/* Confraternização do Time de Logística — 3 telas temporárias no painel (convite, comunicado e cobrança).
   Saem do ar sozinhas na segunda-feira 23/11/2026 às 6h. Para remover de vez: apagar a pasta festa/
   e as 3 linhas marcadas "festa" no index.html.
   Desenvolvido por Lucas L. Diogo para a Be8 — 2026 */
'use strict';
(() => {
  const EXPIRA = new Date('2026-11-23T06:00:00-03:00').getTime();
  const EVENTO = new Date('2026-12-05T10:30:00-03:00').getTime();
  const PRAZO = new Date('2026-11-20T23:59:59-03:00').getTime();
  const ativo = () => Date.now() < EXPIRA;
  if (!ativo()) return;

  const RECADOS = ['🍖 Confraternização do Time de Logística · sábado, 05/12 · a partir das 10h30 · UPF – Associação de Funcionários',
    '📢 Jerrard, Márcio, Bianca e Gustavo: confirmem nome e participação até sexta-feira, 20/11!'];
  const TURMA = [
    { id: 'jerrard', nome: 'Jerrard', visto: 'falando “depois eu vejo isso…”', premio: '1 espeto de picanha 🍖' },
    { id: 'marcio', nome: 'Márcio', visto: 'de punho fechado, pronto pra picanha', premio: '1 chopp gelado 🍺' },
    { id: 'bianca', nome: 'Bianca', visto: 'sorrindo pro buffet', premio: '1 pão de alho 🧄' },
    { id: 'gustavo', nome: 'Gustavo', visto: '“deixa eu ver a agenda…”', premio: '1 coraçãozinho 🍢' },
  ];

  const rnd = (a, b) => a + Math.random() * (b - a);
  const letras = (txt, cls = '') => [...txt].map(c => c === ' ' ? '<span class="ch">&nbsp;</span>' : `<span class="ch ${cls}">${esc(c)}</span>`).join('');
  const falta = alvo => { const ms = Math.max(0, alvo - Date.now()); return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60, ms }; };
  const caixas = (pref) => ['d', 'h', 'm', 's'].map(k => `<div class="cx"><b id="${pref}-${k}">--</b><span>${{ d: 'dias', h: 'horas', m: 'min', s: 'seg' }[k]}</span></div>`).join('');
  function contar(pref, alvo, aoAcabar) {
    const f = falta(alvo); if (!f.ms && aoAcabar) return aoAcabar();
    for (const k of ['d', 'h', 'm', 's']) { const el = document.getElementById(`${pref}-${k}`); if (el) { const v = String(f[k]).padStart(2, '0'); if (el.textContent !== v) { el.textContent = v; if (k !== 's') gsap.fromTo(el, { y: -12, opacity: .2 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(2)' }); } } }
  }

  /* cada tela guarda seu contexto GSAP e seus relogios; ao sair tudo e desligado */
  function base(id, nome, montar, fala) {
    return {
      nome, pronto: ativo,
      render() { this.parar(true); const sec = $('#t-' + id); this.timers = []; this.ctx = gsap.context(() => montar.call(this, sec), sec); },
      sair() { this.parar(false); },
      parar(agora) { (this.timers || []).forEach(clearInterval); this.timers = []; const c = this.ctx; this.ctx = null; if (c) agora ? c.revert() : setTimeout(() => c.revert(), 700); },
      fala,
    };
  }

  /* ------------------------------------------------------------ 1. convite */
  TELAS.convite = base('convite', 'Confraternização 05/12', function (sec) {
    sec.innerHTML = `<div class="cv">
      <div class="cv-foto"><img src="festa/churrasco.jpg" alt="Churrasco"></div><div class="cv-brilho"></div>
      <div class="fx"></div>
      <svg class="cv-linha" viewBox="0 0 1386 872"><path id="cvRota" d="M-30 622C240 582 420 664 690 626S1130 572 1420 600" fill="none" stroke="#0EB194" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 0"/>
        <circle cx="1356" cy="597" r="9" fill="#0EB194"/><g id="cvCam"><g transform="translate(-40,-34) scale(1.15)">
        <rect x="0" y="2" width="44" height="24" rx="3" fill="#0E2A3C" stroke="#55C94F" stroke-width="2"/><text x="22" y="19" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="11" fill="#55C94F">Be8</text>
        <path d="M46 8h12l8 9v9H46z" fill="#14384F" stroke="#55C94F" stroke-width="2"/><rect x="50" y="11" width="7" height="6" rx="1" fill="#8fd9f0"/>
        <circle cx="12" cy="28" r="5" fill="#0B1620" stroke="#8FA9B8" stroke-width="2"/><circle cx="34" cy="28" r="5" fill="#0B1620" stroke="#8FA9B8" stroke-width="2"/><circle cx="58" cy="28" r="5" fill="#0B1620" stroke="#8FA9B8" stroke-width="2"/></g></g></svg>
      <div class="cv-esq">
        <div class="cv-tag"><i></i>Be8 · Time de Logística</div>
        <h2 class="std">${letras('SAVE')} ${letras('THE', 'fino')} ${letras('DATE')}</h2>
        <p class="cv-sub">Confraternização do <b>Time de Logística</b></p>
        <div class="cv-data"><span class="d">05/12</span><div class="lado"><b>Sábado</b><span>dezembro · 2026</span></div></div>
        <ul class="cv-info"><li><i>🔥</i>Churrasco</li><li><i>🕥</i>A partir das 10h30</li><li><i>📍</i>UPF <em>• Associação de Funcionários</em></li></ul>
      </div>
      <div class="cv-cont"><small>Contagem para o churrasco</small><div class="caixas">${caixas('cvc')}</div></div>
      <div class="cv-menu">
        <div class="mn"><i class="barra"></i><span class="ic">🍖</span><small>No cardápio</small><h4>Buffet de Churrasco</h4><p>Carne na brasa à vontade</p></div>
        <div class="mn chopp"><i class="barra"></i><span class="ic">🍺</span><small>Pra brindar</small><h4>Chopp</h4><p>Gelado do jeito certo</p></div>
        <div class="mn"><i class="barra"></i><span class="ic">🥤</span><small>Bebidas</small><h4>Água e Coca</h4><p>Bem geladas pra todo mundo</p></div>
        <div class="mn pula"><i class="barra"></i><span class="selo">A CONFIRMAR</span><span class="ic">🤸</span><small>Diversão</small><h4>Pula-pula</h4><p>Para crianças até <b style="color:#fff">34 anos</b> 😜</p></div>
      </div></div>`;
    const fx = $('.fx', sec);
    fx.innerHTML = [...Array(18)].map(() => '<i class="brasa"></i>').join('') + [...Array(5)].map(() => '<i class="fumaca"></i>').join('') +
      [...Array(34)].map((_, i) => `<i class="confete" style="background:${['#0EB194', '#55C94F', '#F2B705', '#ffffff', '#3D8BB0', '#ff7a3d'][i % 6]};left:${rnd(0, 1386)}px"></i>`).join('');

    // entrada
    const tl = gsap.timeline({ delay: 1.05 });
    tl.from('.cv-foto', { scale: 1.25, opacity: 0, duration: 1.4, ease: 'power3.out' }, 0)
      .from('.cv-tag', { y: -30, opacity: 0, duration: .5, ease: 'back.out(2)' }, .1)
      .from('.std .ch', { y: 90, rotationX: -90, opacity: 0, duration: .7, stagger: .045, ease: 'back.out(1.8)' }, .2)
      .from('.cv-sub', { x: -60, opacity: 0, duration: .6, ease: 'power3.out' }, .7)
      .from('.cv-data .d', { scale: .2, rotation: -12, opacity: 0, duration: 1, ease: 'elastic.out(1,.55)' }, .9)
      .from('.cv-data .lado > *', { x: -30, opacity: 0, stagger: .1, duration: .5 }, 1.2)
      .from('.cv-info li', { x: -80, opacity: 0, stagger: .12, duration: .6, ease: 'back.out(1.6)' }, 1.3)
      .from('.cv-cont', { y: 50, opacity: 0, scale: .8, duration: .7, ease: 'back.out(1.8)' }, 1.5)
      .from('.mn', { y: 160, opacity: 0, rotation: () => rnd(-8, 8), stagger: .12, duration: .8, ease: 'back.out(1.5)' }, 1.4)
      .from('#cvRota', { strokeDashoffset: 1500, strokeDasharray: 1500, duration: 1.4, ease: 'power2.inOut' }, 1.2);

    // movimento continuo
    gsap.to('.cv-foto img', { scale: 1.12, xPercent: -3, duration: 16, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.cv-brilho', { opacity: .45, scale: 1.1, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.cv-data .d', { backgroundPosition: '0% 0', duration: 2.6, repeat: -1, repeatDelay: 1.6, ease: 'power2.inOut', delay: 2.4 });
    gsap.to('.cv-tag i', { boxShadow: '0 0 0 12px rgba(85,201,79,0)', duration: 1.4, repeat: -1, ease: 'power1.out' });
    gsap.to('.cv-info li i', { rotation: 8, scale: 1.08, duration: .5, yoyo: true, repeat: -1, stagger: .3, ease: 'sine.inOut' });
    $$('.brasa', sec).forEach(b => gsap.fromTo(b, { x: rnd(680, 1320), y: rnd(420, 600), opacity: 0, scale: rnd(.5, 1.3) },
      { y: '-=' + rnd(180, 360), x: '+=' + rnd(-60, 60), opacity: 1, duration: rnd(2.4, 4.4), repeat: -1, delay: rnd(0, 3), ease: 'power1.out', keyframes: { opacity: [0, 1, 1, 0] } }));
    $$('.fumaca', sec).forEach(f => gsap.fromTo(f, { x: rnd(820, 1180), y: 330, scale: .4, opacity: 0 }, { y: 80, x: '+=' + rnd(-40, 40), scale: 2.2, duration: rnd(5, 7), repeat: -1, delay: rnd(0, 5), ease: 'sine.out', keyframes: { opacity: [0, .9, .5, 0] } }));
    $$('.confete', sec).forEach(c => gsap.fromTo(c, { y: -40, rotation: rnd(0, 360), opacity: 1 }, { y: 920, x: '+=' + rnd(-120, 120), rotation: '+=' + rnd(360, 900), rotationX: rnd(180, 720), duration: rnd(5, 10), repeat: -1, delay: rnd(.8, 6), ease: 'none' }));
    // caminhao percorrendo a linha
    const rota = $('#cvRota'), cam = $('#cvCam'), L = rota.getTotalLength(), o = { t: 0 };
    gsap.to(o, { t: 1, duration: 11, repeat: -1, ease: 'none', delay: 2, onUpdate() { const p = rota.getPointAtLength(o.t * L), q = rota.getPointAtLength(Math.min(L, o.t * L + 2)); cam.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI).toFixed(1)})`); } });
    gsap.set(cam, { attr: { transform: 'translate(-200,622)' } });
    // cardapio vivo
    const [buffet, chopp, beb, pula] = $$('.mn .ic', sec);
    gsap.to(buffet, { rotation: 10, duration: .35, yoyo: true, repeat: -1, repeatDelay: 1.2, ease: 'sine.inOut', transformOrigin: '50% 80%' });
    gsap.to(chopp, { rotation: -22, duration: .5, yoyo: true, repeat: -1, repeatDelay: 1.8, ease: 'back.inOut(2)', transformOrigin: '30% 90%' });
    gsap.to(beb, { y: -10, duration: .9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.timeline({ repeat: -1, delay: 2.6 }).to(pula, { y: -46, rotation: 360, duration: .55, ease: 'power2.out' }).to(pula, { y: 0, duration: .4, ease: 'bounce.out' }).set(pula, { rotation: 0 })
      .to(pula, { scaleY: .8, scaleX: 1.15, duration: .1, yoyo: true, repeat: 1, transformOrigin: '50% 100%' });
    gsap.to('.mn .selo', { scale: 1.1, duration: .6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const ch = $('.mn.chopp', sec); for (let i = 0; i < 9; i++) { const b = document.createElement('i'); b.className = 'bolha'; b.style.left = rnd(20, 320) + 'px'; ch.appendChild(b); gsap.fromTo(b, { y: 0, opacity: .9, scale: rnd(.6, 1.4) }, { y: -210, x: '+=' + rnd(-14, 14), opacity: 0, duration: rnd(2.4, 4), repeat: -1, delay: rnd(0, 3), ease: 'none' }); }
    gsap.to('.mn', { y: -6, duration: 1.6, yoyo: true, repeat: -1, stagger: { each: .35, from: 'start' }, ease: 'sine.inOut', delay: 4.4 });

    contar('cvc', EVENTO); this.timers.push(setInterval(() => contar('cvc', EVENTO), 1000));
  }, () => ({ texto: 'Anota aí, **Pia do Vô**: dia **05/12** tem churrasco, chopp e até pula-pula pra criança de 34 anos!', tom: 'festa' }));

  /* ------------------------------------------------------------ 2. comunicado */
  TELAS.comunicado = base('comunicado', 'Chamado oficial', function (sec) {
    const fita = [...Array(8)].map(() => '<span>⚠ ATENÇÃO · CHAMADO OFICIAL</span>').join('');
    sec.innerHTML = `<div class="cm">
      <div class="fita f1"><div class="txt">${fita}${fita}</div></div>
      <div class="cm-topo">
        <div class="mega"><svg viewBox="0 0 132 112"><g class="ondas" stroke="#F2B705" stroke-width="6" fill="none" stroke-linecap="round"><path d="M104 34q12 22 0 44"/><path d="M116 22q20 34 0 68"/><path d="M128 10q28 46 0 92"/></g>
          <g class="corneta"><path d="M10 44h18l52-28v80L28 68H10z" fill="#F2B705"/><path d="M80 16q10 40 0 80" stroke="#c99300" stroke-width="6" fill="none"/><rect x="2" y="44" width="14" height="24" rx="4" fill="#E5484D"/><path d="M30 68l10 30h14l-8-26z" fill="#c99300"/></g></svg></div>
        <div><h2>${letras('ALÔ, GALERA!')}</h2><p>ATENÇÃO AO CHAMADO OFICIAL! 🍻😂</p></div>
      </div>
      <div class="cm-grade">
        <div class="bl"><span class="em">🤣</span><div>Passando para lembrar que <mark>nome na lista não é enfeite!</mark></div></div>
        <div class="bl"><span class="em">✅</span><div>Quem já confirmou presença precisa dar aquele <b>OK definitivo</b> até <mark>quinta-feira, dia 19/11!</mark></div></div>
        <div class="bl"><span class="em">🍖</span><div>Estamos fechando os detalhes com o <b>buffet</b> e organizando tudo para o <mark>grande dia!</mark></div></div>
        <div class="bl alerta"><span class="em">⚠️</span><div>A partir de <b>sexta-feira, dia 20/11</b>, todos os nomes que estiverem na lista serão considerados <mark>CONFIRMADOS!</mark></div></div>
        <div class="bl fuga"><span class="em">😂</span><div>Então, se você colocou o nome na emoção e agora está pensando em fugir, essa é sua <mark class="am">última chance de escapar!</mark></div><span class="corredor">🏃💨</span></div>
        <div class="bl citacao" style="padding-right:190px"><span class="em">🤡</span><div>Depois não vale aparecer com aquele clássico: <i>“Mas eu achei que era só uma lista de interessados...”</i> 🤣</div><span class="carimbo verm">NÃO VALE!</span></div>
      </div>
      <div class="cm-cta"><span>🎉</span>Bora confirmar, pessoal! O buffet precisa saber quantas bocas vai alimentar! <span>🍖🍻</span></div></div>`;

    const tl = gsap.timeline({ delay: 1.05 });
    tl.from('.fita', { xPercent: -100, duration: .8, ease: 'power3.out' }, 0)
      .from('.mega', { scale: 0, rotation: -40, duration: .8, ease: 'back.out(2.2)' }, .2)
      .from('.cm-topo h2 .ch', { y: -120, opacity: 0, duration: .8, stagger: .05, ease: 'bounce.out' }, .3)
      .from('.cm-topo p', { scale: 1.6, opacity: 0, duration: .5, ease: 'back.out(2)' }, 1)
      .from('.bl', { x: (i) => i < 3 ? -260 : 260, opacity: 0, rotation: (i) => i < 3 ? -4 : 4, duration: .7, stagger: .16, ease: 'back.out(1.4)' }, 1.1)
      .from('.bl .em', { scale: 0, rotation: -180, duration: .6, stagger: .16, ease: 'back.out(2.5)' }, 1.3)
      .from('.cm-cta', { y: 120, opacity: 0, duration: .7, ease: 'back.out(1.6)' }, 2)
      .from('.carimbo', { scale: 3.2, opacity: 0, rotation: -40, duration: .45, ease: 'power4.in' }, 2.8)
      .to('.bl.citacao', { x: 6, duration: .05, yoyo: true, repeat: 5 }, 3.25);

    const faixaTxt = $('.fita .txt', sec); gsap.to(faixaTxt, { x: () => -faixaTxt.scrollWidth / 2, duration: 22, repeat: -1, ease: 'none' });
    gsap.to('.mega .corneta', { rotation: -6, duration: .14, yoyo: true, repeat: -1, repeatDelay: .05, transformOrigin: '20% 50%' });
    $$('.mega .ondas path', sec).forEach((p, i) => gsap.fromTo(p, { opacity: 0, x: -10 }, { opacity: 1, x: 8, duration: .7, repeat: -1, delay: i * .22, ease: 'power1.out', keyframes: { opacity: [0, 1, 0] } }));
    gsap.to('.cm-topo h2 .ch', { y: -10, duration: .35, yoyo: true, repeat: -1, repeatDelay: 2.6, stagger: .05, ease: 'sine.inOut', delay: 3.5 });
    gsap.to('.bl .em', { scale: 1.15, rotation: 8, duration: .45, yoyo: true, repeat: -1, stagger: { each: .4, repeat: -1, yoyo: true }, ease: 'sine.inOut', delay: 4.6 });
    gsap.to('.bl.alerta', { boxShadow: 'inset 0 0 0 2px #F2B705, 0 0 34px rgba(242,183,5,.55)', duration: .8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.bl.alerta mark', { scale: 1.08, duration: .5, yoyo: true, repeat: -1, ease: 'sine.inOut', display: 'inline-block' });
    const fuga = $('.bl.fuga', sec), runner = $('.corredor', sec);
    gsap.fromTo(runner, { x: () => fuga.offsetWidth + 20 }, { x: -140, duration: 3.2, repeat: -1, repeatDelay: 1.5, ease: 'none', delay: 2.5 });
    gsap.to(runner, { y: -8, duration: .16, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.carimbo', { scale: 1.12, duration: .4, yoyo: true, repeat: -1, repeatDelay: 2, ease: 'power2.inOut', delay: 6 });
    gsap.to('.cm-cta', { scale: 1.025, duration: .7, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 });
    gsap.to('.cm-cta span', { rotation: 18, scale: 1.25, duration: .4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }, () => ({ texto: 'Nome na lista **não é enfeite**, **Cuiudo**! OK definitivo até quinta, **19/11**.', tom: 'alerta' }));

  /* ------------------------------------------------------------ 3. cobranca */
  TELAS.cobranca = base('cobranca', 'Faltam confirmar', function (sec) {
    sec.innerHTML = `<div class="cb">
      <div class="cb-topo"><div><small>Confraternização do Time de Logística · 05/12</small><h2>👀 Cadê o nome de vocês?</h2><p>Ainda faltam confirmar <b style="color:#fff">nome e participação</b> na confraternização.</p></div>
        <div class="prazo"><small class="rot">Prazo · sexta-feira, 20/11</small><div class="caixas">${caixas('cbc')}</div></div></div>
      <div class="cartazes">${TURMA.map((p, i) => `<div class="cartaz"><h5>PROCURA-SE</h5><div class="linha"></div>
        <div class="foto">${FestaAvatar.svg(p.id, i * 1.1)}</div><span class="carimbo">CONFIRMA AÍ!</span>
        <h3>${esc(p.nome)}</h3><div class="visto">Visto pela última vez</div><div class="frase">${esc(p.visto)}</div>
        <div class="recomp">Recompensa<b>${esc(p.premio)}</b></div></div>`).join('')}</div>
      ${[...Array(6)].map(() => '<span class="interroga">?</span>').join('')}<span class="lupa">🔍</span>
      <div class="cb-rodape"><span>⏰</span>Vocês têm até sexta-feira, 20/11, para confirmar nome e participação! <span>✅</span></div></div>`;

    const cartazes = $$('.cartaz', sec), ang = [-3, 2, -2, 3];
    const tl = gsap.timeline({ delay: 1.05 });
    tl.from('.cb-topo > div:first-child > *', { y: -40, opacity: 0, stagger: .12, duration: .6, ease: 'back.out(1.8)' }, 0)
      .from('.prazo', { scale: 0, rotation: 20, duration: .7, ease: 'back.out(2)' }, .3)
      .fromTo(cartazes, { y: -700, rotation: (i) => ang[i] * 6 }, { y: 0, rotation: (i) => ang[i], duration: 1.1, stagger: .18, ease: 'bounce.out' }, .4)
      .from('.cartaz .foto', { scale: 0, duration: .6, stagger: .18, ease: 'back.out(2.4)' }, 1.3)
      .from('.cartaz .carimbo', { scale: 3.4, opacity: 0, rotation: -50, duration: .38, stagger: .5, ease: 'power4.in' }, 2.4)
      .from('.cb-rodape', { y: 120, opacity: 0, duration: .7, ease: 'back.out(1.6)' }, 2.2);
    cartazes.forEach((c, i) => tl.to(c, { x: 5, duration: .05, yoyo: true, repeat: 3 }, 2.78 + i * .5));

    cartazes.forEach((c, i) => gsap.to(c, { rotation: -ang[i] * .8, duration: rnd(2.4, 3.2), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3.6 + i * .2 }));
    gsap.to('.cartaz .foto svg', { y: -8, duration: 1.1, yoyo: true, repeat: -1, stagger: .25, ease: 'sine.inOut' });
    gsap.timeline({ repeat: -1, repeatDelay: 5, delay: 8 }).to('.cartaz .carimbo', { scale: 1.35, duration: .18, stagger: .25, yoyo: true, repeat: 1, ease: 'power2.out' });
    // interrogacoes flutuando em volta dos cartazes
    $$('.interroga', sec).forEach((q, i) => gsap.fromTo(q, { x: 120 + (i % 4) * 320 + rnd(-30, 60), y: 520, opacity: 0, scale: .5 }, { y: 230, x: '+=' + rnd(-40, 40), rotation: rnd(-30, 30), scale: 1.2, duration: rnd(2.8, 4), repeat: -1, delay: rnd(2, 6), ease: 'sine.out', keyframes: { opacity: [0, 1, 1, 0] } }));
    // lupa procurando um por um
    const lupa = $('.lupa', sec), pts = cartazes.map(c => ({ x: c.offsetLeft + 44 + c.offsetWidth / 2 - 30, y: 200 + c.offsetTop + 110 }));
    gsap.set(lupa, { x: -160, y: 380 });
    const lt = gsap.timeline({ repeat: -1, delay: 3.4 });
    pts.forEach(p => lt.to(lupa, { x: p.x, y: p.y, rotation: rnd(-15, 15), duration: 1, ease: 'power2.inOut' }).to(lupa, { scale: 1.25, duration: .25, yoyo: true, repeat: 3, ease: 'sine.inOut' }));
    lt.to(lupa, { x: 1500, y: 300, duration: 1.1, ease: 'power2.in' });
    gsap.to('.prazo', { boxShadow: 'inset 0 0 0 2px #E5484D, 0 0 30px rgba(229,72,77,.55)', duration: .7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.cb-rodape span', { rotation: -16, scale: 1.25, duration: .35, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    const fim = () => { const pz = $('.prazo', sec); if (pz && !pz.dataset.fim) { pz.dataset.fim = 1; $('.caixas', pz).outerHTML = '<div class="fim">PRAZO ENCERRADO</div>'; $$('.cartaz .carimbo', sec).forEach(c => { c.textContent = 'CONFIRMADO!'; }); } };
    contar('cbc', PRAZO, fim); this.timers.push(setInterval(() => contar('cbc', PRAZO, fim), 1000));
  }, () => (Date.now() < PRAZO
    ? { texto: '**Jerrard**, **Márcio**, **Bianca** e **Gustavo**: tô de olho! Confirmem até sexta, **20/11**.', tom: 'alerta' }
    : { texto: 'Prazo encerrado, **Pia do Vô**: nome na lista agora é **CONFIRMADO**!', tom: 'festa' }));

  /* ------------------------------------------------------------ encaixa as telas na programacao */
  const tela = $('#tela'); for (const id of ['convite', 'comunicado', 'cobranca']) { const s = document.createElement('section'); s.className = 'painel festa'; s.id = 't-' + id; tela.appendChild(s); }
  (function ligar() {
    if (!E.cfg) return setTimeout(ligar, 30);
    const o = E.cfg.telas.ordem; if (o.includes('convite')) return;
    const depois = (alvo, id) => { const i = o.indexOf(alvo); o.splice(i >= 0 ? i + 1 : o.length, 0, id); };
    o.unshift('convite'); depois('clima', 'comunicado'); depois('comparativo', 'cobranca');
    E.cfg.recados = [...(E.cfg.recados || []), ...RECADOS];
  })();
  // na segunda de manha recarrega a pagina e as telas da festa somem
  setInterval(() => { if (!ativo()) location.reload(); }, 60e3);
})();
