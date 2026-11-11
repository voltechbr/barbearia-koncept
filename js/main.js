/* KoncepT Barbearia — Parte 1 */
(() => {
  'use strict';
  const doc = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('menu');
  const video = document.getElementById('hero-video');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Cabeçalho: transparente no topo, fundo escuro ao rolar */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu mobile */
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); toggle.focus(); } });
  window.matchMedia('(min-width: 921px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* Link ativo conforme a seção atual (a última cuja borda superior já passou de 40% da altura da tela) */
  const links = [...document.querySelectorAll('[data-nav]')];
  const linkById = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const spySections = ['inicio', 'sobre', 'servicos', 'comodidades', 'galeria', 'profissionais', 'localizacao', 'agendar']
    .map((id) => document.getElementById(id)).filter(Boolean);
  const spyAlias = { comodidades: 'servicos', agendar: null };   // faixa de comodidades pertence a Serviços; agendamento não tem link
  let spyCurrent;
  const updateSpy = () => {
    const line = window.innerHeight * 0.4;
    let id = spySections[0].id;
    spySections.forEach((s) => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) id = 'agendar';   // fim da página
    const key = id in spyAlias ? spyAlias[id] : id;
    if (key === spyCurrent) return;
    spyCurrent = key;
    links.forEach((l) => {
      const on = l === linkById.get(key);
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  };

  /* Atalhos flutuantes: voltar ao topo (após rolar) e barra de agendamento (celular, depois do hero) */
  const dock = document.getElementById('dock');
  const toTop = document.getElementById('to-top');
  const dockBook = document.getElementById('dock-book');
  const heroEl = document.getElementById('inicio');
  const agendaEl = document.getElementById('agendar');
  const svcListEl = document.querySelector('.svc-list');
  const updateDock = () => {
    const vh = window.innerHeight;
    if (dock) dock.classList.toggle('is-top', window.scrollY > Math.min(vh * 0.5, 360));
    if (dockBook && heroEl && agendaEl) {
      const afterHero = heroEl.getBoundingClientRect().bottom < vh * 0.3;
      const atAgenda = agendaEl.getBoundingClientRect().top < vh * 0.85;   // a seção de agendamento já tem o próprio botão
      let atList = false;                                                  // na lista de serviços cada linha já tem "Reservar"
      if (svcListEl) { const r = svcListEl.getBoundingClientRect(); atList = r.top < vh * 0.5 && r.bottom > vh * 0.5; }
      dockBook.classList.toggle('is-on', afterHero && !atAgenda && !atList);
    }
  };
  if (toTop) toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    const brand = document.querySelector('.brand');
    if (brand) brand.focus({ preventScroll: true });
  });
  let frameQueued = false;
  const onFrame = () => { frameQueued = false; updateSpy(); updateDock(); };
  const queueFrame = () => { if (!frameQueued) { frameQueued = true; requestAnimationFrame(onFrame); } };
  window.addEventListener('scroll', queueFrame, { passive: true });
  window.addEventListener('resize', queueFrame);
  queueFrame();

  /* Revelar ao rolar */
  const reveals = document.querySelectorAll('.reveal, .reveal-clip, [data-split]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); } });
    }, { threshold: 0.15 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* Vídeo do hero: pausa fora da tela e respeita "reduzir movimento" */
  if (video) {
    let heroGo = false;                                             // o vídeo só começa quando a tela de carregamento abre
    const play = () => { if (!heroGo) return; const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    const applyMotion = () => (reduceMotion.matches ? video.pause() : play());
    window.__heroStart = () => { heroGo = true; try { video.currentTime = 0; } catch (e) {} applyMotion(); };
    reduceMotion.addEventListener('change', applyMotion);
    new IntersectionObserver(([en]) => {
      if (reduceMotion.matches) return;
      en.isIntersecting ? play() : video.pause();
    }, { threshold: 0.05 }).observe(video);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduceMotion.matches) play(); });
  }

  /* ---------- Citação: palavra por palavra ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('i'); i.textContent = t; i.style.setProperty('--i', n++);
            w.appendChild(i); frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(el);
  });

  /* ---------- Parallax suave (fotos dentro do quadro e detalhes) ---------- */
  const px = [...document.querySelectorAll('[data-parallax]')];
  if (px.length && !reduceMotion.matches) {
    const visible = new Set();
    const vis = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { rootMargin: '15% 0px' });
    px.forEach((el) => vis.observe(el));
    let queued = false;
    const update = () => {
      queued = false;
      const vh = window.innerHeight;
      visible.forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = (r.top + r.height / 2 - vh / 2) / vh;            // -1 .. 1
        const kind = el.dataset.parallax;
        if (kind === 'img') el.style.setProperty('--py', (d * -26).toFixed(1) + 'px');
        else if (kind === 'x') el.style.transform = `translate3d(${(d * -90).toFixed(0)}px, 0, 0)`;
        else el.style.transform = `translate3d(0, ${(d * -50).toFixed(0)}px, 0)`;
      });
    };
    const req = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    req();
  }

  /* ---------- Serviços: luz quente que acompanha o mouse ---------- */
  const svc = document.querySelector('.svc-list');
  if (svc && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    svc.addEventListener('pointermove', (e) => {
      const r = svc.getBoundingClientRect();
      svc.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      svc.style.setProperty('--my', (e.clientY - r.top) + 'px');
      svc.classList.add('is-lit');
    }, { passive: true });
    svc.addEventListener('pointerleave', () => svc.classList.remove('is-lit'));
  }

  /* ---------- Serviços: categorias clicáveis (acordeão, uma aberta por vez) ---------- */
  const cats = [...document.querySelectorAll('[data-svc-cat]')];
  if (cats.length) {
    const setCat = (cat, open) => {
      cat.classList.toggle('is-open', open);
      cat.querySelector('.svc-cat-btn').setAttribute('aria-expanded', String(open));
    };
    cats.forEach((cat) => {
      const btn = cat.querySelector('.svc-cat-btn');
      btn.addEventListener('click', () => {
        const open = !cat.classList.contains('is-open');
        doc.style.overflowAnchor = 'none';                 // o navegador não "puxa" a rolagem enquanto o painel anima
        setTimeout(() => { doc.style.overflowAnchor = ''; }, 700);
        cats.forEach((c) => { if (c !== cat) setCat(c, false); });
        setCat(cat, open);
        if (open) setTimeout(() => {                       // se o título ficou escondido atrás do cabeçalho, traz de volta
          const top = btn.getBoundingClientRect().top;
          if (top < header.offsetHeight + 8) window.scrollTo({ top: window.scrollY + top - header.offsetHeight - 16, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }, 520);
      });
    });
  }

  /* ---------- Galeria: lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const tiles = [...document.querySelectorAll('.g-tile')];
  if (lb && tiles.length) {
    const img = lb.querySelector('.lb-img');
    const count = lb.querySelector('.lb-count');
    const btnClose = lb.querySelector('.lb-close');
    const btnPrev = lb.querySelector('.lb-prev');
    const btnNext = lb.querySelector('.lb-next');
    const data = tiles.map((t) => { const i = t.querySelector('img'); return { src: i.currentSrc || i.src, alt: i.alt, thumb: i }; });
    let idx = 0, lastFocus = null, busy = false, isOpen = false;
    const pad = (n) => String(n).padStart(2, '0');
    const setCount = () => { count.textContent = `${pad(idx + 1)} / ${pad(data.length)}`; };
    const lift = (on) => tiles.forEach((t, k) => t.classList.toggle('is-lifted', on && k === idx));
    const preload = (k) => { const d = data[(k + data.length) % data.length]; const p = new Image(); p.src = d.src; };
    const flipFrom = (thumb) => {                       // anima da miniatura até o tamanho final
      const to = img.getBoundingClientRect(), from = thumb.getBoundingClientRect();
      if (!to.width || !from.width) return;
      img.style.transition = 'none';
      img.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
      img.getBoundingClientRect();
      img.style.transition = 'transform .7s cubic-bezier(.22,.8,.24,1), opacity .4s';
      img.style.transform = '';
    };

    const open = (i) => {
      idx = i; lastFocus = document.activeElement; isOpen = true;
      img.classList.remove('is-swap'); img.style.opacity = 0;
      img.alt = data[idx].alt; img.src = data[idx].src;
      lb.hidden = false; document.body.classList.add('lb-open'); setCount();
      requestAnimationFrame(() => lb.classList.add('is-open'));
      const go = () => { lift(true); img.style.opacity = 1; flipFrom(data[idx].thumb); btnClose.focus({ preventScroll: true }); };
      (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(go);
      preload(idx + 1); preload(idx - 1);
    };

    const close = () => {
      if (!isOpen || busy) return; busy = true; isOpen = false;
      const thumb = data[idx].thumb, r = thumb.getBoundingClientRect(), to = img.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      lb.classList.remove('is-open');
      img.style.transition = 'transform .6s cubic-bezier(.22,.8,.24,1), opacity .45s';
      if (onScreen && to.width) img.style.transform = `translate(${r.left - to.left}px, ${r.top - to.top}px) scale(${r.width / to.width})`;
      else img.style.opacity = 0;
      setTimeout(() => {
        lb.hidden = true; document.body.classList.remove('lb-open'); lift(false);
        img.style.transform = ''; img.style.transition = ''; img.style.opacity = '';
        busy = false; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      }, 620);
    };

    const go = (dir) => {
      if (!isOpen || busy) return; busy = true;
      idx = (idx + dir + data.length) % data.length;
      img.style.transition = 'opacity .25s, transform .25s'; img.classList.add('is-swap'); img.style.transform = `translateX(${dir * -28}px)`;
      setTimeout(() => {
        lift(false); img.alt = data[idx].alt; img.src = data[idx].src; setCount();
        (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => {
          img.style.transition = 'none'; img.style.transform = `translateX(${dir * 28}px)`; img.getBoundingClientRect();
          img.style.transition = 'opacity .4s, transform .5s cubic-bezier(.22,.8,.24,1)'; img.classList.remove('is-swap'); img.style.transform = '';
          busy = false; preload(idx + dir);
        });
      }, 260);
    };

    tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
    lb.addEventListener('click', (e) => { if (e.target.closest('[data-lb-close]') && e.target === e.target.closest('[data-lb-close]')) close(); });
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => go(-1));
    btnNext.addEventListener('click', () => go(1));
    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Tab') {                       // mantém o foco dentro do lightbox
        const f = [btnClose, btnPrev, btnNext], k = f.indexOf(document.activeElement);
        e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    let sx = 0, sy = 0;                                  // deslizar no celular
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
    lb.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse') return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
    });
  }

  /* ---------- Tela de carregamento: 0% → 100% em ~1 s, guiada pelo relógio (não espera arquivos) ---------- */
  const root = document.documentElement;
  const pre = document.getElementById('preloader');
  const num = document.getElementById('pre-num');
  const barEl = document.getElementById('pre-bar');
  const DURATION = 1000;                                  // tempo até 100%
  const HOLD = 60;                                        // 100% visível por um instante, sem atrasar o Hero
  let finished = false;

  const finish = () => {
    if (finished) return; finished = true;
    root.classList.remove('is-loading');
    root.classList.add('is-ready');                       // libera a animação de entrada do Hero
    if (window.__heroStart) window.__heroStart();         // e o vídeo, do primeiro quadro
    if (!pre) return;
    pre.classList.add('is-done');                         // cortina sobe revelando o Hero
    setTimeout(() => pre.remove(), 600);
  };

  if (pre && num && barEl) {
    const ease = (t) => 1 - Math.pow(1 - t, 1.8);          // arranque rápido, chegada suave
    let t0 = 0, last = -1;
    const frame = (now) => {
      if (finished) return;
      if (!t0) t0 = now;
      const t = Math.min(1, (now - t0) / DURATION);
      const p = ease(t);
      const pct = Math.round(p * 100);
      barEl.style.setProperty('--p', p.toFixed(4));
      if (pct !== last) { last = pct; num.textContent = pct; barEl.setAttribute('aria-valuenow', pct); }
      if (t < 1) requestAnimationFrame(frame); else setTimeout(finish, HOLD);
    };
    requestAnimationFrame(frame);
    setTimeout(finish, DURATION + 1200);                  // rede de segurança (aba em segundo plano): nunca prende o visitante
  } else finish();

  /* ---------- Cursor de tesoura (somente mouse) ---------- */
  const cur = document.getElementById('cursor');
  if (cur && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.classList.add('has-cursor');
    let tx = -100, ty = -100, x = -100, y = -100, raf = 0;
    const CLICKABLE = 'a, button, [role="button"], summary, label, input, select, textarea, [data-cursor]';
    const loop = () => {
      x += (tx - x) * 0.38; y += (ty - y) * 0.38;   // seguimento fluido, quase imediato
      cur.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') { cur.classList.remove('is-visible'); return; }
      if (!cur.classList.contains('is-visible')) { x = tx = e.clientX; y = ty = e.clientY; cur.classList.add('is-visible'); }
      tx = e.clientX; ty = e.clientY; kick();
      cur.classList.toggle('is-hover', !!(e.target.closest && e.target.closest(CLICKABLE)));
    }, { passive: true });
    window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') cur.classList.add('is-down'); });
    window.addEventListener('pointerup', () => cur.classList.remove('is-down'));
    window.addEventListener('blur', () => cur.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => cur.classList.remove('is-visible'));
    document.addEventListener('mouseenter', () => cur.classList.add('is-visible'));
  }

  const y = document.getElementById('ano');
  if (y) y.textContent = new Date().getFullYear();
})();

