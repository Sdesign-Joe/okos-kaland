/* Okos Kaland – a nehézségválasztó oldal kiegészítései
 *   • Szorzósor-gyakorló: sorválasztó (2–10 vagy vegyes), soronként 0–3 csillagos „tudásjelzővel”
 *   • Nyomtatható feladatlap: bármelyik játékból 12 feladat A4-en, a végén megoldókulccsal
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const S = GJ.store, t = GJ.t, { esc } = GJ.u;

  GJ.addTexts({
    hu: { ttPick: 'Melyik szorzósort gyakorlod?', ttMix: 'Vegyes', ttLegend: '⭐ = már jól megy',
      wsBtn: '🖨️ Feladatlap nyomtatása', wsName: 'Név', wsDate: 'Dátum', wsKey: 'Megoldókulcs', wsLvl: 'Szint', wsTip: 'Nyomtatásnál válaszd a „Mentés PDF-be” lehetőséget, ha PDF-et szeretnél.',
      wsOrder: 'Rakd sorba:' },
    ro: { ttPick: 'Ce rând din tabla înmulțirii exersezi?', ttMix: 'Amestecat', ttLegend: '⭐ = merge deja bine',
      wsBtn: '🖨️ Tipărește o fișă de lucru', wsName: 'Nume', wsDate: 'Data', wsKey: 'Răspunsuri', wsLvl: 'Nivel', wsTip: 'La tipărire alege „Salvează ca PDF” dacă vrei un PDF.',
      wsOrder: 'Pune în ordine:' },
    en: { ttPick: 'Which times table do you want to practise?', ttMix: 'Mixed', ttLegend: '⭐ = going well already',
      wsBtn: '🖨️ Print a worksheet', wsName: 'Name', wsDate: 'Date', wsKey: 'Answers', wsLvl: 'Level', wsTip: 'When printing, choose “Save as PDF” if you want a PDF.',
      wsOrder: 'Put in order:' }
  });

  /* ================= Szorzósor-gyakorló ================= */
  const ROWS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'mix'];
  A.on('setupBefore', (g, p) => {
    if (g.id !== 'szorzosor') return '';
    const sel = p.ttRow || '2', tb = p.tables || {};
    return `<h3 class="setup-h">${t('ttPick')}</h3>
      <div class="tt-grid">${ROWS.map(r => {
        const s = r === 'mix' ? 0 : GJ.ttStars(tb[r]);
        return `<button class="tt-row ${r === sel ? 'on' : ''}" data-act="ttRow" data-v="${r}"><b>${r === 'mix' ? '🔀' : r + '×'}</b>
          <small>${r === 'mix' ? esc(t('ttMix')) : '⭐'.repeat(s) + '☆'.repeat(3 - s)}</small></button>`;
      }).join('')}</div><p class="muted center"><small>${t('ttLegend')}</small></p>`;
  });
  A.actions.ttRow = b => {
    const p = S.current(); if (!p) return;
    S.update(p.id, x => { x.ttRow = b.dataset.v; });
    document.querySelectorAll('.tt-row').forEach(x => x.classList.toggle('on', x === b));
    GJ.sfx('click');
  };
  // eredmények soronként (csak az első próbálkozás számít)
  function tally(r, good) {
    const row = r.task && r.task.ttRow; if (!row || r.game.id !== 'szorzosor' || r.task.__tt) return;
    r.task.__tt = true;
    const p = S.current(); if (!p) return;
    S.update(p.id, x => { x.tables = x.tables || {}; const e = x.tables[row] || { ok: 0, n: 0 }; e.n++; if (good) e.ok++; x.tables[row] = e; });
  }
  A.on('taskDone', (r, first) => tally(r, first));
  A.on('taskWrong', r => tally(r, false));

  /* ================= Nyomtatható feladatlap ================= */
  const printable = g => g && g.make && g.kind !== 'story' && !g.noPrint && g.id !== 'diktalas' && g.id !== 'hibak';
  A.on('setupExtra', g => (printable(g) ? `<div class="center"><button class="link-btn" data-act="wsPrint">${t('wsBtn')}</button></div>` : ''));

  function taskHTML(tk, i) {
    let ans;
    if (tk.type === 'order') {
      ans = `<div class="ws-order">${t('wsOrder')} ${tk.items.map(it => `<span class="ws-chip">${esc(it.label || it.t)}</span>`).join(' ')}</div>
        <div class="ws-boxes">${tk.answer.map(() => '<span class="ws-box"></span>').join('')}</div>`;
    } else if (tk.type === 'choice') {
      const lab = o => String((tk.optionLabels && tk.optionLabels[o]) || (String(o) + (tk.unit || '')));
      ans = `<div class="ws-opts">${tk.options.map(o => `<span>☐ ${esc(lab(o))}</span>`).join('')}</div>`;
    } else ans = '<div class="ws-line"></div>';
    return `<div class="ws-task"><div class="ws-q"><b>${i + 1}.</b> ${esc(tk.prompt)}</div>${tk.big ? `<div class="ws-big">${tk.big}</div>` : ''}${ans}</div>`;
  }
  function keyOf(tk) {
    if (tk.answerLabel != null) return tk.answerLabel;
    if (tk.type === 'order') return tk.answer.join(tk.items[0] && tk.items[0].label ? ', ' : '');
    if (tk.type === 'choice') return String((tk.optionLabels && tk.optionLabels[tk.answer]) || (String(tk.answer) + (tk.unit || '')));
    return String(tk.answer);
  }

  A.actions.wsPrint = () => {
    const st = A.setup, g = st && GJ.findGame(st.gid), p = S.current(); if (!printable(g) || !p) return;
    const seen = new Set(), tasks = [];
    for (let i = 0; i < 12; i++) tasks.push(GJ.makeTask(g, { level: st.level, age: p.age, name: p.name }, seen));
    const title = typeof g.title === 'object' ? g.title[GJ.lang()] : g.title;
    let sheet = document.getElementById('ws-sheet');
    if (!sheet) { sheet = document.createElement('div'); sheet.id = 'ws-sheet'; sheet.className = 'ws-sheet'; document.body.appendChild(sheet); }
    sheet.innerHTML = `<div class="ws-head"><h1>${esc(g.icon)} ${esc(title)}</h1><div class="ws-meta">${t('wsLvl')}: ${t('lvl' + st.level)} · Okos Kaland</div>
        <div class="ws-fill"><span>${t('wsName')}: ________________________</span><span>${t('wsDate')}: ______________</span></div></div>
      <div class="ws-grid">${tasks.map(taskHTML).join('')}</div>
      <div class="ws-keypage"><h2>🔑 ${t('wsKey')} – ${esc(title)}</h2><ol>${tasks.map(tk => `<li>${esc(keyOf(tk))}</li>`).join('')}</ol></div>`;
    GJ.toast(t('wsTip'));
    document.body.classList.add('printing-ws');
    const done = () => { document.body.classList.remove('printing-ws'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    const imgs = [...sheet.querySelectorAll('img')].filter(i => !i.complete);
    Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; }))).then(() => setTimeout(() => { window.print(); setTimeout(done, 1500); }, 200));
    GJ.track('feladatlap/' + g.id);
  };
});
