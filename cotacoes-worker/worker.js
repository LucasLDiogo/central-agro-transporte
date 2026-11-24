/* central-agro-cotacoes — cotações ao vivo para a tela "Energia & Biocombustível" da Central Agro & Transporte.
   Busca os futuros no Yahoo Finance (atraso típico de 10 a 15 min da bolsa), guarda 60 s em cache e libera CORS.
   GET https://cotacoes.lldworks.com.br/  ->  { gerado_em, itens: { oleo, diesel, brent, soja, farelo, milho, dolar } }
   Desenvolvido por Lucas L. Diogo para a Be8 — 2026 */
const ATIVOS = [
  ['oleo', 'ZL=F', 'Óleo de soja', 'Chicago (CBOT)', 'US¢/lb'],
  ['diesel', 'HO=F', 'Diesel ULSD', 'Nova York (NYMEX)', 'US$/galão'],
  ['brent', 'BZ=F', 'Petróleo Brent', 'Londres (ICE)', 'US$/barril'],
  ['soja', 'ZS=F', 'Soja', 'Chicago (CBOT)', 'US¢/bushel'],
  ['farelo', 'ZM=F', 'Farelo de soja', 'Chicago (CBOT)', 'US$/t curta'],
  ['milho', 'ZC=F', 'Milho', 'Chicago (CBOT)', 'US¢/bushel'],
  ['dolar', 'BRL=X', 'Dólar comercial', 'câmbio', 'R$'],
];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };

async function cotacao([id, ticker, nome, bolsa, unidade]) {
  let ultimoErro;
  for (const host of ['query1', 'query2']) {
    try {
      const r = await fetch(`https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=5m&includePrePost=false`,
        { headers: { 'User-Agent': UA, Accept: 'application/json' }, cf: { cacheTtl: 30 } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const res = (await r.json()).chart.result[0], m = res.meta;
      const ts = res.timestamp || [], fech = ((res.indicators.quote || [])[0] || {}).close || [];
      const intradia = [];
      ts.forEach((t, i) => { if (fech[i] != null) intradia.push([t, +fech[i].toFixed(4)]); });
      const preco = m.regularMarketPrice, anterior = m.chartPreviousClose ?? m.previousClose ?? null;
      const per = (m.currentTradingPeriod || {}).regular || {}, agora = Date.now() / 1000;
      return {
        id, ticker, nome, bolsa, unidade, preco, anterior,
        var_pct: anterior ? +((preco / anterior - 1) * 100).toFixed(2) : null,
        hora: m.regularMarketTime || null, aberto: per.start ? agora >= per.start && agora <= per.end : null,
        intradia: intradia.slice(-150)
      };
    } catch (e) { ultimoErro = e; }
  }
  return { id, ticker, nome, bolsa, unidade, erro: String(ultimoErro && ultimoErro.message || ultimoErro) };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    if (url.pathname !== '/' && url.pathname !== '/cotacoes') return new Response('não encontrado', { status: 404, headers: CORS });
    const cache = caches.default, chave = new Request(url.origin + '/cotacoes');
    const guardado = await cache.match(chave);
    if (guardado) return guardado;
    const lista = await Promise.all(ATIVOS.map(cotacao));
    const corpo = { gerado_em: new Date().toISOString(), fonte: 'Yahoo Finance (futuros; atraso típico de 10 a 15 min)', itens: Object.fromEntries(lista.map(i => [i.id, i])) };
    const ok = lista.some(i => !i.erro);
    const resp = new Response(JSON.stringify(corpo), {
      status: ok ? 200 : 502,
      headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${ok ? 60 : 10}` }
    });
    if (ok) ctx.waitUntil(cache.put(chave, resp.clone()));
    return resp;
  }
};
