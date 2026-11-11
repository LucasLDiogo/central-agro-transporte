/* Central Agro & Transporte — Be8 · painel para TV (1920x1080)
   Desenvolvido por Lucas L. Diogo para a Be8 — 2026 */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (v, d = 2) => (v == null || isNaN(v)) ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = v => v == null ? '—' : (v > 0 ? '+' : '') + nf(v, 2) + '%';
const cls = v => v == null ? 'neutro' : v > 0.005 ? 'alta' : v < -0.005 ? 'baixa' : 'neutro';
const seta = v => v == null ? '' : v > 0.005 ? '▲' : v < -0.005 ? '▼' : '•';
const chip = v => `<span class="chip ${cls(v)}">${seta(v)} ${pct(v)}</span>`;
const params = new URLSearchParams(location.search);
const CORES = ['#0EB194', '#55C94F', '#3D8BB0', '#F2B705'];

const E = { cfg: null, dados: null, clima: null, rota: null, vivo: null };

/* ------------------------------------------------------------------ dados */
async function json(url, ms = 15000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, { signal: c.signal, cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
async function carregarDados() {
  const fontes = [E.cfg.dadosUrl, 'data/dados.json'].filter(Boolean);
  for (const u of fontes) {
    try { const d = await json(u + (u.includes('?') ? '&' : '?') + 't=' + Math.floor(Date.now() / 60000)); if (d && d.gerado_em) { if (!E.dados || d.gerado_em >= E.dados.gerado_em) E.dados = d; break; } } catch (e) { }
  }
  atualizou();
}
async function carregarClima() {
  const c = E.cfg.cidade;
  try {
    E.clima = await json(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,precipitation,weather_code,is_day' +
      '&hourly=temperature_2m,precipitation_probability,weather_code,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset' +
      '&forecast_days=7&timezone=America%2FSao_Paulo');
  } catch (e) { }
  try {
    const r = E.cfg.rota;
    const lista = await json(`https://api.open-meteo.com/v1/forecast?latitude=${r.map(p => p.lat).join(',')}&longitude=${r.map(p => p.lon).join(',')}` +
      '&current=temperature_2m,weather_code,is_day,wind_speed_10m&hourly=precipitation,precipitation_probability&forecast_days=2&timezone=America%2FSao_Paulo');
    E.rota = (Array.isArray(lista) ? lista : [lista]).map((m, i) => {
      const agora = Date.now(); let mm = 0, prob = 0;
      m.hourly.time.forEach((t, k) => { const dt = new Date(t).getTime() - agora; if (dt >= -3600e3 && dt < 24 * 3600e3) { mm += m.hourly.precipitation[k] || 0; prob = Math.max(prob, m.hourly.precipitation_probability[k] || 0); } });
      return { nome: r[i].nome, temp: m.current.temperature_2m, cod: m.current.weather_code, dia: m.current.is_day, vento: m.current.wind_speed_10m, mm, prob };
    });
  } catch (e) { }
  atualizou();
}
async function carregarCambio() {
  try {
    const v = await json('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
    E.vivo = { USD: { valor: +v.USDBRL.bid, var: +v.USDBRL.pctChange, hora: v.USDBRL.create_date }, EUR: { valor: +v.EURBRL.bid, var: +v.EURBRL.pctChange, hora: v.EURBRL.create_date } };
  } catch (e) { }
  atualizou();
}
/* cotacao de moeda: valor do momento (comercial) quando existe, senao PTAX do Banco Central */
function moeda(sigla) {
  const base = E.dados?.cambio?.[sigla]; const vivo = E.vivo?.[sigla] || (base?.agora ? { valor: base.agora.valor, var: base.agora.var_dia_pct } : null);
  if (!base && !vivo) return null;
  return { valor: vivo ? vivo.valor : base.valor, dia: vivo ? vivo.var : base?.var_dia_pct, d7: base?.var_7d_pct, d30: base?.var_30d_pct, serie: base?.serie || [], fonte: vivo ? 'comercial, tempo real' : 'PTAX Banco Central' };
}

/* ------------------------------------------------------------------ icones do tempo (SVG proprio) */
const WMO = c => c === 0 ? ['Céu limpo', 'sol'] : c <= 2 ? ['Parcialmente nublado', 'solnuvem'] : c === 3 ? ['Nublado', 'nuvem'] : c <= 48 ? ['Nevoeiro', 'nevoa'] :
  c <= 57 ? ['Garoa', 'garoa'] : c <= 67 ? ['Chuva', 'chuva'] : c <= 77 ? ['Neve', 'garoa'] : c <= 82 ? ['Pancadas de chuva', 'chuva'] : c <= 86 ? ['Neve', 'garoa'] : ['Trovoadas', 'raio'];
function icone(cod, dia = 1) {
  const tipo = WMO(cod)[1];
  const nuvem = (dx = 0, dy = 0, cor = '#C9D6DF') => `<path transform="translate(${dx},${dy})" fill="${cor}" d="M20 46h26a11 11 0 0 0 1.5-21.9A15 15 0 0 0 18.6 28 9.5 9.5 0 0 0 20 46z"/>`;
  const sol = (x, y, r) => dia ? `<g class="astro"><circle cx="${x}" cy="${y}" r="${r}" fill="#F2B705"/>${[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<line x1="${x + Math.cos(a) * (r + 4)}" y1="${y + Math.sin(a) * (r + 4)}" x2="${x + Math.cos(a) * (r + 10)}" y2="${y + Math.sin(a) * (r + 10)}" stroke="#F2B705" stroke-width="3.4" stroke-linecap="round"/>`; }).join('')}</g>`
    : `<path fill="#DCE6EC" d="M${x + r} ${y + r * .2}A${r} ${r} 0 1 1 ${x - r * .2} ${y - r}a${r * .78} ${r * .78} 0 0 0 ${r * 1.2} ${r * 1.2}z"/>`;
  const gotas = n => [...Array(n)].map((_, i) => `<line class="gota" x1="${24 + i * 9}" y1="50" x2="${21 + i * 9}" y2="59" stroke="#3D8BB0" stroke-width="3.4" stroke-linecap="round"/>`).join('');
  const corpo = { sol: sol(32, 32, 13), solnuvem: sol(24, 22, 9) + nuvem(2, 4), nuvem: nuvem(-6, -8, '#8FA9B8') + nuvem(2, 2),
    nevoa: [22, 32, 42].map(y => `<line x1="12" y1="${y}" x2="52" y2="${y}" stroke="#C9D6DF" stroke-width="4" stroke-linecap="round"/>`).join(''),
    garoa: nuvem(0, -4) + gotas(2), chuva: nuvem(0, -6, '#A9BCC8') + gotas(4),
    raio: nuvem(0, -6, '#8FA9B8') + '<path fill="#F2B705" d="M33 38l-8 13h6l-3 11 11-15h-6l4-9z"/>' }[tipo];
  return `<svg viewBox="0 0 64 64">${corpo}</svg>`;
}

/* ------------------------------------------------------------------ graficos */
function caminho(valores, w, h, margem = 6) {
  const min = Math.min(...valores), max = Math.max(...valores), amp = (max - min) || 1;
  return valores.map((v, i) => `${i ? 'L' : 'M'}${(i / (valores.length - 1) * w).toFixed(1)} ${(margem + (1 - (v - min) / amp) * (h - 2 * margem)).toFixed(1)}`).join(' ');
}
function spark(serie, cor) {
  const v = serie.map(p => p.v); if (v.length < 3) return '';
  const d = caminho(v, 400, 110, 10);
  return `<svg class="spark" viewBox="0 0 400 110" preserveAspectRatio="none"><defs><linearGradient id="g${cor.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cor}" stop-opacity=".35"/><stop offset="1" stop-color="${cor}" stop-opacity="0"/></linearGradient></defs>` +
    `<path d="${d} L400 110 L0 110 Z" fill="url(#g${cor.slice(1)})"/><path class="traco" d="${d}" fill="none" stroke="${cor}" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}
