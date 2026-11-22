/* Okos Kaland – Párbaj: két gyerek ugyanazon a készüléken, felváltva válaszol.
 * Mindenki a saját szintjén kap feladatot (osztály / életkor alapján), így igazságos.
 * Egy feladatra egy próbálkozás van. A végén a profilos játékosok csillagot kapnak.
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const S = GJ.store, t = GJ.t, { esc, pick, shuffle } = GJ.u;

  GJ.addTexts({
    hu: { duelBtn: '⚔️ Párbaj', duelT: '⚔️ Párbaj', duelLead: 'Két játékos, egy készülék: felváltva válaszoltok. Mindenki a saját szintjén kap feladatot!',
      duelP1: '1. játékos', duelP2: '2. játékos', duelGuest: 'Vendég', duelSubj: 'Miből?', duelMix: '🎲 Vegyes', duelN: 'Hány kérdés fejenként?',
      duelGo: '⚔️ Indulhat!', duelSame: 'Válassz két különböző játékost!', duelTurn: '{n} következik!', duelRight: 'Ügyes, {n}! +1 pont', duelWrong: 'Most nem talált. A helyes: {a}',
      duelWin: '🏆 {n} nyert!', duelTie: '🤝 Döntetlen! Mindketten nagyon ügyesek voltatok!', duelScore: '{a} : {b}', duelAgain: '🔁 Visszavágó', duelStars: 'Mindenki annyi ⭐-ot kap, ahány pontot szerzett, a győztes még +2-t.' },
    ro: { duelBtn: '⚔️ Duel', duelT: '⚔️ Duel', duelLead: 'Doi jucători, un dispozitiv: răspundeți pe rând. Fiecare primește sarcini la nivelul lui!',
      duelP1: 'Jucătorul 1', duelP2: 'Jucătorul 2', duelGuest: 'Musafir', duelSubj: 'Din ce?', duelMix: '🎲 Amestecat', duelN: 'Câte întrebări de fiecare?',
      duelGo: '⚔️ Începem!', duelSame: 'Alege doi jucători diferiți!', duelTurn: 'Urmează {n}!', duelRight: 'Bravo, {n}! +1 punct', duelWrong: 'De data asta nu. Corect era: {a}',
      duelWin: '🏆 A câștigat {n}!', duelTie: '🤝 Egalitate! Amândoi ați fost foarte buni!', duelScore: '{a} : {b}', duelAgain: '🔁 Revanșa', duelStars: 'Fiecare primește atâtea ⭐ câte puncte a obținut, iar câștigătorul încă +2.' },
    en: { duelBtn: '⚔️ Duel', duelT: '⚔️ Duel', duelLead: 'Two players, one device: take turns to answer. Everyone gets tasks at their own level!',
      duelP1: 'Player 1', duelP2: 'Player 2', duelGuest: 'Guest', duelSubj: 'Which subject?', duelMix: '🎲 Mixed', duelN: 'Questions each?',
      duelGo: '⚔️ Let’s go!', duelSame: 'Choose two different players!', duelTurn: '{n}, it’s your turn!', duelRight: 'Well done, {n}! +1 point', duelWrong: 'Not this time. The answer was: {a}',
      duelWin: '🏆 {n} wins!', duelTie: '🤝 It’s a draw! You were both brilliant!', duelScore: '{a} : {b}', duelAgain: '🔁 Rematch', duelStars: 'Everyone gets one ⭐ per point, and the winner gets +2 more.' }
  });

  const GUEST = 'guest';
  const EXCLUDE = ['diktalas', 'betuiras', 'mesekeszito', 'hibak'];
  let cfg = null, duel = null;

  A.on('homeButtons', () => `<button class="big-btn pink" data-go="duel">${t('duelBtn')}</button>`);

  const players = () => S.list ? S.list() : (S.profiles ? S.profiles() : []);
  const person = id => {
    if (id === GUEST) return { id: GUEST, name: t('duelGuest'), avatar: '🙂', grade: null, age: 8 };
    return players().find(p => p.id === id);
  };
  const avHTML = p => (GJ.avatarHTML ? GJ.avatarHTML(p.avatar) : esc(p.avatar));

  A.screens.duel = () => {
    const ps = players(), cur = S.current();
    if (!cfg) cfg = { p1: cur ? cur.id : (ps[0] && ps[0].id), p2: (ps.find(p => !cur || p.id !== cur.id) || { id: GUEST }).id, subj: 'mix', n: 5 };
    const chips = (k) => ps.concat([{ id: GUEST, name: t('duelGuest'), avatar: '🙂' }]).map(p =>
      `<button class="duel-pick ${cfg[k] === p.id ? 'on' : ''}" data-act="duelPick" data-k="${k}" data-v="${esc(p.id)}"><span class="dp-av">${avHTML(p)}</span><small>${esc(p.name)}</small></button>`).join('');
    const SUBJ = [['mix', t('duelMix')]].concat(Object.values(GJ.SUBJECTS).map(s => [s.id, `${s.icon} ${s.title}`]));
    A.render(`<div class="screen narrow">
      <div class="topbar"><button class="icon-btn" data-go="${S.current() ? 'home' : 'profiles'}" aria-label="${t('back')}">⬅</button><h2>${t('duelT')}</h2></div>
      <p class="lead">${t('duelLead')}</p>
      <div class="card form">
        <p class="lbl">${t('duelP1')}</p><div class="duel-row">${chips('p1')}</div>
        <p class="lbl">${t('duelP2')}</p><div class="duel-row">${chips('p2')}</div>
        <p class="lbl">${t('duelSubj')}</p><div class="chips">${SUBJ.map(([id, n]) => `<button class="chip ${cfg.subj === id ? 'on' : ''}" data-act="duelSubj" data-v="${id}">${esc(n)}</button>`).join('')}</div>
        <p class="lbl">${t('duelN')}</p><div class="chips">${[3, 5, 8].map(n => `<button class="chip ${cfg.n === n ? 'on' : ''}" data-act="duelN" data-v="${n}">${n}</button>`).join('')}</div>
        <button class="big-btn green wide" data-act="duelStart">${t('duelGo')}</button>
      </div></div>`);
  };
  A.actions.duelPick = b => { cfg[b.dataset.k] = b.dataset.v; GJ.sfx('click'); A.go('duel'); };
  A.actions.duelSubj = b => { cfg.subj = b.dataset.v; GJ.sfx('click'); A.go('duel'); };
  A.actions.duelN = b => { cfg.n = +b.dataset.v; GJ.sfx('click'); A.go('duel'); };
  A.actions.duelStart = () => {
    if (cfg.p1 === cfg.p2 && cfg.p1 !== GUEST) { GJ.toast(t('duelSame')); return; }
    const mk = id => { const p = person(id) || person(GUEST); return { id: p.id, name: p.id === GUEST && id === cfg.p2 && cfg.p1 === GUEST ? t('duelGuest') + ' 2' : p.name, avatar: p.avatar, level: GJ.levelForProfile(p), age: p.age, score: 0 }; };
    const a = mk(cfg.p1), b = mk(cfg.p2);
    if (cfg.p1 === GUEST && cfg.p2 === GUEST) a.name = t('duelGuest') + ' 1';
    duel = { pl: [a, b], turn: 0, q: 0, total: cfg.n * 2, seen: new Set(), lock: false };
    GJ.track('parbaj');
    next();
  };

  function gamePool() {
    const subs = cfg.subj === 'mix' ? Object.keys(GJ.SUBJECTS) : [cfg.subj];
    return subs.flatMap(s => GJ.gamesFor(s)).filter(g => g.make && g.kind !== 'story' && !EXCLUDE.includes(g.id) && !String(g.id).startsWith('sajat-'));
  }
  function makeTask(pl) {
    const pool = gamePool();
    for (let i = 0; i < 30; i++) {
      const g = pick(pool), tk = GJ.makeTask(g, { level: pl.level, age: pl.age, name: pl.name }, duel.seen);
      if (tk && tk.type === 'choice' && !tk.autoSpeak) return Object.assign(tk, { __subj: g.subject });
    }
    return null;
  }
  function next() {
    if (GJ.stopSpeak) GJ.stopSpeak();
    if (duel.q >= duel.total) return finish();
    const pl = duel.pl[duel.turn];
    duel.task = makeTask(pl); duel.lock = false;
    if (!duel.task) return finish();
    const tk = duel.task, n = tk.options.length, cols = tk.cols || (n === 3 ? 3 : 2);
    const lab = o => String((tk.optionLabels && tk.optionLabels[o]) || (String(o) + (tk.unit || '')));
    const sc = (p, i) => `<div class="duel-sc ${i === duel.turn ? 'on' : ''}"><span class="dp-av">${avHTML(p)}</span><b>${esc(p.name)}</b><em>${p.score}</em></div>`;
    A.render(`<div class="screen play s-${tk.__subj}">
      <div class="playbar"><button class="icon-btn" data-go="duel" aria-label="${t('quit')}">✖</button>
        <div class="progress"><div class="pg-fill" style="width:${Math.round(duel.q / duel.total * 100)}%"></div><span>${duel.q + 1} / ${duel.total}</span></div></div>
      <div class="duel-board">${sc(duel.pl[0], 0)}<span class="duel-vs">⚔️</span>${sc(duel.pl[1], 1)}</div>
      <div class="duel-turn pop">${esc(t('duelTurn', { n: pl.name }))}</div>
      <div class="mascot-row"><div class="mascot">${A.mascot('think')}</div>
        <div class="bubble"><span>${esc(tk.prompt)}</span><button class="speak" data-act="duelSpeak" aria-label="🔊">${A.ico('🔊')}</button></div></div>
      ${tk.big ? `<div class="task-card pop">${tk.big}</div>` : ''}
      <div class="answers cols-${cols}">${tk.options.map((o, i) => `<button class="ans pop" style="animation-delay:${i * 60}ms" data-act="duelAns" data-i="${i}">${esc(lab(o))}</button>`).join('')}</div>
      <div class="msg" id="msg" aria-live="polite"></div></div>`);
    if (S.settings().autoSpeak) GJ.speak(tk.speak || tk.prompt);
  }
  A.actions.duelSpeak = () => { if (duel && duel.task) GJ.speak(duel.task.speak || duel.task.prompt); };
  A.actions.duelAns = b => {
    if (!duel || duel.lock) return;
    duel.lock = true;
    const tk = duel.task, o = tk.options[+b.dataset.i], pl = duel.pl[duel.turn], ok = String(o) === String(tk.answer);
    const lab = String((tk.optionLabels && tk.optionLabels[tk.answer]) || (String(tk.answer) + (tk.unit || '')));
    const msg = document.getElementById('msg');
    if (ok) { pl.score++; b.classList.add('right'); GJ.sfx('correct'); const r = b.getBoundingClientRect(); GJ.confetti(r.left + r.width / 2, r.top, 40); msg.innerHTML = `<div class="duel-msg ok">${esc(t('duelRight', { n: pl.name }))}</div>`; }
    else {
      b.classList.add('wrong'); GJ.sfx('wrong');
      const i = tk.options.findIndex(x => String(x) === String(tk.answer)); document.querySelectorAll('.ans')[i]?.classList.add('reveal');
      msg.innerHTML = `<div class="duel-msg">${esc(t('duelWrong', { a: lab }))}</div>`;
    }
    document.querySelectorAll('.ans').forEach(x => { x.disabled = true; });
    setTimeout(() => { if (!duel) return; duel.q++; duel.turn = 1 - duel.turn; next(); }, ok ? 1300 : 2300);
  };

  function finish() {
    const [a, b] = duel.pl, win = a.score === b.score ? null : a.score > b.score ? a : b;
    // csillagok a profilos játékosoknak
    duel.pl.forEach(p => {
      if (p.id === GUEST) return;
      const add = p.score + (win === p ? 2 : 0);
      if (add) S.update(p.id, x => { x.stars = (x.stars || 0) + add; });
    });
    GJ.sfx('fanfare'); GJ.confetti(innerWidth / 2, innerHeight / 3, 120);
    const card = p => `<div class="duel-res ${win === p ? 'win' : ''}"><span class="dp-av big">${avHTML(p)}</span><b>${esc(p.name)}</b><em>${p.score}</em></div>`;
    A.render(`<div class="screen center result">
      <div class="trophy bounce">${A.imgTag(GJ.MASCOT[win ? 'trophy' : 'cheer'], 'trophy-img')}</div>
      <h2 class="title">${esc(win ? t('duelWin', { n: win.name }) : t('duelTie'))}</h2>
      <div class="duel-final">${card(a)}<span class="duel-vs">${esc(t('duelScore', { a: a.score, b: b.score }))}</span>${card(b)}</div>
      <p class="note">${t('duelStars')}</p>
      <div class="row-btns"><button class="big-btn green" data-act="duelStart">${t('duelAgain')}</button>
        <button class="big-btn yellow" data-go="${S.current() ? 'home' : 'profiles'}">${A.ico(t('home'))}</button></div></div>`);
    duel = null;
  }
});
