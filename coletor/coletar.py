"""Coletor de dados da Central Agro & Transporte.

Roda no GitHub Actions a cada 20 minutos e grava dados.json. Cada fonte e independente:
se uma falhar, o valor anterior e mantido e o erro fica registrado em "falhas".
As fontes pesadas (planilhas e PDFs da ANP, arquivos da CONAB) rodam no maximo a cada 12 h.
Dependencias fora da biblioteca padrao: openpyxl (planilhas da ANP) e pypdf (sintese semanal da ANP);
se faltarem, o proprio coletor instala com pip --user na primeira execucao.
Uso: python coletar.py <caminho_do_dados.json>
"""
import csv
import datetime as dt
import email.utils
import io
import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"}
BRT = dt.timezone(dt.timedelta(hours=-3))
CONFIG = json.loads((Path(__file__).resolve().parent.parent / "config.json").read_text(encoding="utf-8"))


def baixar(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", "replace")


def garantir(modulo, pacote):
    """importa o modulo; se faltar (ex.: GitHub Actions), instala com pip --user e tenta de novo"""
    import importlib
    try:
        return importlib.import_module(modulo)
    except ImportError:
        import site
        import subprocess
        for extra in ([], ["--break-system-packages"]):
            if subprocess.call([sys.executable, "-m", "pip", "install", "--quiet", "--user", pacote, *extra]) == 0:
                break
        caminho = site.getusersitepackages()
        if caminho not in sys.path:
            sys.path.append(caminho)
        importlib.invalidate_caches()
        return importlib.import_module(modulo)


def baixar_bytes(url, timeout=120):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=timeout).read()


def norm(txt):
    """'Passo  Fundo ' -> 'PASSO FUNDO' (sem acento, maiusculo)"""
    t = unicodedata.normalize("NFKD", str(txt or "")).encode("ascii", "ignore").decode()
    return " ".join(t.upper().split())


def agora_iso():
    return dt.datetime.now(BRT).isoformat(timespec="seconds")


def acumula(antiga, nova, chave="d", limite=160):
    """junta a serie nova com a ja guardada (historico cresce a cada coleta)"""
    mapa = {p[chave]: p for p in (antiga or [])}
    mapa.update({p[chave]: p for p in nova})
    return sorted(mapa.values(), key=lambda p: p[chave])[-limite:]


def num(txt):
    """'1.564,03' -> 1564.03"""
    return float(str(txt).strip().replace(".", "").replace(",", "."))


def var_pct(serie, dias):
    """variacao percentual do ultimo ponto contra o ponto de N dias corridos atras"""
    if len(serie) < 2:
        return None
    ult = serie[-1]
    alvo = dt.date.fromisoformat(ult["d"]) - dt.timedelta(days=dias)
    base = [p for p in serie[:-1] if dt.date.fromisoformat(p["d"]) <= alvo]
    ref = base[-1] if base else (serie[0] if dias > 1 else serie[-2])
    if dias == 1:
        ref = serie[-2]
    return round((ult["v"] / ref["v"] - 1) * 100, 2) if ref["v"] else None


def resumo(serie, **extra):
    return dict(valor=serie[-1]["v"], data=serie[-1]["d"], var_dia_pct=var_pct(serie, 1), var_7d_pct=var_pct(serie, 7),
                var_30d_pct=var_pct(serie, 30), serie=serie[-70:], **extra)