/* KoncepT Barbearia — Parte 6: equipe (entrada dos espelhos ao rolar) */
(() => {
  'use strict';
  const lists = document.querySelectorAll('[data-team]');
  if (!lists.length) return;
  if (!('IntersectionObserver' in window)) { lists.forEach((l) => l.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); } });
  }, { threshold: 0.18 });
  lists.forEach((l) => io.observe(l));
})();

/* KoncepT Barbearia — Parte 7: mapa no celular (toque para ativar, evita prender a rolagem) */
(() => {
  'use strict';
  const frame = document.querySelector('.map-frame');
  if (!frame) return;
  const shield = frame.querySelector('.map-shield');
  if (shield) shield.addEventListener('click', () => frame.classList.add('is-active'));
  document.addEventListener('pointerdown', (e) => { if (!frame.contains(e.target)) frame.classList.remove('is-active'); }, { passive: true });
})();

/* KoncepT Barbearia — Parte 8: acabamento (desempenho e detalhes de interação) */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const lowData = !!conn.saveData;

  /* Movimento reduzido ou economia de dados: não baixa o vídeo, mantém só o pôster */
  const video = document.getElementById('hero-video');
  if (video && (reduce || lowData)) {
    video.pause();
    video.removeAttribute('autoplay');
    video.querySelectorAll('source').forEach((s) => s.remove());
    video.preload = 'none';
    video.load();                                   // cancela o download; o pôster continua visível
    video.dispatchEvent(new Event('canplay'));      // libera a tela de carregamento sem esperar o vídeo
  }

  /* Animações contínuas (anéis, brilho do botão) pausam quando a seção sai da tela */
  if ('IntersectionObserver' in window && !reduce) {
    const secs = document.querySelectorAll('.sobre, .equipe, .local, .agenda, .hero');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('is-off', !en.isIntersecting));
    }, { rootMargin: '200px 0px' });
    secs.forEach((s) => io.observe(s));
  }

  /* Cursor de tesoura: dentro do mapa (iframe) o cursor nativo assume, para não ficar "preso" na borda */
  const cur = document.getElementById('cursor');
  const map = document.querySelector('.map-frame');
  if (cur && map) map.addEventListener('mouseenter', () => cur.classList.remove('is-visible'));
})();
