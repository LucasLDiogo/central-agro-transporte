/* BeTruck — avatar animado do caminhão-tanque Be8 BeVant
   SVG + JavaScript puro, sem dependências. Rosto (frente da cabine) + corpo inteiro rodando na tela.
   Uso: const bt = new BeTruck(elemento, { palco: elementoDaTela });  bt.falar(3); bt.alerta(true); bt.mangote();
   Desenvolvido por Lucas L. Diogo para a Be8 — 2026 */
(function (global) {
  'use strict';

  const LOGO = {"grads":[["New_Gradient_Swatch_2","281.02","502.28","889.44","502.28"],["New_Gradient_Swatch_2-2","281.02","577.72","889.44","577.72"],["New_Gradient_Swatch_2-3","454.82","276.77","716.02","276.77"],["New_Gradient_Swatch_2-4","302.13","427.25","868.48","427.25"],["New_Gradient_Swatch_2-5","302.11","652.73","868.46","652.73"],["New_Gradient_Swatch_2-6","349.51","351.92","820.74","351.92"],["New_Gradient_Swatch_2-7","349.51","728.08","820.74","728.08"],["New_Gradient_Swatch_2-8","454.82","803.23","716.02","803.23"]],"sym":[["New_Gradient_Swatch_2","M888.42,495.82a21.09,21.09,0,0,0-26.55-13.63c-24.35,7.84-48.65,11.14-69.21,13.34s-42.46,2.88-69.32,2.62h-1.77c-40.81,0-88.11-.57-140.76-1.78-20.8-.33-42.85-1-69.43-2-25.57-.8-48.27-1.73-69.42-2.86-52.85-2.47-97-5.46-138.83-9.4a22.68,22.68,0,0,0-3.78,0,20.22,20.22,0,1,0,3.79,40.26c41.91-3.94,86-6.92,138.83-9.39,20.88-1.11,43.59-2,69.42-2.85,25.89-1,48.59-1.64,69.42-2,52.53-1.22,99.83-1.79,140.77-1.79h1.77c26.81-.24,48.85.55,69.31,2.62s44.91,5.52,69.21,13.33a20.71,20.71,0,0,0,6.45,1,21.13,21.13,0,0,0,18.79-11.48A20.94,20.94,0,0,0,888.42,495.82Z"],["New_Gradient_Swatch_2-2","M888.42,571.26a21.09,21.09,0,0,0-26.55-13.62c-24.35,7.83-48.65,11.13-69.21,13.34-20.46,2.06-42.46,2.87-69.32,2.61h-1.77c-40.81,0-88.11-.57-140.76-1.78-20.8-.33-42.85-1-69.43-2-25.57-.79-48.27-1.73-69.42-2.85-52.85-2.48-97-5.46-138.83-9.4a22.71,22.71,0,0,0-3.78,0,20.22,20.22,0,0,0,3.79,40.27c41.91-3.94,86-6.93,138.83-9.39,20.88-1.12,43.59-2.05,69.42-2.86,25.89-1,48.59-1.64,69.42-2,52.53-1.21,99.83-1.78,140.77-1.78h1.77c26.81-.25,48.85.55,69.31,2.61s44.91,5.53,69.21,13.34a21.1,21.1,0,0,0,26.55-26.55Z"],["New_Gradient_Swatch_2-3","M702.39,296.85a21.49,21.49,0,0,1-15.66,0h0c-48.39-17.8-102.92-18.75-152.07-12.54-13.88,2-32.18,5.27-50.63,12.54a21.21,21.21,0,0,1-7.8,1.49c-23.47-.27-29.89-32.51-7.86-41.62a21.39,21.39,0,0,1,15.66,0c57,21.49,145.59,21.49,202.7,0,10.66-4.46,23.84,1.35,27.81,12.21A21.61,21.61,0,0,1,702.39,296.85Z"],["New_Gradient_Swatch_2-4","M867.16,434.56a21.34,21.34,0,0,1-27.38,12.76c-21.37-7.78-42.34-11-60-13.2-65.28-5.44-142.75-1.87-214.17-1-78.52,1.91-168.71,6.39-241.05,14.25a21.37,21.37,0,0,1-4.38,0c-17.7-1.86-24.55-24.75-10.5-35.92a20.11,20.11,0,0,1,14.88-4.35c54.58,5.93,118.31,9.9,180.78,12.29,62.44,2.72,143.78,3.66,202.12,3.72,50.27-.41,85.2,0,132.35-15.94C856.71,401,873.35,417.46,867.16,434.56Z"],["New_Gradient_Swatch_2-5","M867.14,660a21.36,21.36,0,0,1-27.38,12.77c-21.38-7.78-42.34-11-60-13.21-65.27-5.44-142.74-1.87-214.16-1C487,660.53,396.84,665,324.5,672.87a21.27,21.27,0,0,1-4.37,0c-17.7-1.86-24.56-24.74-10.5-35.92a20.11,20.11,0,0,1,14.88-4.35c54.58,5.93,118.31,9.91,180.78,12.29,62.44,2.72,143.78,3.66,202.12,3.72,50.27-.41,85.2,0,132.35-15.94C856.69,626.52,873.33,643,867.14,660Z"],["New_Gradient_Swatch_2-6","M818.82,343c-4.58-10.86-18.25-16.16-28.94-11.15-13.63,6.06-28.23,10.05-47.34,12.94-13.95,2.16-29,3.11-47.45,3-103,.07-224.42-2.4-322.59-16a20.29,20.29,0,1,0,.18,40.19C411,366.88,506.43,358.61,563,357.63c32.63-1,101.54-1.54,132.09-1.58,18.49-.07,33.49.83,47.45,3,19.11,2.91,33.71,6.89,47.34,12.94a22.2,22.2,0,0,0,8.92,1.87C814.5,374,825.32,357.38,818.82,343Z"],["New_Gradient_Swatch_2-7","M818.82,719.2c-4.58-10.86-18.25-16.16-28.94-11.15-13.63,6.06-28.23,10.05-47.34,12.94-13.95,2.17-29,3.11-47.45,3-103,.07-224.42-2.4-322.59-16a20.28,20.28,0,1,0,.18,40.18C411,743,506.43,734.78,563,733.79c32.63-1,101.54-1.53,132.09-1.58,18.49-.07,33.49.83,47.45,3,19.11,2.91,33.71,6.9,47.34,12.94A22,22,0,0,0,798.8,750C814.5,750.13,825.32,733.54,818.82,719.2Z"],["New_Gradient_Swatch_2-8","M702.39,823.3a21.49,21.49,0,0,1-15.66,0h0c-48.39-17.8-102.92-18.75-152.07-12.54-13.88,2-32.18,5.28-50.63,12.54a21.21,21.21,0,0,1-7.8,1.49c-23.47-.27-29.89-32.5-7.86-41.61a21.29,21.29,0,0,1,15.66,0c57,21.48,145.59,21.48,202.7,0,10.66-4.47,23.84,1.34,27.81,12.2A21.61,21.61,0,0,1,702.39,823.3Z"]],"word":["M1205.09,600.61c0,22.37-8,41.14-23.57,56.32S1146.77,679.7,1124,679.7H1003.38V400.1h111.83c22,0,40.34,7.19,55.52,22s22.77,32.75,22.77,54.32c0,24.77-10,44.34-30.35,58.32,25.56,12.38,41.94,35.94,41.94,65.9M1040.52,434.85v85.48h74.69c23.57,0,41.55-18.77,41.55-42.74a40.73,40.73,0,0,0-12.39-30c-8-8.39-17.57-12.78-29.16-12.78ZM1124,645c25.17,0,44.33-20,44.33-45.54a43.71,43.71,0,0,0-13.17-31.95q-12.59-13.19-31.16-13.18h-83.48V645Z","M1262.76,593.32c6.78,35.55,34.34,56.32,72.29,56.32,26.36,0,45.54-9.58,57.52-29.15l29.55,16.77c-19.56,30-48.72,45.13-87.87,45.13-31.56,0-57.52-10-77.49-29.55-19.56-20-29.55-45.14-29.55-75.49,0-30,9.58-55.12,29.16-75.09s44.73-30,75.48-30c29.16,0,53.12,10.38,71.51,31.15,18.76,20.37,28,45.14,28,74.3a102.06,102.06,0,0,1-1.2,15.57Zm0-30.35h133.41c-6-38-32.37-57.92-64.32-57.92-37.14,0-63.11,22.77-69.09,57.92","M1600.34,541.12l-33.85,18,3.1,1.6c24.87,12.23,37,26.86,37,44.73,0,31.73-31.87,48.34-63.34,48.34-33.85,0-58.43-18.36-58.43-43.66,0-17,11.86-31.52,35.24-43.16l44.87-23.71,25.85-13.78c8.9-5.41,40.36-27.1,40.36-63.23,0-39.78-35.11-68.65-83.48-68.65-44.73,0-90,25.9-90,75.42,0,22.31,10.73,41.07,32.71,57.3l32.43-16.43c-20.21-11.3-30-24.74-30-41.07,0-30,27.72-45.67,55.11-45.67,29.45,0,50.83,17.34,50.83,41.23,0,16.2-10.53,29.58-31.28,39.77-.56.28-68.84,34.76-72.91,37-28.38,15.33-43.38,37.89-43.38,65.23,0,41.74,38,72,90.45,72,60.9,0,98.73-30,98.73-78.37,0-25.48-13.08-46.06-39.9-62.9"]};

  const COR = {
    navy: '#081F2E', contorno: '#0B2433', vidro: '#123650', vidro2: '#0A2234', teal: '#0EB194', lime: '#55C94F',
    azul: '#2A9FD8', calota: '#0B2A45', cinza: '#C9D3DA', borracha: '#151B21', escuro: '#1C262E', laranja: '#E8772E',
    vermelho: '#E5484D', ambar: '#F2B705', lingua: '#E7687C', palpebra: '#C9D7E1', biodiesel: '#C9D84A'
  };
  const FAROL = { normal: '#FFF2B3', vermelho: '#FF3B3F', ambar: '#FFB000', verde: '#7CF29A', azul: '#8FD3FF' };

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sorteia = l => l[Math.floor(Math.random() * l.length)];
  const EASE = {
    lin: t => t,
    io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    sobe: t => Math.sin(t * Math.PI)
  };
  let UID = 0;

  /* ------------------------------------------------------------ logo oficial Be8 (sem distorcer nem recolorir o símbolo) */
  const logoDefs = p => `<linearGradient id="${p}lgb"><stop offset="0" stop-color="#0eb194"/><stop offset="1" stop-color="#55c94f"/></linearGradient>` +
    LOGO.grads.map(([id, x1, y1, x2, y2]) => `<linearGradient id="${p}${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse" href="#${p}lgb" xlink:href="#${p}lgb"/>`).join('');
  const simboloPaths = p => LOGO.sym.map(([g, d]) => `<path fill="url(#${p}${g})" d="${d}"/>`).join('');
  const simbolo = (p, x, y, w) => `<svg x="${x}" y="${y}" width="${w}" height="${(w * 593 / 608).toFixed(1)}" viewBox="281 243 608 593" overflow="visible">${simboloPaths(p)}</svg>`;
  const logo = (p, x, y, w, corTexto = COR.navy) => `<svg x="${x}" y="${y}" width="${w}" height="${(w * 593 / 1384).toFixed(1)}" viewBox="268 243 1384 593" overflow="visible">${simboloPaths(p)}${LOGO.word.map(d => `<path fill="${corTexto}" d="${d}"/>`).join('')}</svg>`;

  /* ------------------------------------------------------------ peças reaproveitadas */
  const folha = (cor = COR.lime) => `<path d="M0 0C5-9 17-11 24-3C17 6 6 8 0 0Z" fill="${cor}"/><path d="M1 0Q12-3 22-3" stroke="#2E7D32" stroke-width="1.4" fill="none" opacity=".6"/>`;
  const estrela4 = (r = 10) => `<path d="M0 ${-r}Q${r * .18} ${-r * .18} ${r} 0Q${r * .18} ${r * .18} 0 ${r}Q${-r * .18} ${r * .18} ${-r} 0Q${-r * .18} ${-r * .18} 0 ${-r}Z" fill="#fff"/>`;
  const gota = (s = 1, cor = COR.azul) => `<path transform="scale(${s})" d="M0-22C8-10 14-3 14 6A14 14 0 0 1-14 6C-14-3-8-10 0-22Z" fill="${cor}"/>`;
  const espiral = (() => { let d = ''; for (let a = 0; a <= Math.PI * 6; a += .25) { const r = 1.5 + a * 1.25; d += (d ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } return d; })();
  const estrela5 = (() => { let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? 10 : 25, a = -Math.PI / 2 + i * Math.PI / 5; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } return d + 'Z'; })();
  const luva = `<path d="M-20 4C-24-10-18-22-6-22H14C22-22 26-14 24-6L22 14C21 22 14 26 6 26H-8C-16 26-20 18-20 10Z" fill="#fff" stroke="${COR.contorno}" stroke-width="3.5" stroke-linejoin="round"/>` +
    `<path d="M-6-8H16M-6 2H16M-6 12H14" stroke="${COR.contorno}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`;
  const punho = `<rect x="-16" y="24" width="30" height="16" rx="5" fill="#fff" stroke="${COR.contorno}" stroke-width="3.5"/><path d="M-12 31H10" stroke="${COR.teal}" stroke-width="4" stroke-linecap="round"/>`;

  /* ------------------------------------------------------------ rosto: frente da cabine (viewBox 540 x 600) */
  const VIDRO = 'M128 178Q128 166 140 166H400Q412 166 412 178L418 298Q419 312 405 312H135Q121 312 122 298Z';
  const TETO = 'M128 150C128 102 140 64 176 58H364C400 64 412 102 412 150Z';
  const CABINE = 'M94 182Q94 142 134 142H406Q446 142 446 182V450H94Z';
  const PARACHOQUE = 'M86 444H454Q462 444 462 452V502Q462 514 450 514H90Q78 514 78 502V452Q78 444 86 444Z';
  const OLHO = { e: { x: 205, y: 240 }, d: { x: 335, y: 240 }, rx: 52, ry: 54 };

  function svgRosto(p) {
    const olho = (lado) => {
      const { x, y } = OLHO[lado], rx = OLHO.rx, ry = OLHO.ry;
      return `<g class="bt-olho-${lado}">
        <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#FBFDFE"/>
        <g clip-path="url(#${p}clip-${lado})">
          <ellipse cx="${x}" cy="${y + 34}" rx="${rx + 6}" ry="30" fill="#E3ECF2" opacity=".7"/>
          <g class="bt-iris-${lado}">
            <g class="bt-ir-normal"><circle r="27" fill="url(#${p}iris)"/><circle class="bt-pupila" r="14" fill="${COR.navy}"/><circle cx="-8" cy="-9" r="6.5" fill="#fff"/><circle cx="7" cy="7" r="2.6" fill="#fff" opacity=".85"/></g>
            <g class="bt-ir-coracao" style="display:none"><path transform="scale(1.45)" d="M0 14C-26-4-22-26-8-24C-3-23 0-18 0-14C0-18 3-23 8-24C22-26 26-4 0 14Z" fill="${COR.vermelho}"/><circle cx="-12" cy="-16" r="4.5" fill="#fff" opacity=".8"/></g>
            <g class="bt-ir-espiral" style="display:none"><path d="${espiral}" stroke="${COR.navy}" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>
            <g class="bt-ir-estrela" style="display:none"><path d="${estrela5}" fill="${COR.ambar}" stroke="#C98F00" stroke-width="2" stroke-linejoin="round"/><circle cx="-6" cy="-6" r="3" fill="#fff"/></g>
          </g>
          <path class="bt-pinf-${lado}" fill="${COR.palpebra}"/>
          <g class="bt-psup-g-${lado}"><path class="bt-psup-${lado}" fill="${COR.palpebra}"/><path class="bt-cilio-${lado}" stroke="${COR.contorno}" stroke-width="5" fill="none" stroke-linecap="round"/></g>
        </g>
        <path class="bt-fechado-${lado}" d="M${x - 32} ${y + 4}Q${x} ${y + 24} ${x + 32} ${y + 4}" stroke="${COR.contorno}" stroke-width="6" fill="none" stroke-linecap="round" style="display:none"/>
        <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${COR.contorno}" stroke-width="5"/>
      </g>`;
    };
    const sobrancelha = (lado) => `<g class="bt-sobr-${lado}">
        <path d="M-70-12Q-70-16-64-16H64Q70-16 70-10L68 8Q67 13 61 13H-60Q-66 13-68 8Z" fill="#101B23"/>
        <path class="bt-led" d="M-58 9H58" stroke="url(#${p}led)" stroke-width="3.5" stroke-linecap="round"/>
      </g>`;
    const farol = (cx, r) => `<circle cx="${cx}" cy="474" r="${r}" fill="#E9EEF2" stroke="#7E8C97" stroke-width="2"/><circle class="bt-lamp" cx="${cx}" cy="474" r="${r - 5}" fill="#FFF8D6"/><circle cx="${cx - r * .35}" cy="${474 - r * .35}" r="${r * .22}" fill="#fff" opacity=".9"/>`;
    const roda = (x) => `<g><rect x="${x}" y="498" width="78" height="82" rx="16" fill="${COR.borracha}"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${x + 6}" y="${508 + i * 14}" width="66" height="5" rx="2" fill="#26313A"/>`).join('')}</g>`;

    return `<svg class="bt-svg" viewBox="0 0 540 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="visible" role="img" aria-label="BeTruck, o caminhão Be8 BeVant">
<defs>
  ${logoDefs(p)}
  <linearGradient id="${p}cab" x1="0" x2="1"><stop offset="0" stop-color="#D2DCE3"/><stop offset=".1" stop-color="#fff"/><stop offset=".9" stop-color="#fff"/><stop offset="1" stop-color="#CBD6DE"/></linearGradient>
  <linearGradient id="${p}cabv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#E6ECF0"/></linearGradient>
  <linearGradient id="${p}vid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D4A66"/><stop offset="1" stop-color="${COR.vidro2}"/></linearGradient>
  <linearGradient id="${p}led" x1="0" x2="1"><stop offset="0" stop-color="${COR.teal}"/><stop offset="1" stop-color="${COR.lime}"/></linearGradient>
  <radialGradient id="${p}iris" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#6BF0D2"/><stop offset=".55" stop-color="${COR.teal}"/><stop offset="1" stop-color="#087A66"/></radialGradient>
  ${['e', 'd'].map(l => `<radialGradient id="${p}halo-${l}"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop class="bt-halo-cor-${l}" offset=".35" stop-color="${FAROL.normal}" stop-opacity=".7"/><stop class="bt-halo-cor-${l}" offset="1" stop-color="${FAROL.normal}" stop-opacity="0"/></radialGradient>`).join('')}
  <radialGradient id="${p}aura"><stop offset="0" stop-color="${COR.vermelho}" stop-opacity=".75"/><stop offset=".55" stop-color="${COR.vermelho}" stop-opacity=".22"/><stop offset="1" stop-color="${COR.vermelho}" stop-opacity="0"/></radialGradient>
  <radialGradient id="${p}feixe" cx="0" cy=".5" r="1"><stop offset="0" stop-color="#FF6B6E" stop-opacity=".85"/><stop offset="1" stop-color="#FF6B6E" stop-opacity="0"/></radialGradient>
  <linearGradient id="${p}bio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6DA55"/><stop offset="1" stop-color="#8CC63F"/></linearGradient>
  <pattern id="${p}colmeia" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0H9L12 5.2L9 10.4H3L0 5.2Z" fill="#1A252E" stroke="#0A1117" stroke-width="1.4"/></pattern>
  <clipPath id="${p}clip-e"><ellipse cx="${OLHO.e.x}" cy="${OLHO.e.y}" rx="${OLHO.rx}" ry="${OLHO.ry}"/></clipPath>
  <clipPath id="${p}clip-d"><ellipse cx="${OLHO.d.x}" cy="${OLHO.d.y}" rx="${OLHO.rx}" ry="${OLHO.ry}"/></clipPath>
  <clipPath id="${p}clip-boca"><path class="bt-boca-clip"/></clipPath>
  <clipPath id="${p}clip-vidro"><path d="${VIDRO}"/></clipPath>
  <clipPath id="${p}clip-frasco"><path d="M-30-60Q-36-58-36-48V18Q-36 30-24 30H24Q36 30 36 18V-48Q36-58 30-60Z"/></clipPath>
</defs>
<circle class="bt-aura-vermelha" cx="270" cy="330" r="300" fill="url(#${p}aura)" opacity="0"/>
<ellipse class="bt-sombra" cx="270" cy="584" rx="205" ry="15" fill="#000" opacity=".3"/>
<g class="bt-rig">
  <g class="bt-pneus">${roda(100)}${roda(362)}</g>
  <g class="bt-giroflex" style="display:none">
    <g class="bt-feixes"><path class="bt-feixe-e" d="M270 30L90 0L90 60Z" fill="url(#${p}feixe)" transform="rotate(180 270 30)"/><path class="bt-feixe-d" d="M270 30L450 0L450 60Z" fill="url(#${p}feixe)"/></g>
    <rect x="246" y="44" width="48" height="14" rx="4" fill="${COR.escuro}"/>
    <path d="M252 46C252 18 288 18 288 46Z" fill="${COR.vermelho}" stroke="#A3262A" stroke-width="2"/>
    <path class="bt-giro-luz" d="M258 40C259 28 266 24 270 24" stroke="#FFD0D1" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <g class="bt-antena-e"><path d="M170 76L162 20" stroke="#AEBBC5" stroke-width="5" stroke-linecap="round"/><circle cx="162" cy="18" r="6" fill="${COR.teal}"/></g>
  <g class="bt-antena-d"><path d="M370 76L378 26" stroke="#AEBBC5" stroke-width="5" stroke-linecap="round"/><circle cx="378" cy="24" r="5" fill="${COR.lime}"/></g>
  <g class="bt-retro-e"><path d="M100 200L62 186" stroke="#56646F" stroke-width="8" stroke-linecap="round"/><rect x="24" y="148" width="40" height="116" rx="13" fill="${COR.escuro}"/><rect x="31" y="157" width="26" height="98" rx="8" fill="url(#${p}vid)"/><path d="M36 176L50 162M36 196L54 178" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/></g>
  <g class="bt-retro-d"><path d="M440 200L478 186" stroke="#56646F" stroke-width="8" stroke-linecap="round"/><rect x="476" y="148" width="40" height="116" rx="13" fill="${COR.escuro}"/><rect x="483" y="157" width="26" height="98" rx="8" fill="url(#${p}vid)"/><path d="M488 176L502 162M488 196L506 178" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/></g>
  <path d="${CABINE}" fill="url(#${p}cab)" stroke="${COR.contorno}" stroke-width="5" stroke-linejoin="round"/>
  <path d="${TETO}" fill="url(#${p}cabv)" stroke="${COR.contorno}" stroke-width="5" stroke-linejoin="round"/>
  <path d="${PARACHOQUE}" fill="url(#${p}cabv)" stroke="${COR.contorno}" stroke-width="5" stroke-linejoin="round"/>
  <g class="bt-tinta" opacity="0" style="mix-blend-mode:multiply"><path d="${CABINE}" fill="${COR.vermelho}"/><path d="${TETO}" fill="${COR.vermelho}"/><path d="${PARACHOQUE}" fill="${COR.vermelho}"/></g>
  <text x="270" y="88" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="17" fill="${COR.navy}" letter-spacing=".5">É RENOVÁVEL!</text>
  ${logo(p, 160, 97, 98)}
  <text x="264" y="132" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-style="italic" font-size="30" fill="${COR.azul}">BeVant</text>
  <path d="M150 145Q270 152 390 145" stroke="${COR.azul}" stroke-width="3" fill="none" opacity=".5"/>
  <path d="${VIDRO}" fill="url(#${p}vid)" stroke="${COR.contorno}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M150 300L230 172H262L182 300ZM290 300L370 172H384L304 300Z" fill="#fff" opacity=".07"/>
  ${olho('e')}${olho('d')}
  <g class="bt-gotas" clip-path="url(#${p}clip-vidro)"></g>
  <g class="bt-limp-e"><line x1="0" y1="0" x2="114" y2="0" stroke="#18212A" stroke-width="5" stroke-linecap="round"/><rect x="38" y="-4.5" width="78" height="9" rx="3" fill="#0F161C"/><circle r="7" fill="#18212A"/></g>
  <g class="bt-limp-d"><line x1="0" y1="0" x2="106" y2="0" stroke="#18212A" stroke-width="5" stroke-linecap="round"/><rect x="34" y="-4.5" width="74" height="9" rx="3" fill="#0F161C"/><circle r="7" fill="#18212A"/></g>
  ${sobrancelha('e')}${sobrancelha('d')}
  <circle cx="232" cy="322" r="4" fill="${COR.escuro}"/><circle cx="308" cy="322" r="4" fill="${COR.escuro}"/>
  <g class="bt-jatos" opacity="0"><path class="bt-jato" d="M232 320Q214 282 205 250" stroke="#9EDCF7" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="7 9"/><path class="bt-jato" d="M308 320Q326 282 335 250" stroke="#9EDCF7" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="7 9"/></g>
  <rect x="140" y="330" width="260" height="28" rx="9" fill="url(#${p}colmeia)" stroke="${COR.contorno}" stroke-width="4"/>
  <path d="M146 333H394" stroke="#9AA8B3" stroke-width="2" opacity=".7"/>
  <circle cx="270" cy="344" r="27" fill="#fff" stroke="${COR.contorno}" stroke-width="4"/>
  ${simbolo(p, 251, 325.5, 38)}
  <g class="bt-boca">
    <path class="bt-boca-fundo" fill="#0A1219"/>
    <g clip-path="url(#${p}clip-boca)">
      <path class="bt-boca-fundo" fill="url(#${p}colmeia)" opacity=".55"/>
      <rect class="bt-dentes" height="15" rx="5" fill="#EDF2F5"/>
      <ellipse class="bt-lingua" ry="22" fill="${COR.lingua}"/>
    </g>
    <path class="bt-boca-borda" fill="none" stroke="${COR.contorno}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
  </g>
  <g class="bt-rubor" opacity="0"><ellipse cx="168" cy="426" rx="24" ry="11" fill="#FF8FA3"/><ellipse cx="372" cy="426" rx="24" ry="11" fill="#FF8FA3"/></g>
  <rect x="100" y="456" width="78" height="36" rx="18" fill="${COR.escuro}"/><rect x="362" y="456" width="78" height="36" rx="18" fill="${COR.escuro}"/>
  <g class="bt-farol-e">${farol(120, 16)}${farol(156, 13)}</g>
  <g class="bt-farol-d">${farol(420, 16)}${farol(384, 13)}</g>
  <rect class="bt-pisca" x="82" y="456" width="13" height="36" rx="4" fill="#8A6A0C"/><rect class="bt-pisca" x="445" y="456" width="13" height="36" rx="4" fill="#8A6A0C"/>
  <g><rect x="221" y="478" width="98" height="30" rx="4" fill="#fff" stroke="#2B3640" stroke-width="2.5"/><rect x="222.5" y="479.5" width="95" height="7" fill="#1F4FA0"/><text x="270" y="485.5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="5.5" fill="#fff" letter-spacing="1">BRASIL</text><text x="270" y="504" text-anchor="middle" font-family="'Arial Black',Arial,sans-serif" font-weight="900" font-size="16" fill="#111" letter-spacing=".6">BETRUCK</text></g>
  <path d="M92 512H448V526Q448 534 440 534H100Q92 534 92 526Z" fill="${COR.escuro}"/>
  <circle class="bt-milha" cx="140" cy="522" r="6" fill="#8D9AA5"/><circle class="bt-milha" cx="400" cy="522" r="6" fill="#8D9AA5"/>
  <g class="bt-halo" style="pointer-events:none">
    <circle class="bt-halo-e" cx="138" cy="474" r="70" fill="url(#${p}halo-e)" opacity="0"/>
    <circle class="bt-halo-d" cx="402" cy="474" r="70" fill="url(#${p}halo-d)" opacity="0"/>
  </g>
  <g class="bt-mangote bt-extra" style="display:none">
    <path class="bt-mang-path" d="M640 660C600 590 500 620 452 540S340 420 290 404" stroke="#B24F12" stroke-width="27" fill="none" stroke-linecap="round"/>
    <path d="M640 660C600 590 500 620 452 540S340 420 290 404" stroke="${COR.laranja}" stroke-width="21" fill="none" stroke-linecap="round"/>
    <path d="M640 660C600 590 500 620 452 540S340 420 290 404" stroke="#B24F12" stroke-width="21" fill="none" stroke-dasharray="3 10" opacity=".7"/>
    <path d="M640 660C600 590 500 620 452 540S340 420 290 404" stroke="#FFC08F" stroke-width="4" fill="none" stroke-linecap="round" transform="translate(-4 -6)" opacity=".7"/>
    <g class="bt-bolhas"></g>
    <rect x="270" y="392" width="30" height="24" rx="6" fill="#AEB9C2" stroke="${COR.contorno}" stroke-width="3"/>
  </g>
  <g class="bt-frasco bt-extra" style="display:none">
    <g class="bt-frasco-in">
      <path d="M-30-60Q-36-58-36-48V18Q-36 30-24 30H24Q36 30 36 18V-48Q36-58 30-60Z" fill="#E8F6FB" opacity=".75"/>
      <g clip-path="url(#${p}clip-frasco)"><path class="bt-liquido" d="M-40-24Q-20-30 0-24T40-24V40H-40Z" fill="url(#${p}bio)"/></g>
      <rect x="-12" y="-76" width="24" height="18" fill="#E8F6FB" stroke="${COR.contorno}" stroke-width="3"/>
      <rect x="-16" y="-94" width="32" height="20" rx="5" fill="${COR.teal}" stroke="${COR.contorno}" stroke-width="3"/>
      <path d="M-30-60Q-36-58-36-48V18Q-36 30-24 30H24Q36 30 36 18V-48Q36-58 30-60Z" fill="none" stroke="${COR.contorno}" stroke-width="3.5"/>
      <path d="M-26-46V8" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <rect x="-30" y="-24" width="60" height="40" rx="5" fill="#fff" stroke="${COR.contorno}" stroke-width="2"/>
      ${simbolo(p, -24, -20, 15)}
      <text x="-6" y="-8" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="10" fill="${COR.navy}">Be8</text>
      <text x="0" y="8" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-style="italic" font-size="14" fill="${COR.azul}">BeVant</text>
    </g>
    <g transform="translate(-6 16)">${luva}${punho}</g>
    <g class="bt-brilhos">${[[-56, -70, 11], [52, -88, 8], [58, -20, 12], [-58, 0, 7]].map(([x, y, r]) => `<g transform="translate(${x} ${y})"><g class="bt-brilho">${estrela4(r)}</g></g>`).join('')}</g>
  </g>
  <g class="bt-joinha bt-extra" style="display:none">
    <path d="M-4-6C-6-24-4-40 6-44C14-46 16-38 14-28L12-14Z" fill="#fff" stroke="${COR.contorno}" stroke-width="3.5" stroke-linejoin="round"/>
    ${luva}${punho}
  </g>
  <g class="bt-medidor bt-extra" style="display:none">
    <circle r="34" fill="#fff" stroke="${COR.contorno}" stroke-width="4"/>
    <path d="M-24 10A26 26 0 0 1-12-23" stroke="${COR.vermelho}" stroke-width="7" fill="none"/><path d="M-12-23A26 26 0 0 1 24 10" stroke="${COR.lime}" stroke-width="7" fill="none"/>
    <text x="-21" y="24" font-family="Montserrat,Arial" font-weight="900" font-size="11" fill="${COR.navy}">E</text><text x="15" y="24" font-family="Montserrat,Arial" font-weight="900" font-size="11" fill="${COR.navy}">F</text>
    <g transform="translate(0 4)">${gota(.42, COR.teal)}</g>
    <g class="bt-ponteiro"><path d="M0 0L0-24" stroke="${COR.vermelho}" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="${COR.navy}"/></g>
  </g>
  <g class="bt-pensa bt-extra" style="display:none">${[[440, 128, 8], [466, 98, 12], [500, 58, 18]].map(([x, y, r], i) => `<circle class="bt-pensa-${i}" cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${COR.contorno}" stroke-width="3"/>`).join('')}</g>
  <g class="bt-zzz" style="display:none">${['Z', 'z', 'z'].map(z => `<text font-family="Montserrat,Arial" font-weight="900" font-size="40" fill="${COR.teal}" opacity="0">${z}</text>`).join('')}</g>
</g>
<g class="bt-poof" style="pointer-events:none"></g>
</svg>`;
  }

  /* ------------------------------------------------------------ corpo inteiro: vista lateral rodando (viewBox 780 x 300) */
  function svgLateral(p) {
    const roda = x => `<g class="bt-roda" data-x="${x}"><circle cx="${x}" cy="246" r="29" fill="${COR.borracha}"/><circle cx="${x}" cy="246" r="25" fill="none" stroke="#26313A" stroke-width="4" stroke-dasharray="5 4"/>
      <g class="bt-aro"><circle cx="${x}" cy="246" r="17" fill="#D5DDE3" stroke="#7E8C97" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `<circle cx="${(x + Math.cos(a) * 11).toFixed(1)}" cy="${(246 + Math.sin(a) * 11).toFixed(1)}" r="2.4" fill="#5D6B76"/>`; }).join('')}<circle cx="${x}" cy="246" r="6" fill="#7E8C97"/><rect x="${x - 1.5}" y="231" width="3" height="8" fill="#5D6B76"/></g></g>`;
    return `<svg class="bt-lat" viewBox="0 0 780 300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="visible" role="img" aria-label="BeTruck rodando">
