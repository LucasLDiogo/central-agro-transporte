"""Coletor de dados da Central Agro & Transporte (somente biblioteca padrao do Python).

Roda no GitHub Actions a cada 20 minutos e grava dados.json. Cada fonte e independente:
se uma falhar, o valor anterior e mantido e o erro fica registrado em "falhas".
Uso: python coletar.py <caminho_do_dados.json>
"""
import datetime as dt
import email.utils
import json
import re
import sys
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


def main():
    destino = Path(sys.argv[1])
    antigo = json.loads(destino.read_text(encoding="utf-8")) if destino.exists() else {}
    dados = {"gerado_em": dt.datetime.now(BRT).isoformat(timespec="seconds"), "falhas": {}}
    etapas = {"cambio": cambio, "cbot": cbot, "cepea": lambda: cepea(antigo.get("cepea", {})), "diesel": diesel,
              "alertas": alertas, "noticias": noticias}
    for nome, funcao in etapas.items():
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
