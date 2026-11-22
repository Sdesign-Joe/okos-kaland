/* Okos Kaland – Betűírás ujjal
 * Saját feladattípus ('trace'): halvány, szaggatott szélű betű (vagy rövid szó), amit a gyerek
 * ujjal / egérrel végigrajzol. Ellenőrzés: a betű mekkora részét fedte le a rajz, és mennyi ment mellé.
 * Telefonon, tableten és egérrel is működik.
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const t = GJ.t, { pick } = GJ.u;

  GJ.addTexts({
    hu: { trClear: '🧽 Újra', trEmpty: 'Rajzold végig a betűt az ujjaddal! ✍️', trMore: 'Majdnem! Rajzold végig az egészet. ✍️', trNeat: 'Próbáld pontosabban, a vonalon belül! ✍️' },
    ro: { trClear: '🧽 Din nou', trEmpty: 'Desenează litera cu degetul! ✍️', trMore: 'Aproape! Desenează-o pe toată. ✍️', trNeat: 'Încearcă mai exact, în interiorul liniei! ✍️' },
    en: { trClear: '🧽 Again', trEmpty: 'Trace the letter with your finger! ✍️', trMore: 'Nearly! Trace all of it. ✍️', trNeat: 'Try to stay inside the lines! ✍️' }
  });

  const FONT = "'Baloo 2', 'Comic Sans MS', 'Trebuchet MS', sans-serif";
  let st = null;   // az aktuális rajz állapota

  function layout(cv, text) {
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const w = cv.clientWidth || 320, h = Math.round(w * 0.62);
    cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const W = cv.width, H = cv.height, ctx = cv.getContext('2d');
    let fs = H * 0.86;
    ctx.font = `800 ${fs}px ${FONT}`;
    const mw = ctx.measureText(text).width;
    if (mw > W * 0.9) fs *= W * 0.9 / mw;
    return { W, H, fs, dpr };
  }
  function glyph(ctx, L, text) {
    ctx.font = `800 ${L.fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    return [L.W / 2, L.H * 0.53];
  }
  function drawGuide(full) {
    const { cv, L, text } = st, ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, L.W, L.H);
    // segédvonalak (mint a füzetben)
    ctx.strokeStyle = '#e4ddff'; ctx.lineWidth = 2 * L.dpr; ctx.setLineDash([]);
    [0.2, 0.53, 0.86].forEach(y => { ctx.beginPath(); ctx.moveTo(0, L.H * y); ctx.lineTo(L.W, L.H * y); ctx.stroke(); });
    const [x, y] = glyph(ctx, L, text);
    ctx.fillStyle = full ? '#8ce99a' : '#efeaff'; ctx.fillText(text, x, y);
    ctx.setLineDash([10 * L.dpr, 8 * L.dpr]); ctx.lineWidth = 3 * L.dpr; ctx.strokeStyle = full ? '#2f9e44' : '#a99de0';
    ctx.strokeText(text, x, y); ctx.setLineDash([]);
    ctx.drawImage(st.ink, 0, 0);
  }

  GJ.taskTypes = GJ.taskTypes || {};
  GJ.taskTypes.trace = {
    html: () => `<div class="trace-wrap"><canvas id="trace-cv" class="trace-cv"></canvas></div>
      <div class="row-btns trace-btns"><button class="big-btn blue small" id="tr-clear" type="button">${t('trClear')}</button>
      <button class="big-btn green small" id="tr-check" type="button">${t('check')}</button></div>`,
    async mount(tk, api) {
      const cv = document.getElementById('trace-cv'); if (!cv) return;
      try { await document.fonts.load(`800 100px 'Baloo 2'`); } catch (e) { /* */ }
      if (!document.body.contains(cv)) return;
      const L = layout(cv, tk.glyph);
      const ink = document.createElement('canvas'); ink.width = L.W; ink.height = L.H;
      const mask = document.createElement('canvas'); mask.width = L.W; mask.height = L.H;
      const mctx = mask.getContext('2d'), [gx, gy] = glyph(mctx, L, tk.glyph);
      mctx.fillStyle = '#000'; mctx.fillText(tk.glyph, gx, gy);
      // tűrés: a betű körül egy sávot még „vonalon belülinek” számítunk
      const tol = document.createElement('canvas'); tol.width = L.W; tol.height = L.H;
      const tctx = tol.getContext('2d'); glyph(tctx, L, tk.glyph);
      tctx.fillStyle = tctx.strokeStyle = '#000'; tctx.lineJoin = 'round'; tctx.lineWidth = L.fs * 0.14;
      tctx.fillText(tk.glyph, gx, gy); tctx.strokeText(tk.glyph, gx, gy);
      st = { cv, L, text: tk.glyph, ink, mask, tol, drawing: false, last: null, strokes: 0 };
      drawGuide(false);

      const ictx = ink.getContext('2d');
      ictx.lineCap = ictx.lineJoin = 'round'; ictx.lineWidth = Math.max(10 * L.dpr, L.fs * 0.11); ictx.strokeStyle = '#7048e8';
      const pos = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * L.W / b.width, (e.clientY - b.top) * L.H / b.height]; };
      cv.addEventListener('pointerdown', e => {
        if (api.locked) return;
        e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* */ }
        st.drawing = true; st.last = pos(e); st.strokes++;
        ictx.beginPath(); ictx.arc(st.last[0], st.last[1], ictx.lineWidth / 2, 0, 7); ictx.fillStyle = ictx.strokeStyle; ictx.fill();
        drawGuide(false);
      });
      cv.addEventListener('pointermove', e => {
        if (!st.drawing) return; e.preventDefault();
        const p = pos(e); ictx.beginPath(); ictx.moveTo(...st.last); ictx.lineTo(...p); ictx.stroke(); st.last = p; drawGuide(false);
      });
      const up = () => { st.drawing = false; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', up);
      const clear = () => { ictx.clearRect(0, 0, L.W, L.H); st.strokes = 0; drawGuide(false); };
      document.getElementById('tr-clear').onclick = () => { if (!api.locked) { clear(); GJ.sfx('click'); } };
      document.getElementById('tr-check').onclick = () => {
        if (api.locked) return;
        const r = score();
        if (r.ink < 30) { GJ.toast(t('trEmpty')); return; }
        if (r.cover >= 0.62 && r.out <= 0.3) { drawGuide(true); api.ok(cv); return; }
        GJ.toast(t(r.cover < 0.62 ? 'trMore' : 'trNeat'));
        api.bad();
        if (!api.locked) setTimeout(clear, 600);
      };
    },
    reveal() { if (st) { st.ink.getContext('2d').clearRect(0, 0, st.L.W, st.L.H); drawGuide(true); } }
  };

  // lefedettség: a betű pontjainak hány %-án ment át a rajz; mellé: a rajz hány %-a esett a tűréssávon kívül
  function score() {
    const { L, ink, mask, tol } = st;
    const I = ink.getContext('2d').getImageData(0, 0, L.W, L.H).data;
    const M = mask.getContext('2d').getImageData(0, 0, L.W, L.H).data;
    const T = tol.getContext('2d').getImageData(0, 0, L.W, L.H).data;
    const step = Math.max(2, Math.round(3 * L.dpr));
    let letter = 0, hit = 0, inkN = 0, out = 0;
    for (let y = 0; y < L.H; y += step) for (let x = 0; x < L.W; x += step) {
      const i = (y * L.W + x) * 4 + 3;
      if (M[i] > 128) { letter++; if (I[i] > 0) hit++; }
      if (I[i] > 0) { inkN++; if (T[i] < 128) out++; }
    }
    return { cover: letter ? hit / letter : 0, out: inkN ? out / inkN : 1, ink: inkN };
  }

  /* ---------- A játék ---------- */
  const SETS = {
    hu: { up: 'ABCDEFGHIJKLMNOPRSTUVZÁÉÖÜ', low: 'abcdefghijklmnoprstuvzáéóöőüű', words: ['ház', 'tó', 'fa', 'nap', 'méz', 'sün', 'ló', 'cica', 'alma', 'hal'] },
    ro: { up: 'ABCDEFGHIJLMNOPRSTUVZĂÂÎȘȚ', low: 'abcdefghijlmnoprstuvzăâîșț', words: ['mama', 'tata', 'pom', 'casă', 'lună', 'apă', 'nor', 'cal', 'lup', 'oaie'] },
    en: { up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', low: 'abcdefghijklmnopqrstuvwxyz', words: ['cat', 'dog', 'sun', 'bed', 'hat', 'pig', 'fish', 'cup', 'egg', 'bus'] }
  };
  GJ.register({
    id: 'betuiras', subject: 'nyelvtan', icon: '✍️', grades: [0, 1, 2],
    title: { hu: 'Betűírás ujjal', ro: 'Scriu cu degetul', en: 'Letter tracing' },
    desc: { hu: 'Rajzold végig a betűt az ujjaddal!', ro: 'Desenează litera cu degetul!', en: 'Trace the letter with your finger!' },
    noPrint: true,
    make({ level, lang }) {
      const S = SETS[lang];
      const g = level === 1 ? pick([...S.up]) : level === 2 ? pick([...S.low]) : pick(S.words);
      const prompt = level === 3 ? { hu: 'Írd át a szót az ujjaddal!', ro: 'Scrie cuvântul cu degetul!', en: 'Trace the word with your finger!' }[lang]
        : { hu: 'Rajzold végig a betűt az ujjaddal!', ro: 'Desenează litera cu degetul!', en: 'Trace the letter with your finger!' }[lang];
      return { type: 'trace', key: g, glyph: g, prompt, speak: prompt + ' ' + g, noTimer: true, answer: g, answerLabel: g };
    }
  });
});