<defs>${logoDefs(p)}
  <linearGradient id="${p}tq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F7F9"/><stop offset=".18" stop-color="#fff"/><stop offset=".7" stop-color="#EEF2F5"/><stop offset="1" stop-color="#C9D4DC"/></linearGradient>
  <linearGradient id="${p}vl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D4A66"/><stop offset="1" stop-color="${COR.vidro2}"/></linearGradient>
</defs>
<ellipse cx="400" cy="276" rx="340" ry="10" fill="#000" opacity=".28"/>
<g class="bt-lat-corpo">
  <rect x="58" y="222" width="660" height="14" rx="4" fill="#1B2630"/>
  <path d="M300 222Q330 238 360 224T420 226T470 222" stroke="${COR.laranja}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M310 228Q345 240 380 230T450 232" stroke="#C85F1D" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="244" y="212" width="52" height="26" rx="3" fill="#8D9AA5" stroke="${COR.contorno}" stroke-width="2"/>
  <ellipse cx="80" cy="141" rx="24" ry="72" fill="${COR.calota}"/>
  <rect x="80" y="69" width="420" height="144" fill="url(#${p}tq)"/>
  <path d="M80 69H500M80 213H500" stroke="${COR.contorno}" stroke-width="3"/>
  <ellipse cx="500" cy="141" rx="18" ry="72" fill="${COR.calota}"/>
  <path d="M120 64H470" stroke="#9AA8B3" stroke-width="3"/>${[130, 220, 310, 400, 465].map(x => `<path d="M${x} 64V70" stroke="#9AA8B3" stroke-width="3"/>`).join('')}
  <rect x="178" y="58" width="40" height="12" rx="3" fill="#B7C3CC"/><rect x="352" y="58" width="40" height="12" rx="3" fill="#B7C3CC"/>
  ${logo(p, 120, 92, 112)}
  <text x="176" y="166" text-anchor="middle" font-family="Montserrat,Arial" font-weight="800" font-style="italic" font-size="22" fill="${COR.azul}">BeVant</text>
  <rect x="276" y="104" width="200" height="24" rx="12" fill="${COR.azul}"/>
  <text x="376" y="121" text-anchor="middle" font-family="Montserrat,Arial" font-weight="800" font-size="11.5" fill="#fff" letter-spacing=".4">MOVIDO A BIOCOMBUSTÍVEL</text>
  <text x="376" y="146" text-anchor="middle" font-family="Montserrat,Arial" font-weight="900" font-size="15" fill="${COR.navy}">Be8 <tspan fill="${COR.azul}" font-style="italic">BeVant</tspan></text>
  <rect x="446" y="176" width="40" height="26" rx="2" fill="${COR.laranja}" stroke="#111" stroke-width="2.5"/><path d="M448 189H484" stroke="#111" stroke-width="2"/>
  <path d="M420 178L431 189L420 200L409 189Z" fill="#fff" stroke="#111" stroke-width="2"/>
  <path d="M116 238Q116 204 150 204H224Q258 204 258 238" stroke="#1B2630" stroke-width="7" fill="none"/>
  <path d="M552 238Q552 208 584 208H662Q694 208 694 238" stroke="#1B2630" stroke-width="7" fill="none"/>
  <rect x="502" y="22" width="11" height="128" rx="4" fill="#B5C1CA" stroke="#6E7C87" stroke-width="2"/><rect x="500" y="16" width="15" height="9" rx="3" fill="#6E7C87"/>
  <path d="M522 48Q528 10 580 8H684Q702 10 704 48Z" fill="#fff" stroke="${COR.contorno}" stroke-width="3"/>
  <text x="614" y="34" text-anchor="middle" font-family="Montserrat,Arial" font-weight="900" font-size="12" fill="${COR.navy}">É RENOVÁVEL!</text>
  <path d="M560 12L554-18" stroke="#AEBBC5" stroke-width="3" stroke-linecap="round"/><circle cx="554" cy="-20" r="4.5" fill="${COR.teal}"/>
  <path d="M518 236V72Q518 48 542 46H678Q700 48 704 80L712 150Q716 162 714 182V236Z" fill="url(#${p}tq)" stroke="${COR.contorno}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M566 64H644V140H566Z" fill="url(#${p}vl)" stroke="${COR.contorno}" stroke-width="2.5"/><path d="M574 132L620 70H632L586 132Z" fill="#fff" opacity=".12"/>
  <rect x="560" y="58" width="90" height="152" rx="6" fill="none" stroke="#B7C3CC" stroke-width="2"/>
  <g transform="translate(604 172)"><path d="M0-22C8-10 14-3 14 6A14 14 0 0 1-14 6C-14-3-8-10 0-22Z" fill="none" stroke="${COR.azul}" stroke-width="3.5"/></g>
  <text x="604" y="203" text-anchor="middle" font-family="Montserrat,Arial" font-weight="900" font-size="9.5" fill="${COR.navy}">Be8 <tspan fill="${COR.azul}" font-style="italic">BeVant</tspan></text>
  <path d="M652 58H690Q699 60 701 74L708 140H652Z" fill="url(#${p}vl)" stroke="${COR.contorno}" stroke-width="2.5"/>
  <g class="bt-lat-olho"><ellipse cx="678" cy="100" rx="19" ry="25" fill="#FBFDFE" stroke="${COR.contorno}" stroke-width="3"/><circle class="bt-lat-iris" cx="686" cy="102" r="10" fill="${COR.teal}"/><circle cx="688" cy="102" r="5" fill="${COR.navy}"/><circle cx="684" cy="97" r="2.6" fill="#fff"/><rect class="bt-lat-palp" x="657" y="73" width="42" height="0" fill="${COR.palpebra}"/></g>
  <path d="M650 56H702L705 68H652Z" fill="#101B23"/><path d="M656 67H700" stroke="${COR.lime}" stroke-width="2"/>
  <path d="M704 72L732 64" stroke="${COR.escuro}" stroke-width="5" stroke-linecap="round"/><rect x="728" y="46" width="13" height="46" rx="5" fill="${COR.escuro}"/>
  <path d="M704 150H714V188H704Z" fill="url(#${p}vl)"/>
  <path d="M688 190H718Q724 190 724 198V236H688Z" fill="#fff" stroke="${COR.contorno}" stroke-width="3"/>
  <rect class="bt-lat-farol" x="708" y="196" width="14" height="12" rx="4" fill="#FFF2B3" stroke="#7E8C97" stroke-width="1.5"/>
  <path d="M696 216Q708 228 720 214" stroke="${COR.contorno}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <rect x="598" y="214" width="42" height="6" rx="2" fill="${COR.escuro}"/><rect x="598" y="226" width="42" height="6" rx="2" fill="${COR.escuro}"/>
  <circle class="bt-lat-luz" cx="738" cy="202" r="40" fill="#FFF2B3" opacity="0"/>
