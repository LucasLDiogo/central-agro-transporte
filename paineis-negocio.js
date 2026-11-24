/* Central Agro & Transporte — telas de negócio: energia e biocombustível, combustíveis mês a mês, soja e trigo,
   frete mínimo e reforma tributária, e cenário e impactos (leitura automática dos dados por regras explícitas).
   Usa os dados de dados.json (coletor/coletar.py) e config.json. Nenhum número é inventado: sem dado, aparece "—".
   Carregado antes do app.js; o app.js junta TELAS_NEGOCIO às telas. Desenvolvido por Lucas L. Diogo para a Be8 — 2026 */
'use strict';

const MES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const mesAno = ym => { if (!ym) return '—'; const [a, m] = ym.split('-'); return `${MES_PT[+m - 1]}/${a.slice(2)}`; };
const dm = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—';
const hojeISO = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const lista = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
const variacao = (a, b) => (a != null && b) ? (a / b - 1) * 100 : null;

/* gráfico de linhas em SVG: séries [{nome, cor, pontos:[{d,v}], tracejado}] alinhadas pelo campo d */
function grafico({ series, W = 620, H = 300, fmt = v => nf(v, 2), ref = null, margem = [18, 84, 34, 58], rotulo = 'mes' }) {
  const [mT, mR, mB, mL] = margem;
  const xs = [...new Set(series.flatMap(s => s.pontos.map(p => p.d)))].sort();
  const vals = series.flatMap(s => s.pontos.map(p => p.v)).concat(ref ? [ref.v] : []).filter(v => v != null);
  if (xs.length < 2 || !vals.length) return '<div class="vazio">Sem histórico suficiente ainda.</div>';
  let min = Math.min(...vals), max = Math.max(...vals); const folga = (max - min) * .12 || max * .05 || 1; min -= folga; max += folga;
  const X = i => mL + i / (xs.length - 1) * (W - mL - mR), Y = v => mT + (1 - (v - min) / (max - min)) * (H - mT - mB);
  const grade = [0, 1, 2, 3].map(i => min + (max - min) * (i + .5) / 4);
  const fx = d => rotulo === 'mes' ? mesAno(d) : dm(d);
  const idxX = [0, Math.round((xs.length - 1) / 2), xs.length - 1];
  const fins = series.map(s => { const u = s.pontos[s.pontos.length - 1]; return u ? { s, u, y: Y(u.v) } : null; }).filter(Boolean).sort((a, b) => a.y - b.y);
  for (let i = 1; i < fins.length; i++) if (fins[i].y - fins[i - 1].y < 22) fins[i].y = fins[i - 1].y + 22;
  return `<svg viewBox="0 0 ${W} ${H}" class="graf">
    ${grade.map(g => `<line x1="${mL}" x2="${W - mR}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="#1E3A4F"/><text x="${mL - 10}" y="${(Y(g) + 6).toFixed(1)}" fill="#8FA9B8" font-size="16" text-anchor="end">${fmt(g)}</text>`).join('')}
    ${ref ? `<line x1="${mL}" x2="${W - mR}" y1="${Y(ref.v).toFixed(1)}" y2="${Y(ref.v).toFixed(1)}" stroke="#F2B705" stroke-width="2" stroke-dasharray="7 6"/><text x="${mL + 8}" y="${(Y(ref.v) - 8).toFixed(1)}" fill="#F2B705" font-size="16" font-weight="700">${esc(ref.nome)}</text>` : ''}
    ${idxX.map(i => `<text x="${X(i).toFixed(1)}" y="${H - 8}" fill="#8FA9B8" font-size="16" text-anchor="${i === 0 ? 'start' : i === xs.length - 1 ? 'end' : 'middle'}">${fx(xs[i])}</text>`).join('')}
    ${series.map(s => { const pts = s.pontos.map(p => [xs.indexOf(p.d), p.v]).filter(([i, v]) => i >= 0 && v != null);
      return `<path class="traco" d="${pts.map(([i, v], k) => `${k ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${s.cor}" stroke-width="${s.fina ? 3 : 4.5}" stroke-linejoin="round" stroke-linecap="round" ${s.tracejado ? 'stroke-dasharray="10 8"' : ''}/>` +
        (pts.length ? `<circle cx="${X(pts[pts.length - 1][0]).toFixed(1)}" cy="${Y(pts[pts.length - 1][1]).toFixed(1)}" r="6" fill="${s.cor}"/>` : ''); }).join('')}
    ${fins.map(f => `<text class="ponta" x="${W - mR + 12}" y="${(f.y + 6).toFixed(1)}" fill="${f.s.cor}" font-size="18" font-weight="800">${fmt(f.u.v)}</text>`).join('')}
  </svg>`;
}
const legenda = itens => `<div class="leg">${itens.map(([nome, cor, tr]) => `<span><i style="background:${tr ? 'transparent' : cor};border:2px ${tr ? 'dashed' : 'solid'} ${cor}"></i>${esc(nome)}</span>`).join('')}</div>`;

/* ------------------------------------------------------------------ cotações ao vivo (opcional: config.cotacoesUrl) */
async function carregarCotacoesVivo() {
  if (!E.cfg?.cotacoesUrl) return;
  try { const r = await json(E.cfg.cotacoesUrl); if (r?.itens) E.cotVivo = { ...r, recebido: Date.now() }; } catch (e) { }
}
function futuro(chave) {
  const f = E.dados?.energia?.[chave]; if (!f) return null;
  const mapa = { oleo_soja: 'oleo', diesel_ny: 'diesel', brent: 'brent', farelo: 'farelo', milho_cbot: 'milho' };
  const v = E.cotVivo?.itens?.[mapa[chave]];
  if (v && !v.erro && v.preco != null) return { ...f, valor: v.preco, var_dia_pct: v.var_pct, hora: v.hora * 1000, vivo: true };
  return { ...f, hora: f.agora?.hora ? f.agora.hora * 1000 : null, valor: f.agora?.valor ?? f.valor };
}

/* ------------------------------------------------------------------ leitura automática: insights por regras */
function insights() {
  const D = E.dados || {}, cfg = E.cfg || {}, out = [], mes = new Date().getMonth() + 1, hoje = hojeISO();
  const add = (nivel, titulo, texto, impacto, fonte) => out.push({ nivel, titulo, texto, impacto, fonte });
  const plantioSoja = mes >= 10 && mes <= 12, colheitaSoja = mes >= 3 && mes <= 5, plantioTrigo = mes >= 5 && mes <= 7, colheitaTrigo = mes >= 10 && mes <= 12;

  const lav = D.lavouras?.cidades || [];
  const prev = lav.filter(c => c.prev_7d >= 100 || (c.prev_max_dia && c.prev_max_dia[1] >= 50)).sort((a, b) => b.prev_7d - a.prev_7d);
  if (prev.length) {
    const top = prev.slice(0, 3);
    add('alerta', `Chuva forte prevista em ${lista(top.map(c => c.cidade))}`,
      top.map(c => `${c.cidade}: ${nf(c.prev_7d, 0)} mm em 7 dias${c.prev_max_dia ? ` (pico de ${nf(c.prev_max_dia[1], 0)} mm em ${dm(c.prev_max_dia[0])})` : ''}`).join(' · ') + '.',
      plantioSoja ? 'Janela de plantio da soja: risco de erosão e replantio nas lavouras recém-semeadas, máquinas paradas e plantio atrasado.' :
        colheitaSoja ? 'Colheita da soja: atraso, grão úmido e fila de caminhões nos armazéns.' : plantioTrigo ? 'Plantio do trigo pode atrasar.' : 'Estradas vicinais e pátios encharcados: risco de atraso nas coletas.',
      'Open-Meteo · regra: ≥ 100 mm em 7 dias ou ≥ 50 mm em um dia');
  }
  const obs = lav.filter(c => c.mm_7d >= 60).sort((a, b) => b.mm_7d - a.mm_7d);
  if (obs.length && colheitaTrigo) add('atencao', 'Chuva na colheita do trigo', `Últimos 7 dias: ${obs.slice(0, 3).map(c => `${c.cidade} ${nf(c.mm_7d, 0)} mm`).join(', ')}.`,
    'Chuva sobre trigo maduro derruba o PH e pode germinar o grão na espiga: trigo fora do padrão de moagem vale menos e muda o destino do frete.', 'Open-Meteo · regra: ≥ 60 mm em 7 dias entre out e dez');
  const secos = lav.filter(c => c.mm_14d < 15 && c.prev_7d < 10);
  if (plantioSoja && secos.length >= 3) add('atencao', 'Solo seco na janela do plantio', `${lista(secos.slice(0, 4).map(c => c.cidade))}: menos de 15 mm em 14 dias e pouca chuva prevista.`,
    'Plantio e germinação da soja podem atrasar.', 'Open-Meteo · regra: < 15 mm em 14 dias e < 10 mm previstos');

  const fm = cfg.frete_minimo, s10 = D.anp_semanal?.diesel_s10;
  if (fm && s10) {
    const v = variacao(s10.valor, fm.referencia), g = fm.gatilho_pct, nivel = Math.abs(v) >= g ? 'alerta' : Math.abs(v) >= g * .7 ? 'atencao' : 'bom';
    add(nivel, Math.abs(v) >= g ? 'Gatilho do frete mínimo atingido' : `Frete mínimo: diesel a ${pct(v)} da referência`,
      `Diesel S10 médio Brasil R$ ${nf(s10.valor)} (ANP, semana até ${dm(s10.data)}) contra R$ ${nf(fm.referencia)} da ${fm.ato}. Gatilho de ±${g}%: R$ ${nf(fm.referencia * (1 + g / 100))} ou R$ ${nf(fm.referencia * (1 - g / 100))}.`,
      Math.abs(v) >= g ? 'A ANTT deve publicar novos pisos: revisar contratos e tabelas indexados ao piso.' : 'Sem novo reajuste do piso no horizonte imediato.', 'ANP · ANTT · Lei 13.703/2018');
  }
  const sem = D.anp_semanal;
  if (sem?.ppi && sem?.diesel_a) {
    const gap = variacao(sem.ppi.valor, sem.diesel_a.valor);
    if (gap >= 5) add('atencao', `Diesel importado ${nf(gap, 0)}% acima do preço das refinarias`, `Paridade de importação (PPI) R$ ${nf(sem.ppi.valor)}/L contra R$ ${nf(sem.diesel_a.valor)}/L do diesel A na realização (semana até ${dm(sem.diesel_a.data)}).`,
      'Distância grande pressiona reajuste nas refinarias e encarece a parcela importada do diesel; se chegar à bomba, mexe no frete e no piso da ANTT.', sem.fonte);
    else if (gap <= -5) add('bom', 'Diesel importado abaixo do preço das refinarias', `PPI R$ ${nf(sem.ppi.valor)}/L contra R$ ${nf(sem.diesel_a.valor)}/L na realização.`, 'Espaço para redução do diesel e alívio no frete.', sem.fonte);
  }
  if (sem?.biodiesel && sem?.diesel_a) {
    const dif = sem.biodiesel.valor - sem.diesel_a.valor;
    add('info', `Biodiesel a R$ ${nf(sem.biodiesel.valor)}/L (${pct(sem.biodiesel.var_sem_pct)} na semana)`,
      `Diesel A a R$ ${nf(sem.diesel_a.valor)}/L. Com a mistura ${cfg.biodiesel?.mistura || 'B15'}, cada litro de diesel B leva 15% de biodiesel: R$ ${nf(dif * .15)} por litro a ${dif >= 0 ? 'mais' : 'menos'} que o diesel A puro (cálculo sobre os preços da ANP).`,
      `Em 12 meses: biodiesel ${pct(sem.biodiesel.var_12m_pct)}, diesel A ${pct(sem.diesel_a.var_12m_pct)}.`, sem.fonte);
  }
  const ol = D.energia?.oleo_soja;
  if (ol?.var_30d_pct != null && Math.abs(ol.var_30d_pct) >= 5) add(ol.var_30d_pct > 0 ? 'atencao' : 'bom', `Óleo de soja ${pct(ol.var_30d_pct)} em 30 dias`, `Chicago a ${nf(ol.valor)} US¢/lb (${pct(ol.var_7d_pct)} em 7 dias).`,
    ol.var_30d_pct > 0 ? 'A principal matéria-prima do biodiesel ficou mais cara: pressão de custo nas usinas e no preço do biodiesel.' : 'A principal matéria-prima do biodiesel ficou mais barata: alívio de custo para as usinas.', ol.fonte);
  const sj = D.conab_safra?.soja?.slice(-1)[0];
  if (sj && sj.levs.length > 1) {
    const p = sj.levs[0], u = sj.levs[sj.levs.length - 1], v = variacao(u.rs_prod, p.rs_prod);
    if (v != null && Math.abs(v) >= 3) add(v < 0 ? 'atencao' : 'bom', `Soja RS ${sj.ano}: ${pct(v)} do 1º ao último levantamento`,
      `CONAB: de ${nf(p.rs_prod / 1000, 1)} para ${nf(u.rs_prod / 1000, 1)} milhões de t (${p.mes} → ${u.mes}). Brasil: ${nf(u.br_prod / 1000, 1)} milhões de t.`,
      v < 0 ? 'Menos soja no RS: menos frete de grão para Rio Grande e para as esmagadoras, e matéria-prima regional mais disputada.' : 'Mais soja no RS: mais frete de grão e oferta regional de matéria-prima.', 'CONAB');
  }
  const rsd = D.anp_mensal?.rs?.diesel_s10;
  if (rsd?.length >= 13) {
    const u = rsd[rsd.length - 1], a = rsd[rsd.length - 13], v = variacao(u.v, a.v);
    add(v >= 10 ? 'atencao' : 'info', `Diesel S10 no RS ${pct(v)} em 12 meses`, `R$ ${nf(u.v)} em ${mesAno(u.d)} contra R$ ${nf(a.v)} em ${mesAno(a.d)} (média mensal de revenda).`,
      'O diesel pesa no custo do caminhão: reajustes chegam ao frete negociado e ao piso da ANTT.', 'ANP');
  }
  const usd = typeof moeda === 'function' ? moeda('USD') : null;
  if (usd?.d30 != null && Math.abs(usd.d30) >= 3) add('info', `Dólar ${pct(usd.d30)} em 30 dias`, `R$ ${nf(usd.valor)} agora.`,
    usd.d30 > 0 ? 'Real mais fraco: soja vale mais em reais (exportação aquecida, mais frete para o porto) e o diesel importado encarece.' : 'Real mais forte: diesel importado mais barato e soja em reais perdendo preço.', 'Banco Central · AwesomeAPI');
  const rota = (E.rota || []).filter(p => p.mm >= 30);
  if (rota.length) add('alerta', `Chuva forte no corredor: ${lista(rota.map(p => p.nome))}`, rota.map(p => `${p.nome}: ${nf(p.mm, 0)} mm em 24 h`).join(' · ') + '.', 'Rodovias e pátios com risco de alagamento: considerar atraso nas viagens até Rio Grande.', 'Open-Meteo');
  for (const d of cfg.destaques || []) if (!d.valido_ate || d.valido_ate >= hoje) add('info', d.titulo, d.texto, d.impacto, d.fonte);
  const peso = { alerta: 0, atencao: 1, bom: 2, info: 3 };
  return out.sort((a, b) => peso[a.nivel] - peso[b.nivel]);
}

/* ------------------------------------------------------------------ telas */
const TELAS_NEGOCIO = {

  energia: {
    nome: 'Energia & biocombustível', pronto: () => !!E.dados?.energia?.oleo_soja,
    cards() {
      const usd = moeda('USD')?.valor;
      const card = (chave, titulo, conv, cor) => {
        const f = futuro(chave); if (!f) return '';
        const c = conv && usd && f.valor != null ? conv(f.valor, usd) : null;
        return `<div class="cartao cot ener anima" data-k="${chave}"><div class="linha1"><div class="rot">${titulo}</div>${chip(f.var_dia_pct)}</div>
          <div class="num valor">${nf(f.valor, f.valor >= 100 ? 1 : 2)}</div><div class="un">${esc(f.unidade)} · ${esc(f.bolsa)}</div>
          <div class="extra">${c ? `≈ <b>R$ ${c}</b> · ` : ''}30 d <b class="${cls(f.var_30d_pct)}">${pct(f.var_30d_pct)}</b></div>
          <div class="ctz">${f.hora ? 'cotação das ' + new Date(f.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
          ${spark(f.serie || [], cor)}</div>`;
      };
      return card('oleo_soja', 'Óleo de soja', (v, u) => nf(v * 22.0462 * u, 0) + '/t', CORES[1]) +
        card('diesel_ny', 'Diesel (NY)', (v, u) => nf(v / 3.78541 * u) + '/L', CORES[3]) +
        card('brent', 'Petróleo Brent', (v, u) => nf(v * u / 158.987) + '/L', CORES[2]) +
        card('farelo', 'Farelo de soja', (v, u) => nf(v / .907185 * u, 0) + '/t', CORES[0]);
    },
    render() {
      const D = E.dados, sem = D.anp_semanal || {}, bio = E.cfg.biodiesel || {};
      const barras = [['Biodiesel', 'produtor', sem.biodiesel, CORES[1]], ['Diesel A', 'refinaria (realização)', sem.diesel_a, CORES[2]],
        ['Paridade de importação', 'PPI do diesel', sem.ppi, CORES[3]], ['Diesel B S10', 'bomba, média Brasil', sem.diesel_s10, CORES[0]]].filter(b => b[2]);
      const maxB = Math.max(8, ...barras.map(b => b[2].valor));
      const hist = [sem.biodiesel && { nome: 'Biodiesel', cor: CORES[1], pontos: sem.biodiesel.serie }, sem.diesel_a && { nome: 'Diesel A', cor: CORES[2], pontos: sem.diesel_a.serie },
        sem.ppi && { nome: 'PPI', cor: CORES[3], pontos: sem.ppi.serie, tracejado: true }].filter(Boolean);
      $('#t-energia').innerHTML = `
        <div class="cab"><div><small>Insumos do biodiesel e do frete</small><h2>Energia & biocombustível</h2></div>
          <div class="fonte"><span class="vivo"><i></i>AO VIVO</span> <span id="enerHora">atualizado ${haQuanto(D.gerado_em)}</span><br>CBOT · NYMEX · ICE (atraso de 10 a 15 min) · ANP</div></div>
        <div class="g-ener">
          <div class="ener-cards">${this.cards()}</div>
          <div class="cartao anima bio-barras"><div class="linha1"><div class="rot">Biodiesel × diesel · R$/litro</div><span class="tag-b15">Mistura ${esc(bio.mistura || 'B15')} desde ${bio.desde ? dm(bio.desde) + '/' + bio.desde.slice(2, 4) : '—'}</span></div>
            ${barras.map(([n, sub, b, cor]) => `<div class="barra"><div class="b-rot"><b>${n}</b><small>${sub}</small></div><div class="b-trilho"><div class="b-enc" style="width:${(b.valor / maxB * 100).toFixed(1)}%;background:${cor}"></div></div><div class="b-val">${nf(b.valor)}<small class="${cls(b.var_sem_pct)}">${pct(b.var_sem_pct)} sem.</small></div></div>`).join('')}
            <div class="nota">${sem.fonte ? esc(sem.fonte) + ' · semana até ' + dm(sem.biodiesel?.data) : 'Síntese semanal da ANP ainda não coletada'}</div></div>
          <div class="cartao anima"><div class="rot">Semana a semana · R$/litro</div>${legenda(hist.map(h => [h.nome, h.cor, h.tracejado]))}
            ${grafico({ series: hist, W: 560, H: 268, rotulo: 'dia' })}</div>
        </div>`;
    },
    entrar() {
      clearInterval(this.tmr); clearInterval(this.tique);
      const vivo = async () => { await Promise.allSettled([carregarDados(), carregarCotacoesVivo()]); if (Show.atual === 'energia') { const g = $('#t-energia .ener-cards'); if (g) { g.innerHTML = this.cards(); gsap.from($$('.ener .valor', g), { color: '#55C94F', duration: 1.2 }); } } };
      this.tmr = setInterval(vivo, (E.cfg.cotacoesUrl ? 60 : 120) * 1000); vivo();
      this.tique = setInterval(() => { const h = $('#enerHora'); const t = E.cotVivo?.recebido || (E.dados?.gerado_em && new Date(E.dados.gerado_em).getTime()); if (h && t) { const s = Math.round((Date.now() - t) / 1000); h.textContent = 'atualizado há ' + (s < 90 ? s + ' s' : Math.round(s / 60) + ' min'); } }, 1000);
    },
    sair() { clearInterval(this.tmr); clearInterval(this.tique); },
    fala() {
      const o = futuro('oleo_soja'), d = futuro('diesel_ny');
      if (o?.var_dia_pct >= 2) return { texto: `**Luz vermelha no painel!** Óleo de soja subindo ${nf(o.var_dia_pct)}% hoje em Chicago: custo do biodiesel pressionado.`, tom: 'alerta' };
      if (d?.var_dia_pct >= 3) return { texto: `**Pisca-alerta ligado!** Diesel em Nova York subindo ${nf(d.var_dia_pct)}% hoje.`, tom: 'alerta' };
      const b = E.dados.anp_semanal?.biodiesel;
      return { texto: `Óleo de soja a ${nf(o?.valor)} US¢/lb${b ? ` e biodiesel a R$ ${nf(b.valor)}/L na ANP` : ''}. **É renovável, é BeVant agora!**`, tom: 'ok', gesto: 'bevant' };
    }
  },

  combustiveis: {
    nome: 'Combustíveis mês a mês', pronto: () => !!E.dados?.anp_mensal?.rs?.diesel_s10?.length,
    render() {
      const M = E.dados.anp_mensal, P = E.dados.anp_postos;
      const corte = s => (s || []).slice(-25);
      const bloco = (chave, titulo) => {
        const rs = corte(M.rs[chave]), br = corte(M.brasil[chave]); const u = rs[rs.length - 1], a = rs[rs.length - 13];
        return `<div class="cartao anima comb"><div class="linha1"><div class="rot">${titulo}</div>${chip(variacao(u?.v, a?.v))}</div>
          <div class="comb-num"><span><em style="color:${CORES[1]}">● RS</em> <b>R$ ${nf(u?.v)}</b></span><span><em style="color:${CORES[2]}">● Brasil</em> <b>R$ ${nf(br[br.length - 1]?.v)}</b></span><small>${mesAno(u?.d)} · chip: variação em 12 meses no RS</small></div>
          ${grafico({ series: [{ nome: 'Brasil', cor: CORES[2], pontos: br, fina: true }, { nome: 'RS', cor: CORES[1], pontos: rs }], W: 410, H: 250, margem: [14, 70, 30, 52] })}</div>`;
      };
      const cid = (P?.cidades || []).slice().sort((a, b) => b.valor - a.valor), rsUlt = P?.rs?.s10?.slice(-1)[0];
      const vmin = Math.min(...cid.map(c => c.valor), rsUlt?.v ?? 99) - .25, vmax = Math.max(...cid.map(c => c.valor), rsUlt?.v ?? 0) + .05;
      const pos = v => ((v - vmin) / (vmax - vmin) * 100).toFixed(1);
      $('#t-combustiveis').innerHTML = `
        <div class="cab"><div><small>Preço médio de revenda · mês a mês</small><h2>Combustíveis: RS × Brasil</h2></div>
          <div class="fonte">ANP · médias mensais até ${mesAno(M.ate)}<br>postos do corredor: semana até ${dm(P?.ate)}</div></div>
        <div class="g-comb">
          ${bloco('diesel_s10', 'Diesel S10')}${bloco('gasolina', 'Gasolina comum')}${bloco('etanol', 'Etanol hidratado')}
          <div class="cartao anima postos"><div class="linha1"><div class="rot">Diesel S10 nos postos do corredor · R$/litro</div><span class="tag-b15" style="background:var(--lime)">Passo Fundo em destaque</span></div>
            <div class="p-grade">${cid.map(c => `<div class="p-lin${c.cidade === 'Passo Fundo' ? ' pf' : ''}"><span>${esc(c.cidade)}</span><div class="p-tri"><div style="width:${pos(c.valor)}%"></div></div><b>${nf(c.valor)}</b><small>${c.n} postos · ${nf(c.min)}–${nf(c.max)}</small></div>`).join('')}</div>
            <div class="nota">Média RS: R$ ${nf(rsUlt?.v)} (${rsUlt?.n ?? '—'} postos) · ${esc(P?.fonte || '')}</div></div>
        </div>`;
    },
    fala() {
      const rs = E.dados.anp_mensal.rs.diesel_s10, u = rs[rs.length - 1], p = rs[rs.length - 2], a = rs[rs.length - 13];
      const m = variacao(u?.v, p?.v), y = variacao(u?.v, a?.v);
      if (m >= 3) return { texto: `**Pé no freio, comboio!** Diesel S10 no RS subiu ${nf(m)}% em um mês: R$ ${nf(u.v)} em ${mesAno(u.d)}.`, tom: 'alerta' };
      return { texto: `Diesel S10 no RS: R$ ${nf(u?.v)} em ${mesAno(u?.d)}, ${pct(y)} em 12 meses. Olho no tanque, **comboio**!`, tom: 'ok', gesto: 'pensa' };
    }
  },

  safra: {
    nome: 'Soja e trigo', pronto: () => !!(E.dados?.conab_precos?.soja_rs || E.dados?.conab_safra?.soja),
    render() {
      const C = E.dados.conab_precos || {}, S = E.dados.conab_safra || {};
      const preco = (k, kpr, titulo, dec) => {
        const rs = (C[k]?.serie || []).slice(-25), pr = (C[kpr]?.serie || []).slice(-25), u = rs[rs.length - 1], a = rs[Math.max(0, rs.length - 13)];
        return `<div class="cartao anima"><div class="linha1"><div class="rot">${titulo} · preço ao produtor</div>${chip(variacao(u?.v, a?.v))}</div>
          <div class="comb-num"><span>RS <b>R$ ${nf(u?.v, dec)}</b><small style="display:inline;margin-left:8px">${esc(C[k]?.unidade || '')}</small></span><small>${mesAno(u?.d)} · chip: variação desde ${mesAno(a?.d)}</small></div>
          ${legenda([['RS', CORES[1]], ['Paraná', CORES[2], true]])}
          ${grafico({ series: [{ nome: 'PR', cor: CORES[2], pontos: pr, tracejado: true, fina: true }, { nome: 'RS', cor: CORES[1], pontos: rs }], W: 600, H: 178, fmt: v => nf(v, 0), margem: [10, 76, 26, 60] })}</div>`;
      };
      const sj = (S.soja || []).slice(-1)[0], ant = (S.soja || []).slice(-2)[0];
      let safra = '<div class="vazio">Levantamentos da CONAB ainda não coletados.</div>';
      if (sj) {
        const max = Math.max(...sj.levs.map(l => l.rs_prod || 0)), H = 210;
        safra = `<div class="levs">${sj.levs.map(l => `<div class="lev"><b>${nf((l.rs_prod || 0) / 1000, 1)}</b><div class="lev-b" style="height:${((l.rs_prod || 0) / max * H).toFixed(0)}px"></div><small>${l.mes}</small></div>`).join('')}</div>
          <div class="nota">RS em milhões de t. Brasil: ${nf(sj.levs[0].br_prod / 1000, 1)} → ${nf(sj.levs[sj.levs.length - 1].br_prod / 1000, 1)} milhões de t${ant && ant !== sj ? ` · safra ${ant.ano} no RS: ${nf(ant.levs[ant.levs.length - 1].rs_prod / 1000, 1)}` : ''}</div>`;
      }
      const dest = (E.cfg.destaques || []).filter(d => d.tela === 'safra' && (!d.valido_ate || d.valido_ate >= hojeISO()));
      $('#t-safra').innerHTML = `
        <div class="cab"><div><small>Preço e safra, mês a mês</small><h2>Soja e trigo</h2></div><div class="fonte">CONAB · preços mensais por UF e levantamentos da safra<br>atualiza quando a CONAB publica</div></div>
        <div class="g-safra">
          <div class="s-esq">${preco('soja_rs', 'soja_pr', 'Soja', 2)}${preco('trigo_rs', 'trigo_pr', 'Trigo', 0)}</div>
          <div class="s-dir">
            <div class="cartao anima"><div class="rot">Soja ${esc(sj?.ano || '')} no RS · levantamentos CONAB</div>${safra}</div>
            <div class="cartao anima campo"><div class="rot">Agora no campo</div>${dest.length ? dest.map(d => `<p><b>${esc(d.titulo)}</b> ${esc(d.texto)}<small>${esc(d.fonte)}</small></p>`).join('') : '<div class="vazio">Sem destaque vigente.</div>'}</div>
          </div>
        </div>`;
    },
    fala() {
      const sj = E.dados.conab_safra?.soja?.slice(-1)[0], s = E.dados.conab_precos?.soja_rs;
      if (sj && sj.levs.length > 1) { const v = variacao(sj.levs[sj.levs.length - 1].rs_prod, sj.levs[0].rs_prod); if (v <= -10) return { texto: `A soja do RS em ${sj.ano} caiu ${nf(Math.abs(v), 0)}% do primeiro ao último levantamento da CONAB. **Pé no freio** nas projeções, **comboio**!`, tom: 'ok', gesto: 'pensa' }; }
      return { texto: `Soja no RS a R$ ${nf(s?.valor)} a saca para o produtor em ${mesAno(s?.data)}. **Carga liberada!**`, tom: 'ok', gesto: 'joinha' };
    }
  },

  frete: {
    nome: 'Frete mínimo e reforma', pronto: () => !!E.cfg?.frete_minimo,
    render() {
      const fm = E.cfg.frete_minimo, rf = E.cfg.reforma || { marcos: [] }, s10 = E.dados?.anp_semanal?.diesel_s10, g = fm.gatilho_pct;
      const v = s10 ? variacao(s10.valor, fm.referencia) : null, pos = v == null ? 50 : Math.max(0, Math.min(100, (v + g * 1.4) / (g * 2.8) * 100));
      const ano = new Date().getFullYear(), dias = Math.ceil((new Date('2027-01-01T00:00:00-03:00') - Date.now()) / 864e5);
      $('#t-frete').innerHTML = `
        <div class="cab"><div><small>Regras que mexem no frete e nos impostos</small><h2>Frete mínimo & reforma</h2></div><div class="fonte">ANTT · ANP<br>${esc(rf.fonte || '')}</div></div>
        <div class="g-frete">
          <div class="cartao anima piso">
            <div class="rot">Piso mínimo do frete · ANTT</div>
            <div class="piso-ref"><div><small>Diesel de referência</small><b class="num">R$ ${nf(fm.referencia)}</b><span>${esc(fm.ato)} · em vigor desde ${dm(fm.vigencia)}/${fm.vigencia.slice(2, 4)}</span></div>
              <div><small>Diesel S10 agora (ANP)</small><b class="num ${Math.abs(v) >= g ? 'baixa' : ''}">R$ ${nf(s10?.valor)}</b><span>média Brasil, semana até ${dm(s10?.data)} · <b class="${cls(v)}">${pct(v)}</b></span></div></div>
            <div class="gatilho"><div class="g-faixa"><i style="left:${((g * .4) / (g * 2.8) * 100).toFixed(1)}%;right:${((g * .4) / (g * 2.8) * 100).toFixed(1)}%"></i><u style="left:${pos.toFixed(1)}%"><em>${pct(v)}</em></u></div>
              <div class="g-rot"><span>−${g}% · R$ ${nf(fm.referencia * (1 - g / 100))}<br>gatilho de baixa</span><span>referência</span><span>+${g}% · R$ ${nf(fm.referencia * (1 + g / 100))}<br>gatilho de alta</span></div></div>
            <div class="nota" style="margin-top:4px">${esc(fm.regra)}</div>
            <div class="linha-t">${fm.historico.map(h => `<div><b>${dm(h.data)}/${h.data.slice(2, 4)}</b><span>${esc(h.texto)}</span></div>`).join('')}</div>
          </div>
          <div class="cartao anima reforma">
            <div class="linha1"><div class="rot">Reforma tributária · calendário</div><span class="tag-b15">${dias > 0 ? `faltam ${dias} dias para a CBS ser cobrada` : 'CBS em cobrança'}</span></div>
            <div class="marcos">${rf.marcos.map(m => `<div class="marco${m.ano === ano ? ' agora' : m.ano < ano ? ' passou' : ''}"><i>${m.ano}${m.ano === ano ? '<em>hoje</em>' : ''}</i><div><b>${esc(m.titulo)}</b><span>${esc(m.texto)}</span></div></div>`).join('')}</div>
          </div>
        </div>`;
    },
    fala() {
      const fm = E.cfg.frete_minimo, s10 = E.dados?.anp_semanal?.diesel_s10; if (!s10) return null;
      const v = variacao(s10.valor, fm.referencia);
      if (Math.abs(v) >= fm.gatilho_pct * .9) return { texto: `**Pisca-alerta ligado!** Diesel a R$ ${nf(s10.valor)}, ${pct(v)} da referência da ANTT: o piso do frete está perto de mudar.`, tom: 'alerta' };
      return { texto: `Diesel a R$ ${nf(s10.valor)}, ${pct(v)} da referência da ANTT. Piso do frete sem mudança à vista: **estrada limpa**!`, tom: 'ok', gesto: 'joinha' };
    }
  },

  cenario: {
    nome: 'Cenário e impactos', pronto: () => !!E.dados,
    render() {
      const todos = insights(), itens = todos.slice(0, 4), resto = todos.slice(4, 8), lav = (E.dados.lavouras?.cidades || []).slice().sort((a, b) => b.prev_7d - a.prev_7d).slice(0, 7);
      const nots = (E.dados.noticias?.lavouras || []).slice(0, 3);
      const rotulo = { alerta: 'Alerta', atencao: 'Atenção', bom: 'Favorável', info: 'Contexto' };
      $('#t-cenario').innerHTML = `
        <div class="cab"><div><small>Leitura automática dos dados</small><h2>Cenário & impactos</h2></div><div class="fonte">Regras sobre ANP, ANTT, CONAB, CBOT e Open-Meteo<br>cada item mostra a fonte · coleta ${haQuanto(E.dados.gerado_em)}</div></div>
        <div class="g-cen">
          <div class="ins-grade">${itens.length ? itens.map(i => `<div class="cartao anima ins ${i.nivel}"><span class="ins-n">${rotulo[i.nivel]}</span><b>${esc(i.titulo)}</b><p>${esc(i.texto)}</p><p class="imp"><em>Impacto:</em> ${esc(i.impacto)}</p><small>${esc(i.fonte)}</small></div>`).join('') : '<div class="vazio">Nada fora do normal agora.</div>'}
            ${resto.length ? `<div class="cartao anima ins-mais"><div class="rot">Mais leituras</div>${resto.map(i => `<div class="im ${i.nivel}"><b>${esc(i.titulo)}</b><span>${esc(i.impacto)}</span></div>`).join('')}</div>` : ''}</div>
          <div class="cen-dir">
            <div class="cartao anima"><div class="rot">Chuva nas lavouras do RS · mm</div>
              <table class="tab-chuva"><tr><th></th><th>7 dias</th><th>próx. 7</th></tr>${lav.map(c => `<tr><td>${esc(c.cidade)}</td><td>${nf(c.mm_7d, 0)}</td><td class="${c.prev_7d >= 100 ? 'baixa' : c.prev_7d >= 50 ? 'amb' : ''}">${nf(c.prev_7d, 0)}</td></tr>`).join('')}</table></div>
            <div class="cartao anima"><div class="rot">Na imprensa · lavouras RS</div>${nots.length ? nots.map(n => `<p class="nt">${esc(n.titulo)}<small>${esc(n.fonte)} · ${n.data ? haQuanto(n.data) : ''}</small></p>`).join('') : '<div class="vazio" style="font-size:18px">Sem notícias novas.</div>'}</div>
          </div>
        </div>`;
    },
    fala() {
      const i = insights()[0]; if (!i) return null;
      if (i.nivel === 'alerta') return { texto: `**Pisca-alerta ligado!** ${i.titulo}. ${i.impacto}`, tom: 'alerta' };
      return { texto: `Leitura do dia: ${i.titulo.toLowerCase()}. **Bora rodar renovável!**`, tom: 'ok', gesto: 'pensa' };
    }
  }
};
