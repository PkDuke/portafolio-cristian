/**
 * Cristian Villota Vega — Portafolio
 * Sin dependencias: idioma ES/EN, tema, menú, lightbox, copiar correo
 * y un boceto de planta 3D que solo dibuja cuando algo cambia.
 */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
  };

  /* ---------- 1. Idioma ---------- */
  const EN = window.I18N_EN || {};
  const ES = {}; // se llena con el HTML original la primera vez
  const META_ES = { title: document.title, desc: $('meta[name="description"]').content };
  let lang = 'es';

  function applyLang(next, { persist = false } = {}) {
    lang = next === 'en' ? 'en' : 'es';
    $$('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!(key in ES)) ES[key] = el.innerHTML;
      const value = lang === 'en' ? EN[key] : ES[key];
      if (value != null) el.innerHTML = value;
    });
    $$('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':');
        const id = `@${attr}:${key}`;
        if (!(id in ES)) ES[id] = el.getAttribute(attr);
        const value = lang === 'en' ? EN[key] : ES[id];
        if (value != null) el.setAttribute(attr, value);
      });
    });
    root.lang = lang === 'en' ? 'en' : 'es-CO';
    document.title = lang === 'en' ? EN['meta.title'] : META_ES.title;
    $('meta[name="description"]').content = lang === 'en' ? EN['meta.desc'] : META_ES.desc;
    $$('.lang-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    root.removeAttribute('data-i18n-pending');

    if (persist) {
      store.set('lang', lang);
      const url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
  }

  applyLang(root.lang.startsWith('en') ? 'en' : 'es');
  $$('.lang-switch button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang, { persist: true })));

  /* ---------- 2. Tema ---------- */
  const redrawHooks = [];
  $('#themeBtn').addEventListener('click', () => {
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    const swap = () => { root.dataset.theme = next; store.set('theme', next); redrawHooks.forEach(fn => fn()); };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(swap);
    else swap();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => redrawHooks.forEach(fn => fn()));

  /* ---------- 3. Menú móvil ---------- */
  const menuBtn = $('#menuBtn');
  const navLinks = $('#navLinks');
  const setMenu = open => {
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- 4. Copiar correo ---------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  $$('[data-copy-email]').forEach(btn => btn.addEventListener('click', async () => {
    const email = btn.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(email);
      showToast(lang === 'en' ? 'Email copied to clipboard' : 'Correo copiado al portapapeles');
    } catch {
      showToast(email);
    }
  }));

  /* ---------- 5. Lightbox (por galería, con teclado) ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbCount = $('#lbCount');
  let lbSet = [];
  let lbIndex = 0;

  function showShot(i) {
    lbIndex = (i + lbSet.length) % lbSet.length;
    const img = lbSet[lbIndex];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lbCount.textContent = `${lbIndex + 1} / ${lbSet.length}`;
  }
  $$('[data-gallery]').forEach(gallery => {
    const imgs = $$('img', gallery);
    $$('.shot', gallery).forEach((shot, i) => shot.addEventListener('click', () => {
      lbSet = imgs;
      showShot(i);
      lb.showModal();
    }));
  });
  lb.addEventListener('click', e => {
    const action = e.target.closest('[data-lb]')?.dataset.lb;
    if (action === 'prev') showShot(lbIndex - 1);
    else if (action === 'next') showShot(lbIndex + 1);
    else if (action === 'close' || e.target === lb) lb.close();
  });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
    if (e.key === 'ArrowRight') showShot(lbIndex + 1);
  });

  /* ---------- 6. Boceto de planta: render bajo demanda ---------- */
  initVenue();

  function initVenue() {
    const canvas = $('#venue');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const hud = $('#hud');
    const hudFps = $('#hudFps');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Escena en metros: salón de 24 × 16 m, 20 mesas redondas de 8 puestos y un escenario.
    const HALL = { w: 24, d: 16 };
    const tables = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) tables.push({ x: -9.6 + c * 3.5, z: -5.4 + r * 3.6 });
    const STAGE = { x0: 7.2, x1: 11, z0: -4.5, z1: 4.5, h: 0.8 };
    const ELEV = 0.6; // elevación de cámara en radianes
    const SIN_E = Math.sin(ELEV);
    const COS_E = Math.cos(ELEV);
    const TAU = Math.PI * 2;

    let w = 0, h = 0, dpr = 1, scale = 1;
    let yaw = reduced ? 0.62 : 0.15;
    let targetYaw = 0.62;
    let hover = -1;
    let pointer = null;
    let running = false;
    let frames = 0, fpsT0 = 0;
    let colors = {};

    function readColors() {
      const cs = getComputedStyle(root);
      colors = ['ink', 'muted', 'line', 'accent', 'accent-wash', 'surface'].reduce((o, k) => (o[k] = cs.getPropertyValue(`--${k}`).trim(), o), {});
    }

    let cosY = 1, sinY = 0;
    const px = (x, z) => w / 2 + (x * cosY - z * sinY) * scale;
    const py = (x, y, z) => h * 0.54 + ((x * sinY + z * cosY) * SIN_E - y * COS_E) * scale;

    function ring(cx, cz, y, radius, segments) {
      ctx.moveTo(px(cx + radius, cz), py(cx + radius, y, cz));
      for (let i = 1; i <= segments; i++) {
        const a = (i / segments) * TAU;
        const x = cx + Math.cos(a) * radius, z = cz + Math.sin(a) * radius;
        ctx.lineTo(px(x, z), py(x, y, z));
      }
    }
    function line(x0, y0, z0, x1, y1, z1) {
      ctx.moveTo(px(x0, z0), py(x0, y0, z0));
      ctx.lineTo(px(x1, z1), py(x1, y1, z1));
    }
    function quad(x0, z0, x1, z1, y) {
      ctx.moveTo(px(x0, z0), py(x0, y, z0));
      ctx.lineTo(px(x1, z0), py(x1, y, z0));
      ctx.lineTo(px(x1, z1), py(x1, y, z1));
      ctx.lineTo(px(x0, z1), py(x0, y, z1));
      ctx.closePath();
    }
    function dimension(x0, z0, x1, z1, label) {
      ctx.beginPath();
      line(x0, 0, z0, x1, 0, z1);
      const tx = x0 === x1 ? 0.35 : 0, tz = x0 === x1 ? 0 : 0.35;
      line(x0 - tx, 0, z0 - tz, x0 + tx, 0, z0 + tz);
      line(x1 - tx, 0, z1 - tz, x1 + tx, 0, z1 + tz);
      ctx.stroke();
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const lw = ctx.measureText(label).width + 10;
      ctx.fillStyle = colors.surface;
      ctx.fillRect(px(mx, mz) - lw / 2, py(mx, 0, mz) - 8, lw, 16);
      ctx.fillStyle = colors.accent;
      ctx.fillText(label, px(mx, mz), py(mx, 0, mz));
    }

    function draw() {
      cosY = Math.cos(yaw); sinY = Math.sin(yaw);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = 'round';
      const hw = HALL.w / 2, hd = HALL.d / 2;

      // Piso y retícula de 2 m
      ctx.beginPath(); quad(-hw, -hd, hw, hd, 0);
      ctx.fillStyle = colors.surface; ctx.fill();
      ctx.beginPath();
      for (let x = -hw + 2; x < hw; x += 2) line(x, 0, -hd, x, 0, hd);
      for (let z = -hd + 2; z < hd; z += 2) line(-hw, 0, z, hw, 0, z);
      ctx.strokeStyle = colors.line; ctx.lineWidth = 0.6; ctx.stroke();
      ctx.beginPath(); quad(-hw, -hd, hw, hd, 0);
      ctx.strokeStyle = colors.ink; ctx.lineWidth = 1.4; ctx.stroke();

      // Escenario (caja alámbrica)
      const s = STAGE;
      ctx.beginPath(); quad(s.x0, s.z0, s.x1, s.z1, s.h);
      ctx.fillStyle = colors['accent-wash']; ctx.fill();
      ctx.beginPath();
      quad(s.x0, s.z0, s.x1, s.z1, 0); quad(s.x0, s.z0, s.x1, s.z1, s.h);
      line(s.x0, 0, s.z0, s.x0, s.h, s.z0); line(s.x1, 0, s.z0, s.x1, s.h, s.z0);
      line(s.x1, 0, s.z1, s.x1, s.h, s.z1); line(s.x0, 0, s.z1, s.x0, s.h, s.z1);
      ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.2; ctx.stroke();

      // Mesas y sillas (la mesa bajo el cursor se resalta)
      if (pointer) {
        let best = 28 * 28; hover = -1;
        tables.forEach((tb, i) => {
          const dx = px(tb.x, tb.z) - pointer.x, dy = py(tb.x, 0.75, tb.z) - pointer.y;
          if (dx * dx + dy * dy < best) { best = dx * dx + dy * dy; hover = i; }
        });
      } else hover = -1;

      tables.forEach((tb, i) => {
        const on = i === hover;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU + 0.39;
          ring(tb.x + Math.cos(a) * 1.3, tb.z + Math.sin(a) * 1.3, 0.45, 0.24, 6);
        }
        ctx.strokeStyle = on ? colors.accent : colors.muted; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.beginPath(); ring(tb.x, tb.z, 0.75, 0.9, 22);
        ctx.fillStyle = on ? colors.accent : colors.surface; ctx.fill();
        ctx.strokeStyle = on ? colors.accent : colors.ink; ctx.lineWidth = 1.2; ctx.stroke();
      });

      // Cotas
      ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = colors.accent; ctx.lineWidth = 1;
      dimension(-hw, hd + 1.4, hw, hd + 1.4, '24.0 m');
      dimension(-hw - 1.4, -hd, -hw - 1.4, hd, '16.0 m');

      if (hover >= 0) {
        const tb = tables[hover];
        const label = `M-${String(hover + 1).padStart(2, '0')} · 8 pax`;
        const lx = px(tb.x, tb.z), ly = py(tb.x, 0.75, tb.z) - 0.9 * scale - 10;
        const lw = ctx.measureText(label).width + 14;
        ctx.fillStyle = colors.ink; ctx.beginPath(); ctx.roundRect(lx - lw / 2, ly - 10, lw, 20, 4); ctx.fill();
        ctx.fillStyle = colors.surface; ctx.fillText(label, lx, ly);
      }
    }

    function setActive(on) {
      hud.classList.toggle('is-active', on);
      if (!on) hudFps.textContent = '0';
    }

    let lastHover = -1;
    function frame(now) {
      yaw += (targetYaw - yaw) * 0.085;
      draw();
      frames++;
      if (now - fpsT0 >= 400) { hudFps.textContent = Math.round((frames * 1000) / (now - fpsT0)); frames = 0; fpsT0 = now; }
      const settled = Math.abs(targetYaw - yaw) < 0.0008 && hover === lastHover;
      lastHover = hover;
      if (settled) { yaw = targetYaw; draw(); running = false; setActive(false); return; }
      requestAnimationFrame(frame);
    }
    // Único punto de entrada al bucle: si nada cambia, no hay frames.
    function invalidate() {
      if (reduced) { yaw = targetYaw; draw(); return; }
      if (running) return;
      running = true; frames = 0; fpsT0 = performance.now(); setActive(true);
      requestAnimationFrame(frame);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      scale = Math.min(w / 34, h / 23);
      draw();
    }

    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      targetYaw = 0.62 + (pointer.x / rect.width - 0.5) * 1.5;
      invalidate();
    });
    canvas.addEventListener('pointerleave', () => { pointer = null; targetYaw = 0.62; invalidate(); });

    readColors();
    new ResizeObserver(resize).observe(canvas);
    resize();
    redrawHooks.push(() => { readColors(); draw(); });
    document.fonts?.ready.then(draw);
    invalidate(); // giro de entrada; luego queda en 0 FPS
  }
})();