</g>
${[150, 224, 584, 662].map(roda).join('')}
</svg>`;
  }

  /* ------------------------------------------------------------ expressões */
  const BASE = {
    olhoE: 1, olhoD: 1, baixoE: .12, baixoD: .12, sobrE: 0, sobrD: 0, rotE: 0, rotD: 0, palpRotE: 0, palpRotD: 0,
    pupX: 0, pupY: 0, pupS: 1, bocaL: 100, bocaA: .06, sorriso: .8, torto: 0, lingua: 0, rubor: 0, farol: .55,
    incl: 0, ergue: 0, achata: 1, retroE: 0, retroD: 0
  };
  const EXPR = {
    feliz: {},
    radiante: { olhoE: .9, olhoD: .9, baixoE: .6, baixoD: .6, sobrE: 10, sobrD: 10, bocaL: 112, bocaA: .62, sorriso: 1, lingua: 1, rubor: .35, farol: .9, ergue: 6 },
    piscadinha: { olhoE: .02, baixoE: .45, sobrE: -4, sobrD: 10, rotD: -6, bocaL: 96, bocaA: .14, sorriso: .9, torto: .45, rubor: .2, incl: -4 },
    apaixonado: { olho: 'coracao', baixoE: .3, baixoD: .3, sobrE: 12, sobrD: 12, rotE: -8, rotD: 8, bocaL: 84, bocaA: .3, sorriso: .9, lingua: .6, rubor: 1, farol: .8, incl: 5 },
    encantado: { olho: 'estrela', sobrE: 16, sobrD: 16, bocaL: 104, bocaA: .55, sorriso: 1, lingua: .8, farol: 1, ergue: 8 },
    confiante: { olhoE: .72, olhoD: .72, baixoE: .25, baixoD: .25, sobrE: 10, rotE: -8, sobrD: -2, bocaL: 92, bocaA: .04, sorriso: .7, torto: .75, incl: -3 },
    pensativo: { pupX: -.55, pupY: -.75, sobrE: 18, rotE: -6, sobrD: 2, bocaL: 52, bocaA: .04, sorriso: .1, torto: .7, incl: -5 },
    surpreso: { olhoE: 1, olhoD: 1, baixoE: 0, baixoD: 0, pupS: .72, sobrE: 24, sobrD: 24, bocaL: 40, bocaA: .9, sorriso: 0, ergue: 10 },
    alerta: { baixoE: 0, baixoD: 0, pupS: .7, sobrE: 16, sobrD: 16, rotE: -12, rotD: 12, palpRotE: -8, palpRotD: 8, bocaL: 58, bocaA: .55, sorriso: -.35, farol: 1 },
    confuso: { sobrE: 20, rotE: -12, sobrD: -6, rotD: 10, pupX: .3, pupY: -.3, bocaL: 62, bocaA: .08, sorriso: -.15, torto: -.7, incl: -7 },
    envergonhado: { olhoE: .6, olhoD: .6, baixoE: .45, baixoD: .45, pupX: .45, pupY: .55, sobrE: 6, sobrD: 6, rotE: -10, rotD: 10, bocaL: 46, bocaA: .02, sorriso: .45, rubor: 1, incl: 5 },
    preocupado: { olhoE: .92, olhoD: .92, baixoE: .08, baixoD: .08, sobrE: 8, sobrD: 8, rotE: -15, rotD: 15, palpRotE: -10, palpRotD: 10, bocaL: 70, bocaA: .06, sorriso: -.5 },
    assustado: { baixoE: 0, baixoD: 0, pupS: .55, sobrE: 28, sobrD: 28, rotE: -10, rotD: 10, bocaL: 86, bocaA: .72, sorriso: -.55, ergue: 14, achata: 1.04 },
    triste: { olhoE: .72, olhoD: .72, baixoE: .1, baixoD: .1, pupY: .4, sobrE: 4, sobrD: 4, rotE: -18, rotD: 18, palpRotE: -14, palpRotD: 14, bocaL: 76, bocaA: .04, sorriso: -.85, farol: .3, achata: .98 },
    bravo: { olhoE: .72, olhoD: .72, baixoE: .2, baixoD: .2, sobrE: -10, sobrD: -10, rotE: 20, rotD: -20, palpRotE: 16, palpRotD: -16, pupS: .85, bocaL: 92, bocaA: .26, sorriso: -.7, farol: 1 },
    cansado: { olhoE: .42, olhoD: .42, baixoE: .1, baixoD: .1, pupY: .3, sobrE: -6, sobrD: -6, rotE: -6, rotD: 6, bocaL: 66, bocaA: .06, sorriso: -.1, farol: .25, achata: .98, incl: 3 },
    sonolento: { olhoE: .2, olhoD: .26, baixoE: .1, baixoD: .1, sobrE: -8, sobrD: -8, bocaL: 50, bocaA: .12, sorriso: .1, farol: .15, incl: 4 },
    dormindo: { olhoE: 0, olhoD: 0, baixoE: 0, baixoD: 0, sobrE: -8, sobrD: -8, bocaL: 40, bocaA: .14, sorriso: .25, farol: .06, achata: .98 },
    tonto: { olho: 'espiral', sobrE: 12, rotE: -10, sobrD: 4, rotD: 12, bocaL: 72, bocaA: .2, sorriso: .1, torto: .8, lingua: .7 }
  };

  /* ------------------------------------------------------------ persona e bordões */
  const PERSONA = {
    nome: 'BeTruck',
    apelido: 'Bê',
    quem: 'Caminhão-tanque 8x2 da frota Be8, pintado de BeVant, mascote da Logística e Transporte em Passo Fundo/RS.',
    tracos: ['divertido', 'expressivo', 'otimista', 'exagerado nas caras', 'orgulhoso de rodar renovável', 'gaúcho de coração', 'atento aos números'],
    bordoes: {
      saudacao: ['**Bom dia, comboio!**', '**Fom-fom, parceiro!**', '**Partiu, comboio!**'],
      assinatura: ['**Bora rodar renovável!**', '**É renovável, é BeVant agora!**'],
      bom: ['**Estrada limpa!**', '**Tanque cheio, tchê!**', '**Carga liberada!**'],
      alerta: ['**Pisca-alerta ligado!**', '**Pé no freio, comboio!**', '**Luz vermelha no painel!**'],
      ocioso: ['Vou dar um trato no para-brisa, **comboio**…', 'Só um golinho de BeVant pra seguir viagem…', '**Motor em marcha lenta…**'],
      tchau: ['**Farol baixo e até amanhã, comboio!**']
    }
  };
  const frase = tipo => sorteia(PERSONA.bordoes[tipo] || PERSONA.bordoes.assinatura);

  /* ------------------------------------------------------------ motor */
  class BeTruck {
    constructor(el, op = {}) {
      this.el = el; this.op = Object.assign({ palco: null, pistaBase: 0, zzz: false, loop: true, piscarAuto: true }, op);
      this.p = 'bt' + (++UID) + '-';
      el.classList.add('betruck');
      el.innerHTML = svgRosto(this.p);
      this.svg = el.querySelector('svg');
      const q = s => this.svg.querySelector(s);
      this.$ = {
        rig: q('.bt-rig'), sombra: q('.bt-sombra'), aura: q('.bt-aura-vermelha'), tinta: q('.bt-tinta'), giro: q('.bt-giroflex'), feixeE: q('.bt-feixe-e'), feixeD: q('.bt-feixe-d'), giroLuz: q('.bt-giro-luz'),
        antE: q('.bt-antena-e'), antD: q('.bt-antena-d'), retroE: q('.bt-retro-e'), retroD: q('.bt-retro-d'),
        sobrE: q('.bt-sobr-e'), sobrD: q('.bt-sobr-d'), leds: [...this.svg.querySelectorAll('.bt-led')],
        limpE: q('.bt-limp-e'), limpD: q('.bt-limp-d'), gotas: q('.bt-gotas'), jatos: q('.bt-jatos'), jato: [...this.svg.querySelectorAll('.bt-jato')],
        bocaFundo: [...this.svg.querySelectorAll('.bt-boca-fundo')], bocaClip: q('.bt-boca-clip'), bocaBorda: q('.bt-boca-borda'), dentes: q('.bt-dentes'), lingua: q('.bt-lingua'),
        rubor: q('.bt-rubor'), lampE: [...q('.bt-farol-e').querySelectorAll('.bt-lamp')], lampD: [...q('.bt-farol-d').querySelectorAll('.bt-lamp')],
        haloE: q('.bt-halo-e'), haloD: q('.bt-halo-d'), haloCorE: [...this.svg.querySelectorAll('.bt-halo-cor-e')], haloCorD: [...this.svg.querySelectorAll('.bt-halo-cor-d')], pisca: [...this.svg.querySelectorAll('.bt-pisca')],
        mangote: q('.bt-mangote'), mangPath: q('.bt-mang-path'), bolhas: q('.bt-bolhas'), frasco: q('.bt-frasco'), liquido: q('.bt-liquido'), brilhos: [...this.svg.querySelectorAll('.bt-brilho')],
        joinha: q('.bt-joinha'), medidor: q('.bt-medidor'), ponteiro: q('.bt-ponteiro'), pensa: q('.bt-pensa'), pensaC: [0, 1, 2].map(i => q('.bt-pensa-' + i)),
        zzz: q('.bt-zzz'), zzzT: [...this.svg.querySelectorAll('.bt-zzz text')], poof: q('.bt-poof')
      };
      for (const l of ['e', 'd']) {
        const g = q('.bt-iris-' + l);
        Object.assign(this.$, {
          ['iris' + l]: g, ['pinf' + l]: q('.bt-pinf-' + l), ['psup' + l]: q('.bt-psup-' + l), ['psupG' + l]: q('.bt-psup-g-' + l),
          ['cilio' + l]: q('.bt-cilio-' + l), ['fechado' + l]: q('.bt-fechado-' + l),
          ['ir' + l]: { normal: g.querySelector('.bt-ir-normal'), coracao: g.querySelector('.bt-ir-coracao'), espiral: g.querySelector('.bt-ir-espiral'), estrela: g.querySelector('.bt-ir-estrela') }
        });
      }

      this.P = Object.assign({}, BASE, { piscada: 0, limpador: 0, jato: 0, mangote: 0, frasco: 0, joinha: 0, medidor: 0, combustivel: .15, pensa: 0, escala: 1, giroflex: 0, vermelho: 0 });
      this.T = Object.assign({}, this.P);
      this.tws = []; this.tok = 0; this.ocupado = null; this.humor = 'feliz'; this.estiloOlho = 'normal'; this.estado = 'acordado';
      this.falaAte = 0; this.modo = null; this.modoDesde = 0; this.calmoApos = 6000; this.ant = { e: { a: 0, v: 0 }, d: { a: 0, v: 0 } }; this.ultimoErgue = 0;
      this.gotasL = []; this.bolhasL = []; this.limpAnt = 0; this.proxPiscada = performance.now() + 2500; this.proxOlhada = performance.now() + 5000;
      this.t0 = performance.now(); this.agora = this.t0; this.ultimo = this.t0;
      this.render(0);
      if (this.op.loop) { const f = n => { if (this.morto) return; this.update(n); requestAnimationFrame(f); }; requestAnimationFrame(f); }
    }

    /* -------- utilidades */
    espera(ms) { return new Promise(r => setTimeout(r, ms)); }
    tw(k, para, ms = 300, ease = 'io') {
      return new Promise(res => {
        this.tws = this.tws.filter(x => { if (x.k === k) { x.res(); return false; } return true; });
        this.tws.push({ k, de: this.P[k], para, t0: this.agora, ms: Math.max(1, ms), ease: EASE[ease] || EASE.io, res });
        this.T[k] = para;
      });
    }
    alvo(obj) { Object.assign(this.T, obj); }
    async gag(nome, fn, opc = {}) {
      if (this.estado !== 'acordado' && !opc.semprePode) return false;
      if (this.modo === 'alerta' && !opc.noAlerta) return false;
      const tok = ++this.tok, cancel = () => tok !== this.tok;
      this.ocupado = nome; this.limparExtras();
      try { await fn(cancel); } catch (e) { console.error('[BeTruck]', nome, e); }
      if (!cancel()) { this.ocupado = null; this.limparExtras(); if (!opc.manterExpr) this.expressao(this.humor); }
      return !cancel();
    }
    limparExtras() {
      this.alvo({ limpador: 0, jato: 0, mangote: 0, frasco: 0, joinha: 0, medidor: 0, pensa: 0, retroE: 0, retroD: 0 });
      this.bebendo = false; this.festaAte = 0; this.tontoAte = 0;
      if (this.P.escala < 1 && !this.dirigindo) this.tw('escala', 1, 400, 'back');
    }

    /* -------- expressões e fala */
    expressao(nome = 'feliz', manter = true) {
      const e = EXPR[nome] || EXPR.feliz;
      const alvo = Object.assign({}, BASE, e); delete alvo.olho; this.alvo(alvo);
      this.estiloOlho = e.olho || 'normal';
      if (manter && !this.ocupado && EXPR[nome] && !['dormindo', 'sonolento', 'alerta'].includes(nome)) this.humor = nome;
      return this;
    }
    setExpression(n) { return this.expressao(n); }
    falar(seg = 3) { this.falaAte = Math.max(this.falaAte, this.agora + seg * 1000); return this; }
    calar() { this.falaAte = 0; return this; }
    olhar(x = 0, y = 0) { this.alvo({ pupX: clamp(x, -1, 1), pupY: clamp(y, -1, 1) }); this.olhandoAte = this.agora + 2500; return this; }

    /* -------- piscadas */
    async piscar(vezes = 1) {
      for (let i = 0; i < vezes; i++) { await this.tw('piscada', 1, 70, 'in'); await this.tw('piscada', 0, 120, 'out'); if (i < vezes - 1) await this.espera(90); }
    }
    piscadinha() {
      return this.gag('piscadinha', async c => {
        this.expressao('piscadinha', false); this.farolPisca('e', 3, FAROL.normal); await this.espera(1300); if (c()) return;
        this.alvo({ olhoE: 1, baixoE: .12 }); await this.piscar(2); if (c()) return;
        this.alvo({ olhoD: .02, baixoD: .45, olhoE: 1, torto: -.45, sobrD: -4, sobrE: 10 }); this.farolPisca('d', 3, FAROL.normal); await this.espera(1100);
      });
    }
    farolPisca(lado, vezes = 2, cor = FAROL.normal) { this.flash = { lado, ate: this.agora + vezes * 260, cor }; }

    /* -------- gracinhas */
    limpador() {
      return this.gag('limpador', async c => {
        this.alvo({ pupY: -.25, sobrE: 14, sobrD: 14, bocaL: 70, bocaA: .2, sorriso: .5 });
        for (let i = 0; i < 3 && !c(); i++) {
          this.alvo({ pupX: -.6 }); await this.tw('limpador', 1, 520, 'io'); if (c()) return;
          this.alvo({ pupX: .6, olhoE: .55, olhoD: .55 }); await this.tw('limpador', 0, 520, 'io');
          this.alvo({ olhoE: 1, olhoD: 1 });
        }
        if (c()) return; this.expressao('radiante', false); await this.piscar(2); await this.espera(900);
      });
    }
    lavarVidro() {
      return this.gag('lavar', async c => {
        this.expressao('surpreso', false); await this.espera(350); if (c()) return;
        await this.tw('jato', 1, 200); this.alvo({ olhoE: .08, olhoD: .08, baixoE: .5, baixoD: .5, sobrE: -6, sobrD: -6, rotE: 10, rotD: -10, bocaL: 60, bocaA: .35, sorriso: -.2, achata: .97 });
        for (let i = 0; i < 26; i++) { this.novaGota(i < 13 ? 205 : 335); if (i % 3 === 0) await this.espera(60); }
        await this.espera(700); await this.tw('jato', 0, 200); if (c()) return;
        for (let i = 0; i < 2 && !c(); i++) { await this.tw('limpador', 1, 480); await this.tw('limpador', 0, 480); }
        if (c()) return; this.alvo({ achata: 1 }); this.expressao('radiante', false); await this.piscar(2); await this.espera(500);
        this.expressao('encantado', false); await this.espera(1100);
      });
    }
    mangote() {
      return this.gag('mangote', async c => {
        this.alvo({ pupX: .7, pupY: .7, sobrE: 16, sobrD: 16 }); this.P.mangote = 0; await this.tw('mangote', 1, 900, 'out'); if (c()) return;
        this.alvo({ pupX: -.1, pupY: .3, olhoE: .5, olhoD: .5, baixoE: .55, baixoD: .55, bocaL: 30, bocaA: .22, sorriso: .2, torto: .2, rubor: .4 });
        await this.tw('medidor', 1, 380, 'back'); this.T.combustivel = this.P.combustivel = .1;
        this.bebendo = true; const fim = this.agora + 3300; let k = 0;
        while (this.agora < fim && !c()) { this.T.combustivel = clamp(.1 + (1 - (fim - this.agora) / 3300) * .9); this.T.achata = k++ % 2 ? 1.03 : .99; await this.espera(260); }
        this.bebendo = false; this.alvo({ achata: 1, combustivel: 1 }); if (c()) return;
        await this.tw('mangote', 0, 650, 'in'); this.expressao('radiante', false); this.soltaFolha(); await this.espera(1400); if (c()) return;
        await this.tw('medidor', 0, 260); this.T.combustivel = .15;
      });
    }
    bevant() {
      return this.gag('bevant', async c => {
        this.expressao('confiante', false); await this.espera(500); if (c()) return;
        this.puf(); await this.tw('escala', 0, 260, 'in'); if (c()) return;
        await this.espera(800); if (c()) return;
        this.P.frasco = 1; this.T.frasco = 1; this.expressao('encantado', false); this.alvo({ pupX: .55, pupY: .1 }); this.puf(true);
        await this.tw('escala', 1, 560, 'back'); if (c()) return;
        await this.espera(1400); if (c()) return;
        this.expressao('piscadinha', false); this.farolPisca('e', 3, FAROL.verde); await this.espera(1500); if (c()) return;
        this.expressao('radiante', false); await this.espera(1200);
      });
    }
    joinha() {
      return this.gag('joinha', async c => {
        await this.tw('joinha', 1, 420, 'back'); this.expressao('piscadinha', false); this.farolPisca('e', 2); await this.espera(1600); if (c()) return;
        this.expressao('radiante', false); await this.espera(900);
      });
    }
    acenar() {
      return this.gag('aceno', async c => {
        this.expressao('radiante', false);
        for (let i = 0; i < 4 && !c(); i++) { await this.tw('retroD', -28, 220); await this.tw('retroD', 8, 220); }
        await this.tw('retroD', 0, 200);
      });
    }
    bocejar() {
      return this.gag('bocejo', async c => {
        this.alvo({ olhoE: .1, olhoD: .1, baixoE: .3, baixoD: .3, sobrE: 18, sobrD: 18, rotE: -8, rotD: 8, bocaL: 72, bocaA: 1, sorriso: 0, lingua: .7, ergue: 10, achata: 1.04, incl: -3, farol: .3 });
        await this.espera(1900); if (c()) return; this.alvo({ ergue: 0, achata: 1, incl: 2 });
        this.expressao('sonolento', false); await this.espera(900); if (c()) return; await this.piscar(1); this.expressao('feliz', false); await this.espera(500);
      });
    }
    pensar(seg = 3) {
      return this.gag('pensa', async c => {
        this.expressao('pensativo', false); await this.tw('pensa', 1, 600, 'out'); await this.espera(seg * 1000); if (c()) return;
        this.expressao('encantado', false); await this.tw('pensa', 0, 200); await this.espera(700);
      });
    }
    comemorar() {
      return this.gag('festa', async c => {
        this.expressao('encantado', false); this.festaAte = this.agora + 2600; this.puf(true, true);
        for (let i = 0; i < 3 && !c(); i++) { await this.tw('ergue', 26, 220, 'out'); await this.tw('ergue', 0, 260, 'in'); }
        if (c()) return; this.expressao('radiante', false); await this.espera(900);
      });
    }
    surpresa() {
      return this.gag('surpresa', async c => {
        this.expressao('surpreso', false); await this.tw('ergue', 22, 160, 'out'); await this.tw('ergue', 10, 300); await this.espera(1100); if (c()) return;
        await this.piscar(2);
      });
    }
    tonto() {
      return this.gag('tonto', async c => { this.expressao('tonto', false); this.tontoAte = this.agora + 2800; await this.espera(2900); if (c()) return; await this.piscar(2); });
    }
    olhaTela(dx = .9) {
      return this.gag('olha', async c => { this.alvo({ pupX: dx, pupY: -.1, sobrE: 12, sobrD: 12 }); this.olhandoAte = this.agora + 1600; await this.espera(1500); if (c()) return; this.alvo({ pupX: 0, pupY: 0 }); await this.piscar(1); });
    }

    /* -------- alerta: fica vermelho, giroflex e farol piscando (sem som) */
    alerta(ligar = true, op = {}) {
      if (!ligar) { if (this.modo !== 'alerta') return this; this.modo = null; this.alvo({ vermelho: 0, giroflex: 0 }); this.expressao(this.humor); return this; }
      if (this.estado !== 'acordado') this.acordar(false);
      this.tok++; this.ocupado = null; this.limparExtras(); this.P.escala = this.T.escala = 1;
      this.modo = 'alerta'; this.modoDesde = this.agora; this.calmoApos = op.calmoApos ?? 6000;
      this.expressao('alerta', false); this.tw('ergue', 18, 160, 'out').then(() => this.tw('ergue', 0, 420, 'back'));
      this.alvo({ giroflex: 1 });
      return this;
    }
    get emAlerta() { return this.modo === 'alerta'; }

    /* -------- dormir / acordar */
    dormir() {
      if (this.estado !== 'acordado') return; this.tok++; this.ocupado = null; this.limparExtras(); this.alerta(false); this.estado = 'dormindo'; this.calar();
      this.expressao('sonolento', false); setTimeout(() => { if (this.estado === 'dormindo') this.expressao('dormindo', false); }, 1400);
    }
    acordar(feliz = true) {
      if (this.estado !== 'dormindo') return; this.estado = 'acordado';
      this.expressao('surpreso', false); this.tw('ergue', 16, 160, 'out').then(() => this.tw('ergue', 0, 360, 'back'));
      setTimeout(() => { if (this.estado === 'acordado' && !this.ocupado && this.modo !== 'alerta') { this.piscar(2); this.expressao(feliz ? 'radiante' : this.humor, false); setTimeout(() => !this.ocupado && this.modo !== 'alerta' && this.expressao(this.humor), 1200); } }, 700);
    }

    /* -------- sumir e voltar */
    async sumir() { this.puf(); await this.tw('escala', 0, 260, 'in'); }
    async voltar() { this.puf(true); await this.tw('escala', 1, 520, 'back'); }

    /* -------- corpo inteiro: atravessa o palco rodando (o rosto some e volta depois) */
    rodar(op = {}) {
      const palco = op.palco || this.op.palco || this.el.parentElement;
      if (!palco || this.dirigindo) return Promise.resolve(false);
      return this.gag('rodar', async c => {
        this.dirigindo = true;
        const W = palco.clientWidth || 1920, largura = op.largura || 640, alt = largura * 300 / 780, base = op.base ?? this.op.pistaBase, z = op.z || 6;
        const pista = document.createElement('div');
        pista.className = 'bt-pista';
        pista.style.cssText = `position:absolute;left:0;bottom:${base}px;width:${largura}px;height:${alt}px;pointer-events:none;z-index:${z};will-change:transform;transform:translateX(${-largura - 40}px)`;
        pista.innerHTML = svgLateral(this.p + 'l');
        const fumaca = document.createElement('div');
        fumaca.style.cssText = `position:absolute;left:0;bottom:${base}px;width:${W}px;height:${alt}px;pointer-events:none;z-index:${z - 1}`;
        palco.appendChild(fumaca); palco.appendChild(pista);
        const corpo = pista.querySelector('.bt-lat-corpo'), aros = [...pista.querySelectorAll('.bt-aro')], palp = pista.querySelector('.bt-lat-palp'), luz = pista.querySelector('.bt-lat-luz');
        const esc = largura / 780;
        try {
          if (op.manterRosto !== true) { this.expressao('radiante', false); await this.espera(250); this.puf(); await this.tw('escala', 0, 300, 'in'); }
          const x0 = -largura - 40, xm = W / 2 - largura / 2, x1 = W + 60;
          const seg = [{ de: x0, para: xm, ms: op.msIda || 3000, ease: EASE.out }, { pausa: 1000 }, { de: xm, para: x1, ms: op.msVolta || 2600, ease: EASE.in }];
          let xAnt = x0, ang = 0, fum = 0;
          for (const s of seg) {
            if (c()) break;
            const t0 = performance.now(), ms = s.pausa || s.ms;
            await new Promise(res => {
              const f = n => {
                const k = clamp((n - t0) / ms), x = s.pausa ? xAnt : lerp(s.de, s.para, s.ease(k));
                const dx = x - xAnt; xAnt = x; ang += dx / (17 * esc) * 57.3 * .55;
                pista.style.transform = `translateX(${x.toFixed(1)}px)`;
                aros.forEach(a => { const cx = +a.parentNode.dataset.x; a.setAttribute('transform', `rotate(${ang.toFixed(1)} ${cx} 246)`); });
                const bal = s.pausa ? Math.sin(n / 90) * .6 : Math.sin(n / 55) * 1.4;
                corpo.setAttribute('transform', `translate(0 ${bal.toFixed(2)})`);
                if (s.pausa) { palp.setAttribute('height', k > .2 && k < .32 ? 52 : 0); luz.setAttribute('opacity', k > .45 && Math.sin(k * Math.PI * 8) > 0 ? .85 : 0); }
                else { palp.setAttribute('height', 0); luz.setAttribute('opacity', 0); }
                if (!s.pausa && (fum += Math.abs(dx)) > 34) { fum = 0; this.fumacinha(fumaca, x + 507 * esc, (300 - 16) * esc - alt + alt); }
                if (k < 1 && !c()) requestAnimationFrame(f); else res();
              };
              requestAnimationFrame(f);
            });
          }
        } finally {
          pista.remove(); setTimeout(() => fumaca.remove(), 2600);
          this.dirigindo = false;
        }
        if (c()) { this.P.escala = this.T.escala = 1; return; }
        if (op.manterRosto !== true) { this.expressao('radiante', false); await this.voltar(); await this.piscar(2); await this.espera(600); }
      });
    }
    fumacinha(caixa, x, yBase) {
      const d = document.createElement('div'), folhaV = Math.random() < .45, s = 14 + Math.random() * 12;
      d.style.cssText = `position:absolute;left:${x - s / 2}px;bottom:${yBase - s / 2}px;width:${s}px;height:${s}px;border-radius:50%;background:${folhaV ? 'transparent' : 'rgba(236,244,240,.85)'};transition:transform 1.8s ease-out,opacity 1.8s ease-out;opacity:.95`;
      if (folhaV) d.innerHTML = `<svg viewBox="-2 -12 28 24" width="${s + 6}" height="${s}">${folha(Math.random() < .5 ? COR.lime : COR.teal)}</svg>`;
      caixa.appendChild(d);
      requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = `translate(${-40 - Math.random() * 60}px, ${-50 - Math.random() * 50}px) scale(${folhaV ? 1.2 : 2.6}) rotate(${Math.random() * 160 - 80}deg)`; d.style.opacity = 0; }));
      setTimeout(() => d.remove(), 1900);
    }

    /* -------- partículas no SVG do rosto */
    puf(entrada = false, soFolhas = false) {
      const NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g'); this.$.poof.appendChild(g);
      const itens = [];
      for (let i = 0; i < (soFolhas ? 14 : 22); i++) {
        const a = Math.random() * Math.PI * 2, folhaV = soFolhas || i % 3 === 0, e = document.createElementNS(NS, 'g');
        e.innerHTML = folhaV ? folha(i % 2 ? COR.lime : COR.teal) : `<circle r="${18 + Math.random() * 20}" fill="#F3F8FA" stroke="#D3DEE5" stroke-width="3"/>`;
        g.appendChild(e); itens.push({ e, a, d: 60 + Math.random() * 170, r: Math.random() * 360, f: folhaV });
      }
      const t0 = performance.now(), dur = 900;
      const f = n => {
        const k = clamp((n - t0) / dur), ko = EASE.out(k);
        for (const it of itens) {
          const dd = entrada ? it.d * (.4 + ko * .8) : it.d * ko, s = it.f ? 1.4 : (entrada ? 1 - k : .6 + ko * .7);
          it.e.setAttribute('transform', `translate(${(270 + Math.cos(it.a) * dd).toFixed(1)} ${(330 + Math.sin(it.a) * dd * .8).toFixed(1)}) rotate(${(it.r + k * 160).toFixed(0)}) scale(${Math.max(.01, s).toFixed(2)})`);
          it.e.setAttribute('opacity', (1 - k).toFixed(2));
        }
        if (k < 1) requestAnimationFrame(f); else g.remove();
      };
      requestAnimationFrame(f);
    }
    soltaFolha() {
      const NS = 'http://www.w3.org/2000/svg', e = document.createElementNS(NS, 'g'); e.innerHTML = folha(COR.lime); this.$.poof.appendChild(e);
      const t0 = performance.now();
      const f = n => { const k = clamp((n - t0) / 1800); e.setAttribute('transform', `translate(${(270 + Math.sin(k * 9) * 26).toFixed(1)} ${(420 - k * 260).toFixed(1)}) rotate(${(Math.sin(k * 7) * 40).toFixed(0)}) scale(1.6)`); e.setAttribute('opacity', (1 - k * k).toFixed(2)); if (k < 1) requestAnimationFrame(f); else e.remove(); };
      requestAnimationFrame(f);
    }
    novaGota(cx) {
      const NS = 'http://www.w3.org/2000/svg', e = document.createElementNS(NS, 'g'), r = 4 + Math.random() * 6;
      e.innerHTML = `<circle r="${r.toFixed(1)}" fill="#BFE7FA" opacity=".75"/><circle cx="${(-r * .3).toFixed(1)}" cy="${(-r * .35).toFixed(1)}" r="${(r * .3).toFixed(1)}" fill="#fff"/>`;
      this.$.gotas.appendChild(e);
      this.gotasL.push({ e, x: cx + (Math.random() - .5) * 140, y: 190 + Math.random() * 110, vy: 4 + Math.random() * 10, a: 1, viva: true });
    }

    /* ------------------------------------------------------------ quadro a quadro */
    update(n) {
      const dt = Math.min(.05, Math.max(0, (n - this.ultimo) / 1000)); this.ultimo = n; this.agora = n;
      const P = this.P, T = this.T, tw = new Set();
      this.tws = this.tws.filter(x => { const k = clamp((n - x.t0) / x.ms); P[x.k] = lerp(x.de, x.para, x.ease(k)); if (k >= 1) { x.res(); return false; } tw.add(x.k); return true; });
      for (const k in T) { if (tw.has(k) || typeof T[k] !== 'number') continue; const r = k === 'pupX' || k === 'pupY' ? 16 : k === 'incl' || k === 'ergue' ? 7 : k === 'combustivel' ? 4 : 11; P[k] += (T[k] - P[k]) * (1 - Math.exp(-dt * r)); }
      if (this.op.piscarAuto && this.estado === 'acordado' && n > this.proxPiscada) { this.proxPiscada = n + 2200 + Math.random() * 3800; if (P.olhoE > .3 && this.estiloOlho === 'normal') this.piscar(Math.random() < .2 ? 2 : 1); }
      if (!this.ocupado && this.modo !== 'alerta' && this.estado === 'acordado' && n > this.proxOlhada && !(this.olhandoAte > n)) { this.proxOlhada = n + 3500 + Math.random() * 5000; const e = EXPR[this.humor] || {}; this.alvo({ pupX: (e.pupX || 0) + (Math.random() < .5 ? (Math.random() - .5) * .9 : 0), pupY: (e.pupY || 0) + (Math.random() - .5) * .3 }); }
      this.render((n - this.t0) / 1000, dt);
    }

    render(t, dt = .016) {
      const P = this.P, $ = this.$, falando = this.agora < this.falaAte, dorme = this.estado === 'dormindo';
      const alerta = this.modo === 'alerta', forte = alerta && (this.agora - this.modoDesde) < this.calmoApos;
      // corpo: respiração + vibração do motor + balanço
      let incl = P.incl, ergue = P.ergue + Math.sin(t * 2.1) * (dorme ? 3 : 2) + (dorme ? 0 : Math.sin(t * 47) * .35);
      if (falando) ergue += Math.abs(Math.sin(t * 7)) * 3;
      if (dorme) incl += Math.sin(t * .9) * 2.2;
      if (this.tontoAte > this.agora) incl += Math.sin(t * 6) * 6;
      if (forte) incl += Math.sin(t * 30) * .9;
      const esc = Math.max(0, P.escala), sx = esc * (2 - P.achata), sy = esc * P.achata;
      $.rig.setAttribute('transform', `translate(270 ${(580 - ergue).toFixed(2)}) rotate(${incl.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-270 -580)`);
      $.sombra.setAttribute('rx', (205 * esc * (1 - Math.min(Math.max(ergue, 0), 40) / 140)).toFixed(1)); $.sombra.setAttribute('opacity', (.3 * esc).toFixed(2));
      // antenas em mola
      const dErg = ergue - this.ultimoErgue; this.ultimoErgue = ergue;
      for (const l of ['e', 'd']) { const a = this.ant[l]; a.v += (-a.a * 140 - a.v * 7 + dErg * 900 * (l === 'e' ? 1 : -1) / Math.max(dt * 60, 1) + incl * 2) * dt; a.a = clamp(a.a + a.v * dt, -30, 30); const el = l === 'e' ? $.antE : $.antD; el.setAttribute('transform', `rotate(${a.a.toFixed(2)} ${l === 'e' ? 170 : 370} 76)`); }
      // retrovisores (aceno)
      $.retroE.setAttribute('transform', `rotate(${(P.retroE + Math.sin(t * 2.1 + 1) * .8).toFixed(2)} 98 200)`);
      $.retroD.setAttribute('transform', `rotate(${(P.retroD + Math.sin(t * 2.1) * .8).toFixed(2)} 442 200)`);
      // olhos
      const est = this.estiloOlho;
      for (const l of ['e', 'd']) {
        const L = l.toUpperCase(), { x, y } = OLHO[l], rx = OLHO.rx, ry = OLHO.ry;
        let aberto = clamp(P['olho' + L] * (1 - P.piscada)); const baixo = clamp(P['baixo' + L]);
        if (forte) aberto = Math.max(aberto, .95 * (1 - P.piscada));
        const ir = $['ir' + l]; for (const k in ir) ir[k].style.display = k === est ? '' : 'none';
        let px = P.pupX * 17, py = P.pupY * 15; if (est === 'espiral') { px = 0; py = 0; ir.espiral.setAttribute('transform', `rotate(${((t * 400 * (l === 'e' ? 1 : -1)) % 360).toFixed(0)})`); }
        let s = P.pupS * (est === 'coracao' ? 1 + Math.sin(t * 9) * .08 : 1); if (forte) s *= .9 + Math.sin(t * 20) * .05;
        $['iris' + l].setAttribute('transform', `translate(${(x + px).toFixed(1)} ${(y + py).toFixed(1)}) scale(${s.toFixed(3)})`);
        const ySup = y - ry - 6 + (2 * ry + 12) * (1 - aberto), bojo = 14 * aberto + 4;
        $['psup' + l].setAttribute('d', `M${x - rx - 8} ${y - ry - 12}H${x + rx + 8}V${ySup.toFixed(1)}Q${x} ${(ySup + bojo).toFixed(1)} ${x - rx - 8} ${ySup.toFixed(1)}Z`);
        $['cilio' + l].setAttribute('d', `M${x - rx - 8} ${ySup.toFixed(1)}Q${x} ${(ySup + bojo).toFixed(1)} ${x + rx + 8} ${ySup.toFixed(1)}`);
        $['cilio' + l].style.display = aberto > .97 ? 'none' : '';
        $['psupG' + l].setAttribute('transform', `rotate(${P['palpRot' + L].toFixed(1)} ${x} ${y})`);
        const yInf = y + ry + 6 - (2 * ry) * baixo * .72;
        $['pinf' + l].setAttribute('d', `M${x - rx - 8} ${y + ry + 10}H${x + rx + 8}V${yInf.toFixed(1)}Q${x} ${(yInf - 20 * baixo).toFixed(1)} ${x - rx - 8} ${yInf.toFixed(1)}Z`);
        $['fechado' + l].style.display = aberto < .12 ? '' : 'none';
        // sobrancelhas = quebra-sol
        const sb = l === 'e' ? $.sobrE : $.sobrD;
        sb.setAttribute('transform', `translate(${x} ${(172 - P['sobr' + L] * .55 + (forte ? Math.sin(t * 18) * 1.5 : 0)).toFixed(1)}) rotate(${P['rot' + L].toFixed(1)})`);
      }
      const ledCor = alerta ? (Math.sin(t * 10) > 0 ? COR.vermelho : '#7A1D20') : `url(#${this.p}led)`;
      if (ledCor !== this.ledAnt) { this.ledAnt = ledCor; $.leds.forEach(e => e.setAttribute('stroke', ledCor)); }
      // boca = grade do caminhão
      let bA = clamp(P.bocaA, 0, 1.1), bL = P.bocaL;
      if (falando) { const w = Math.max(0, Math.sin(t * 13) * .55 + Math.sin(t * 21.7) * .3 + .1); bA = Math.max(bA, .08 + w * .5); bL = bL * (1 - w * .12); }
      if (this.bebendo) bA = .2 + Math.abs(Math.sin(t * 6)) * .08;
      if (dorme) bA = .1 + (Math.sin(t * 2.1) + 1) * .05;
      const cx = 270, cy = 396, s = P.sorriso, tor = P.torto;
      const yE = cy - s * 18 + tor * 12, yD = cy - s * 18 - tor * 12, topo = cy + s * 12 - bA * 20, base = cy + s * 20 + 12 + bA * 60;
      const dBoca = `M${(cx - bL).toFixed(1)} ${yE.toFixed(1)}C${(cx - bL * .5).toFixed(1)} ${topo.toFixed(1)} ${(cx + bL * .5).toFixed(1)} ${topo.toFixed(1)} ${(cx + bL).toFixed(1)} ${yD.toFixed(1)}C${(cx + bL * .6).toFixed(1)} ${base.toFixed(1)} ${(cx - bL * .6).toFixed(1)} ${base.toFixed(1)} ${(cx - bL).toFixed(1)} ${yE.toFixed(1)}Z`;
      $.bocaFundo.forEach(e => e.setAttribute('d', dBoca)); $.bocaClip.setAttribute('d', dBoca); $.bocaBorda.setAttribute('d', dBoca);
      const topoMed = (Math.min(yE, yD) + topo) / 2;
      $.dentes.setAttribute('x', (cx - bL * .62).toFixed(1)); $.dentes.setAttribute('width', (bL * 1.24).toFixed(1)); $.dentes.setAttribute('y', (topoMed - 4).toFixed(1));
      $.dentes.style.display = bA > .12 ? '' : 'none';
      $.lingua.setAttribute('cx', cx); $.lingua.setAttribute('cy', (base - 10 + (1 - P.lingua) * 22).toFixed(1)); $.lingua.setAttribute('rx', (bL * .5).toFixed(1));
      $.lingua.style.display = bA > .15 ? '' : 'none';
      $.rubor.setAttribute('opacity', (P.rubor * .6).toFixed(2));
      // faróis, piscas, giroflex e tinta vermelha
      let fE = P.farol, fD = P.farol, cE = FAROL.normal, cD = FAROL.normal, pisca = false;
      if (alerta) {
        const on = Math.sin(t * (forte ? 7 : 3.2)) > 0;
        fE = on ? 1 : .08; fD = on ? .08 : 1; cE = forte ? FAROL.vermelho : FAROL.ambar; cD = forte ? FAROL.ambar : FAROL.vermelho; pisca = Math.sin(t * 6.5) > 0;
        this.T.vermelho = forte ? .6 + Math.sin(t * 9) * .2 : .28 + Math.sin(t * 3) * .1;
      }
      if (this.festaAte > this.agora) { const on = Math.sin(t * 16) > 0; fE = on ? 1 : .2; fD = on ? .2 : 1; cE = cD = FAROL.verde; }
      if (this.flash && this.flash.ate > this.agora) { const on = Math.sin(t * 24) > 0; if (this.flash.lado !== 'd') { fE = on ? 1 : .1; cE = this.flash.cor; } if (this.flash.lado !== 'e') { fD = on ? 1 : .1; cD = this.flash.cor; } }
      if (dorme) fE = fD = .05;
      $.lampE.forEach(e => e.setAttribute('fill', fE > .3 ? cE : '#E2E6D8')); $.lampD.forEach(e => e.setAttribute('fill', fD > .3 ? cD : '#E2E6D8'));
      if (cE !== this.corE) { this.corE = cE; $.haloCorE.forEach(s => s.setAttribute('stop-color', cE)); } if (cD !== this.corD) { this.corD = cD; $.haloCorD.forEach(s => s.setAttribute('stop-color', cD)); }
      $.haloE.setAttribute('opacity', clamp((fE - .45) * 1.6).toFixed(2)); $.haloD.setAttribute('opacity', clamp((fD - .45) * 1.6).toFixed(2));
      $.pisca.forEach(e => e.setAttribute('fill', pisca ? '#FFB000' : '#8A6A0C'));
      $.tinta.setAttribute('opacity', clamp(P.vermelho).toFixed(2)); $.aura.setAttribute('opacity', clamp(P.vermelho * 1.2).toFixed(2));
      $.giro.style.display = P.giroflex > .02 ? '' : 'none';
      if (P.giroflex > .02) {
        $.giro.setAttribute('transform', `translate(0 ${((1 - P.giroflex) * 40).toFixed(1)})`);
        const r = Math.cos(t * 9);
        $.feixeD.setAttribute('transform', `translate(270 30) scale(${Math.max(.02, r).toFixed(3)} 1) translate(-270 -30)`);
        $.feixeE.setAttribute('transform', `translate(270 30) scale(${(-Math.max(.02, -r)).toFixed(3)} 1) translate(-270 -30)`);
        $.giroLuz.setAttribute('opacity', (.5 + r * .5).toFixed(2));
      }
      // limpadores e gotas no vidro
      const aE = 180 + P.limpador * 104, aD = 180 + P.limpador * 100, aAntE = 180 + this.limpAnt * 104, aAntD = 180 + this.limpAnt * 100;
      $.limpE.setAttribute('transform', `translate(250 308) rotate(${aE.toFixed(1)})`); $.limpD.setAttribute('transform', `translate(394 308) rotate(${aD.toFixed(1)})`);
      const varreu = Math.abs(P.limpador - this.limpAnt) > .001; this.limpAnt = P.limpador;
      for (const g of this.gotasL) {
        if (g.viva && g.y < 300) g.y += g.vy * dt;
        if (varreu && g.viva) for (const [px, py, len, a0, a1] of [[250, 308, 118, aAntE, aE], [394, 308, 110, aAntD, aD]]) {
          const dx = g.x - px, dy = g.y - py, dist = Math.hypot(dx, dy); let ang = Math.atan2(dy, dx) * 57.2958; if (ang < 90) ang += 360;
          if (dist < len + 6 && ang >= Math.min(a0, a1) - 5 && ang <= Math.max(a0, a1) + 5) g.viva = false;
        }
        if (!g.viva) g.a -= dt * 5;
        g.e.setAttribute('transform', `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) scale(1 ${(1 + g.vy / 30).toFixed(2)})`); g.e.setAttribute('opacity', clamp(g.a).toFixed(2));
      }
      if (this.gotasL.length) this.gotasL = this.gotasL.filter(g => { if (g.a <= 0) { g.e.remove(); return false; } return true; });
      $.jatos.setAttribute('opacity', P.jato.toFixed(2)); if (P.jato > .01) $.jato.forEach(j => j.setAttribute('stroke-dashoffset', (-t * 90).toFixed(1)));
      // extras
      const mostra = (el, v) => { const vis = v > .01; if (el._vis !== vis) { el._vis = vis; el.style.display = vis ? '' : 'none'; } return vis; };
      if (mostra($.mangote, P.mangote)) {
        $.mangote.setAttribute('transform', `translate(${((1 - P.mangote) * 260).toFixed(1)} ${((1 - P.mangote) * 280).toFixed(1)})`);
        if (this.bebendo && Math.random() < dt * 9) { const NS = 'http://www.w3.org/2000/svg', b = document.createElementNS(NS, 'circle'); b.setAttribute('r', (4 + Math.random() * 4).toFixed(1)); b.setAttribute('fill', Math.random() < .5 ? COR.biodiesel : COR.lime); b.setAttribute('stroke', '#7FA33A'); b.setAttribute('stroke-width', 1.5); $.bolhas.appendChild(b); this.bolhasL.push({ e: b, k: 0 }); }
        const L = this.mangL || (this.mangL = $.mangPath.getTotalLength());
        this.bolhasL = this.bolhasL.filter(b => { b.k += dt * .7; if (b.k >= 1) { b.e.remove(); return false; } const pt = $.mangPath.getPointAtLength(b.k * L); b.e.setAttribute('cx', pt.x.toFixed(1)); b.e.setAttribute('cy', pt.y.toFixed(1)); return true; });
      } else if (this.bolhasL.length) { this.bolhasL.forEach(b => b.e.remove()); this.bolhasL = []; }
      if (mostra($.medidor, P.medidor)) { $.medidor.setAttribute('transform', `translate(470 78) scale(${(P.medidor * 1.3).toFixed(3)})`); $.ponteiro.setAttribute('transform', `rotate(${(-62 + P.combustivel * 124).toFixed(1)})`); }
      if (mostra($.frasco, P.frasco)) {
        $.frasco.setAttribute('transform', `translate(498 ${(352 + Math.sin(t * 3) * 5).toFixed(1)}) rotate(${(Math.sin(t * 2.4) * 6).toFixed(1)}) scale(${(P.frasco * 1.45).toFixed(3)})`);
        $.liquido.setAttribute('transform', `translate(${(Math.sin(t * 3) * 6).toFixed(1)} 0)`);
        $.brilhos.forEach((b, i) => b.setAttribute('transform', `scale(${Math.max(0, Math.sin(t * 4 + i * 1.7)).toFixed(2)}) rotate(${((t * 90) % 360).toFixed(0)})`));
      }
      if (mostra($.joinha, P.joinha)) $.joinha.setAttribute('transform', `translate(502 ${(352 + Math.sin(t * 5) * 3).toFixed(1)}) rotate(${(-8 + Math.sin(t * 6) * 6).toFixed(1)}) scale(${(P.joinha * 1.5).toFixed(3)})`);
      if (mostra($.pensa, P.pensa)) $.pensaC.forEach((cc, i) => { cc.setAttribute('transform', `translate(0 ${(Math.sin(t * 3 + i) * 3).toFixed(1)})`); cc.setAttribute('opacity', clamp(P.pensa * 3 - i).toFixed(2)); });
      // zzz (opcional; o painel da TV tem o próprio)
      if (this.op.zzz) { mostra($.zzz, dorme ? 1 : 0); if (dorme) $.zzzT.forEach((z, i) => { const k = ((t * .45 + i * .33) % 1); z.setAttribute('x', (400 + k * 70 + i * 6).toFixed(0)); z.setAttribute('y', (150 - k * 120).toFixed(0)); z.setAttribute('opacity', Math.sin(k * Math.PI).toFixed(2)); z.setAttribute('font-size', (26 + k * 26).toFixed(0)); }); }
    }

    destruir() { this.morto = true; this.tok++; this.el.innerHTML = ''; this.el.classList.remove('betruck'); }
  }

  BeTruck.expressoes = Object.keys(EXPR);
  BeTruck.gracinhas = ['piscadinha', 'limpador', 'lavarVidro', 'mangote', 'bevant', 'joinha', 'acenar', 'bocejar', 'pensar', 'comemorar', 'surpresa', 'tonto', 'rodar'];
  BeTruck.persona = PERSONA;
  BeTruck.frase = frase;
  BeTruck.svgLateral = () => svgLateral('btx' + (++UID) + '-');
  global.BeTruck = BeTruck;
})(typeof window !== 'undefined' ? window : globalThis);
