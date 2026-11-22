/* Okos Kaland – Párbaj: két gyerek ugyanazon a készüléken, felváltva válaszol.
 * Mindenki a saját szintjén kap feladatot (osztály / életkor alapján), így igazságos.
 * Vendég ellenfélnek megadható a neve és a korosztálya.
 * Egy feladatra egy próbálkozás van. Egy forduló után visszavágó vagy eredményhirdetés jöhet;
 * az eredményhirdetés a teljes verseny (minden forduló) végén van.
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const S = GJ.store, t = GJ.t, { esc, pick } = GJ.u;

  GJ.addTexts({
    hu: { duelBtn: '⚔️ Párbaj', duelT: '⚔️ Párbaj', duelLead: 'Két játékos, egy készülék: felváltva válaszoltok. Mindenki a saját szintjén kap feladatot!',
      duelP1: '1. játékos', duelP2: '2. játékos', duelGuest: 'Vendég', duelSubj: 'Miből?', duelMix: '🎲 Vegyes', duelN: 'Hány kérdés fejenként?',
      duelGo: '⚔️ Indulhat!', duelSame: 'Válassz két különböző játékost!', duelTurn: '{n} következik!', duelRight: 'Ügyes, {n}! +1 pont', duelWrong: 'Most nem talált. A helyes: {a}',
      duelAdd: 'Új játékos', duelGName: 'A vendég neve', duelGNamePh: 'Pl. Peti', duelGGrade: 'Korosztály',
      duelRoundEnd: '{r}. forduló vége', duelScore: '{a} : {b}', duelStanding: 'Győzelmek eddig: {a} : {b}',
      duelAgain: '🔁 Visszavágó', duelCeremonyBtn: '🏆 Eredményhirdetés', duelCeremony: '🏆 Eredményhirdetés',
      duelChamp: 'A párbaj győztese:', duelTie: '🤝 Döntetlen! Mindketten nagyon ügyesek voltatok!',
      duelWins: '{n} győzelem', duelPts: '{n} pont', duelRoundN: '{r}. forduló', duelDraw: 'döntetlen',
      duelStarsGot: '+{n} ⭐', duelStars: 'Mindenki annyi ⭐-ot kapott, ahány pontot szerzett, a forduló győztese még +2-t.',
      duelNew: '⚔️ Új párbaj',
      duelSayWin: 'Eredményhirdetés! A párbaj győztese: {n}! Gratulálunk! {o} is nagyon ügyes volt!',
      duelSayTie: 'Eredményhirdetés! Döntetlen lett! {a} és {b}, mindketten nagyon ügyesek voltatok!' },
    ro: { duelBtn: '⚔️ Duel', duelT: '⚔️ Duel', duelLead: 'Doi jucători, un dispozitiv: răspundeți pe rând. Fiecare primește sarcini la nivelul lui!',
      duelP1: 'Jucătorul 1', duelP2: 'Jucătorul 2', duelGuest: 'Musafir', duelSubj: 'Din ce?', duelMix: '🎲 Amestecat', duelN: 'Câte întrebări de fiecare?',
      duelGo: '⚔️ Începem!', duelSame: 'Alege doi jucători diferiți!', duelTurn: 'Urmează {n}!', duelRight: 'Bravo, {n}! +1 punct', duelWrong: 'De data asta nu. Corect era: {a}',
      duelAdd: 'Jucător nou', duelGName: 'Numele musafirului', duelGNamePh: 'De ex. Andrei', duelGGrade: 'Vârsta / clasa',
      duelRoundEnd: 'Sfârșitul rundei {r}', duelScore: '{a} : {b}', duelStanding: 'Victorii până acum: {a} : {b}',
      duelAgain: '🔁 Revanșa', duelCeremonyBtn: '🏆 Festivitatea de premiere', duelCeremony: '🏆 Festivitatea de premiere',
      duelChamp: 'Câștigătorul duelului:', duelTie: '🤝 Egalitate! Amândoi ați fost foarte buni!',
      duelWins: '{n} victorii', duelPts: '{n} puncte', duelRoundN: 'Runda {r}', duelDraw: 'egal',
      duelStarsGot: '+{n} ⭐', duelStars: 'Fiecare a primit atâtea ⭐ câte puncte a obținut, iar câștigătorul rundei încă +2.',
      duelNew: '⚔️ Duel nou',
      duelSayWin: 'Festivitatea de premiere! Câștigătorul duelului este {n}! Felicitări! Și {o} a fost foarte bun!',
      duelSayTie: 'Festivitatea de premiere! Este egalitate! {a} și {b}, amândoi ați fost foarte buni!' },
    en: { duelBtn: '⚔️ Duel', duelT: '⚔️ Duel', duelLead: 'Two players, one device: take turns to answer. Everyone gets tasks at their own level!',
      duelP1: 'Player 1', duelP2: 'Player 2', duelGuest: 'Guest', duelSubj: 'Which subject?', duelMix: '🎲 Mixed', duelN: 'Questions each?',
      duelGo: '⚔️ Let’s go!', duelSame: 'Choose two different players!', duelTurn: '{n}, it’s your turn!', duelRight: 'Well done, {n}! +1 point', duelWrong: 'Not this time. The answer was: {a}',
      duelAdd: 'New player', duelGName: 'Guest’s name', duelGNamePh: 'e.g. Sam', duelGGrade: 'Age group',
      duelRoundEnd: 'End of round {r}', duelScore: '{a} : {b}', duelStanding: 'Wins so far: {a} : {b}',
      duelAgain: '🔁 Rematch', duelCeremonyBtn: '🏆 Award ceremony', duelCeremony: '🏆 Award ceremony',
      duelChamp: 'The winner of the duel:', duelTie: '🤝 It’s a draw! You were both brilliant!',
      duelWins: '{n} wins', duelPts: '{n} points', duelRoundN: 'Round {r}', duelDraw: 'draw',
      duelStarsGot: '+{n} ⭐', duelStars: 'Everyone got one ⭐ per point, and each round’s winner got +2 more.',
      duelNew: '⚔️ New duel',
      duelSayWin: 'Award ceremony! The winner of the duel is {n}! Congratulations! {o} was brilliant too!',
      duelSayTie: 'Award ceremony! It’s a draw! {a} and {b}, you were both brilliant!' }
  });

  const GUEST = 'guest';
  const GUEST_AV = { p1: '🙂', p2: '😎' };
  const EXCLUDE = ['diktalas', 'betuiras', 'mesekeszito', 'hibak'];
  let cfg = null, duel = null, series = null, lastSay = '';

  A.on('homeButtons', () => `<button class="big-btn pink" data-go="duel">${t('duelBtn')}</button>`);

  const players = () => S.list ? S.list() : (S.profiles ? S.profiles() : []);
  const avHTML = p => (GJ.avatarHTML ? GJ.avatarHTML(p.avatar) : esc(p.avatar));
  const homeGo = () => (S.current() ? 'home' : 'profiles');

  /** A vendég mezőinek aktuális értéke (újrarajzolás előtt elmentjük, hogy ne vesszen el a beírt név). */
  function readGuestInputs() {
    if (!cfg) return;
    ['p1', 'p2'].forEach(k => { const el = document.getElementById('dg-name-' + k); if (el) cfg.guest[k].name = el.value.trim().slice(0, 20); });
  }

  A.screens.duel = () => {
    if (GJ.stopSpeak) GJ.stopSpeak();
    duel = null;
    const ps = players(), cur = S.current();
    if (!cfg) cfg = { auto1: true, auto2: true, subj: 'mix', n: 5,
      guest: { p1: { name: '', grade: 2 }, p2: { name: '', grade: cur ? GJ.gradeOf(cur) : 2 } } };
    // a játékoslista mindig friss: törölt játékos helyére új választás, az automatikus választás követi az újonnan regisztráltakat
    const has = id => id === GUEST || ps.some(p => p.id === id);
    if (GJ.pfNew && ps.some(p => p.id === GJ.pfNew)) {
      const k = cfg.p1 === GJ.pfNew ? null : (cfg.pickFor || 'p2');
      if (k) { cfg[k] = GJ.pfNew; cfg['auto' + k.slice(1)] = false; }
    }
    GJ.pfNew = null; GJ.pfReturn = null; cfg.pickFor = null;
    if (cfg.auto1 || !has(cfg.p1)) { cfg.p1 = cur ? cur.id : (ps[0] ? ps[0].id : GUEST); cfg.auto1 = true; }
    if (cfg.auto2 || !has(cfg.p2) || (cfg.p2 === cfg.p1 && cfg.p1 !== GUEST)) {
      cfg.p2 = (ps.find(p => p.id !== cfg.p1) || { id: GUEST }).id; cfg.auto2 = true;
    }
    const chips = (k) => ps.concat([{ id: GUEST, name: t('duelGuest'), avatar: GUEST_AV[k] }]).map(p =>
      `<button class="duel-pick ${cfg[k] === p.id ? 'on' : ''}" data-act="duelPick" data-k="${k}" data-v="${esc(p.id)}"><span class="dp-av">${avHTML(p)}</span><small>${esc(p.name)}</small></button>`).join('')
      + `<button class="duel-pick add" data-act="duelAddPlayer" data-k="${k}"><span class="dp-av">➕</span><small>${esc(t('duelAdd'))}</small></button>`;
    const guestBox = k => cfg[k] !== GUEST ? '' : `<div class="duel-guest">
        <label class="lbl" for="dg-name-${k}">${t('duelGName')}</label>
        <input id="dg-name-${k}" class="txt" maxlength="20" value="${esc(cfg.guest[k].name)}" placeholder="${esc(t('duelGNamePh'))}" autocomplete="off">
        <p class="lbl">${t('duelGGrade')}</p>
        <div class="chips">${[0, 1, 2, 3, 4].map(g => `<button class="chip ${cfg.guest[k].grade === g ? 'on' : ''}" data-act="duelGrade" data-k="${k}" data-v="${g}">${t('gradeN' + g)}</button>`).join('')}</div>
      </div>`;
    const SUBJ = [['mix', t('duelMix')]].concat(Object.values(GJ.SUBJECTS).map(s => [s.id, `${s.icon} ${s.title}`]));
    A.render(`<div class="screen narrow">
      <div class="topbar"><button class="icon-btn" data-go="${homeGo()}" aria-label="${t('back')}">⬅</button><h2>${t('duelT')}</h2></div>
      <p class="lead">${t('duelLead')}</p>
      <div class="card form">
        <p class="lbl">${t('duelP1')}</p><div class="duel-row">${chips('p1')}</div>${guestBox('p1')}
        <p class="lbl">${t('duelP2')}</p><div class="duel-row">${chips('p2')}</div>${guestBox('p2')}
        <p class="lbl">${t('duelSubj')}</p><div class="chips">${SUBJ.map(([id, n]) => `<button class="chip ${cfg.subj === id ? 'on' : ''}" data-act="duelSubj" data-v="${id}">${esc(n)}</button>`).join('')}</div>
        <p class="lbl">${t('duelN')}</p><div class="chips">${[3, 5, 8].map(n => `<button class="chip ${cfg.n === n ? 'on' : ''}" data-act="duelN" data-v="${n}">${n}</button>`).join('')}</div>
        <button class="big-btn green wide" data-act="duelStart">${t('duelGo')}</button>
      </div></div>`);
  };
  A.actions.duelPick = b => { readGuestInputs(); const k = b.dataset.k; cfg[k] = b.dataset.v; cfg['auto' + k.slice(1)] = false; GJ.sfx('click'); A.go('duel'); };
  /** Új játékos regisztrálása a párbajból: utána visszajövünk, és ő lesz kiválasztva ezen a helyen. */
  A.actions.duelAddPlayer = b => { readGuestInputs(); cfg.pickFor = b.dataset.k; GJ.pfReturn = 'duel'; GJ.sfx('click'); A.go('editProfile'); };
  A.actions.duelGrade = b => { readGuestInputs(); cfg.guest[b.dataset.k].grade = +b.dataset.v; GJ.sfx('click'); A.go('duel'); };
  A.actions.duelSubj = b => { readGuestInputs(); cfg.subj = b.dataset.v; GJ.sfx('click'); A.go('duel'); };
  A.actions.duelN = b => { readGuestInputs(); cfg.n = +b.dataset.v; GJ.sfx('click'); A.go('duel'); };

  /** Új verseny indítása a beállító képernyőről. */
  A.actions.duelStart = () => {
    readGuestInputs();
    if (cfg.p1 === cfg.p2 && cfg.p1 !== GUEST) { GJ.toast(t('duelSame')); return; }
    const both = cfg.p1 === GUEST && cfg.p2 === GUEST;
    const mk = k => {
      const id = cfg[k];
      const p = id !== GUEST && players().find(x => x.id === id);
      if (p) return { id: p.id, name: p.name, avatar: p.avatar, level: GJ.levelForProfile(p), age: p.age };
      const g = cfg.guest[k], age = g.grade + 6;
      const name = g.name || (both ? `${t('duelGuest')} ${k === 'p1' ? 1 : 2}` : t('duelGuest'));
      return { id: GUEST, name, avatar: GUEST_AV[k], level: GJ.levelForProfile({ grade: g.grade, age }), age };
    };
    const a = mk('p1'), b = mk('p2');
    if (a.id === GUEST && b.id === GUEST && a.name === b.name) b.name += ' 2';
    series = { pl: [a, b], rounds: [], wins: [0, 0], pts: [0, 0], stars: [0, 0], n: cfg.n, subj: cfg.subj };
    GJ.track('parbaj');
    startRound();
  };
  /** Visszavágó: ugyanazokkal a játékosokkal, most a másik kezd. */
  A.actions.duelRematch = () => { if (!series) return A.go('duel'); GJ.sfx('click'); startRound(); };
  A.actions.duelCeremony = () => { if (!series) return A.go('duel'); ceremony(); };
  A.actions.duelSayAgain = () => { if (lastSay) GJ.speak(lastSay); };

  function startRound() {
    const first = series.rounds.length % 2;   // visszavágóban felváltva kezdenek
    duel = { pl: series.pl.map(p => Object.assign({}, p, { score: 0 })), turn: first, q: 0, total: series.n * 2, seen: new Set(), lock: false };
    next();
  }

  function gamePool() {
    const subs = series.subj === 'mix' ? Object.keys(GJ.SUBJECTS) : [series.subj];
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
    if (duel.q >= duel.total) return roundEnd();
    const pl = duel.pl[duel.turn];
    duel.task = makeTask(pl); duel.lock = false;
    if (!duel.task) return roundEnd();
    const tk = duel.task, n = tk.options.length, cols = tk.cols || (n === 3 ? 3 : 2);
    const lab = o => String((tk.optionLabels && tk.optionLabels[o]) || (String(o) + (tk.unit || '')));
    const sc = (p, i) => `<div class="duel-sc ${i === duel.turn ? 'on' : ''}"><span class="dp-av">${avHTML(p)}</span><b>${esc(p.name)}</b><em>${p.score}</em></div>`;
    const rn = series.rounds.length + 1;
    A.render(`<div class="screen play s-${tk.__subj}">
      <div class="playbar"><button class="icon-btn" data-go="duel" aria-label="${t('quit')}">✖</button>
        <div class="progress"><div class="pg-fill" style="width:${Math.round(duel.q / duel.total * 100)}%"></div><span>${rn > 1 ? esc(t('duelRoundN', { r: rn })) + ' · ' : ''}${duel.q + 1} / ${duel.total}</span></div></div>
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
    const d = duel;
    setTimeout(() => { if (duel !== d) return; duel.q++; duel.turn = 1 - duel.turn; next(); }, ok ? 1300 : 2300);
  };

  /** Egy forduló vége: csak az állás látszik, a győztest az eredményhirdetés hirdeti ki. */
  function roundEnd() {
    if (GJ.stopSpeak) GJ.stopSpeak();
    const [a, b] = duel.pl, wi = a.score === b.score ? -1 : a.score > b.score ? 0 : 1;
    series.rounds.push({ s: [a.score, b.score], wi });
    if (wi >= 0) series.wins[wi]++;
    duel.pl.forEach((p, i) => {
      series.pts[i] += p.score;
      const add = p.score + (wi === i ? 2 : 0);
      series.stars[i] += add;
      if (p.id !== GUEST && add) S.update(p.id, x => { x.stars = (x.stars || 0) + add; });
    });
    duel = null;
    GJ.sfx('correct');
    const card = (p, i) => `<div class="duel-res"><span class="dp-av big">${avHTML(p)}</span><b>${esc(p.name)}</b><em>${series.rounds[series.rounds.length - 1].s[i]}</em></div>`;
    const r = series.rounds.length;
    A.render(`<div class="screen center result">
      <h2 class="title">${esc(t('duelRoundEnd', { r }))}</h2>
      <div class="duel-final">${card(series.pl[0], 0)}<span class="duel-vs">⚔️</span>${card(series.pl[1], 1)}</div>
      ${r > 1 ? `<p class="duel-standing">${esc(t('duelStanding', { a: series.wins[0], b: series.wins[1] }))}</p>` : ''}
      <div class="row-btns"><button class="big-btn green" data-act="duelRematch">${t('duelAgain')}</button>
        <button class="big-btn yellow" data-act="duelCeremony">${t('duelCeremonyBtn')}</button></div></div>`);
  }

  /** Eredményhirdetés a teljes verseny végén. Győztes: több megnyert forduló, egyenlőségnél több pont. */
  function ceremony() {
    const s = series, [a, b] = s.pl;
    let wi = s.wins[0] === s.wins[1] ? (s.pts[0] === s.pts[1] ? -1 : s.pts[0] > s.pts[1] ? 0 : 1) : s.wins[0] > s.wins[1] ? 0 : 1;
    const multi = s.rounds.length > 1;
    if (!multi) wi = s.rounds[0].wi;
    const order = wi === 1 ? [1, 0] : [0, 1];
    lastSay = wi < 0 ? t('duelSayTie', { a: a.name, b: b.name }) : t('duelSayWin', { n: s.pl[wi].name, o: s.pl[1 - wi].name });
    GJ.sfx('fanfare');
    setTimeout(() => GJ.confetti(innerWidth / 2, innerHeight / 3, 160), 1400);
    const stat = i => `${multi ? `<span>${esc(t('duelWins', { n: s.wins[i] }))}</span>` : ''}<span>${esc(t('duelPts', { n: s.pts[i] }))}</span><span class="dc-stars">${esc(t('duelStarsGot', { n: s.stars[i] }))}</span>`;
    const podium = (i, place) => `<div class="dc-col ${place === 1 ? 'first' : 'second'} ${wi < 0 ? 'tie' : ''}" style="animation-delay:${place === 1 ? 1200 : 400}ms">
        ${place === 1 && wi >= 0 ? '<div class="dc-crown">👑</div>' : ''}
        <span class="dp-av big">${avHTML(s.pl[i])}</span><b>${esc(s.pl[i].name)}</b>
        <div class="dc-stat">${stat(i)}</div>
        <div class="dc-step">${wi < 0 ? '🤝' : place === 1 ? '🥇' : '🥈'}</div></div>`;
    const rows = multi ? `<div class="dc-rounds">${s.rounds.map((r, k) => `<div class="dc-round"><span>${esc(t('duelRoundN', { r: k + 1 }))}</span><b>${r.s[0]} : ${r.s[1]}</b><span>${r.wi < 0 ? esc(t('duelDraw')) : avHTML(s.pl[r.wi])}</span></div>`).join('')}</div>` : '';
    A.render(`<div class="screen center result duel-ceremony">
      <h2 class="title">${t('duelCeremony')}</h2>
      <div class="trophy bounce">${A.imgTag(GJ.MASCOT[wi >= 0 ? 'trophy' : 'cheer'], 'trophy-img')}</div>
      <p class="dc-champ">${wi >= 0 ? `${esc(t('duelChamp'))} <b>${esc(s.pl[wi].name)}</b>` : esc(t('duelTie'))}
        <button class="speak" data-act="duelSayAgain" aria-label="🔊">${A.ico('🔊')}</button></p>
      <div class="dc-podium">${podium(order[1], 2)}${podium(order[0], 1)}</div>
      ${rows}
      <p class="note">${t('duelStars')}</p>
      <div class="row-btns"><button class="big-btn green" data-go="duel">${t('duelNew')}</button>
        <button class="big-btn yellow" data-go="${homeGo()}">${A.ico(t('home'))}</button></div></div>`);
    const say = lastSay; setTimeout(() => { if (document.querySelector('.duel-ceremony') && lastSay === say) GJ.speak(say); }, 900);
    series = null;
  }
});
