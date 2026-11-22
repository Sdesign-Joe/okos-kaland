/* Okos Kaland – tanulást segítő funkciók
 *   • Gyakorold a hibáidat!  – az elrontott feladatok visszatérnek egy külön körben
 *   • Automatikus nehézség   – jól megy → feljebb lép, nehéz → visszalép
 *   • Napi küldetés + sorozat (🔥 egymást követő napok)
 *   • Fejlődési kimutatás a Szülői sarokban
 *   • Állítható napi időkorlát
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const S = GJ.store, t = GJ.t, { esc, shuffle } = GJ.u;
  const pad = n => String(n).padStart(2, '0');
  const dayStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dayStr(new Date());
  const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return dayStr(d); };

  GJ.addTexts({
    hu: {
      recForYou: '⭐ Neked ajánlott', grade: 'Hányadik osztályos vagy?', gradeN0: 'Óvoda', gradeN1: '1. o.', gradeN2: '2. o.', gradeN3: '3. o.', gradeN4: '4. o.', check: '✔ Kész',
      mistakesBtn: '🎯 Gyakorold a hibáidat', mistakesTitle: 'Gyakorold a hibáidat', mistakesDesc: 'Az elrontott feladatok újra',
      mistakeFixed: 'Ezt már tudod! Kikerült a gyakorlandók közül. ✨',
      lvlUp: '🎉 Ügyes vagy! Mostantól nehezebb szinten folytatod: {l}', lvlDown: '🐢 A következő kör kicsit könnyebb lesz: {l}',
      dailyT: '🎯 Mai küldetés', dailyDone: '✅ Teljesítve! Holnap új küldetés vár.', dailyToast: '🎯 Mai küldetés teljesítve! +{n} ⭐',
      streakN: '🔥 {n} nap', streakToast: '🔥 {n} napja egymás után! Csak így tovább!',
      mSolve: 'Oldj meg {n} feladatot!', mStars: 'Gyűjts {n} csillagot!', mGames: 'Játssz {n} különböző játékkal!',
      mPerfect: 'Érj el egy hibátlan kört!', mStory: 'Írj egy mesét a Mesekészítőben!', mMath: 'Játssz egy matek kört!', mLang: 'Játssz egy nyelvtan kört!',
      sAutoLvl: 'Automatikus nehézség', sAutoLvlNote: 'Ha egy játék nagyon jól megy, a következő kör nehezebb lesz; ha nehéz, könnyebb.',
      sLimit: '⏳ Napi játékidő', sLimitNote: 'Játékosonként, naponta. Ha letelik, a bagoly kedvesen elköszön; a szülő hosszabbíthat.', limitOff: 'Nincs',
      limitLeft: '⏳ {n} perc', limitT: 'Mára ennyi volt, {n}! 🌙', limitText: 'Ügyes voltál! Pihenj egy kicsit – holnap új kalandok várnak.',
      limitMore: '🔒 Szülő: +15 perc', limitGate: 'Szülői jóváhagyás: mennyi {a} × {b}?', limitAdded: '+15 perc – jó játékot!',
      rpTitle: '📈 Fejlődés', rpWeek: 'Az elmúlt 7 napban: {m} perc játék, {d} napon.', rpSubj: 'Pontosság tantárgyanként (30 nap)',
      rpWeak: 'Gyakorlásra ajánlott', rpGood: 'Jól megy', rpNone: 'Még kevés az adat – játsszon néhány kört!', rpMist: 'Gyakorlandó feladatok: {n}', rpStreak: 'Sorozat: {n} nap'
    },
    ro: {
      recForYou: '⭐ Recomandat pentru tine', grade: 'În ce clasă ești?', gradeN0: 'Grădiniță', gradeN1: 'Cl. I', gradeN2: 'Cl. a II-a', gradeN3: 'Cl. a III-a', gradeN4: 'Cl. a IV-a', check: '✔ Gata',
      mistakesBtn: '🎯 Exersează greșelile', mistakesTitle: 'Exersează greșelile', mistakesDesc: 'Sarcinile greșite, din nou',
      mistakeFixed: 'Acum știi! Nu mai e nevoie să o exersezi. ✨',
      lvlUp: '🎉 Bravo! De acum continui la un nivel mai greu: {l}', lvlDown: '🐢 Runda următoare va fi puțin mai ușoară: {l}',
      dailyT: '🎯 Misiunea zilei', dailyDone: '✅ Gata! Mâine te așteaptă o misiune nouă.', dailyToast: '🎯 Misiunea zilei îndeplinită! +{n} ⭐',
      streakN: '🔥 {n} zile', streakToast: '🔥 {n} zile la rând! Ține-o tot așa!',
      mSolve: 'Rezolvă {n} sarcini!', mStars: 'Adună {n} stele!', mGames: 'Joacă {n} jocuri diferite!',
      mPerfect: 'Fă o rundă fără greșeli!', mStory: 'Scrie o poveste în Atelierul de povești!', mMath: 'Joacă o rundă de matematică!', mLang: 'Joacă o rundă de limbă!',
      sAutoLvl: 'Dificultate automată', sAutoLvlNote: 'Dacă un joc merge foarte bine, runda următoare e mai grea; dacă e greu, mai ușoară.',
      sLimit: '⏳ Timp de joc pe zi', sLimitNote: 'Pe jucător, pe zi. Când expiră, bufnița își ia rămas-bun; părintele poate prelungi.', limitOff: 'Fără',
      limitLeft: '⏳ {n} min', limitT: 'Gata pentru azi, {n}! 🌙', limitText: 'Te-ai descurcat foarte bine! Odihnește-te puțin – mâine te așteaptă aventuri noi.',
      limitMore: '🔒 Părinte: +15 minute', limitGate: 'Aprobarea părintelui: cât face {a} × {b}?', limitAdded: '+15 minute – joacă plăcută!',
      rpTitle: '📈 Progres', rpWeek: 'În ultimele 7 zile: {m} minute de joc, în {d} zile.', rpSubj: 'Precizie pe materii (30 de zile)',
      rpWeak: 'De exersat', rpGood: 'Merge bine', rpNone: 'Încă sunt puține date – să joace câteva runde!', rpMist: 'Sarcini de exersat: {n}', rpStreak: 'Serie: {n} zile'
    },
    en: {
      recForYou: '⭐ Recommended for you', grade: 'Which school year are you in?', gradeN0: 'Pre-school', gradeN1: 'Year 1', gradeN2: 'Year 2', gradeN3: 'Year 3', gradeN4: 'Year 4', check: '✔ Done',
      mistakesBtn: '🎯 Practise your mistakes', mistakesTitle: 'Practise your mistakes', mistakesDesc: 'The tasks you got wrong, again',
      mistakeFixed: 'Now you know it! It’s off your practice list. ✨',
      lvlUp: '🎉 Well done! From now on you play a harder level: {l}', lvlDown: '🐢 The next round will be a bit easier: {l}',
      dailyT: '🎯 Today’s mission', dailyDone: '✅ Done! A new mission awaits tomorrow.', dailyToast: '🎯 Today’s mission complete! +{n} ⭐',
      streakN: '🔥 {n} days', streakToast: '🔥 {n} days in a row! Keep it up!',
      mSolve: 'Solve {n} tasks!', mStars: 'Collect {n} stars!', mGames: 'Play {n} different games!',
      mPerfect: 'Get a perfect round!', mStory: 'Write a story in the Story Maker!', mMath: 'Play a maths round!', mLang: 'Play a language round!',
      sAutoLvl: 'Automatic difficulty', sAutoLvlNote: 'If a game goes very well, the next round is harder; if it is hard, easier.',
      sLimit: '⏳ Daily play time', sLimitNote: 'Per player, per day. When it runs out, the owl kindly says goodbye; a parent can extend it.', limitOff: 'Off',
      limitLeft: '⏳ {n} min', limitT: 'That’s all for today, {n}! 🌙', limitText: 'You did great! Have a little rest – new adventures await tomorrow.',
      limitMore: '🔒 Parent: +15 minutes', limitGate: 'Parent approval: what is {a} × {b}?', limitAdded: '+15 minutes – have fun!',
      rpTitle: '📈 Progress', rpWeek: 'Last 7 days: {m} minutes of play, on {d} days.', rpSubj: 'Accuracy by subject (30 days)',
      rpWeak: 'Worth practising', rpGood: 'Going well', rpNone: 'Not enough data yet – play a few rounds!', rpMist: 'Tasks to practise: {n}', rpStreak: 'Streak: {n} days'
    }
  });

  const me = () => S.current();
  const settings = () => S.settings();

  /* =================== Gyakorold a hibáidat =================== */
  const MKEYS = ['type', 'prompt', 'big', 'options', 'answer', 'speak', 'items', 'optionLabels', 'unit', 'cols', 'explain', 'hint', 'fixed', 'accept', 'numeric', 'autoSpeak', 'placeholder'];
  const mKey = tk => tk.prompt + '|' + (tk.big || '') + '|' + JSON.stringify(tk.answer);
  const myMistakes = p => (p.mistakes || []).filter(m => m.lang === GJ.lang());

  function saveMistake(r) {
    const p = me(); if (!p || r.mode === 'hibak' || r.task.__m || String(r.game.id).startsWith('sajat-')) return;
    if (GJ.taskTypes && GJ.taskTypes[r.task.type]) return;   // pl. betűírás – ezt nem tesszük a gyakorlandók közé
    r.task.__m = true;
    const task = {}; MKEYS.forEach(k => { if (r.task[k] !== undefined) task[k] = r.task[k]; });
    const k = mKey(task);
    S.update(p.id, x => {
      x.mistakes = (x.mistakes || []).filter(m => m.k !== k);
      x.mistakes.unshift({ k, gid: r.game.id, subject: r.game.subject, lang: GJ.lang(), task, at: Date.now() });
      x.mistakes = x.mistakes.slice(0, 40);
    });
  }
  function dropMistake(k) {
    const p = me(); if (!p) return false;
    let found = false;
    S.update(p.id, x => { const n = (x.mistakes || []).length; x.mistakes = (x.mistakes || []).filter(m => m.k !== k); found = x.mistakes.length !== n; });
    return found;
  }
  A.on('taskWrong', r => saveMistake(r));
  A.on('taskDone', (r, first) => {
    if (!first) return;
    const k = mKey(r.task);
    if (dropMistake(k) && r.mode === 'hibak') setTimeout(() => GJ.toast(t('mistakeFixed')), 500);
  });

  const HIBAK = () => {
    const p = me(), list = p ? myMistakes(p) : [];
    return {
      id: 'hibak', subject: (list[0] && list[0].subject) || 'matek', icon: '🎯',
      get title() { return t('mistakesTitle'); }, get desc() { return t('mistakesDesc'); },
      make() { const m = list[0]; return m ? Object.assign({}, m.task) : null; }
    };
  };
  const findGame0 = GJ.findGame;
  GJ.findGame = id => (id === 'hibak' ? HIBAK() : findGame0(id));

  A.on('roundStart', (r, game) => {
    if (game.id !== 'hibak') return;
    const p = me();
    const list = shuffle(myMistakes(p)).slice(0, Math.max(3, Math.min(10, S.settings().roundLen + 2)));
    r.mode = 'hibak';
    r.queue = list.map(m => Object.assign({}, m.task, { __gid: m.gid }));
    r.total = r.queue.length;
    if (!r.total) setTimeout(() => A.go('home'), 0);
  });

  A.on('homeButtons', p => {
    const n = myMistakes(p).length;
    return n ? `<button class="big-btn orange" data-go="play" data-arg="hibak">${t('mistakesBtn')} <small>${n}</small></button>` : '';
  });

  /* =================== Automatikus nehézség =================== */
  function autoLevel(r) {
    if (settings().autoLevel === false || r.queue || r.story || !r.game || String(r.game.id).startsWith('sajat-') || !r.total) return '';
    const p = me(); if (!p) return '';
    const gid = r.game.id, ratio = r.firstTry / r.total;
    let msg = '';
    S.update(p.id, x => {
      const d = x.diff[gid] || { level: r.level, timed: !!r.timedAll };
      const h = (d.h || []).concat([Math.round(ratio * 100) / 100]).slice(-3);
      let lv = d.level || r.level;
      const prev = h.length >= 2 ? h[h.length - 2] : 0;
      if ((ratio === 1 || (ratio >= 0.8 && prev >= 0.8)) && lv < 3) { lv++; msg = t('lvlUp', { l: t('lvl' + lv) }); d.h = []; }
      else if (ratio < 0.4 && h.length >= 2 && h[h.length - 2] < 0.5 && lv > 1) { lv--; msg = t('lvlDown', { l: t('lvl' + lv) }); d.h = []; }
      else d.h = h;
      d.level = lv; x.diff[gid] = d;
    });
    return msg ? `<p class="lvl-note pop">${esc(msg)}</p>` : '';
  }

  /* =================== Kimutatáshoz: körnapló =================== */
  function logRound(r) {
    const p = me(); if (!p || !r.game || !r.total) return;
    S.update(p.id, x => {
      x.log = (x.log || []).concat([{ d: today(), g: r.game.id, s: r.game.subject, c: r.correct, t: r.total, f: r.firstTry,
        ms: r.t0 ? Math.min(3600000, Date.now() - r.t0) : 0 }]).slice(-300);
    });
  }

  /* =================== Napi küldetés + sorozat =================== */
  const MISSIONS = [
    { id: 'solve', n: [6, 8, 10, 12, 12] }, { id: 'stars', n: [10, 14, 18, 22, 25] }, { id: 'games', n: [2, 2, 3, 3, 3] },
    { id: 'perfect', n: [1, 1, 1, 1, 1] }, { id: 'story', n: [1, 1, 1, 1, 1] }, { id: 'math', n: [1, 1, 1, 1, 1] }, { id: 'lang', n: [1, 1, 1, 1, 1] }
  ];
  const MTEXT = { solve: 'mSolve', stars: 'mStars', games: 'mGames', perfect: 'mPerfect', story: 'mStory', math: 'mMath', lang: 'mLang' };
  const REWARD = 5;
  function hash(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  function daily(p) {
    const d = today();
    if (p.daily && p.daily.date === d) return p.daily;
    const m = MISSIONS[hash(d + p.id) % MISSIONS.length];
    return { date: d, id: m.id, n: m.n[Math.min(4, GJ.gradeOf(p))], prog: 0, done: false, games: [] };
  }
  GJ.dailyOf = p => daily(p);   // más modulok (pl. adventi naptár) is látják, kész-e a mai küldetés
  const streakNow = p => { const s = p.streak; return s && (s.last === today() || s.last === daysAgo(1)) ? s.n : 0; };

  function progress(fn) {
    const p0 = me(); if (!p0) return;
    let completed = false, streakN = 0;
    S.update(p0.id, x => {
      const dl = daily(x);
      if (dl.done) { x.daily = dl; return; }
      fn(dl);
      if (dl.prog >= dl.n) {
        dl.done = true; completed = true;
        const st = x.streak || { n: 0, last: null };
        if (st.last !== today()) { st.n = st.last === daysAgo(1) ? st.n + 1 : 1; st.last = today(); }
        x.streak = st; streakN = st.n;
      }
      x.daily = dl;
    });
    if (completed) {
      setTimeout(() => {
        A.addStars(REWARD, 0);
        GJ.toast(t('dailyToast', { n: REWARD }) + (streakN > 1 ? ' ' + t('streakToast', { n: streakN }) : ''));
        GJ.sfx('fanfare'); GJ.confetti(innerWidth / 2, innerHeight / 3, 100);
      }, 1200);
    }
  }
  A.on('stars', (n, solved) => {
    progress(dl => {
      if (dl.id === 'solve') dl.prog += solved;
      if (dl.id === 'stars') dl.prog += n;
    });
  });
  function missionRound(r, aw) {
    progress(dl => {
      if (dl.id === 'games' && r.game && !dl.games.includes(r.game.id)) { dl.games.push(r.game.id); dl.prog = dl.games.length; }
      if (dl.id === 'perfect' && aw && aw.perfect) dl.prog = 1;
      if (dl.id === 'story' && r.story) dl.prog = 1;
      if (dl.id === 'math' && r.game && r.game.subject === 'matek' && !r.queue) dl.prog = 1;
      if (dl.id === 'lang' && r.game && r.game.subject === 'nyelvtan' && !r.queue) dl.prog = 1;
    });
  }

  A.on('homeTop', p => {
    const dl = daily(p), sn = streakNow(p), lim = limitLeftMin(p);
    const pct = Math.min(100, Math.round(dl.prog / dl.n * 100));
    return `<div class="daily-card ${dl.done ? 'done' : ''}">
      <div class="dl-head"><b>${t('dailyT')}</b>
        <span class="dl-pills">${sn ? `<span class="pill streak">${t('streakN', { n: sn })}</span>` : ''}${lim != null ? `<span class="pill limit">${t('limitLeft', { n: lim })}</span>` : ''}</span></div>
      ${dl.done ? `<div class="dl-text">${t('dailyDone')}</div>`
        : `<div class="dl-text">${esc(t(MTEXT[dl.id], { n: dl.n }))} <small>+${REWARD} ⭐</small></div>
           <div class="dl-bar"><i style="width:${pct}%"></i><span>${Math.min(dl.prog, dl.n)} / ${dl.n}</span></div>`}
    </div>`;
  });

  /* =================== Kör vége: minden együtt =================== */
  A.on('roundEnd', (r, aw) => {
    logRound(r);
    const note = autoLevel(r);
    missionRound(r, aw);
    return note;
  });

  /* =================== Játékidő mérése + időkorlát =================== */
  const NOCOUNT = ['profiles', 'parent', 'parentGate', 'editProfile', 'limit'];
  const TICK = 15;
  setInterval(() => {
    const p = me();
    if (!p || document.visibilityState !== 'visible' || NOCOUNT.includes(A.cur.name)) return;
    const d = today();
    S.update(p.id, x => {
      x.usage = x.usage || {};
      x.usage[d] = (x.usage[d] || 0) + TICK;
      const keys = Object.keys(x.usage).sort(); while (keys.length > 60) delete x.usage[keys.shift()];
    });
  }, TICK * 1000);

  function limitLeftMin(p) {
    const lim = +settings().timeLimit || 0; if (!lim || !p) return null;
    const ex = settings().limitExtra || {};
    const extra = ex.date === today() && ex.pid === p.id ? ex.min : 0;
    const used = ((p.usage || {})[today()] || 0) / 60;
    return Math.max(0, Math.ceil(lim + extra - used));
  }
  A.on('gate', () => {
    const p = me(); const left = limitLeftMin(p);
    if (left === 0) { A.go('limit'); return true; }
    return false;
  });
  // a Kezdőlapról / tantárgyból is ide visz, ha letelt
  ['subject', 'setup'].forEach(name => {
    const orig = A.screens[name];
    A.screens[name] = arg => (limitLeftMin(me()) === 0 ? A.go('limit') : orig(arg));
  });

  let gateAns = 0;
  A.screens.limit = () => {
    const p = me(); if (!p) return A.go('profiles');
    A.render(`<div class="screen narrow center result">
      <div class="trophy bob">${A.imgTag(GJ.MASCOT.hello, 'trophy-img')}</div>
      <h2 class="title">${esc(t('limitT', { n: p.name }))}</h2>
      <p class="lead">${t('limitText')}</p>
      <div class="row-btns">
        <button class="big-btn blue" data-go="profiles">${A.ico(t('switchPlayer'))}</button>
        <button class="big-btn yellow" data-act="limitMore">${A.ico(t('limitMore'))}</button>
      </div></div>`);
  };
  A.actions.limitMore = () => {
    const a = GJ.u.rand(11, 19), b = GJ.u.rand(3, 9); gateAns = a * b;
    A.modal(`<p>${t('limitGate', { a, b })}</p><input name="ans" class="txt" type="number" inputmode="numeric">
      <div class="row-btns"><button class="big-btn green small" data-m="ok">OK</button><button class="big-btn blue small" data-m="no">✖</button></div>`, (m, v) => {
      if (m !== 'ok' || +v.ans !== gateAns) return;
      const p = me(), s = settings(), ex = s.limitExtra || {};
      s.limitExtra = { date: today(), pid: p.id, min: (ex.date === today() && ex.pid === p.id ? ex.min : 0) + 15 };
      S.saveSettings(s); GJ.toast(t('limitAdded')); A.go('home');
    });
  };

  /* =================== Beállítások =================== */
  A.on('settings', s => `
    <div class="set-row"><span>${t('sAutoLvl')}<br><small class="muted">${t('sAutoLvlNote')}</small></span>
      <button class="toggle ${s.autoLevel !== false ? 'on' : ''}" data-act="toggleAutoLvl"><i></i></button></div>
    <div class="set-row wrap"><span>${t('sLimit')}<br><small class="muted">${t('sLimitNote')}</small></span>
      <div class="chips">${[0, 10, 15, 20, 30, 45, 60].map(n => `<button class="chip ${(+s.timeLimit || 0) === n ? 'on' : ''}" data-act="setLimit" data-v="${n}">${n ? n + ' min' : t('limitOff')}</button>`).join('')}</div></div>`);
  A.actions.toggleAutoLvl = b => { const s = settings(); s.autoLevel = s.autoLevel === false; S.saveSettings(s); b.classList.toggle('on', s.autoLevel); };
  A.actions.setLimit = b => {
    const s = settings(); s.timeLimit = +b.dataset.v; S.saveSettings(s);
    b.parentElement.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
  };

  /* =================== Fejlődési kimutatás (Szülői sarok → Játékosok) =================== */
  A.on('playerReport', p => {
    const usage = p.usage || {}, log = p.log || [];
    let sec = 0, days = 0;
    for (let i = 0; i < 7; i++) { const u = usage[daysAgo(i)] || 0; sec += u; if (u >= 30) days++; }
    const since = daysAgo(30), recent = log.filter(e => e.d >= since);
    if (!recent.length && !sec) return `<div class="report"><b>${t('rpTitle')}</b><p class="muted">${t('rpNone')}</p></div>`;
    const bySubj = {}, byGame = {};
    recent.forEach(e => {
      const a = bySubj[e.s] = bySubj[e.s] || { c: 0, t: 0 }; a.c += e.f; a.t += e.t;
      const g = byGame[e.g] = byGame[e.g] || { c: 0, t: 0, n: 0 }; g.c += e.f; g.t += e.t; g.n++;
    });
    const bar = (lbl, c, tt) => { const pc = tt ? Math.round(c / tt * 100) : 0;
      return `<div class="rp-bar"><span>${lbl}</span><div><i style="width:${pc}%" class="${pc < 60 ? 'low' : pc < 80 ? 'mid' : 'hi'}"></i></div><b>${pc}%</b></div>`; };
    const gname = id => { const g = GJ.findGame(id); return g ? `${g.icon} ${esc(GJ.L(g.title))}` : esc(id); };
    const games = Object.entries(byGame).filter(([id, g]) => g.n >= 2 && id !== 'hibak' && id !== 'mesekeszito').map(([id, g]) => ({ id, pc: g.c / g.t }));
    const weak = games.filter(g => g.pc < 0.7).sort((a, b) => a.pc - b.pc).slice(0, 3);
    const good = games.filter(g => g.pc >= 0.9).sort((a, b) => b.pc - a.pc).slice(0, 3);
    const mist = (p.mistakes || []).length, sn = streakNow(p);
    return `<div class="report"><b>${t('rpTitle')}</b>
      <p>${t('rpWeek', { m: Math.round(sec / 60), d: days })}${sn ? ' · ' + t('rpStreak', { n: sn }) : ''}${mist ? ' · ' + t('rpMist', { n: mist }) : ''}</p>
      ${Object.keys(bySubj).length ? `<p class="lbl">${t('rpSubj')}</p>${Object.entries(bySubj).map(([sid, a]) => bar((GJ.SUBJECTS[sid] ? GJ.SUBJECTS[sid].icon + ' ' + GJ.SUBJECTS[sid].title : sid), a.c, a.t)).join('')}` : ''}
      ${weak.length ? `<p class="lbl">${t('rpWeak')}</p><p>${weak.map(g => `${gname(g.id)} <small>(${Math.round(g.pc * 100)}%)</small>`).join(' · ')}</p>` : ''}
      ${good.length ? `<p class="lbl">${t('rpGood')}</p><p>${good.map(g => `${gname(g.id)} <small>(${Math.round(g.pc * 100)}%)</small>`).join(' · ')}</p>` : ''}
    </div>`;
  });
});
