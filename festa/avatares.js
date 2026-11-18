/* Avatares da turma da confraternização (SVG próprio, animado por CSS/GSAP).
   Desenvolvido por Lucas L. Diogo para a Be8 — 2026 */
'use strict';
const FestaAvatar = (() => {
  const HEAD = 'M56 92C56 56 76 36 100 36C124 36 144 56 144 92C144 124 126 150 100 150C74 150 56 124 56 92Z';
  const corpo = (cor) => `<path d="M10 222C14 184 48 165 100 165C152 165 186 184 190 222Z" fill="${cor}"/>`;
  const pescoco = (pele, sombra) => `<path d="M84 136h32v34c0 8-32 8-32 0z" fill="${sombra}"/><path d="M84 136h32v18c-8 6-24 6-32 0z" fill="${pele}" opacity=".35"/>`;
  const orelhas = (pele, sombra) => `<ellipse cx="57" cy="100" rx="9" ry="13" fill="${pele}"/><ellipse cx="143" cy="100" rx="9" ry="13" fill="${pele}"/><path d="M55 95q4 5 0 10M145 95q-4 5 0 10" stroke="${sombra}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const olhosAbertos = (cor = '#2a1d17') => [82, 118].map(x => `<g class="fa-olho"><ellipse cx="${x}" cy="97" rx="9" ry="7.5" fill="#fff"/><circle cx="${x + 1}" cy="97.5" r="5.4" fill="${cor}"/><circle cx="${x + 2.6}" cy="95.4" r="1.8" fill="#fff"/></g>`).join('');
  const olhosSorrindo = cor => [82, 118].map(x => `<path d="M${x - 9} 99q9-9 18 0" stroke="${cor}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M${x + 8} 96l4-3M${x + 9} 99l5-1" stroke="${cor}" stroke-width="2" stroke-linecap="round"/>`).join('');
  const sobrancelhas = (cor, larg = 4.5, d = 'M71 84q11-7 22-1M107 83q11-6 22 1') => `<path d="${d}" stroke="${cor}" stroke-width="${larg}" fill="none" stroke-linecap="round"/>`;
  const nariz = sombra => `<path d="M100 101q-5 12-1 15q4 2 8-1" stroke="${sombra}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  const bochechas = (cor = '#ff7a6b', op = .22) => `<ellipse cx="73" cy="117" rx="9" ry="5.5" fill="${cor}" opacity="${op}"/><ellipse cx="127" cy="117" rx="9" ry="5.5" fill="${cor}" opacity="${op}"/>`;
  const bocaDentes = (labio = '#9a3b33') => `<path d="M82 123q18 22 36 0q-18 6-36 0z" fill="#5c1a1a"/><path d="M84 124q16 5 32 0l-1.5 5q-14.5 4-29 0z" fill="#fff"/><path d="M90 136q10 5 20 0q-10 4-20 0z" fill="#e0726b"/><path d="M82 123q18 22 36 0" stroke="${labio}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const bocaSorriso = (labio = '#8a4336') => `<path d="M87 126q13 11 26 0" stroke="${labio}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M85 124.5l3 2.5M115 124.5l-3 2.5" stroke="${labio}" stroke-width="2.4" stroke-linecap="round"/>`;
  const cordao = (x1, x2, cor = '#1f2b46') => `<path d="M${x1} 172L94 222M${x2} 172L106 222" stroke="${cor}" stroke-width="7" fill="none"/>` +
    [0.3, 0.62].map(t => `<circle cx="${x1 + (94 - x1) * t}" cy="${172 + 50 * t}" r="2.4" fill="#0EB194"/><circle cx="${x2 + (106 - x2) * t}" cy="${172 + 50 * t}" r="2.4" fill="#55C94F"/>`).join('');

  /* cachos: circulos sobrepostos com brilho, gerados de forma deterministica */
  function cachos(pontos, cores) {
    return pontos.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cores[i % cores.length]}"/>` +
      `<path d="M${x - r * .5} ${y - r * .1}q${r * .5} -${r * .7} ${r} 0" stroke="#d98a4e" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>`).join('');
  }
  function anel(cx, cy, rx, ry, a0, a1, n, r) {
    const out = []; for (let i = 0; i < n; i++) { const a = (a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180; out.push([+(cx + Math.cos(a) * rx).toFixed(1), +(cy + Math.sin(a) * ry).toFixed(1), r + (i % 3) * 2]); } return out;
  }

  const P = {
    marcio: { pele: '#c38b62', sombra: '#a2704c', desenho(p) {
      return `${pescoco(p.pele, p.sombra)}${corpo('#24282f')}
        <path d="M52 182C64 162 136 162 148 182C130 172 70 172 52 182Z" fill="#323842"/>
        <path d="M84 166Q100 186 116 166L113 222H87Z" fill="#111317"/>
        <path d="M74 165L100 199L91 222H68L64 172Z" fill="#4a6c93"/><path d="M126 165L100 199L109 222H132L136 172Z" fill="#4a6c93"/>
        <path d="M74 165L88 170L100 199Z M126 165L112 170L100 199Z" fill="#5d82ad"/>
        <path d="M62 222L56 176M138 222L144 176" stroke="#15181d" stroke-width="3"/>
        <path d="M70 178v22M130 178v22" stroke="#9aa3ad" stroke-width="2"/><circle cx="70" cy="202" r="3" fill="#cfd5db"/><circle cx="130" cy="202" r="3" fill="#cfd5db"/>
        <g class="fa-cabeca">${orelhas(p.pele, p.sombra)}<path d="${HEAD}" fill="${p.pele}"/>
        <path d="M60 108C64 134 80 151 100 152C120 151 136 134 140 108C136 128 122 143 100 144C78 143 64 128 60 108Z" fill="#1c1917" opacity=".28"/>
        ${bochechas('#c0504a', .16)}${olhosAbertos()}${sobrancelhas('#1c1917', 5.5, 'M70 85q12-5 23 0M107 85q11-5 23 0')}${nariz(p.sombra)}
        <path d="M83 121Q91 112 100 115Q109 112 117 121Q108 117 100 119Q92 117 83 121Z" fill="#1c1917"/>
        <path d="M88 128q12 6 24-2" stroke="#7d3a2e" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M85 133Q100 158 115 133Q109 147 100 147Q91 147 85 133Z" fill="#1c1917" opacity=".92"/>
        <path d="M58 86C55 52 76 33 100 33C124 33 145 52 142 86C138 66 130 56 120 54C108 49 92 49 80 54C70 57 62 66 58 86Z" fill="#1c1917"/>
        <path d="M57 90C56 78 58 70 62 64L63 94ZM143 90C144 78 142 70 138 64L137 94Z" fill="#1c1917" opacity=".55"/></g>`;
    } },
    bianca: { pele: '#e8b08c', sombra: '#cc8f6b', desenho(p) {
      const cores = ['#8f3f1e', '#a24c24', '#b45a2b', '#9a4520'];
      const tras = [...anel(100, 96, 70, 74, 150, 390, 17, 20), ...[[36, 150, 19], [164, 150, 19], [40, 176, 18], [160, 176, 18], [48, 198, 16], [152, 198, 16], [30, 124, 20], [170, 124, 20]]];
      const frente = [...anel(100, 64, 46, 26, 196, 344, 9, 11), [58, 96, 10], [142, 96, 10], [56, 116, 9]];
      const sardas = [[90, 108], [94, 104], [106, 104], [110, 108], [72, 108], [77, 104], [123, 104], [128, 108], [69, 112], [131, 112], [80, 110], [120, 110]];
      return `${cachos(tras, cores)}${pescoco(p.pele, p.sombra)}${corpo('#efe9df')}
        <path d="M82 160h36l3 30q-21 10-42 0z" fill="#16191c"/>
        <path d="M80 186Q100 198 120 186L116 222H84Z" fill="#16191c"/>
        <path d="M66 170L84 186L92 222H60ZM134 170L116 186L108 222H140Z" fill="#ddd5c6"/>
        ${cordao(84, 116)}
        <g class="fa-cabeca">${orelhas(p.pele, p.sombra)}<path d="${HEAD}" fill="${p.pele}"/>
        ${bochechas('#ff6f61', .3)}${sardas.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#a85a35" opacity=".6"/>`).join('')}
        ${olhosSorrindo('#3b2216')}${sobrancelhas('#8a3d1e', 3.6, 'M71 82q11-7 22-2M107 80q11-5 22 2')}${nariz(p.sombra)}${bocaDentes('#b4483f')}
        ${cachos(frente, cores)}</g>`;
    } },
    gustavo: { pele: '#efc3a1', sombra: '#d4a283', desenho(p) {
      return `${pescoco(p.pele, p.sombra)}${corpo('#4e6d91')}
        <path d="M80 164L100 190L74 196L66 172ZM120 164L100 190L126 196L134 172Z" fill="#5f81a8"/>
        <path d="M100 190V222" stroke="#3d5a7c" stroke-width="2.5"/><circle cx="100" cy="202" r="2.4" fill="#c9d6e6"/><circle cx="100" cy="215" r="2.4" fill="#c9d6e6"/>
        <path d="M86 166Q100 182 114 166L100 190Z" fill="${p.sombra}"/>
        <g class="fa-cabeca">${orelhas(p.pele, p.sombra)}<path d="${HEAD}" fill="${p.pele}"/>
        <path d="M60 106C64 134 80 151 100 152C120 151 136 134 140 106C136 128 122 144 100 145C78 144 64 128 60 106Z" fill="#8b7d74" opacity=".32"/>
        <path d="M86 120q14-5 28 0q-14-2-28 0z" fill="#8b7d74" opacity=".45"/>
        ${bochechas('#e0665a', .2)}${olhosAbertos('#3a2a20')}${sobrancelhas('#6e6259', 4, 'M71 85q11-4 22 0M107 85q11-4 22 0')}${nariz(p.sombra)}${bocaSorriso('#9a5446')}
        <path d="M58 82C56 48 78 30 102 30C126 30 146 48 142 82C140 66 136 58 126 52C116 46 90 45 78 52C68 58 62 66 58 82Z" fill="#8d8b88"/>
        <path d="M76 50C92 38 118 38 134 50M82 44C98 36 116 36 128 42M70 60C80 50 90 46 100 45" stroke="#62605d" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
        <path d="M88 40C100 34 116 35 126 40" stroke="#c4c2bf" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M57 90C56 80 57 72 61 66L62 94ZM143 90C144 80 143 72 139 66L138 94Z" fill="#7d7b78" opacity=".6"/></g>`;
    } },
    jerrard: { pele: '#d69f7a', sombra: '#b8825f', desenho(p) {
      return `${pescoco(p.pele, p.sombra)}${corpo('#c9d6eb')}
        <path d="M78 162L100 186L80 196L68 170ZM122 162L100 186L120 196L132 170Z" fill="#dce6f4"/>
        <path d="M100 186V222" stroke="#a9b8cf" stroke-width="2"/><circle cx="100" cy="205" r="2.4" fill="#fff"/>
        ${cordao(80, 120)}
        <g class="fa-cabeca">${orelhas(p.pele, p.sombra)}<path d="${HEAD}" fill="${p.pele}"/>
        ${bochechas('#e0665a', .22)}${olhosAbertos()}${sobrancelhas('#1d1816', 5, 'M70 84q12-7 23-1M107 83q11-6 23 1')}${nariz(p.sombra)}${bocaDentes()}
        <path d="M59 84C55 62 62 46 74 37L76 22L86 31L93 13L102 28L112 14L117 30L130 22L130 38C140 48 146 64 141 84C138 68 130 60 120 57C108 53 90 53 80 57C70 61 62 70 59 84Z" fill="#1f1a18"/>
        <path d="M84 30L90 42M100 26L102 40M114 28L112 42" stroke="#3a3330" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M58 90C57 80 58 72 62 66L63 94ZM142 90C143 80 142 72 138 66L137 94Z" fill="#1f1a18" opacity=".55"/></g>`;
    } },
  };
  /* devolve o SVG do avatar; "atraso" desencontra o piscar de cada um */
  function svg(nome, atraso = 0) {
    const p = P[nome]; if (!p) return '';
    return `<svg class="fa fa-${nome}" viewBox="0 0 200 222" style="--pisca:${atraso}s" aria-label="Avatar ${nome}">${p.desenho(p)}</svg>`;
  }
  return { svg, nomes: Object.keys(P) };
})();