# ---------------------------------------------------------------- cambio (Banco Central, PTAX venda)
def cambio():
    saida = {}
    for moeda, codigo in (("USD", 1), ("EUR", 21619)):
        hoje = dt.datetime.now(BRT).date()
        periodo = f"dataInicial={hoje - dt.timedelta(days=100):%d/%m/%Y}&dataFinal={hoje:%d/%m/%Y}"
        bruto = json.loads(baixar(f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?formato=json&{periodo}"))
        serie = [{"d": dt.datetime.strptime(p["data"], "%d/%m/%Y").date().isoformat(), "v": round(float(p["valor"]), 4)} for p in bruto]
        saida[moeda] = resumo(serie, unidade="R$", fonte="Banco Central (PTAX venda)")
    try:  # cotacao comercial do momento
        vivo = json.loads(baixar("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL"))
        for moeda in ("USD", "EUR"):
            c = vivo[moeda + "BRL"]
            saida[moeda]["agora"] = {"valor": round(float(c["bid"]), 4), "var_dia_pct": round(float(c["pctChange"]), 2),
                                     "hora": c["create_date"], "fonte": "AwesomeAPI (comercial)"}
    except Exception:
        pass
    return saida


# ---------------------------------------------------------------- graos em Chicago (CBOT)
def cbot():
    saida = {}
    for chave, ticker, nome in (("soja_cbot", "ZS=F", "Soja em Chicago"), ("trigo_cbot", "ZW=F", "Trigo em Chicago")):
        r = json.loads(baixar(f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range=3mo&interval=1d"))["chart"]["result"][0]
        fech = r["indicators"]["quote"][0]["close"]
        serie = [{"d": dt.datetime.fromtimestamp(t, dt.timezone.utc).date().isoformat(), "v": round(c / 100, 4)}
                 for t, c in zip(r["timestamp"], fech) if c]
        saida[chave] = resumo(serie, nome=nome, unidade="US$/bushel", contrato=r["meta"].get("shortName", ""),
                              fonte="CBOT via Yahoo Finance")
    return saida


# ---------------------------------------------------------------- indicadores CEPEA/ESALQ (mercado fisico brasileiro)
CEPEA = [92, 12, 179, 178, 77]  # ids dos indicadores no widget do CEPEA
NOMES_CEPEA = {"Soja Paranaguá": ("soja_paranagua", "Soja Paranaguá"), "Soja - PR": ("soja_pr", "Soja Paraná"),
               "Trigo - RS": ("trigo_rs", "Trigo RS"), "Trigo - PR": ("trigo_pr", "Trigo Paraná"), "Milho": ("milho", "Milho")}


def cepea(anterior):
    url = ("https://www.cepea.org.br/br/widgetproduto.js.php?fonte=arial&tamanho=10&largura=400px&corfundo=dbd6b2"
           "&cortexto=333333&corlinha=ede7bf" + "".join(f"&id_indicador%5B%5D={i}" for i in CEPEA))
    html = baixar(url)
    linhas = re.findall(r"<tr[^>]*>(.*?)</tr>", html, flags=re.S)
    saida = {}
    for linha in linhas:
        texto = " ".join(re.sub(r"<[^>]+>", " ", linha).split())
        m = re.match(r"(\d{2}/\d{2}/\d{4})\s+(.*?)\s+(sc de 60kg|t|@)\s+R\$\s*([\d.,]+)", texto)
        if not m or m.group(2) not in NOMES_CEPEA:
            continue
        chave, nome = NOMES_CEPEA[m.group(2)]
        valor = num(m.group(4))
        dia = dt.datetime.strptime(m.group(1), "%d/%m/%Y").date().isoformat()
        serie = [p for p in (anterior.get(chave, {}).get("serie") or []) if p["d"] != dia] + [{"d": dia, "v": valor}]
        serie.sort(key=lambda p: p["d"])
        saida[chave] = resumo(serie[-120:], nome=nome, unidade="R$/sc 60 kg" if "sc" in m.group(3) else "R$/t",
                              fonte="CEPEA/ESALQ")
    if not saida:
        raise RuntimeError("widget do CEPEA sem linhas reconhecidas")
    return saida


# ---------------------------------------------------------------- diesel (precos medios ao consumidor)
def diesel():
    c = json.loads(baixar("https://combustivelapi.com.br/api/precos/"))
    d = c["precos"]["diesel"]
    return {"rs": num(d["rs"]), "br": num(d["br"]), "data_coleta": c.get("data_coleta"),
            "fonte": "Petrobras (precos.petrobras.com.br), via combustivelapi.com.br", "unidade": "R$/litro"}


# ---------------------------------------------------------------- avisos meteorologicos (INMET)
def alertas():
    cidades = [c["nome"] for c in CONFIG["rota"]]
    bruto = json.loads(baixar("https://apiprevmet3.inmet.gov.br/avisos/ativos", timeout=60))
    saida = []
    for quando in ("hoje", "futuro"):
        for a in bruto.get(quando, []):
            municipios = a.get("municipios", "")
            atingidas = [c for c in cidades if f"{c} - RS (" in municipios]
            if not atingidas:
                continue
            riscos = re.findall(r"'([^']+)'", a.get("riscos", "")) or [a.get("riscos", "")]
            saida.append({"quando": quando, "descricao": a.get("descricao"), "severidade": a.get("severidade"),
                          "cor": a.get("aviso_cor"), "inicio": a.get("inicio"), "fim": a.get("fim"),
                          "cidades": atingidas, "risco": riscos[0].strip() if riscos else ""})
    return saida


# ---------------------------------------------------------------- noticias (Google Noticias, RSS)
def noticias():
    saida = {}
    for cat in CONFIG["noticias"]:
        q = urllib.parse.quote(cat["busca"] + " when:7d")
        raiz = ET.fromstring(baixar(f"https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419"))
        itens, vistos = [], set()
        for it in raiz.iter("item"):
            titulo = (it.findtext("title") or "").strip()
            fonte = (it.findtext("source") or "").strip()
            if fonte and titulo.endswith(" - " + fonte):
                titulo = titulo[: -len(fonte) - 3].strip()
            chave = re.sub(r"\W+", "", titulo.lower())[:60]
            if not titulo or chave in vistos:
                continue
            vistos.add(chave)
            try:
                quando = email.utils.parsedate_to_datetime(it.findtext("pubDate")).astimezone(BRT).isoformat()
            except Exception:
                quando = None
            itens.append({"titulo": titulo, "fonte": fonte, "link": it.findtext("link"), "data": quando})
        itens.sort(key=lambda n: n["data"] or "", reverse=True)
        saida[cat["id"]] = itens[:10]
    return saida


# ---------------------------------------------------------------- energia: futuros que mexem no biodiesel e no frete
FUTUROS = (("oleo_soja", "ZL=F", "Óleo de soja", "US¢/lb", "Chicago (CBOT)"),
           ("diesel_ny", "HO=F", "Diesel ULSD", "US$/galão", "Nova York (NYMEX)"),
           ("brent", "BZ=F", "Petróleo Brent", "US$/barril", "Londres (ICE)"),
           ("farelo", "ZM=F", "Farelo de soja", "US$/t curta", "Chicago (CBOT)"),
           ("milho_cbot", "ZC=F", "Milho", "US¢/bushel", "Chicago (CBOT)"))


def energia():
    saida = {}
    for chave, ticker, nome, unidade, bolsa in FUTUROS:
        r = json.loads(baixar(f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range=6mo&interval=1d"))["chart"]["result"][0]
        fech = r["indicators"]["quote"][0]["close"]
        serie = [{"d": dt.datetime.fromtimestamp(t, dt.timezone.utc).date().isoformat(), "v": round(c, 4)}
                 for t, c in zip(r["timestamp"], fech) if c]
        m = r["meta"]
        saida[chave] = resumo(serie, nome=nome, unidade=unidade, bolsa=bolsa, ticker=ticker, fonte=f"{bolsa} via Yahoo Finance",
                              agora={"valor": m.get("regularMarketPrice"), "hora": m.get("regularMarketTime")})
    return saida


# ---------------------------------------------------------------- ANP: sintese semanal (biodiesel, diesel A, PPI, diesel S10)
ANP = "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos"
LINHA3 = r"(\d{2}/\d{2}/\d{4})\s+(\d+,\d{2})\s+(-?\d+,\d{2})%\s+(-?\d+,\d{2})%"
LINHA_PPI = r"(\d{2}/\d{2}/\d{4})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(-?\d+,\d{2})%"


def _iso(dmy):
    return dt.datetime.strptime(dmy, "%d/%m/%Y").date().isoformat()


def _bloco(linhas):
    if not linhas:
        return None
    serie = [{"d": _iso(d), "v": num(v)} for d, v, *_ in linhas]
    u = linhas[-1]
    return {"valor": num(u[1]), "data": _iso(u[0]), "var_sem_pct": num(u[2]), "var_12m_pct": num(u[3]), "serie": serie}


def anp_semanal(antigo):
    PdfReader = garantir("pypdf", "pypdf").PdfReader
    hoje = dt.datetime.now(BRT).date()
    edicoes = []
    for ano in (hoje.year, hoje.year - 1):
        links = set()
        for b in range(0, 140, 20):
            html = baixar(f"{ANP}/arq-sintese-semanal/{ano}?b_start:int={b}", timeout=60)
            novos = set(re.findall(rf'href="(https://www\.gov\.br/anp/[^"]*?/arq-sintese-semanal/{ano}/[^"/]+?)(?:/view)?"', html)) - links
            if not novos:
                break
            links |= novos
        for link in links:
            m = re.search(r"(\d{1,2})(?:-\d{4})?(?:\.pdf|-pdf)$", link)
            if m and "sintese" in link:
                edicoes.append((ano, int(m.group(1)), link))
        if edicoes:
            break
    if not edicoes:
        raise RuntimeError("nenhuma edicao da sintese semanal encontrada")
    ano, ed, link = max(edicoes)
    if antigo.get("edicao") == ed and antigo.get("ano") == ano and antigo.get("biodiesel"):
        return dict(antigo, coletado_em=agora_iso())
    pdf = baixar_bytes(link)
    if not pdf.startswith(b"%PDF"):
        pdf = baixar_bytes(link + "/@@download/file")
    t = "\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(pdf)).pages)
    i_bio = re.search(r"Biodiesel\s*\n\s*Semana", t)
    if not i_bio:
        raise RuntimeError("tabela de biodiesel nao encontrada no PDF")
    biodiesel = _bloco(re.findall(LINHA3, t[i_bio.end():i_bio.end() + 700])[:4])
    i_golfo = t.rfind("Diesel da Costa do Golfo", 0, i_bio.start())
    ppi_linhas = re.findall(LINHA_PPI, t[max(0, i_golfo - 700):i_golfo])[-4:]
    i_dieselA = t.rfind("Diesel A", 0, i_golfo)
    diesel_a = _bloco(re.findall(LINHA3, t[i_dieselA:i_dieselA + 700])[:4]) if i_dieselA > 0 else None
    i_dist = t.rfind("DISTRIBUI", 0, i_dieselA) if i_dieselA > 0 else -1
    s10 = _bloco(re.findall(LINHA3, t[max(0, i_dist - 900):i_dist])[-4:]) if i_dist > 0 else None
    ppi = None
    if ppi_linhas:
        u = ppi_linhas[-1]
        ppi = {"valor": num(u[2]), "golfo": num(u[1]), "data": _iso(u[0]), "var_sem_pct": num(u[3]),
               "serie": [{"d": _iso(d), "v": num(p), "golfo": num(g)} for d, g, p, _ in ppi_linhas]}
    saida = {"ano": ano, "edicao": ed, "url": link, "coletado_em": agora_iso(),
             "fonte": f"ANP · Síntese Semanal de Preços dos Combustíveis, ed. {ed:02d}/{ano}",
             "biodiesel": biodiesel, "diesel_a": diesel_a, "ppi": ppi, "diesel_s10": s10}
    for k in ("biodiesel", "diesel_a", "ppi", "diesel_s10"):  # historico semanal cresce a cada edicao
        if saida[k] and (antigo.get(k) or {}).get("serie"):
            saida[k]["serie"] = acumula(antigo[k]["serie"], saida[k]["serie"], limite=104)
    if not biodiesel:
        raise RuntimeError("linhas de biodiesel nao reconhecidas")
    return saida


# ---------------------------------------------------------------- ANP: diesel nos postos das cidades do corredor (ultimas 4 semanas)
def anp_postos():
    bruto = baixar_bytes("https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/qus/ultimas-4-semanas-diesel-gnv.csv", 180)
    txt = bruto.decode("utf-8-sig") if bruto[:3] == b"\xef\xbb\xbf" else bruto.decode("latin-1")
    leitor = csv.reader(io.StringIO(txt), delimiter=";")
    cab = [norm(c) for c in next(leitor)]
    ix = {k: cab.index(k) for k in ("ESTADO - SIGLA", "MUNICIPIO", "PRODUTO", "DATA DA COLETA", "VALOR DE VENDA")}
    cidades = {norm(c): c for c in CONFIG.get("postos_cidades", [])}
    reg = []
    for lin in leitor:
        if len(lin) < len(cab) or lin[ix["ESTADO - SIGLA"]].strip() != "RS":
            continue
        prod = norm(lin[ix["PRODUTO"]])
        if prod not in ("DIESEL S10", "DIESEL"):
            continue
        try:
            reg.append((norm(lin[ix["MUNICIPIO"]]), prod, dt.datetime.strptime(lin[ix["DATA DA COLETA"]].strip(), "%d/%m/%Y").date(), num(lin[ix["VALOR DE VENDA"]])))
        except ValueError:
            continue
    if not reg:
        raise RuntimeError("CSV da ANP sem linhas do RS")
    sab = lambda d: d + dt.timedelta(days=(5 - d.weekday()) % 7)  # semana da ANP termina no sabado
    def media(lst):
        return round(sum(lst) / len(lst), 3) if lst else None
    semanas = {}
    for mun, prod, d, v in reg:
        semanas.setdefault((prod, sab(d)), []).append(v)
    rs = {}
    for prod, chave in (("DIESEL S10", "s10"), ("DIESEL", "s500")):
        rs[chave] = [{"d": w.isoformat(), "v": media(v), "n": len(v)} for (p, w), v in sorted(semanas.items()) if p == prod]
    ult = max(d for *_, d, _v in reg)
    por_cidade = []
    for chave_norm, nome in cidades.items():
        lst = [(d, v) for mun, prod, d, v in reg if mun == chave_norm and prod == "DIESEL S10"]
        if not lst:
            continue
        d_max = max(d for d, _ in lst)
        recente = [v for d, v in lst if (d_max - d).days <= 6]
        por_cidade.append({"cidade": nome, "valor": media(recente), "min": min(recente), "max": max(recente), "n": len(recente), "data": d_max.isoformat(),
                           "serie": [{"d": w.isoformat(), "v": media([v for d, v in lst if sab(d) == w])} for w in sorted({sab(d) for d, _ in lst})]})
    return {"coletado_em": agora_iso(), "ate": ult.isoformat(), "rs": rs, "cidades": por_cidade,
            "fonte": "ANP · Levantamento de Preços de Combustíveis (postos), últimas 4 semanas"}


# ---------------------------------------------------------------- ANP: medias mensais de revenda (Brasil e RS)
def anp_mensal():
    openpyxl = garantir("openpyxl", "openpyxl")
    base = f"{ANP}/precos-revenda-e-de-distribuicao-combustiveis/shlp/mensal/"
    produtos = {"OLEO DIESEL S10": "diesel_s10", "GASOLINA COMUM": "gasolina", "ETANOL HIDRATADO": "etanol"}

    def ler(arquivo, estado=None):
        wb = openpyxl.load_workbook(io.BytesIO(baixar_bytes(base + arquivo, 180)), read_only=True, data_only=True)
        out, ix = {v: [] for v in produtos.values()}, None
        for r in wb.worksheets[0].iter_rows(values_only=True):
            if ix is None:
                cab = [norm(c) for c in r]
                if "PRODUTO" in cab and "PRECO MEDIO REVENDA" in cab:
                    ix = {"p": cab.index("PRODUTO"), "v": cab.index("PRECO MEDIO REVENDA"), "e": cab.index("ESTADO") if "ESTADO" in cab else None}
                continue
            if not isinstance(r[0], dt.datetime):
                continue
            chave = produtos.get(norm(r[ix["p"]]))
            if not chave or (estado and norm(r[ix["e"]]) != estado):
                continue
            try:
                out[chave].append({"d": r[0].strftime("%Y-%m"), "v": round(float(r[ix["v"]]), 3)})
            except (TypeError, ValueError):
                continue
        wb.close()
        if ix is None:
            raise RuntimeError(f"cabecalho nao encontrado em {arquivo}")
        return {k: sorted(v, key=lambda p: p["d"])[-60:] for k, v in out.items()}

    brasil, rs = ler("mensal-brasil-desde-jan2013.xlsx"), ler("mensal-estados-desde-jan2013.xlsx", "RIO GRANDE DO SUL")
    ate = max((s[-1]["d"] for s in brasil.values() if s), default=None)
    return {"coletado_em": agora_iso(), "ate": ate, "brasil": brasil, "rs": rs,
            "fonte": "ANP · Levantamento de Preços de Combustíveis, médias mensais de revenda"}


# ---------------------------------------------------------------- CONAB: safra levantamento a levantamento e precos mensais
CONAB = "https://portaldeinformacoes.conab.gov.br/downloads/arquivos/"
MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]


def _ordem_ano(ano):
    a = ano.strip()
    return (int(a[:4]) + (0 if "/" in a else -1), a)


def conab_safra():
    linhas = [l.split(";") for l in baixar_bytes(CONAB + "LevantamentoGraos.txt", 240).decode("latin-1").splitlines()[1:]]
    saida = {"coletado_em": agora_iso(), "fonte": "CONAB · Acompanhamento da safra brasileira de grãos (levantamentos mensais)"}
    for produto in ("SOJA", "TRIGO"):
        anos = {}
        for r in linhas:
            if len(r) < 10 or norm(r[3]) != produto:
                continue
            try:
                area, prod = float(r[7].replace(",", ".")), float(r[8].replace(",", "."))
            except ValueError:
                continue
            lev = int(r[5])
            a = anos.setdefault(r[0].strip(), {})
            br = a.setdefault(lev, {"br_area": 0.0, "br_prod": 0.0})
            br["br_area"] += area
            br["br_prod"] += prod
            if r[2].strip() == "RS":
                br["rs_area"], br["rs_prod"] = area, prod
        ordem = sorted(anos, key=_ordem_ano)
        safras = []
        for ano in ordem[-3:]:
            base = _ordem_ano(ano)[0]
            levs = []
            for lev in sorted(anos[ano]):
                x = anos[ano][lev]
                mes = (9 + lev - 1)  # 1o levantamento = outubro do inicio do ciclo
                levs.append({"lev": lev, "mes": f"{MESES[mes % 12]}/{str(base + mes // 12)[2:]}", "rs_area": x.get("rs_area"), "rs_prod": x.get("rs_prod"),
                             "br_area": round(x["br_area"], 1), "br_prod": round(x["br_prod"], 1)})
            safras.append({"ano": ano, "levs": levs})
        saida[produto.lower()] = safras
    return saida


def conab_precos():
    linhas = [l.split(";") for l in baixar_bytes(CONAB + "PrecosMensalUF.txt", 240).decode("latin-1").splitlines()[1:]]
    alvo = {("SOJA", "RS"): ("soja_rs", 60, "R$/sc 60 kg"), ("SOJA", "PR"): ("soja_pr", 60, "R$/sc 60 kg"),
            ("TRIGO", "RS"): ("trigo_rs", 1000, "R$/t"), ("TRIGO", "PR"): ("trigo_pr", 1000, "R$/t"), ("MILHO", "RS"): ("milho_rs", 60, "R$/sc 60 kg")}
    acc = {}
    for r in linhas:
        if len(r) < 9 or "RECEBIDO" not in norm(r[7]):
            continue
        k = alvo.get((norm(r[0]), r[3].strip()))
        if not k:
            continue
        try:
            v = num(r[8])
        except ValueError:
            continue
        acc.setdefault(k, {}).setdefault(f"{int(r[5]):04d}-{int(r[6]):02d}", []).append(v)
    saida = {"coletado_em": agora_iso(), "fonte": "CONAB · Preços agropecuários mensais por UF (preço recebido pelo produtor)"}
    for (chave, fator, unidade), meses in acc.items():
        serie = [{"d": m, "v": round(sum(v) / len(v) * fator, 2)} for m, v in sorted(meses.items())][-60:]
        saida[chave] = {"unidade": unidade, "serie": serie, "valor": serie[-1]["v"], "data": serie[-1]["d"]}
    if len(saida) < 4:
        raise RuntimeError("precos da CONAB sem soja/trigo do RS")
    return saida


# ---------------------------------------------------------------- chuva nas regioes produtoras do RS (Open-Meteo, 14 dias passados + 7 previstos)
def lavouras():
    pontos = CONFIG.get("lavouras", [])
    url = ("https://api.open-meteo.com/v1/forecast?latitude=" + ",".join(str(p["lat"]) for p in pontos) +
           "&longitude=" + ",".join(str(p["lon"]) for p in pontos) +
           "&daily=precipitation_sum,temperature_2m_max&past_days=14&forecast_days=7&timezone=America%2FSao_Paulo")
    bruto = json.loads(baixar(url, timeout=60))
    bruto = bruto if isinstance(bruto, list) else [bruto]
    hoje = dt.datetime.now(BRT).date().isoformat()
    saida = []
    for p, m in zip(pontos, bruto):
        dias = list(zip(m["daily"]["time"], m["daily"]["precipitation_sum"], m["daily"]["temperature_2m_max"]))
        passados = [(d, c or 0) for d, c, _ in dias if d < hoje]
        futuros = [(d, c or 0) for d, c, _ in dias if d >= hoje]
        saida.append({"cidade": p["nome"], "mm_7d": round(sum(c for _, c in passados[-7:]), 1), "mm_14d": round(sum(c for _, c in passados), 1),
                      "max_dia": max(passados, key=lambda x: x[1]) if passados else None, "prev_7d": round(sum(c for _, c in futuros), 1),
                      "prev_max_dia": max(futuros, key=lambda x: x[1]) if futuros else None,
                      "tmax_7d": round(max((t or 0) for d, _, t in dias if d < hoje), 1) if passados else None})
    return {"coletado_em": agora_iso(), "cidades": saida, "fonte": "Open-Meteo (observado e previsto)"}


def main():
    destino = Path(sys.argv[1])
    antigo = json.loads(destino.read_text(encoding="utf-8")) if destino.exists() else {}
    dados = {"gerado_em": dt.datetime.now(BRT).isoformat(timespec="seconds"), "falhas": {}}
    etapas = {"cambio": cambio, "cbot": cbot, "cepea": lambda: cepea(antigo.get("cepea", {})), "diesel": diesel,
              "alertas": alertas, "noticias": noticias, "energia": energia, "lavouras": lavouras,
              "anp_semanal": lambda: anp_semanal(antigo.get("anp_semanal") or {}), "anp_postos": anp_postos,
              "anp_mensal": anp_mensal, "conab_safra": conab_safra, "conab_precos": conab_precos}
    lentas = {"anp_semanal": 6, "anp_postos": 12, "anp_mensal": 12, "conab_safra": 12, "conab_precos": 12}  # horas entre coletas
    so = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None  # teste: python coletar.py saida.json energia,anp_mensal
    for nome, funcao in etapas.items():
        velho = antigo.get(nome)
        if so is not None and nome not in so:
            dados[nome] = velho if velho is not None else ([] if nome == "alertas" else {})
            continue
        if nome in lentas and isinstance(velho, dict) and velho.get("coletado_em"):
            idade = dt.datetime.now(BRT) - dt.datetime.fromisoformat(velho["coletado_em"])
            if idade < dt.timedelta(hours=lentas[nome]) and not (antigo.get("falhas") or {}).get(nome):
                dados[nome] = velho
                print(f"cache {nome} ({idade.seconds // 60} min)")
                continue
        try:
            dados[nome] = funcao()
            print(f"ok   {nome}")
        except Exception as erro:  # mantem o ultimo valor bom
            dados[nome] = antigo.get(nome, [] if nome == "alertas" else {})
            dados["falhas"][nome] = f"{type(erro).__name__}: {str(erro)[:200]}"
            print(f"FALHA {nome}: {dados['falhas'][nome]}")
    if isinstance(dados["cepea"], dict) and isinstance(antigo.get("cepea"), dict):  # indicadores que sumiram do widget
        for k, v in antigo["cepea"].items():
            dados["cepea"].setdefault(k, v)
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(dados, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("gravado", destino, f"({destino.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