const haQuanto = iso => { if (!iso) return ''; const m = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000); return m < 60 ? `há ${Math.round(m)} min` : m < 1440 ? `há ${Math.round(m / 60)} h` : `há ${Math.round(m / 1440)} d`; };
const hhmm = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/* ------------------------------------------------------------------ telas */
const TELAS = {
  clima: { nome: 'Tempo em Passo Fundo', pronto: () => !!E.clima, render() {
    const m = E.clima, c = m.current, [desc] = WMO(c.weather_code), d = m.daily;
    const agora = Date.now(); const i0 = Math.max(0, m.hourly.time.findIndex(t => new Date(t).getTime() >= agora));
    const horas = [...Array(8)].map((_, k) => i0 + k * 2).filter(i => i < m.hourly.time.length);
    $('#t-clima').innerHTML = `
      <div class="cab"><div><small>Tempo agora</small><h2>${esc(E.cfg.cidade.nome)}</h2></div><div class="fonte">Fonte: Open-Meteo · atualizado ${hhmm(c.time)}</div></div>
      <div class="g-clima">
        <div class="cartao agora anima">
          <div><div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="num tempzao" data-conta="${c.temperature_2m}" data-dec="0">${nf(c.temperature_2m, 0)}<sup>°C</sup></div>${icone(c.weather_code, c.is_day)}</div>
          <div class="desc">${desc}</div><div class="sub">Sensação de ${nf(c.apparent_temperature, 0)}°</div></div>
          <div><div class="rot">Hoje</div><div class="num" style="font-size:46px;margin-top:6px"><span class="baixa" style="color:var(--blue)">${nf(d.temperature_2m_min[0], 0)}°</span> <span class="neutro" style="font-weight:600">/</span> <span style="color:var(--amber)">${nf(d.temperature_2m_max[0], 0)}°</span></div>
          <div class="sub">Sol nasce ${hhmm(d.sunrise[0])} · se põe ${hhmm(d.sunset[0])}</div></div>
        </div>
        <div class="c-dir">
          <div class="metricas">
            <div class="cartao anima"><div class="rot">Umidade</div><div class="num">${nf(c.relative_humidity_2m, 0)}<small>%</small></div></div>
            <div class="cartao anima"><div class="rot">Vento</div><div class="num">${nf(c.wind_speed_10m, 0)}<small>km/h</small></div></div>
            <div class="cartao anima"><div class="rot">Rajadas</div><div class="num">${nf(c.wind_gusts_10m, 0)}<small>km/h</small></div></div>
            <div class="cartao anima"><div class="rot">Chance de chuva hoje</div><div class="num" style="color:${d.precipitation_probability_max[0] >= 60 ? 'var(--amber)' : 'inherit'}">${nf(d.precipitation_probability_max[0], 0)}<small>%</small></div></div>
          </div>
          <div class="cartao anima" style="display:flex;flex-direction:column;gap:12px"><div class="rot">Próximas horas</div><div class="horas">${horas.map(i => `
            <div class="hora"><span>${hhmm(m.hourly.time[i])}</span>${icone(m.hourly.weather_code[i], m.hourly.is_day[i])}<b>${nf(m.hourly.temperature_2m[i], 0)}°</b><em>${nf(m.hourly.precipitation_probability[i], 0)}% chuva</em></div>`).join('')}</div></div>
          <div class="cartao anima" style="display:flex;flex-direction:column;gap:12px"><div class="rot">Próximos dias</div><div class="dias">${d.time.slice(1, 7).map((t, k) => { const i = k + 1; return `
            <div class="dia"><span>${new Date(t + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', '')}</span>${icone(d.weather_code[i])}<b>${nf(d.temperature_2m_max[i], 0)}°<i>${nf(d.temperature_2m_min[i], 0)}°</i></b><em>${nf(d.precipitation_sum[i], 0)} mm</em></div>`; }).join('')}</div></div>
        </div>
      </div>`;
  }, fala() {
    const c = E.clima.current, prob = E.clima.daily.precipitation_probability_max[0], [desc] = WMO(c.weather_code);
    if (prob >= 60) return { texto: `**Tem um gato no telhado**: ${nf(prob, 0)}% de chance de chuva hoje em ${E.cfg.cidade.nome}.`, tom: 'alerta' };
    return { texto: `${saudacao()} Agora em ${E.cfg.cidade.nome}: ${nf(c.temperature_2m, 0)}° e ${desc.toLowerCase()}.`, tom: 'ok' };
  } },

  mercado: { nome: 'Mercado agora', pronto: () => !!E.dados, render() {
    const D = E.dados, usd = moeda('USD'), eur = moeda('EUR'), cb = D.cbot || {}, cp = D.cepea || {};
    const grao = (titulo, fis, chi, cor) => {
      const usaFis = fis && fis.serie && fis.serie.length >= 5; const s = usaFis ? fis.serie : (chi?.serie || []);
      return `<div class="cartao cot anima"><div class="linha1"><div class="rot">${titulo}</div>${fis?.var_dia_pct != null ? chip(fis.var_dia_pct) : ''}</div>
        <div class="num valor" data-conta="${fis?.valor ?? ''}">${fis ? 'R$ ' + nf(fis.valor) : '—'}<small>${fis ? esc(fis.unidade.replace('R$', '').replace(' 60 kg', '')) : ''}</small></div>
        <div class="extra">${chi ? `Chicago US$ ${nf(chi.valor)}/bu <b class="${cls(chi.var_dia_pct)}" style="white-space:nowrap">${seta(chi.var_dia_pct)} ${pct(chi.var_dia_pct)}</b>` : ''}</div>
        <div class="extra" style="font-size:16px">${fis ? `${esc(fis.fonte)} · ${new Date(fis.data + 'T12:00').toLocaleDateString('pt-BR')}` : ''}</div>
        <div class="legspark">${usaFis ? 'indicador CEPEA' : 'tendência em Chicago, 3 meses'}</div>${spark(s, cor)}</div>`;
    };
    const fx = (titulo, m, cor) => `<div class="cartao cot anima"><div class="linha1"><div class="rot">${titulo}</div>${chip(m?.dia)}</div>
        <div class="num valor" data-conta="${m?.valor ?? ''}">${m ? 'R$ ' + nf(m.valor) : '—'}</div>
        <div class="extra">7 dias <b class="${cls(m?.d7)}">${pct(m?.d7)}</b> · 30 dias <b class="${cls(m?.d30)}">${pct(m?.d30)}</b></div>
        <div class="extra" style="font-size:16px">${m ? esc(m.fonte) : ''}</div><div class="legspark">PTAX, 3 meses</div>${spark(m?.serie || [], cor)}</div>`;
    const mini = (t, v, u, f) => `<div class="cartao anima"><div class="rot">${t}</div><div class="num">${v == null ? '—' : 'R$ ' + nf(v)}<small>${u}</small></div><div class="extra" style="font:500 14px var(--txt);color:var(--muted)">${f}</div></div>`;
    $('#t-mercado').innerHTML = `
      <div class="cab"><div><small>Câmbio e grãos</small><h2>Mercado agora</h2></div><div class="fonte">Banco Central · CEPEA/ESALQ · CBOT<br>coleta ${haQuanto(D.gerado_em)}</div></div>
      <div class="g-merc">
        ${fx('Dólar', usd, CORES[0])}${fx('Euro', eur, CORES[2])}
        ${grao('Soja · Paranaguá', cp.soja_paranagua, cb.soja_cbot, CORES[1])}${grao('Trigo · Rio Grande do Sul', cp.trigo_rs, cb.trigo_cbot, CORES[3])}
        <div class="faixa-mini">
          ${mini('Soja · Paraná', cp.soja_pr?.valor, '/sc', 'CEPEA')}${mini('Trigo · Paraná', cp.trigo_pr?.valor, '/t', 'CEPEA')}${mini('Milho', cp.milho?.valor, '/sc', 'CEPEA')}
          ${mini('Diesel · RS', D.diesel?.rs, '/litro', 'média ao consumidor · Petrobras')}${mini('Diesel · Brasil', D.diesel?.br, '/litro', 'média ao consumidor · Petrobras')}
        </div>
      </div>`;
  }, fala() {
    const u = moeda('USD'), s = E.dados.cbot?.soja_cbot;
    if (u && u.dia >= 0.5) return { texto: `**Tem um gato no telhado**: dólar subindo ${nf(u.dia)}% hoje, a R$ ${nf(u.valor)}.`, tom: 'alerta' };
    if (u && u.dia <= -0.5) return { texto: `Dólar caindo ${nf(Math.abs(u.dia))}% hoje, a R$ ${nf(u.valor)}. Olha aí, **Cuiudo**!`, tom: 'ok' };
    if (s && s.var_dia_pct >= 1) return { texto: `Soja subindo ${nf(s.var_dia_pct)}% em Chicago. **Joia rara**!`, tom: 'festa' };
    return { texto: `Mercado sem susto por enquanto, **Pia do Vô**. Dólar a R$ ${u ? nf(u.valor) : '—'}.`, tom: 'ok' };
  } },

  comparativo: { nome: 'Comparativo 30 dias', pronto: () => !!E.dados?.cambio?.USD, itens() {
    const D = E.dados, usd = moeda('USD'), eur = moeda('EUR');
    return [
      { nome: 'Dólar', sub: 'R$ · PTAX', serie: D.cambio.USD.serie, dia: usd.dia, d7: usd.d7, d30: usd.d30 },
      { nome: 'Euro', sub: 'R$ · PTAX', serie: D.cambio.EUR.serie, dia: eur.dia, d7: eur.d7, d30: eur.d30 },
      D.cbot?.soja_cbot && { nome: 'Soja', sub: 'Chicago · US$/bushel', serie: D.cbot.soja_cbot.serie, dia: D.cbot.soja_cbot.var_dia_pct, d7: D.cbot.soja_cbot.var_7d_pct, d30: D.cbot.soja_cbot.var_30d_pct },
      D.cbot?.trigo_cbot && { nome: 'Trigo', sub: 'Chicago · US$/bushel', serie: D.cbot.trigo_cbot.serie, dia: D.cbot.trigo_cbot.var_dia_pct, d7: D.cbot.trigo_cbot.var_7d_pct, d30: D.cbot.trigo_cbot.var_30d_pct },
    ].filter(Boolean).map(x => ({ ...x, cor: { 'Dólar': CORES[0], Euro: CORES[2], Soja: CORES[1], Trigo: CORES[3] }[x.nome] }));
  }, render() {
    const itens = this.itens(); const W = 800, H = 600, mL = 64, mR = 96, mT = 20, mB = 44;
    const corte = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const datas = [...new Set(itens.flatMap(x => x.serie.map(p => p.d)).filter(d => d >= corte))].sort();
    const linhas = itens.map(x => { let ult = null; const mapa = Object.fromEntries(x.serie.map(p => [p.d, p.v])); const antes = x.serie.filter(p => p.d < corte).pop(); ult = antes ? antes.v : null;
      const v = datas.map(d => (ult = mapa[d] ?? ult)); const base = v.find(n => n != null); return { ...x, idx: v.map(n => n == null ? 100 : n / base * 100) }; });
    const todos = linhas.flatMap(l => l.idx), min = Math.floor(Math.min(...todos) - 1), max = Math.ceil(Math.max(...todos) + 1);
    const X = i => mL + i / Math.max(1, datas.length - 1) * (W - mL - mR), Y = v => mT + (1 - (v - min) / (max - min)) * (H - mT - mB);
    const passo = (max - min) > 16 ? 4 : 2; const grade = []; for (let g = Math.ceil(min / passo) * passo; g <= max; g += passo) grade.push(g);
    const rot = [0, Math.floor(datas.length / 2), datas.length - 1].map(i => `<text x="${X(i)}" y="${H - 12}" fill="#8FA9B8" font-size="17" text-anchor="middle">${datas[i] ? new Date(datas[i] + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}</text>`).join('');
    const fins = linhas.map(l => ({ l, y: Y(l.idx[l.idx.length - 1]) })).sort((a, b) => a.y - b.y); for (let i = 1; i < fins.length; i++) if (fins[i].y - fins[i - 1].y < 24) fins[i].y = fins[i - 1].y + 24;
    $('#t-comparativo').innerHTML = `
      <div class="cab"><div><small>Quem subiu, quem caiu</small><h2>Comparativo · 30 dias</h2></div><div class="fonte">Base 100 no início do período<br>Banco Central (PTAX) · CBOT</div></div>
      <div class="g-comp">
        <div class="cartao anima" style="padding:16px"><svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%">
          ${grade.map(g => `<line x1="${mL}" x2="${W - mR}" y1="${Y(g)}" y2="${Y(g)}" stroke="${g === 100 ? '#8FA9B8' : '#1E3A4F'}" stroke-width="${g === 100 ? 1.6 : 1}" stroke-dasharray="${g === 100 ? '6 6' : ''}"/><text x="${mL - 12}" y="${Y(g) + 6}" fill="#8FA9B8" font-size="17" text-anchor="end">${g}</text>`).join('')}
          ${rot}
          ${linhas.map(l => `<path class="traco" d="${l.idx.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${l.cor}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/><circle class="ponta" cx="${X(datas.length - 1)}" cy="${Y(l.idx[l.idx.length - 1])}" r="7" fill="${l.cor}"/>`).join('')}
          ${fins.map(f => `<text class="ponta" x="${W - mR + 14}" y="${f.y + 7}" fill="${f.l.cor}" font-size="20" font-weight="700">${f.l.nome}</text>`).join('')}
        </svg></div>
        <div class="cartao anima"><table class="tabela"><tr><th>Variação</th><th>Dia</th><th>7 dias</th><th>30 dias</th></tr>
          ${itens.map(x => `<tr><td><i style="background:${x.cor}"></i>${x.nome}<small>${x.sub}</small></td><td class="${cls(x.dia)}">${pct(x.dia)}</td><td class="${cls(x.d7)}">${pct(x.d7)}</td><td class="${cls(x.d30)}">${pct(x.d30)}</td></tr>`).join('')}
        </table>
        <div class="extra" style="margin-top:22px;font:500 17px/1.45 var(--txt);color:var(--muted)">Soja e trigo comparados pelo contrato futuro de Chicago, em dólar. O histórico dos indicadores CEPEA em reais começa a ser acumulado a partir da primeira coleta deste painel.</div></div>
      </div>`;
  }, fala() {
    const m = this.itens().filter(x => x.d30 != null).sort((a, b) => Math.abs(b.d30) - Math.abs(a.d30))[0];
    return m ? { texto: `Em 30 dias, quem mais se mexeu foi ${m.nome.toLowerCase() === 'soja' ? 'a soja' : 'o ' + m.nome.toLowerCase()}: ${pct(m.d30)}. Olha aí, **Cuiudo**!`, tom: 'ok', gesto: 'pensa' } : null;
  } },

  rota: { nome: 'Rota até Rio Grande', pronto: () => !!E.rota, risco: p => p.mm >= 30 ? 'perigo' : (p.mm >= 10 || p.prob >= 75) ? 'atencao' : '', render() {
    const R = E.rota, n = R.length, W = 1314, x = i => 90 + i / (n - 1) * (W - 180), yL = 286;
    const avisos = (E.dados?.alertas || []).slice(0, 2);
    const ruins = R.filter(p => this.risco(p));
    $('#t-rota').innerHTML = `
      <div class="cab"><div><small>Clima no corredor de escoamento</small><h2>${esc(R[0].nome)} → ${esc(R[n - 1].nome)}</h2></div><div class="fonte">Chuva prevista para as próximas 24 h<br>Open-Meteo · avisos do INMET</div></div>
      <div class="g-rota">
        <div class="trilho">
          <svg class="linha" viewBox="0 0 ${W} 590" preserveAspectRatio="none"><line x1="${x(0)}" x2="${x(n - 1)}" y1="${yL}" y2="${yL}" stroke="#14384F" stroke-width="16" stroke-linecap="round"/><line id="trilhoCor" x1="${x(0)}" x2="${x(n - 1)}" y1="${yL}" y2="${yL}" stroke="#0EB194" stroke-width="5" stroke-dasharray="14 16" stroke-linecap="round"/>
            ${R.map((p, i) => `<circle cx="${x(i)}" cy="${yL}" r="15" fill="#081F2E" stroke="${{ perigo: '#E5484D', atencao: '#F2B705' }[this.risco(p)] || '#0EB194'}" stroke-width="6"/>`).join('')}</svg>
          <div id="caminhao"><svg viewBox="0 0 96 56"><rect x="2" y="8" width="58" height="32" rx="5" fill="#0EB194"/><path d="M62 18h16l14 12v10H62z" fill="#55C94F"/><path d="M67 22h9l8 7H67z" fill="#081F2E"/><circle cx="20" cy="44" r="8" fill="#E6EEF2"/><circle cx="46" cy="44" r="8" fill="#E6EEF2"/><circle cx="78" cy="44" r="8" fill="#E6EEF2"/><circle cx="20" cy="44" r="3" fill="#081F2E"/><circle cx="46" cy="44" r="3" fill="#081F2E"/><circle cx="78" cy="44" r="3" fill="#081F2E"/></svg></div>
          ${R.map((p, i) => `<div class="parada anima ${this.risco(p)}" style="left:${x(i) / W * 100}%;top:${i % 2 ? 334 : 0}px"><div class="cx"><h4>${esc(p.nome)}</h4>${icone(p.cod, p.dia)}<b>${nf(p.temp, 0)}°</b><em>${nf(p.mm, 0)} mm · ${nf(p.prob, 0)}%</em><span>vento ${nf(p.vento, 0)} km/h</span></div></div>`).join('')}
        </div>
        <div class="avisos">
          ${avisos.length ? avisos.map(a => `<div class="aviso anima" style="border-left-color:${esc(a.cor || '#F2B705')}"><b>INMET · ${esc(a.descricao)} (${esc(a.severidade)})</b>${esc(a.cidades.join(', '))} · até ${esc((a.fim || '').slice(8, 10) + '/' + (a.fim || '').slice(5, 7))} · ${esc(a.risco)}</div>`).join('')
            : `<div class="aviso ok anima"><b>Sem avisos do INMET para as cidades do corredor</b>Consulta feita ${haQuanto(E.dados?.gerado_em)}.</div>`}
          <div class="aviso anima ${ruins.length ? '' : 'ok'}"><b>${ruins.length ? 'Atenção à chuva no trajeto' : 'Trajeto sem chuva forte prevista'}</b>${ruins.length ? ruins.map(p => `${esc(p.nome)}: ${nf(p.mm, 0)} mm`).join(' · ') : 'Nenhuma cidade com mais de 10 mm nas próximas 24 h.'}</div>
        </div>
      </div>`;
  }, entrar() {
    const t = $('.trilho'), w = t.clientWidth; gsap.killTweensOf('#caminhao');
    gsap.fromTo('#caminhao', { x: 90 / 1314 * w - 48, y: 286 / 590 * t.clientHeight - 66 }, { x: (1314 - 90) / 1314 * w - 48, duration: 16, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.2 });
    gsap.to('#trilhoCor', { strokeDashoffset: -300, duration: 10, ease: 'none', repeat: -1 });
  }, fala() {
    const pior = [...E.rota].sort((a, b) => b.mm - a.mm)[0]; const av = (E.dados?.alertas || [])[0];
    if (av) return { texto: `**Tem um gato no telhado** na rota: aviso de ${av.descricao.toLowerCase()} em ${av.cidades[0]}.`, tom: 'alerta' };
    if (this.risco(pior)) return { texto: `**Tem um gato no telhado** na rota: ${nf(pior.mm, 0)} mm de chuva previstos em ${pior.nome}.`, tom: 'alerta' };
    return { texto: 'Rota até Rio Grande sem chuva forte prevista. **Joia preciosa**!', tom: 'festa' };
  } },

  noticias: { nome: 'Central de notícias', pronto: () => Object.values(E.dados?.noticias || {}).some(l => l.length), todas() {
    return E.cfg.noticias.flatMap(c => (E.dados.noticias[c.id] || []).map(n => ({ ...n, cat: c.nome })));
  }, render() {
    const cats = E.cfg.noticias.filter(c => (E.dados.noticias[c.id] || []).length);
    this.fila = cats.map(c => ({ ...E.dados.noticias[c.id][0], cat: c.nome })); // destaque: a mais recente de cada assunto
    const vistos = new Set(this.fila.map(n => n.titulo));
    const lista = []; for (let k = 1; k < 4 && lista.length < 5; k++) for (const c of cats) { const n = E.dados.noticias[c.id][k]; if (n && !vistos.has(n.titulo) && lista.length < 5) { vistos.add(n.titulo); lista.push({ ...n, cat: c.nome }); } } // uma de cada assunto
    $('#t-noticias').innerHTML = `
      <div class="cab"><div><small>ANTT · frete · rotas · combustíveis · agro</small><h2>Central de notícias</h2></div><div class="fonte">Manchetes reunidas via Google Notícias<br>coleta ${haQuanto(E.dados.gerado_em)}</div></div>
      <div class="g-not">
        <div class="cartao destaque anima"><div id="destaque"></div><div class="pontos">${this.fila.map(() => '<i></i>').join('')}</div></div>
        <div class="lista">${lista.map(n => `<div class="item anima"><small>${esc(n.cat)}</small><p>${esc(n.titulo)}</p><span>${esc(n.fonte)} · ${haQuanto(n.data)}</span></div>`).join('')}</div>
      </div>`;
    this.pos = -1; this.proxima(true);
  }, proxima(semAnim) {
    if (!this.fila?.length) return; this.pos = (this.pos + 1) % this.fila.length; const n = this.fila[this.pos], el = $('#destaque');
    const troca = () => { el.innerHTML = `<span class="cat">${esc(n.cat)}</span><h3>${esc(n.titulo)}</h3><div class="meta"><b>${esc(n.fonte)}</b> · ${haQuanto(n.data)}</div>`; $$('.pontos i').forEach((p, i) => p.classList.toggle('at', i === this.pos)); };
    if (semAnim) return troca();
    gsap.timeline().to(el, { opacity: 0, y: -18, duration: .3, ease: 'power2.in', onComplete: troca }).fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' });
  }, entrar() { clearInterval(this.tmr); this.tmr = setInterval(() => this.proxima(), 7000); }, sair() { clearInterval(this.tmr); }, fala() {
    const n = this.fila?.[0]; return { texto: n ? `Central de notícias no ar, **Pia do Vô**! Tem novidade em ${n.cat}.` : 'Central de notícias no ar, **Pia do Vô**!', tom: 'ok' };
  } },

  video: { nome: 'Vídeo em destaque', pronto: () => videos().length > 0, render() { }, entrar(fim) {
    const lista = videos(); this.i = ((this.i ?? -1) + 1) % lista.length; const v = lista[this.i]; const som = v.som ? 0 : 1;
    const corpo = v.youtube
      ? `<iframe id="yt" allow="autoplay; encrypted-media; fullscreen" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?autoplay=1&mute=${som}&controls=0&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}"></iframe>`
      : `<video id="vd" src="${esc(v.src)}" autoplay ${v.som ? '' : 'muted'} playsinline></video>`;
    $('#t-video').innerHTML = `<div class="quadro">${corpo}<div class="legenda"><b>VÍDEO</b>${esc(v.titulo || '')}</div></div>`;
    let acabou = false; const termina = () => { if (!acabou) { acabou = true; clearTimeout(this.tmax); window.removeEventListener('message', this.ouvir); fim(); } };
    this.tmax = setTimeout(termina, (v.duracaoSeg || 240) * 1000);
    if (v.youtube) {
      const fr = $('#yt'); fr.addEventListener('load', () => fr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'));
      this.ouvir = ev => { if (ev.source !== fr.contentWindow) return; try { const d = JSON.parse(ev.data); if (d.event === 'infoDelivery' && d.info && d.info.playerState === 0) termina(); } catch (e) { } };
      window.addEventListener('message', this.ouvir);
    } else { const el = $('#vd'); el.addEventListener('ended', termina); el.addEventListener('error', termina); el.play().catch(() => { el.muted = true; el.play().catch(termina); }); }
    this.olhar = setInterval(() => Avatar.tocar('olha'), 21000);
    return true; // a propria tela decide quando terminar
  }, sair() { clearTimeout(this.tmax); clearInterval(this.olhar); window.removeEventListener('message', this.ouvir); setTimeout(() => { $('#t-video').innerHTML = ''; }, 600); }, fala() {
    return { texto: 'Presta atenção nesse vídeo, **joia rara**!', tom: 'ok' };
  } },
};
function videos() { const u = params.get('video'); const extra = u ? [/^[\w-]{11}$/.test(u) ? { youtube: u, titulo: 'Vídeo' } : { src: u, titulo: 'Vídeo' }] : []; return [...extra, ...(E.cfg?.videos || [])]; }
function saudacao() { const h = new Date().getHours(); return h < 12 ? '**Bom dia com alegria**, **joia preciosa**!' : h < 18 ? 'Boa tarde, **joia rara**!' : 'Boa noite, **Pia do Vô**!'; }

/* ------------------------------------------------------------------ avatar
   Cada clipe e um MP4 "empilhado": cor na metade de cima, mascara na de baixo. O WebGL junta os dois (fundo transparente). */
const Avatar = {
  clipes: ['repouso', 'sorriso', 'bocejo', 'olha', 'surpresa', 'aceno', 'risada', 'falando', 'dormir', 'dormindo', 'acordar', 'chimarrao', 'espicha', 'joinha', 'pensa'],
  repetem: { repouso: 1, dormindo: 1 }, v: {}, atual: null, estado: 'acordado', ocupadoAte: 0, ultimoBocejo: Date.now(),
  iniciar() {
    const cv = $('#avatarGl'); let gl = null; try { gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }); } catch (e) { }
    if (!gl) return; this.gl = gl;
    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;uniform sampler2D t;varying vec2 uv;void main(){vec3 c=texture2D(t,vec2(uv.x,uv.y*.498+.001)).rgb;float a=smoothstep(.06,.94,texture2D(t,vec2(uv.x,.501+uv.y*.498)).r);gl_FragColor=vec4(c*a,a);}'));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    for (const [k, val] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, k, val);
    for (const nome of this.clipes) {
      const el = document.createElement('video'); el.muted = true; el.playsInline = true; el.preload = 'auto'; el.loop = !!this.repetem[nome]; el.src = `assets/avatar/${nome}.mp4?v=${E.cfg.versao || 1}`;
      el.addEventListener('ended', () => { if (this.atual === nome) this.terminou(nome); });
      el.addEventListener('error', () => { delete this.v[nome]; });
      this.v[nome] = el;
    }
    const desenhar = () => { const el = this.v[this.mostrando]; if (el && el.readyState >= 2) { try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); if (!this.visivel) { this.visivel = true; cv.style.opacity = 1; $('#avatarImg').style.opacity = 0; } } catch (e) { } } requestAnimationFrame(desenhar); };
    requestAnimationFrame(desenhar);
    this.tocar('repouso');
    gsap.to('#avatar .aura', { scale: 1.08, opacity: .8, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  },
  /* toca um clipe; a troca so aparece quando o primeiro quadro do novo clipe esta pronto (sem piscar) */
  tocar(nome, aoFim) {
    const el = this.v[nome]; if (!el) { aoFim && aoFim(); return; }
    this.atual = nome; this.aoFim = aoFim || null; try { el.currentTime = 0; } catch (e) { }
    const troca = () => { if (this.atual !== nome) return; const antigo = this.mostrando; this.mostrando = nome; if (antigo && antigo !== nome) this.v[antigo]?.pause(); };
    el.play().then(() => { el.requestVideoFrameCallback ? el.requestVideoFrameCallback(troca) : setTimeout(troca, 60); }).catch(() => { if (nome !== 'repouso') this.terminou(nome); });
  },
  terminou(nome) { const f = this.aoFim; this.aoFim = null; if (f) return f(); if (this.estado === 'dormindo') return this.tocar('dormindo'); this.tocar('repouso'); },
  livre() { return this.estado === 'acordado' && Date.now() > this.ocupadoAte && (this.atual === 'repouso' || !this.gl); },

  /* fala: balao com as palavras entrando uma a uma; **negrito** marca os bordoes */
  falar(texto, tom = 'ok', gesto) {
    if (this.estado !== 'acordado') return;
    const b = $('#balao'), p = $('p', b); b.className = tom === 'alerta' ? 'alerta' : tom === 'festa' ? 'festa' : '';
    p.innerHTML = texto.split(/(\*\*.+?\*\*)/).filter(Boolean).map((parte, i) => {
      const forte = parte.startsWith('**'), limpo = forte ? parte.slice(2, -2) : parte, cola = i > 0 && !forte && !/^\s/.test(parte);
      return limpo.trim().split(/\s+/).filter(Boolean).map((w, k) => `${k === 0 && cola ? '' : ' '}<span class="palavra">${forte ? '<b>' : ''}${esc(w)}${forte ? '</b>' : ''}</span>`).join('');
    }).join('');
    const palavras = $$('.palavra', p), dur = Math.max(4.2, palavras.length * .42 + 2.2); this.ocupadoAte = Date.now() + dur * 1000;
    gsap.killTweensOf([b, palavras]);
    gsap.timeline().set(b, { visibility: 'visible' })
      .fromTo(b, { opacity: 0, scale: .4, y: 40, rotation: -6 }, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: .55, ease: 'back.out(1.7)' })
      .fromTo(palavras, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .22, stagger: .075, ease: 'power2.out' }, '-=.25')
      .to(b, { opacity: 0, scale: .85, y: -14, duration: .35, ease: 'power2.in', onComplete: () => gsap.set(b, { visibility: 'hidden' }) }, dur);
    if (gesto === false) return; // so o balao, sem trocar o clipe que esta tocando
    const g = (gesto && this.v[gesto]) ? gesto : (tom === 'alerta' ? 'surpresa' : tom === 'festa' ? (this.v.joinha ? 'joinha' : 'risada') : 'falando');
    this.tocar(g, g === 'falando' ? null : () => this.tocar('falando'));
    gsap.fromTo('#avatar', { y: 0 }, { y: -14, duration: .22, yoyo: true, repeat: 1, ease: 'power2.out' });
  },
  bocejar() {
    if (this.estado !== 'acordado') return; this.ultimoBocejo = Date.now(); this.ocupadoAte = Date.now() + 7000;
    this.tocar('bocejo'); setTimeout(() => { if (this.atual === 'bocejo') this.falar(['Uaaah… que calmaria, **Pia do Vô**.', 'Uaaah… bateu aquele soninho, **Cuiudo**.', 'Uaaah… alguém passa um café aí, **joia rara**?'][Math.floor(Math.random() * 3)], 'ok', false); }, 3400);
  },
  /* gesto solto (chimarrao, espichar, joinha...) com uma frase opcional no meio */
  gesto(nome, frases, atraso = 1500) {
    if (this.estado !== 'acordado' || !this.v[nome]) return false; this.ultimoBocejo = Date.now(); this.ocupadoAte = Date.now() + (this.v[nome].duration || 8) * 1000;
    this.tocar(nome); if (frases) setTimeout(() => { if (this.atual === nome) this.falar(frases[Math.floor(Math.random() * frases.length)], 'ok', false); }, atraso);
    return true;
  },
  chimarrao() { return this.gesto('chimarrao', ['Hora do chimarrão, **Pia do Vô**!', 'Um mate pra acompanhar as notícias, **Cuiudo**.', 'Chimarrão na cuia e olho no painel, **joia rara**!'], 2600); },
  espichar() { return this.gesto('espicha', ['Deixa eu me espichar um pouco, **Pia do Vô**…', 'Aaah… uma espichada pra seguir o dia, **Cuiudo**!'], 1200); },
  /* muito tempo sem novidade: alterna bocejo, chimarrao e espichada */
  ocioso() { const lista = ['bocejo', 'chimarrao', 'espicha'].filter(n => this.v[n]); this.vez = ((this.vez ?? -1) + 1) % lista.length; const n = lista[this.vez]; return n === 'chimarrao' ? this.chimarrao() : n === 'espicha' ? this.espichar() : this.bocejar(); },
  dormir() {
    if (this.estado !== 'acordado') return; this.estado = 'dormindo'; gsap.set('#balao', { visibility: 'hidden', opacity: 0 });
    this.tocar('dormir', () => this.tocar('dormindo'));
    this.tlZ = gsap.timeline({ repeat: -1, delay: 3 }); $$('#zzz b').forEach((z, i) => this.tlZ.fromTo(z, { x: 0, y: 0, opacity: 0, scale: .5 + i * .25 }, { x: 60 + i * 26, y: -110 - i * 40, opacity: 1, scale: 1 + i * .3, duration: 2.2, ease: 'sine.out' }, i * .7).to(z, { opacity: 0, duration: .5 }, i * .7 + 1.9));
    gsap.to('#avatar', { rotation: 2.5, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' });
  },
  acordar(falar = true) {
    if (this.estado !== 'dormindo') return; this.estado = 'acordando'; this.tlZ?.kill(); gsap.to('#zzz b', { opacity: 0, duration: .2 }); gsap.killTweensOf('#avatar'); gsap.to('#avatar', { rotation: 0, duration: .3 });
    this.ultimoBocejo = Date.now();
    this.tocar('acordar', () => { this.estado = 'acordado'; this.tocar('repouso'); if (falar) this.falar('Opa! Tô ligado, **Cuiudo**!', 'ok', 'surpresa'); });
  },
};

/* ------------------------------------------------------------------ troca de telas: o avatar puxa a proxima */
const Show = { ordem: [], pos: -1, pausado: false, trocando: false, ultimaTroca: Date.now(),
  disponiveis() { return E.cfg.telas.ordem.filter(id => TELAS[id] && TELAS[id].pronto()); },
  programacao() {
    const nova = this.disponiveis();
    if (nova.join() !== this.ordem.join()) { this.ordem = nova; $('#programacao').innerHTML = nova.map((id, i) => `<li data-id="${id}"><i>${i + 1}</i>${esc(TELAS[id].nome)}<u></u></li>`).join(''); }
    $$('#programacao li').forEach(li => li.classList.toggle('ativa', li.dataset.id === this.atual));
  },
  proxima(passo = 1) { this.programacao(); if (!this.ordem.length) return; const i = this.ordem.indexOf(this.atual); this.ir(this.ordem[(i + passo + this.ordem.length) % this.ordem.length]); },
  ir(id) {
    if (this.trocando || !TELAS[id] || !TELAS[id].pronto()) return; this.trocando = true; this.ultimaTroca = Date.now();
    const velha = this.atual, nova = TELAS[id], sec = $('#t-' + id), secVelha = velha && $('#t-' + velha);
    gsap.killTweensOf('#programacao u'); gsap.set('#programacao u', { scaleX: 0 }); this.tempo?.kill(); if (velha) TELAS[velha].sair?.();
    if (Avatar.estado === 'dormindo') Avatar.acordar(false);
    nova.render(); this.atual = id; this.programacao();
    const tl = gsap.timeline({ onComplete: () => { this.trocando = false; this.depois(id); } });
    if (secVelha) tl.to(secVelha, { x: -140, opacity: 0, scale: .96, duration: .45, ease: 'power2.in', onComplete: () => gsap.set(secVelha, { visibility: 'hidden' }) });
    tl.add(() => { if (Avatar.estado === 'acordado') Avatar.tocar('olha'); }, 0)
      .set(sec, { visibility: 'visible', x: 1480, opacity: 1, scale: 1 }, '>-0.1')
      .to('#avatar', { x: 34, rotation: 5, duration: .28, ease: 'power2.out' })                 // se prepara
      .to(sec, { x: 760, duration: .5, ease: 'power3.out' })                  // primeiro puxao
      .to('#avatar', { x: -26, rotation: -6, duration: .5, ease: 'power3.out' }, '<')
      .to('#avatar', { x: 10, rotation: 3, duration: .2, ease: 'power1.inOut' })                 // toma folego
      .to(sec, { x: 0, duration: .7, ease: 'back.out(1.15)' })                // segundo puxao
      .to('#avatar', { x: -30, rotation: -7, duration: .45, ease: 'power3.out' }, '<')
      .to('#avatar', { x: 0, rotation: 0, duration: .7, ease: 'elastic.out(1,.55)' }, '>-0.15')
      .from($$('.anima', sec), { opacity: 0, y: 34, duration: .55, stagger: .06, ease: 'power3.out', clearProps: 'opacity,transform' }, '-=1.0');
    $$('.traco', sec).forEach(t => { const n = t.getTotalLength ? t.getTotalLength() : 0; if (n) { gsap.set(t, { strokeDasharray: n, strokeDashoffset: n }); tl.to(t, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '-=1.0'); } });
    if ($$('.ponta', sec).length) tl.from($$('.ponta', sec), { opacity: 0, duration: .4, stagger: .08 }, '-=.4');
    $$('[data-conta]', sec).forEach(el => { const alvo = parseFloat(el.dataset.conta), txt = el.firstChild; if (isNaN(alvo) || !txt || txt.nodeType !== 3) return; const pre = txt.nodeValue.trim().startsWith('R$') ? 'R$ ' : '', dec = +(el.dataset.dec ?? 2), o = { v: alvo * .93 }; tl.to(o, { v: alvo, duration: 1.3, ease: 'power2.out', onUpdate: () => { txt.nodeValue = pre + nf(o.v, dec); } }, '-=1.4'); });
  },
  depois(id) {
    const tela = TELAS[id]; const fim = () => { if (this.atual === id && !this.pausado) this.proxima(); };
    const propria = tela.entrar?.(fim);
    const f = tela.fala?.(); if (f && Avatar.estado === 'acordado') setTimeout(() => this.atual === id && Avatar.falar(f.texto, f.tom, this.primeira ? f.gesto : (this.primeira = true, 'aceno')), 350);
    if (propria === true) return;
    const li = $(`#programacao li[data-id="${id}"] u`), seg = +(params.get('seg') || E.cfg.telas.segundosPorTela);
    this.tempo = gsap.fromTo(li, { scaleX: 0 }, { scaleX: 1, duration: seg, ease: 'none', onComplete: fim }); if (this.pausado) this.tempo.pause();
  },
  pausar(v = !this.pausado) { this.pausado = v; v ? this.tempo?.pause() : (this.tempo ? this.tempo.resume() : this.proxima()); $('.aovivo').lastChild.nodeValue = v ? 'PAUSADO' : 'AO VIVO'; },
};

/* ------------------------------------------------------------------ faixa de noticias e cotacoes do rodape */
let faixaTween = null, faixaChave = '';
function faixa() {
  const D = E.dados, itens = []; if (!D) return;
  const q = (nome, valor, v) => `<span><b>${nome}</b> ${valor} ${v != null ? `<b class="${cls(v)}">${seta(v)} ${pct(v)}</b>` : ''}</span>`;
  const u = moeda('USD'), e = moeda('EUR'); if (u) itens.push(q('Dólar', 'R$ ' + nf(u.valor), u.dia)); if (e) itens.push(q('Euro', 'R$ ' + nf(e.valor), e.dia));
  const cp = D.cepea || {}, cb = D.cbot || {};
  if (cp.soja_paranagua) itens.push(q('Soja Paranaguá', `R$ ${nf(cp.soja_paranagua.valor)}/sc`, cp.soja_paranagua.var_dia_pct));
  if (cp.trigo_rs) itens.push(q('Trigo RS', `R$ ${nf(cp.trigo_rs.valor)}/t`, cp.trigo_rs.var_dia_pct));
  if (cb.soja_cbot) itens.push(q('Soja Chicago', `US$ ${nf(cb.soja_cbot.valor)}/bu`, cb.soja_cbot.var_dia_pct));
  if (cb.trigo_cbot) itens.push(q('Trigo Chicago', `US$ ${nf(cb.trigo_cbot.valor)}/bu`, cb.trigo_cbot.var_dia_pct));
  if (D.diesel?.rs) itens.push(q('Diesel RS', `R$ ${nf(D.diesel.rs)}/L`));
  if (E.clima) itens.push(q(E.cfg.cidade.nome, `${nf(E.clima.current.temperature_2m, 0)}° · ${WMO(E.clima.current.weather_code)[0]}`));
  for (const r of (E.cfg.recados || [])) itens.push(`<span class="n" data-c="Recado">${esc(r)}</span>`);
  for (const c of E.cfg.noticias) for (const n of (D.noticias?.[c.id] || []).slice(0, 2)) itens.push(`<span class="n" data-c="${esc(c.nome)}">${esc(n.titulo)} <i style="color:var(--muted);font-style:normal">· ${esc(n.fonte)}</i></span>`);
  const html = itens.join(''); if (html === faixaChave) return; faixaChave = html;
  const el = $('#faixa'); el.innerHTML = html + html; faixaTween?.kill(); gsap.set(el, { x: 0 });
  requestAnimationFrame(() => { const metade = el.scrollWidth / 2; if (metade > 0) faixaTween = gsap.to(el, { x: -metade, duration: metade / 95, ease: 'none', repeat: -1 }); });
}

/* ------------------------------------------------------------------ relogio, topo e rotinas */
function relogio() {
  const a = new Date(); $('#hora').textContent = a.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); $('#seg').textContent = String(a.getSeconds()).padStart(2, '0');
  const d = a.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }); $('#data').textContent = d.charAt(0).toUpperCase() + d.slice(1);
}
function atualizou() {
  if (!E.cfg) return;
  if (E.clima) { const c = E.clima.current; $('#miniClima').innerHTML = `${icone(c.weather_code, c.is_day)}<div>${nf(c.temperature_2m, 0)}°<small>${esc(E.cfg.cidade.nome)}</small></div>`; }
  const u = moeda('USD'); if (u) $('#miniDolar').innerHTML = `<div>R$ ${nf(u.valor)} <span class="${cls(u.dia)}" style="font-size:20px">${seta(u.dia)} ${pct(u.dia)}</span><small>Dólar</small></div>`;
  if (E.dados) $('#atualizado').textContent = 'Dados coletados às ' + hhmm(E.dados.gerado_em) + ' de ' + new Date(E.dados.gerado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  faixa(); Show.programacao();
  if (E.pronto && Show.pos === -1 && Show.ordem.length) { Show.pos = 0; const quer = params.get('tela'); Show.ir(Show.ordem.includes(quer) ? quer : Show.ordem[0]); if (params.get('pausa')) Show.pausado = true; }
}
/* tedio: muito tempo sem novidade -> boceja; parado de verdade (pausado ou madrugada) -> dorme */
function tedio() {
  const a = E.cfg.avatar, agora = Date.now(), h = new Date().getHours(), madrugada = h >= 23 || h < 5;
  const parado = (agora - Show.ultimaTroca) / 1000;
  if (Avatar.estado === 'acordado' && Avatar.livre()) {
    if ((Show.pausado && parado > a.dormeAposSeg) || (madrugada && parado > 14 && Show.atual !== 'video')) return Avatar.dormir();
    if ((agora - Avatar.ultimoBocejo) / 1000 > a.bocejaAposSeg && parado > 12 && Show.atual !== 'video') return Avatar.ocioso();
    if (Math.random() < .16) Avatar.tocar('sorriso');
  }
}
function ajustar() { const s = Math.min(innerWidth / 1920, innerHeight / 1080); $('#palco').style.transform = `translate(-50%,-50%) scale(${s})`; }

async function iniciar() {
  ajustar(); addEventListener('resize', ajustar); relogio(); setInterval(relogio, 1000);
  E.cfg = await json('config.json');
  $('#titulo').textContent = E.cfg.titulo; $('#subtitulo').textContent = E.cfg.subtitulo; document.title = E.cfg.titulo + ' · Be8';
  Avatar.iniciar();
  gsap.to('.b1', { x: 120, y: -80, duration: 26, yoyo: true, repeat: -1, ease: 'sine.inOut' }); gsap.to('.b2', { x: -140, y: 90, duration: 32, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.aovivo i', { opacity: .25, duration: .8, yoyo: true, repeat: -1 });
  gsap.from('#topo', { y: -110, duration: .9, ease: 'power3.out' }); gsap.from('#rodape', { y: 80, duration: .9, ease: 'power3.out' }); gsap.from('#avatar', { y: 600, duration: 1.1, ease: 'back.out(1.2)', delay: .2 });
  await Promise.allSettled([carregarDados(), carregarClima(), carregarCambio()]); E.pronto = true; atualizou();
  setInterval(carregarDados, 5 * 60e3); setInterval(carregarClima, 10 * 60e3); setInterval(carregarCambio, 3 * 60e3); setInterval(tedio, 8000);
  setInterval(() => { if (new Date().getHours() === 4 && performance.now() > 3600e3) location.reload(); }, 20 * 60e3); // pega versao nova de madrugada

  let tCursor; const mexeu = () => { document.body.classList.remove('sem-cursor'); clearTimeout(tCursor); tCursor = setTimeout(() => document.body.classList.add('sem-cursor'), 3000); }; addEventListener('mousemove', mexeu); mexeu();
  const telaCheia = () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => { }); };
  addEventListener('dblclick', telaCheia);
  addEventListener('keydown', ev => {
    if (Avatar.estado === 'dormindo' && !['d', 'D'].includes(ev.key)) Avatar.acordar();
    ({ ArrowRight: () => Show.proxima(1), ArrowLeft: () => Show.proxima(-1), ' ': () => Show.pausar(), f: telaCheia, F: telaCheia, b: () => Avatar.bocejar(), B: () => Avatar.bocejar(), c: () => Avatar.chimarrao(), C: () => Avatar.chimarrao(), e: () => Avatar.espichar(), E: () => Avatar.espichar(), j: () => Avatar.gesto('joinha'), J: () => Avatar.gesto('joinha'), d: () => Avatar.dormir(), D: () => Avatar.dormir(),
      h: () => { const a = $('#ajuda'); a.style.display = a.style.display === 'block' ? 'none' : 'block'; }, H: () => { const a = $('#ajuda'); a.style.display = a.style.display === 'block' ? 'none' : 'block'; } })[ev.key]?.();
    const n = parseInt(ev.key, 10); if (n >= 1 && n <= Show.ordem.length) Show.ir(Show.ordem[n - 1]);
  });
  try { const trava = () => navigator.wakeLock?.request('screen').catch(() => { }); trava(); document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && trava()); } catch (e) { }
}
iniciar();
