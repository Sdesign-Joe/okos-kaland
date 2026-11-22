/* Okos Kaland – képernyők, játékmenet, mesekészítő */
(function () {
  'use strict';
  const { esc, pick, rand } = GJ.u;
  const S = GJ.store, t = GJ.t, L = GJ.L;
  const app = document.getElementById('app');
  const layer = document.getElementById('layer');

  const AVATARS = ['🦄', '🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🐸', '🦁', '🐯', '🐧', '🦉', '🐻', '🐵', '🐞', '🦋'];
  const COLORS = ['#ff6fa8', '#ffa94d', '#fcc419', '#51cf66', '#339af0', '#845ef7', '#e64980', '#20c997'];
  const LOCALE = { hu: 'hu-HU', ro: 'ro-RO', en: 'en-GB' };
  const TIME = { 1: 30, 2: 20, 3: 15 };          // másodperc időre megoldandó feladatnál, szintenként
  const LVL_EMOJI = ['🐢', '🐰', '🦁'];

  /* Rajzolt képek (Higgsfield) – ha egy játéknak nincs képe, az emoji látszik */
  const imgTag = (src, cls) => `<img class="${cls}" src="${src}" alt="" draggable="false">`;
  const gIcon = g => (g.img ? imgTag(g.img, 'gi-img') : g.icon);
  const mascot = mood => imgTag(GJ.MASCOT[mood], 'mascot-img');

  /* Gombok ikonjai: a feliratban lévő emojit rajzolt képre cseréli.
     Ha a kép még nincs meg (vagy nem töltődik be), az emoji marad. */
  const BTN_ICON = {
    '🏅': 'img/ui/btn-album.webp', '📚': 'img/ui/btn-books.webp', '👥': 'img/ui/btn-players.webp',
    '🔁': 'img/ui/btn-replay.webp', '🎮': 'img/ui/btn-games.webp', '🏠': 'img/ui/btn-home.webp',
    '🔒': 'img/ui/btn-lock.webp', '🔊': 'img/ui/btn-speaker.webp', '⏱️': 'img/ui/btn-timer.webp',
    '➕': 'img/ui/btn-plus.webp', '🚀': 'img/stickers/raketa.webp', '📖': 'img/ui/g-mesekeszito.webp'
  };
  const ico = s => {
    for (const [e, src] of Object.entries(BTN_ICON)) {
      if (s.includes(e)) s = s.replace(e, `<img class="btn-ico" src="${src}" alt="" draggable="false" onerror="this.outerHTML='${e}'">`);
    }
    return s;
  };

  let round = null;      // futó játékkör
  let story = null;      // futó mese
  let book = null;       // éppen megnyitott mesekönyv
  let form = null;       // profil űrlap
  let setup = null;      // nehézségválasztó állapota
  let gateAnswer = 0, parentOk = false;
  let installEvt = null;
  /* Eszközfelismerés a telepítéshez (iPadOS asztali Macnek mutatja magát, ezért az érintéspontokat is nézzük) */
  const ua = navigator.userAgent || '';
  const IS_IOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const IS_ANDROID = /Android/.test(ua);
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  // gomb akkor látszik, ha a böngésző felajánlja a telepítést, vagy mobilon kézi útmutatót tudunk adni
  const IS_FIREFOX = /Firefox\//.test(ua), IS_SAMSUNG = /SamsungBrowser/.test(ua);
  const IS_MAC_SAFARI = !IS_IOS && /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua);
  /** milyen eszköz / böngésző – ehhez igazítjuk a telepítési útmutatót */
  const deviceKind = () => isStandalone() ? 'installed' : IS_IOS ? 'ios' : IS_ANDROID ? (IS_SAMSUNG ? 'samsung' : 'android')
    : IS_FIREFOX ? 'firefox' : IS_MAC_SAFARI ? 'macSafari' : 'desktop';
  // a gomb minden eszközön látszik (weboldalként megnyitva), amíg nincs telepítve; ahol nincs automatikus ajánlat, útmutatót ad
  const canInstall = () => !!installEvt || (!isStandalone() && location.protocol.startsWith('http'));
  const installGuide = () => { const k = deviceKind(); return `<p class="lbl">${t('instHere', { d: t('dev_' + k) })}</p><div class="inst-steps">${t('inst_' + k)}</div>`; };
  let fbStars = 0;          // visszajelzés csillagai   // a böngésző telepítési ajánlata (PWA)
  let timer = null;
  let cur = { name: 'profiles' };

  /* ---------- Bővítési pontok (js/features/*.js modulokhoz) ---------- */
  const H = {};
  const hook = (name, ...a) => (H[name] || []).map(f => {
    try { return f(...a); } catch (e) { console.warn('hook hiba:', name, e); return null; }
  }).filter(x => x != null && x !== false && x !== '');

  const me = () => S.current();
  const gTitle = g => L(g.title), gDesc = g => L(g.desc);
  function render(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function go(name, arg) {
    stopTimer();
    if (name !== 'play') round = null;
    if (name !== 'story') story = null;
    cur = { name, arg };
    screens[name](arg);
  }

  /* ---------- Nyelvváltó ---------- */
  const langSwitch = () => `<div class="langs">${GJ.LANGS.map(l =>
    `<button class="lang-btn ${l.id === GJ.lang() ? 'on' : ''}" data-act="setLang" data-v="${l.id}" title="${l.name}" aria-label="${l.name}">${GJ.flag(l.id)}<span>${l.id.toUpperCase()}</span></button>`).join('')}</div>`;

  /* ---------- Csillagok + rangváltás ---------- */
  function addStars(n, solved) {
    const p0 = me(); if (!p0) return null;
    const before = GJ.rankFor(p0.stars).cur;
    const p = S.update(p0.id, p => { p.stars += n; p.solved = (p.solved || 0) + (solved || 0); });
    hook('stars', n, solved || 0);
    const after = GJ.rankFor(p.stars).cur;
    if (after.min !== before.min) setTimeout(() => { GJ.toast(t('rankToast', { r: `${after.e} ${after.n}` })); GJ.sfx('sticker'); }, 900);
    return p;
  }

  /* ---------- Kör végi jutalom (matrica, bónusz, statisztika) ---------- */
  function award(gid, correct, total, firstTry, always) {
    const p0 = me();
    const perfect = total > 0 && firstTry === total;
    const needed = Math.ceil(total / 2);
    const earned = always || correct >= needed;
    const owned = new Set(p0.stickers);
    const take = rare => {
      let pool = GJ.STICKERS.filter(s => !owned.has(s.id) && s.rare === rare);
      if (!pool.length) pool = GJ.STICKERS.filter(s => !owned.has(s.id));
      if (!pool.length) return null;
      const s = pick(pool); owned.add(s.id); return s;
    };
    const got = [];
    let bonus = perfect ? 3 : 0, allDone = false;
    if (earned) {
      const s1 = take(false); if (s1) got.push(s1); else { bonus += 5; allDone = true; }
      if (perfect) { const s2 = take(true); if (s2) got.push(s2); }
    }
    const p = S.update(p0.id, p => {
      p.stickers = [...owned]; p.stars += bonus;
      const st = p.played[gid] || { rounds: 0, best: 0, total };
      st.rounds++; st.best = Math.max(st.best, correct); st.total = total;
      p.played[gid] = st; p.lastPlayed = Date.now();
    });
    return { perfect, needed, earned, got, bonus, allDone, p };
  }
  const stickersHTML = got => `<div class="sticker-row">${got.map((s, i) =>
    `<div class="sticker-reveal ${s.rare ? 'rare' : ''}" style="animation-delay:${0.4 + i * 0.5}s">
      <div class="sr-e"><img class="sr-img" src="${s.img}" alt=""></div><div class="sr-n">${esc(s.n)}</div>
      <div class="sr-t">${s.rare ? t('rareSticker') : t('newSticker')}</div></div>`).join('')}</div>`;

  /* ---------- Felugró ablak ---------- */
  function modal(html, onClose) {
    layer.innerHTML = `<div class="overlay"><div class="modal pop">${html}</div></div>`;
    const ov = layer.firstElementChild;
    const close = m => {
      const vals = {};
      ov.querySelectorAll('input[name]').forEach(i => { vals[i.name] = i.value.trim(); });
      layer.innerHTML = '';
      onClose && onClose(m, vals);
    };
    ov.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) close(b.dataset.m); });
    ov.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.name) close('ok'); });
    const inp = ov.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 60);
  }
  const closeModal = () => { layer.innerHTML = ''; };

  /* ---------- Időzítő ---------- */
  function startTimer(sec, onEnd) {
    stopTimer();
    const total = sec * 1000, end = Date.now() + total;
    let lastSec = sec;
    timer = setInterval(() => {
      const el = document.getElementById('timer');
      if (!el) { stopTimer(); return; }
      const left = Math.max(0, end - Date.now()), s = Math.ceil(left / 1000);
      el.querySelector('.tm-fill').style.width = (left / total * 100) + '%';
      el.querySelector('.tm-num').textContent = s;
      el.classList.toggle('hurry', s <= 5);
      if (s !== lastSec) { lastSec = s; if (s <= 5 && s > 0) GJ.sfx('tick'); }
      if (left <= 0) { stopTimer(); onEnd(); }
    }, 100);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  const timerHTML = sec => `<div class="timer" id="timer"><div class="tm-fill"></div><span class="tm-num">${sec}</span><span class="tm-ico">⏱️</span></div>`;

  /* ---------- Közös feladat-megjelenítés ---------- */
  const optLabel = (tk, o) => String((tk.optionLabels && tk.optionLabels[o]) || (String(o) + (tk.unit || '')));
  /* Bővíthető feladattípusok: GJ.taskTypes[type] = { html(tk), mount(tk, api), reveal(tk) }
     api.ok(el) = helyes, api.bad() = hibás; a feladat tk.answerLabel-je jelenik meg a „helyes válasz” dobozban. */
  GJ.taskTypes = GJ.taskTypes || {};
  function answersHTML(tk, act) {
    if (GJ.taskTypes[tk.type]) return GJ.taskTypes[tk.type].html(tk);
    if (tk.type === 'input') {
      return `<div class="input-row"><input id="ans-in" class="txt big-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
          ${tk.numeric ? 'inputmode="numeric"' : ''} maxlength="40" placeholder="${esc(tk.placeholder || '…')}">
        <button class="big-btn green small" data-act="inputCheck">${t('check')}</button></div>`;
    }
    if (tk.type === 'order') {
      return `<div class="slots" id="slots">${tk.answer.map((_, i) => `<button class="slot-box" data-act="unslot" data-i="${i}"></button>`).join('')}</div>
        <div class="tiles" id="tiles">${tk.items.map((it, i) => `<button class="tile pop" style="animation-delay:${i * 50}ms" data-act="tile" data-i="${i}">${esc(it.label || it.t)}</button>`).join('')}</div>`;
    }
    const n = tk.options.length, cols = tk.cols || (n === 3 ? 3 : 2);
    return `<div class="answers cols-${cols}">${tk.options.map((o, i) => {
      const lb = optLabel(tk, o);
      return `<button class="ans pop ${/^[<>=.?!]$/.test(lb) ? 'sym' : ''}" style="animation-delay:${i * 60}ms" data-act="${act}" data-i="${i}">${esc(lb)}</button>`;
    }).join('')}</div>`;
  }
  const taskBody = tk => `
    <div class="mascot-row"><div class="mascot">${mascot('think')}</div>
      <div class="bubble"><span>${esc(tk.prompt)}</span><button class="speak" data-act="speak" aria-label="${t('readAloud')}">${ico('🔊')}</button></div></div>
    ${tk.big ? `<div class="task-card pop">${tk.big}</div>` : ''}
    ${tk.hint ? `<p class="hint">${esc(tk.hint)}</p>` : ''}`;
  function revealCorrect(tk) {
    if (GJ.taskTypes[tk.type]) { if (GJ.taskTypes[tk.type].reveal) GJ.taskTypes[tk.type].reveal(tk); return; }
    if (tk.type === 'input') {
      const inp = document.getElementById('ans-in'); if (inp) { inp.value = tk.answer; inp.classList.add('reveal'); inp.disabled = true; }
      return;
    }
    if (tk.type === 'order') {
      const slots = document.querySelectorAll('.slot-box');
      tk.answer.forEach((a, i) => {
        const it = tk.items.find(x => x.t === a);
        slots[i].textContent = it ? (it.label || it.t) : a;
        slots[i].classList.add('reveal');
      });
    } else {
      const i = tk.options.findIndex(o => String(o) === String(tk.answer));
      document.querySelectorAll('.ans')[i]?.classList.add('reveal');
    }
  }
  function revealBox(tk, head, act) {
    const shown = tk.answerLabel != null ? tk.answerLabel : tk.type === 'order' ? tk.answer.join(tk.items[0]?.label ? ', ' : '') : tk.type === 'input' ? tk.answer : optLabel(tk, tk.answer);
    return `<div class="reveal-box">${head ? `<div class="rb-head">${head}</div>` : ''}${t('correctWas')} <b>${esc(shown)}</b><br>${t('nextTime')}
      ${tk.explain ? `<div class="pp-explain">💡 ${esc(tk.explain)}</div>` : ''}
      <button class="big-btn green small" data-act="${act}">${t('next')}</button></div>`;
  }
  function centerOf(el) {
    if (!el) return [innerWidth / 2, innerHeight / 2];
    const b = el.getBoundingClientRect();
    return [b.left + b.width / 2, b.top + b.height / 2];
  }
  function praiseModal(pr, gained, extras, explain, onNext, autoMs) {
    setTimeout(() => {
      modal(`<div class="pp-emoji bounce">${imgTag(GJ.MASCOT.cheer, 'pp-img')}</div>
        <div class="pp-text">${esc(pr.text)} ${pr.e}</div>
        <div class="pp-sub">+${gained} ⭐${extras.map(x => '<br>' + x).join('')}</div>
        ${explain ? `<div class="pp-explain">💡 ${esc(explain)}</div>` : ''}
        <button class="big-btn green" data-m="next">${t('next')}</button>`, onNext);
      if (autoMs && !explain) {
        const shown = layer.firstElementChild;
        setTimeout(() => { if (layer.firstElementChild === shown) { closeModal(); onNext(); } }, autoMs);
      }
    }, 350);
  }

  /* ==================================================================
     KÉPERNYŐK
     ================================================================== */
  const screens = {

    profiles() {
      const ps = S.profiles();
      render(`<div class="screen center">
        <div class="toprow">${langSwitch()}</div>
        <header class="logo">
          <img class="logo-img pop" src="${GJ.logo()}" alt="${esc(t('appName'))}">
          <h1 class="sr-only">${t('appName')}</h1>
          ${GJ.brand().poster ? '' : `<p class="tag">${t('tagline')}</p>`}
        </header>
        <h2 class="title">${ps.length ? t('whoPlays') : t('welcome')}</h2>
        <div class="profile-grid">
          ${ps.map((p, i) => `<button class="profile-card pop" style="--c:${p.color};animation-delay:${i * 70}ms" data-act="pickProfile" data-id="${p.id}">
              <span class="pc-avatar">${GJ.avatarHTML(p.avatar)}</span>
              <span class="pc-name">${esc(p.name)}</span>
              <span class="pc-meta">${t('age', { n: p.age })} · ⭐ ${p.stars}</span>
            </button>`).join('')}
          <button class="profile-card add pop" data-go="editProfile">
            <span class="pc-avatar">${ico('➕')}</span><span class="pc-name">${t('newPlayer')}</span>
          </button>
        </div>
        ${canInstall() ? `<button class="big-btn green small install-btn" data-act="install">${t('install')}</button>` : ''}
        <button class="link-btn" data-go="parentGate">${ico(t('parentCorner'))}</button>
        ${madeBy()}
      </div>`);
    },

    editProfile(id) {
      const p = id ? S.get(id) : null;
      form = { id: id || '', name: p ? p.name : '', age: p ? p.age : 7, grade: p ? GJ.gradeOf(p) : null,
        avatar: p ? p.avatar : pick(AVATARS), color: p ? p.color : pick(COLORS) };
      render(`<div class="screen narrow">
        <div class="topbar">
          <button class="icon-btn" data-go="${id ? 'parent' : 'profiles'}" aria-label="${t('back')}">⬅</button>
          <h2>${p ? t('editPlayer') : t('newPlayer')}</h2>
        </div>
        <div class="card form">
          <div class="preview" id="pf-prev" style="--c:${form.color}"><span id="pf-av">${GJ.avatarHTML(form.avatar)}</span></div>
          <label class="lbl" for="pf-name">${t('yourName')}</label>
          <input id="pf-name" class="txt" maxlength="20" value="${esc(form.name)}" placeholder="${t('namePh')}" autocomplete="off">
          <label class="lbl">${t('howOld')}</label>
          <div class="chips">${[5, 6, 7, 8, 9, 10, 11, 12].map(a =>
            `<button class="chip ${a === form.age ? 'on' : ''}" data-act="pfAge" data-v="${a}">${a}</button>`).join('')}</div>
          <label class="lbl">${t('grade')}</label>
          <div class="chips" id="pf-grades">${[0, 1, 2, 3, 4].map(g =>
            `<button class="chip ${g === (form.grade == null ? GJ.gradeForAge(form.age) : form.grade) ? 'on' : ''}" data-act="pfGrade" data-v="${g}">${t('gradeN' + g)}</button>`).join('')}</div>
          <label class="lbl">${t('pickAvatar')}</label>
          <div class="avatars">${AVATARS.map(a =>
            `<button class="av ${a === form.avatar ? 'on' : ''}" data-act="pfAvatar" data-v="${a}">${GJ.avatarHTML(a)}</button>`).join('')}</div>
          <label class="lbl">${t('favColor')}</label>
          <div class="colors">${COLORS.map(c =>
            `<button class="sw ${c === form.color ? 'on' : ''}" style="--c:${c}" data-act="pfColor" data-v="${c}" aria-label="color"></button>`).join('')}</div>
          <p class="err" id="pf-err"></p>
          <button class="big-btn green" data-act="pfSave">${p ? t('save') : t('letsGo')}</button>
        </div>
      </div>`);
      if (!p) setTimeout(() => document.getElementById('pf-name')?.focus(), 50);
    },

    home() {
      const p = me(); if (!p) return go('profiles');
      const rk = GJ.rankFor(p.stars);
      const pct = rk.next ? Math.round((p.stars - rk.cur.min) / (rk.next.min - rk.cur.min) * 100) : 100;
      render(`<div class="screen">
        <div class="toprow"><img class="mini-logo" src="${GJ.brand().title}" alt="${esc(t('appName'))}" data-go="profiles">${langSwitch()}</div>
        <div class="userbar" style="--c:${p.color}">
          <button class="ub-av" data-go="profiles" title="${t('switchPlayer')}">${GJ.avatarHTML(p.avatar)}</button>
          <div class="ub-info"><b>${esc(p.name)}</b><span><img class="rank-mini" src="${rk.cur.img}" alt="">${esc(rk.cur.n)}</span></div>
          <img class="rank-img" src="${rk.cur.img}" alt="${esc(rk.cur.n)}" title="${esc(rk.cur.n)}">
          <div class="pill star">⭐ ${p.stars}</div>
        </div>
        ${rk.next ? `<div class="rankbar"><div class="rb-fill" style="width:${pct}%"></div>
          <span>${t('toNextRank', { n: rk.next.min - p.stars, r: `<img class="rank-mini" src="${rk.next.img}" alt="">${esc(rk.next.n)}` })}</span></div>` : ''}
        ${hook('homeTop', p).join('')}
        <div class="mascot-row"><div class="mascot bob">${hook('homeMascot', p)[0] || mascot('hello')}</div><div class="bubble">${esc(t('greet', { n: p.name }))}</div></div>
        <div class="subject-grid">
          ${Object.values(GJ.SUBJECTS).map((s, i) => `<button class="subject-card s-${s.id} pop" style="animation-delay:${i * 90}ms" data-go="subject" data-arg="${s.id}">
              <span class="sc-icon">${imgTag(s.img, 'sc-img')}</span>
              <span class="sc-title">${s.title}</span>
              <span class="sc-desc">${s.desc}</span>
              <span class="sc-count">${t('gamesN', { n: GJ.gamesFor(s.id).length })}</span>
            </button>`).join('')}
        </div>
        <div class="row-btns">
          ${hook('homeButtons', p).join('')}
          <button class="big-btn yellow" data-go="album">${ico(t('myStickers'))} <small>${p.stickers.length}/${GJ.STICKERS.length}</small></button>
          <button class="big-btn pink" data-go="library">${ico(t('stLibrary'))} <small>${p.stories.length}</small></button>
          <button class="big-btn blue" data-go="profiles">${ico(t('switchPlayer'))}</button>
        </div>
      </div>`);
    },

    subject(sid) {
      const p = me(); if (!p) return go('profiles');
      const s = GJ.SUBJECTS[sid]; if (!s) return go('home');
      const games = GJ.gamesFor(sid).map((g, i) => ({ g, i, rec: GJ.isRecommended(g, p) }))
        .sort((a, b) => (b.rec - a.rec) || (a.i - b.i)).map(x => x.g);
      render(`<div class="screen s-${sid}">
        <div class="topbar">
          <button class="icon-btn" data-go="home" aria-label="${t('back')}">⬅</button>
          <h2>${s.icon} ${s.title}</h2>
          <div class="pill star">⭐ ${p.stars}</div>
        </div>
        <div class="game-grid">
          ${games.map((g, i) => {
            const st = p.played[g.id];
            return `<button class="game-card pop ${g.kind === 'story' ? 'featured' : ''}" style="animation-delay:${i * 50}ms" data-go="setup" data-arg="${esc(g.id)}">
              <span class="gc-icon">${gIcon(g)}</span>
              <span class="gc-title">${esc(gTitle(g))}</span>
              <span class="gc-desc">${esc(gDesc(g))}</span>
              ${GJ.isRecommended(g, p) ? `<span class="gc-rec">${t('recForYou')}</span>` : ''}
              ${st ? `<span class="gc-best">${t('best', { b: st.best, t: st.total })}</span>` : `<span class="gc-new">${t('isNew')}</span>`}
            </button>`;
          }).join('')}
        </div>
      </div>`);
    },

    /* --- Nehézségválasztó --- */
    setup(gid) {
      const p = me(); if (!p) return go('profiles');
      const g = GJ.findGame(gid); if (!g) return go('home');
      const rec = GJ.levelForProfile(p), prev = p.diff[gid] || {};
      setup = { gid, level: prev.level || rec, timed: !!prev.timed };
      render(`<div class="screen narrow s-${g.subject}">
        <div class="topbar">
          <button class="icon-btn" data-go="subject" data-arg="${g.subject}" aria-label="${t('back')}">⬅</button>
          <h2>${g.icon} ${esc(gTitle(g))}</h2>
        </div>
        <div class="setup-hero pop"><span class="sh-icon">${gIcon(g)}</span><p>${esc(gDesc(g))}</p></div>
        <h3 class="setup-h">${t('chooseLevel')}</h3>
        <div class="lvl-grid">${[1, 2, 3].map(n => `<button class="lvl lvl${n} ${n === setup.level ? 'on' : ''}" data-act="pickLvl" data-v="${n}">
            <span class="lvl-e">${imgTag(GJ.LEVEL_IMG[n - 1], 'lvl-img')}</span><b>${t('lvl' + n)}</b><small>${t('lvl' + n + 'd')}</small>
            ${n === rec ? `<em>${t('forYou')}</em>` : ''}</button>`).join('')}</div>
        <div class="timed-row">
          <span><b>${t('timed')}</b><small>${t('timedD')}</small></span>
          <button class="toggle ${setup.timed ? 'on' : ''}" data-act="toggleTimed" aria-label="${t('timed')}"><i></i></button>
        </div>
        ${hook('setupBefore', g, p).join('')}
        <button class="big-btn green wide" data-act="startGame">${ico(t('start'))}</button>
        ${hook('setupExtra', g, p).join('')}
        ${g.kind === 'story' ? `<div class="center"><button class="link-btn" data-go="library">${ico(t('stLibrary'))} (${p.stories.length})</button></div>` : ''}
      </div>`);
    },

    /* --- Játékkör --- */
    play(gid) {
      const p = me(); if (!p) return go('profiles');
      const game = GJ.findGame(gid); if (!game) return go('home');
      if (game.kind === 'story') return go('story');
      GJ.track('jatek/' + gid);
      const st = p.diff[gid] || { level: GJ.levelForProfile(p), timed: false };
      const total = Math.min(S.settings().roundLen, game.maxRounds || Infinity);
      round = {
        game, total, idx: 0, correct: 0, firstTry: 0, stars: 0, streak: 0, seen: new Set(),
        level: st.level, timedAll: !!st.timed,
        ctx: { level: st.level, age: p.age, name: p.name },
        startRank: GJ.rankFor(p.stars).cur, t0: Date.now()
      };
      hook('roundStart', round, game);
      nextTask();
    },

    /* --- Mesekészítő --- */
    story() {
      const p = me(); if (!p) return go('profiles');
      const st = p.diff.mesekeszito || { level: GJ.levelForProfile(p), timed: false };
      story = { level: st.level, timedAll: !!st.timed, hero: null, heroes: [], picked: [], friend: null, quest: null, node: null,
        log: [], stars: 0, correct: 0, firstTry: 0, total: 0, startRank: GJ.rankFor(p.stars).cur, t0: Date.now() };
      GJ.track('jatek/mesekeszito');
      goNode('start');
    },

    /* --- Meséim --- */
    library() {
      const p = me(); if (!p) return go('profiles');
      render(`<div class="screen">
        <div class="topbar">
          <button class="icon-btn" data-go="home" aria-label="${t('back')}">⬅</button>
          <h2>${ico(t('stLibrary'))}</h2>
          <button class="big-btn green small" data-go="setup" data-arg="mesekeszito">✏️ ${esc(gTitle(GJ.findGame('mesekeszito')))}</button>
        </div>
        ${p.stories.length ? `<div class="shelf">${p.stories.map((s, i) => `<button class="book-card pop" style="animation-delay:${i * 50}ms" data-go="book" data-arg="${s.id}">
            ${s.img ? `<img class="bk-img" src="${s.img}" alt="">` : `<span class="bk-e">${s.e}</span>`}<span class="bk-t">${esc(s.title)}</span>
            <span class="bk-d">${new Date(s.date).toLocaleDateString(LOCALE[GJ.lang()])}</span></button>`).join('')}</div>`
          : `<div class="card center"><p class="lead">${t('stNone')}</p></div>`}
      </div>`);
    },

    book(id) {
      const p = me(); if (!p) return go('profiles');
      book = p.stories.find(s => s.id === id); if (!book) return go('library');
      render(`<div class="screen narrow">
        <div class="topbar"><button class="icon-btn" data-go="library" aria-label="${t('back')}">⬅</button><h2>📖</h2></div>
        ${bookHTML(book)}
        <div class="row-btns">
          <button class="big-btn blue" data-act="readBook">${ico(t('stRead'))}</button>
          ${hook('bookButtons', book).join('')}
          <button class="big-btn yellow" data-go="library">${ico(t('stLibrary'))}</button>
        </div>
      </div>`);
    },

    album() {
      const p = me(); if (!p) return go('profiles');
      const own = new Set(p.stickers);
      render(`<div class="screen">
        <div class="topbar">
          <button class="icon-btn" data-go="home" aria-label="${t('back')}">⬅</button>
          <h2>${ico(t('myStickers'))}</h2>
          <div class="pill">${own.size}/${GJ.STICKERS.length}</div>
        </div>
        <p class="lead">${t('albumLead')}</p>
        <div class="album">
          ${GJ.STICKERS.map(s => own.has(s.id)
            ? `<div class="stk ${s.rare ? 'rare' : ''}"><img class="stk-img" src="${s.img}" alt=""><small>${esc(s.n)}</small></div>`
            : `<div class="stk locked ${s.rare ? 'rare' : ''}"><span>?</span><small>${s.rare ? t('rareLbl') : '???'}</small></div>`).join('')}
        </div>
      </div>`);
    },

    parentGate() {
      if (parentOk) return go('parent');
      const a = rand(11, 19), b = rand(3, 9);
      gateAnswer = a * b;
      render(`<div class="screen narrow center">
        <div class="topbar"><button class="icon-btn" data-go="${me() ? 'home' : 'profiles'}" aria-label="${t('back')}">⬅</button><h2>${ico(t('parentCorner'))}</h2></div>
        <div class="card form">
          <p>${t('gateText')}</p>
          <div class="eq">${a} × ${b} = ?</div>
          <input id="gate" class="txt" type="number" inputmode="numeric" placeholder="${t('gatePh')}">
          <p class="err" id="gate-err"></p>
          <button class="big-btn blue" data-act="gate">${t('enter')}</button>
        </div>
      </div>`);
      setTimeout(() => document.getElementById('gate')?.focus(), 50);
    },

    parent(tab) {
      if (!parentOk) return go('parentGate');
      tab = tab || 'players';
      const tabs = [['players', t('tPlayers')], ['custom', t('tCustom')], ['settings', t('tSettings')], ['feedback', t('tFeedback')], ['help', t('tHelp')]];
      render(`<div class="screen">
        <div class="topbar">
          <button class="icon-btn" data-act="parentExit" aria-label="${t('back')}">⬅</button>
          <h2>${ico(t('parentCorner'))}</h2>
        </div>
        <div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-go="parent" data-arg="${k}">${n}</button>`).join('')}</div>
        <div class="card panel">${parentTabs[tab]()}</div>
      </div>`);      if (tab === 'settings') ttsStatus();
    }
  };

  /* ---------- Szülői sarok fülei ---------- */
  const parentTabs = {
    players() {
      const ps = S.profiles();
      if (!ps.length) return `<p>${t('noPlayers')}</p><button class="big-btn green small" data-go="editProfile">${t('addPlayer')}</button>`;
      return ps.map(p => {
        const rows = Object.entries(p.played || {}).map(([gid, st]) => {
          const g = GJ.findGame(gid);
          return `<tr><td>${g ? g.icon + ' ' + esc(gTitle(g)) : esc(gid)}</td><td>${st.rounds}</td><td>${st.best}/${st.total}</td></tr>`;
        }).join('');
        const rk = GJ.rankFor(p.stars).cur;
        return `<div class="pp-row" style="--c:${p.color}">
          <div class="pp-head">
            <span class="pp-av">${GJ.avatarHTML(p.avatar)}</span>
            <div><b>${esc(p.name)}</b> · ${t('age', { n: p.age })}<br>
              <small>${t('summary', { s: p.stars, d: p.solved || 0, k: p.stickers.length, m: p.stories.length })} · <img class="rank-mini" src="${rk.img}" alt="">${esc(rk.n)}</small></div>
            <div class="pp-btns">
              <button class="mini-btn" data-go="editProfile" data-arg="${p.id}">${t('edit')}</button>
              <button class="mini-btn red" data-act="delProfile" data-id="${p.id}">${t('del')}</button>
            </div>
          </div>
          ${hook('playerReport', p).join('')}
          ${rows ? `<table class="stats"><thead><tr><th>${t('thGame')}</th><th>${t('thRounds')}</th><th>${t('thBest')}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="muted">${t('notPlayed')}</p>`}
        </div>`;
      }).join('') + `<button class="big-btn green small" data-go="editProfile">${t('addPlayer')}</button>`;
    },

    custom() {
      const list = S.custom();
      return `<p>${t('cIntro')}</p>
        <div class="cform">
          <label>${t('cSubject')}<select id="cf-subj">${Object.values(GJ.SUBJECTS).map(s => `<option value="${s.id}">${s.icon} ${s.title}</option>`).join('')}</select></label>
          <label>${t('cQuestion')}<input id="cf-q" maxlength="160" placeholder="${esc(t('cQPh'))}"></label>
          <label>${t('cEmoji')}<input id="cf-e" maxlength="8" placeholder="🧚"></label>
          <label>${t('cRight')}<input id="cf-a" maxlength="60" placeholder="${esc(t('cRightPh'))}"></label>
          <label>${t('cWrong', { n: 1 })}<input id="cf-w1" maxlength="60" placeholder="${esc(t('cWrongPh'))}"></label>
          <label>${t('cWrong', { n: 2 })}<input id="cf-w2" maxlength="60" placeholder="${t('optional')}"></label>
          <label>${t('cWrong', { n: 3 })}<input id="cf-w3" maxlength="60" placeholder="${t('optional')}"></label>
        </div>
        <p class="err" id="cf-err"></p>
        <button class="big-btn green small" data-act="addCustom">${t('cAdd')}</button>
        <h3>${t('cList', { n: list.length })}</h3>
        ${list.length ? `<ul class="clist">${list.map(c => `<li>
            <span>${GJ.SUBJECTS[c.subject]?.icon || ''} ${c.emoji ? esc(c.emoji) + ' ' : ''}<b>${esc(c.question)}</b><br>
            <small>✅ ${esc(c.answer)} · ❌ ${c.wrong.map(esc).join(', ')}</small></span>
            <button class="mini-btn red" data-act="delCustom" data-id="${c.id}">🗑️</button></li>`).join('')}</ul>`
          : `<p class="muted">${t('cNone')}</p>`}`;
    },

    settings() {
      const s = S.settings();
      return `<div class="set-row"><span>${t('sLang')}</span>${langSwitch()}</div>
        <div class="set-row"><span>${t('sSound')}</span>
          <button class="toggle ${s.sound ? 'on' : ''}" data-act="toggleSet" data-k="sound"><i></i></button></div>
        <div class="set-row"><span>${t('sSpeak')}<br><small class="muted">${t('sSpeakNote')}</small></span>
          <button class="toggle ${s.autoSpeak ? 'on' : ''}" data-act="toggleSet" data-k="autoSpeak"><i></i></button></div>
        <div class="set-row tts-row"><span>${t('sVoice')}<br><small class="muted">${t('sVoiceNote')}</small>
            <span class="tts-bar" id="tts-bar" hidden><i></i></span></span>
          <span class="tts-btns"><button class="mini-btn" data-act="ttsDownload" id="tts-btn" disabled>…</button>
            <button class="link-btn inline tts-del" data-act="ttsRemove" id="tts-del" hidden>${t('ttsRemove')}</button></span></div>
        <div class="set-row"><span>${t('sRound')}</span>
          <div class="chips">${[5, 8, 10, 12].map(n => `<button class="chip ${s.roundLen === n ? 'on' : ''}" data-act="roundLen" data-v="${n}">${n}</button>`).join('')}</div></div>
        ${hook('settings', s).join('')}
        <h3>${t('sFamily')}</h3>
        <p class="muted">${t('sFamilyNote')}</p>
        <div class="family-grid">${Object.keys(GJ.STORY.family).map(k => {
          const h = GJ.STORY.heroes[k];
          return `<label class="fam-row"><img src="${h.img}" alt=""><span>${esc(L(h.label))}</span>
            <input class="txt small" data-fam="${k}" maxlength="20" value="${esc((s.family || {})[k] || '')}" placeholder="${esc(L(h.h))}"></label>`;
        }).join('')}</div>
        <button class="mini-btn" data-act="familySave">${t('sFamilySave')}</button>
        <p class="ok" id="fam-msg"></p>
        <div class="set-row"><span>${t('sStats')}<br><small class="muted">${t('sStatsNote')}</small></span>
          <button class="toggle ${s.stats !== false ? 'on' : ''}" data-act="toggleStats"><i></i></button></div>
        <h3>${t('sApp')}</h3>
        <p class="muted">${t('sAppNote')}</p>
        ${location.protocol.startsWith('http') || isStandalone() ? installGuide() : ''}
        ${installEvt ? `<button class="mini-btn" data-act="install">${t('install')}</button>` : ''}
        <h3>${t('sBackup')}</h3>
        <p class="muted">${t('sBackupNote')}</p>
        <div class="row-btns left">
          <button class="mini-btn" data-act="export">${t('sExport')}</button>
          <label class="mini-btn">${t('sImport')}<input type="file" id="importFile" accept=".json,application/json" hidden></label>
        </div>
        <p class="ok" id="set-msg"></p>`;
    },

    feedback() {
      const C = GJ.CONFIG || {}, ok = C.feedbackForm || C.feedbackEmail;
      return `<h3>${t('tFeedback')}</h3><p>${t('fbIntro')}</p>
        ${ok ? `<p class="lbl">${t('fbRate')}</p>
          <div class="chips" id="fb-rate">${[1, 2, 3, 4, 5].map(n => `<button class="chip" data-act="fbRate" data-v="${n}">${'⭐'.repeat(n)}</button>`).join('')}</div>
          <textarea id="fb-text" class="txt fb-text" maxlength="1500" placeholder="${esc(t('fbPh'))}"></textarea>
          <button class="big-btn green small" data-act="fbSend">${t('fbSend')}</button>
          <p class="muted"><small>${t('fbPrivacy')}</small></p>`
        : `<p class="muted">${t('fbNotSet')}</p>`}`;
    },
    help() {
      return `<h3>${t('hTitle')}</h3>
        <ul class="help">${GJ.tl('hItems').map(x => `<li>${x}</li>`).join('')}</ul>
        <h3>${t('hExtTitle')}</h3><p>${t('hExt')}</p>
        ${madeBy()}`;
    }
  };

  /* ---------- Beépített felolvasó hang: letöltés / állapot ---------- */
  let ttsAsked = false, ttsPct = 0;
  async function ttsStatus() {
    const btn = document.getElementById('tts-btn'); if (!btn || !GJ.tts) return;
    const lang = GJ.lang(), del = document.getElementById('tts-del'), bar = document.getElementById('tts-bar');
    if (!GJ.tts.supported) { btn.textContent = t('ttsNo'); btn.disabled = true; return; }
    if (GJ.tts.isDownloading(lang)) {
      btn.textContent = t('ttsDl', { p: Math.round(ttsPct * 100) }); btn.disabled = true;
      bar.hidden = false; bar.firstElementChild.style.width = Math.round(ttsPct * 100) + '%'; del.hidden = true; return;
    }
    bar.hidden = true;
    const ready = await GJ.tts.isReady(lang);
    if (!ready && await GJ.deviceHasVoice(lang)) { btn.textContent = t('ttsDevice'); btn.disabled = true; del.hidden = true; return; }
    if (ready) { btn.textContent = t('ttsReady'); btn.disabled = true; del.hidden = false; }
    else { btn.textContent = t('ttsGet', { n: await GJ.tts.sizeMB(lang) || 93 }); btn.disabled = false; del.hidden = true; }
  }
  function ttsStart(lang) {
    if (!GJ.tts || GJ.tts.isDownloading(lang)) return;
    ttsPct = 0;
    GJ.toast(t('ttsStarted'));
    const p = GJ.tts.download(lang, x => { ttsPct = x; ttsStatus(); });
    ttsStatus();
    p.then(() => { GJ.toast(t('ttsDone')); GJ.track('felolvaso/' + lang, true); })
      .catch(() => GJ.toast(t('ttsErr'))).then(ttsStatus);
  }
  // ha felolvasnánk, de még nincs letöltve: egyszer (munkamenetenként) megkérdezzük
  GJ.onTtsMissing = lang => {
    if (ttsAsked || layer.innerHTML) return;
    ttsAsked = true;
    const n = 90;   // motor (~30 MB) + hang (~60 MB) – azonnal kérdezünk, nem várunk a méret lekérdezésére
    modal(`<h3>${t('ttsAskT')}</h3><p>${t('ttsAsk', { n })}</p>
      <div class="row-btns"><button class="big-btn green small" data-m="ok">${t('ttsYes')}</button>
      <button class="big-btn blue small" data-m="no">${t('ttsLater')}</button></div>`, m => { if (m === 'ok') ttsStart(lang); });
  };

  /** „Készítette: BimPex” – a logó a bimpex.ro oldalra visz (új lapon) */
  function madeBy() {
    return `<div class="made-by-row"><a class="made-by" href="https://bimpex.ro/" target="_blank" rel="noopener">
        <span>${t('madeBy')}</span><img src="img/bimpex-logo.webp" alt="BimPex" width="480" height="112">
      </a></div>`;
  }

  /* ==================================================================
     JÁTÉKKÖR
     ================================================================== */
  function nextTask() {
    const r = round; if (!r) return;
    if (r.idx >= r.total) return finishRound();
    if (hook('gate', 'task').length) return;
    r.task = r.queue ? r.queue[r.idx] : GJ.makeTask(r.game, r.ctx, r.seen);
    r.tries = 0; r.locked = false; r.placed = [];
    r.timed = !r.task.noTimer && (r.timedAll || r.idx % 4 === 2); // minden körben vannak villámfeladatok
    r.timeSec = TIME[r.level] + (r.task.type === 'order' ? 15 : 0);
    renderTask();
  }

  function renderTask() {
    const r = round, tk = r.task, g = r.game;
    const pct = Math.round(r.idx / r.total * 100);
    render(`<div class="screen play s-${g.subject}">
      <div class="playbar">
        <button class="icon-btn" data-act="quit" aria-label="${t('quit')}">✖</button>
        <div class="progress"><div class="pg-fill" style="width:${pct}%"></div><span>${r.idx + 1} / ${r.total} · ${LVL_EMOJI[r.level - 1]}</span></div>
        <div class="pill star" id="rstars">⭐ ${r.stars}</div>
      </div>
      ${r.timed && !r.timedAll ? `<div class="lightning pop">${t('lightning')}</div>` : ''}
      ${r.timed ? timerHTML(r.timeSec) : ''}
      ${taskBody(tk)}
      ${answersHTML(tk, 'answer')}
      <div class="msg" id="msg" aria-live="polite"></div>
    </div>`);
    if (S.settings().autoSpeak || tk.autoSpeak) GJ.speak(tk.speak || tk.prompt);
    if (tk.type === 'input') setTimeout(() => document.getElementById('ans-in')?.focus(), 80);
    if (GJ.taskTypes[tk.type] && GJ.taskTypes[tk.type].mount) {
      GJ.taskTypes[tk.type].mount(tk, { ok: el => { if (round === r && !r.locked) success(el); }, bad: () => { if (round === r && !r.locked) fail(); }, get locked() { return round !== r || r.locked; } });
    }
    if (r.timed) startTimer(r.timeSec, timeUp);
  }

  function success(el) {
    const r = round; r.locked = true; stopTimer();
    const first = r.tries === 0;
    r.correct++;
    hook('taskDone', r, first);
    if (first) { r.firstTry++; r.streak++; } else r.streak = 0;
    const streakB = first && r.streak > 0 && r.streak % 3 === 0 ? 1 : 0;
    const fastB = r.timed ? 1 : 0;
    const gained = (first ? 2 : 1) + streakB + fastB;
    r.stars += gained;
    const p = addStars(gained, 1);
    GJ.sfx('correct');
    GJ.confetti(...centerOf(el), 60);
    const s = document.getElementById('rstars');
    if (s) { s.textContent = '⭐ ' + r.stars; s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump'); }
    const extras = [];
    if (fastB) extras.push(t('fastBonus'));
    if (streakB) extras.push(t('streakBonus'));
    praiseModal(GJ.praise(p && p.name, first), gained, extras, r.task.explain, () => { r.idx++; nextTask(); }, 1700);
  }

  function fail() {
    const r = round, tk = r.task;
    r.tries++; r.streak = 0;
    hook('taskWrong', r);
    GJ.sfx('wrong');
    const msg = document.getElementById('msg');
    if (r.tries >= (tk.type === 'order' ? 3 : 2)) {
      r.locked = true; stopTimer();
      revealCorrect(tk);
      msg.innerHTML = revealBox(tk, '', 'next');
    } else {
      msg.innerHTML = `<div class="encourage shake">${imgTag(GJ.MASCOT.encourage, 'enc-img')}<span>${esc(GJ.encourage())}</span></div>`;
    }
  }

  function timeUp() {
    const r = round; if (!r || r.locked) return;
    r.locked = true; r.streak = 0;
    hook('taskWrong', r);
    GJ.sfx('timeout');
    revealCorrect(r.task);
    document.getElementById('msg').innerHTML = revealBox(r.task, t('timeUp'), 'next');
  }

  function updateSlots() {
    const r = round, tk = r.task;
    document.querySelectorAll('.slot-box').forEach((s, i) => {
      const it = tk.items[r.placed[i]];
      s.textContent = it ? (it.label || it.t) : '';
      s.classList.toggle('filled', !!it);
    });
    document.querySelectorAll('.tile').forEach((b, i) => {
      const used = r.placed.includes(i);
      b.classList.toggle('used', used); b.disabled = used;
    });
  }

  function checkOrder() {
    const r = round, tk = r.task;
    const slots = document.getElementById('slots');
    if (r.placed.map(i => tk.items[i].t).join('|') === tk.answer.join('|')) {
      slots.classList.add('right'); success(slots);
    } else {
      slots.classList.add('wrong'); fail();
      if (!r.locked) setTimeout(() => {
        if (round !== r || r.locked) return;
        r.placed = []; updateSlots();
        document.getElementById('slots')?.classList.remove('wrong');
      }, 900);
    }
  }

  function finishRound() {
    const r = round; if (!me()) return go('profiles');
    const aw = award(r.game.id, r.correct, r.total, r.firstTry, false);
    const newRank = GJ.rankFor(aw.p.stars).cur;
    const ratio = r.correct / r.total;
    const [mood, title] = aw.perfect ? ['trophy', t('rPerfect')] : ratio >= 0.7 ? ['cheer', t('rGreat')]
      : ratio >= 0.4 ? ['hello', t('rGood')] : ['encourage', t('rTry')];
    const gid = r.game.id, sid = r.game.subject;
    const extra = hook('roundEnd', r, aw).join('');
    round = null;
    render(`<div class="screen center result">
      <div class="trophy bounce">${imgTag(GJ.MASCOT[mood], 'trophy-img')}</div>
      <h2 class="title">${title}</h2>
      <p class="score">${t('correctOf', { c: r.correct, t: r.total })} · ${LVL_EMOJI[r.level - 1]} ${t('lvl' + r.level)}</p>
      <div class="medal-row"><img class="medal-img pop" src="img/ui/medal-${aw.perfect ? 'trophy' : ratio >= 0.7 ? 'gold' : ratio >= 0.4 ? 'silver' : 'star'}.webp" alt="">
        <div class="stars-earned pop">${t('starsPlus', { n: r.stars + aw.bonus })}</div></div>
      ${aw.perfect ? `<p class="perfect">${t('perfectBonus')}</p>` : ''}
      ${newRank.min !== r.startRank.min ? `<p class="rankup pop"><img class="rank-img" src="${newRank.img}" alt="">${t('newRank', { r: newRank.n })}</p>` : ''}
      ${stickersHTML(aw.got)}
      ${!aw.earned ? `<p class="note">${t('needSticker', { n: aw.needed })}</p>` : ''}
      ${aw.allDone ? `<p class="note">${t('allStickers')}</p>` : ''}
      ${extra}
      <div class="row-btns">
        ${r.queue ? '' : `<button class="big-btn green" data-go="play" data-arg="${esc(gid)}">${ico(t('again'))}</button>`}
        <button class="big-btn blue" data-go="${r.queue ? 'home' : 'subject'}" data-arg="${sid}">${ico(t('otherGame'))}</button>
        <button class="big-btn yellow" data-go="home">${ico(t('home'))}</button>
      </div>
    </div>`);
    celebrate(ratio, aw.got.length);
  }
  function celebrate(ratio, stickers) {
    GJ.sfx('fanfare');
    GJ.confetti(innerWidth / 2, innerHeight / 3, 120);
    if (ratio >= 0.7) {
      setTimeout(() => GJ.confetti(innerWidth * 0.25, innerHeight / 2, 60), 500);
      setTimeout(() => GJ.confetti(innerWidth * 0.75, innerHeight / 2, 60), 900);
    }
    if (stickers) setTimeout(() => GJ.sfx('sticker'), 600);
  }

  /* ==================================================================
     MESEKÉSZÍTŐ
     ================================================================== */
  const ST = () => GJ.STORY;
  function heroInfoFor(key) {
    const p = me(), h = ST().heroes[key];
    if (!h) return null;
    if (key === 'me') return { key, e: p.avatar, img: GJ.avatarImg(p.avatar), H: p.name, h: p.name, raw: h };
    // családtag saját névvel (Szülői sarok → Beállítások → Családtagok nevei)
    const custom = (S.settings().family || {})[key];
    if (custom && ST().family[key]) {
      const def = L(h.h), swap = o => ({ [GJ.lang()]: L(o).split(def).join('{h}') });
      return { key, e: h.e, img: h.img || null, H: L(ST().family[key]).replace('{n}', custom), h: custom,
        raw: Object.assign({}, h, { intro: swap(h.intro), trick: swap(h.trick), ending: swap(h.ending) }) };
    }
    return { key, e: h.e, img: h.img || null, H: L(h.H), h: L(h.h), raw: h };
  }
  const heroInfo = () => heroInfoFor(story.hero);           // a főhős
  const team = () => (story.heroes || []).map(heroInfoFor).filter(Boolean); // főhős + csapattagok
  // rövid név; ha két szereplőnek azonos a neve (pl. a két „Tesó”), a címkéjüket használjuk
  function shortName(hi) {
    return team().filter(x => x.h === hi.h).length > 1 ? L(hi.raw.label) : hi.h;
  }
  function namesList() {
    const ns = team().map(shortName), and = L(ST().team.and);
    return ns.length < 2 ? (ns[0] || '') : `${ns.slice(0, -1).join(', ')} ${and} ${ns[ns.length - 1]}`;
  }
  function subFor(hi, x) {
    const fr = story.friend ? ST().friends[story.friend] : null;
    const base = { H: hi ? hi.H : '', h: hi ? shortName(hi) : '', F: fr ? L(fr.F) : '' };
    return x.replace(/\{(H|h|F)\}/g, (m, k) => base[k]);
  }
  function fill(s) {
    const lead = heroInfo(), others = team().slice(1), T = ST().team;
    const fr = story.friend ? ST().friends[story.friend] : null;
    const extra = {
      // mindenki bemutatkozik
      intro: lead ? [subFor(lead, L(lead.raw.intro)),
        ...others.map(o => `${L(T.joins).replace('{H}', o.H)} ${subFor(o, L(o.raw.intro))}`)].join(' ') : '',
      // a döntő pillanatban mindenki beveti a képességét
      trick: lead ? (others.length ? L(T.together) + ' ' : '') +
        [lead, ...others].map(o => subFor(o, L(o.raw.trick))).join(' ') : '',
      help: fr ? subFor(lead, L(fr.help)) : ''
    };
    return subFor(lead, s.replace(/\{(intro|trick|help)\}/g, (m, k) => extra[k]));
  }
  function nodeArt(id, n) {
    const hi = story.hero ? heroInfo() : null;
    if (id === 'intro' && hi) return { e: team().map(x => x.e).join('') + n.e, img: hi.img, imgs: team().map(x => x.img).filter(Boolean) };
    if (id === 'friend2' && story.friend) { const f = ST().friends[story.friend]; return { e: f.e + n.e, img: f.img || null }; }
    return { e: n.e || '📖', img: n.img || null };
  }
  // kép (ha van), különben emoji
  const artHTML = (img, e, cls) => img
    ? `<img class="${cls}-img${img.includes('/scenes/') ? ' wide' : ''}" src="${img}" alt="" loading="lazy">`
    : `<span class="${cls}-art">${e}</span>`;
  function choiceOptions(n) {
    const p = me();
    if (n.choose === 'hero') return Object.entries(ST().heroes).map(([k, h]) =>
      ({ key: k, kind: 'hero', e: k === 'me' ? p.avatar : h.e, img: k === 'me' ? GJ.avatarImg(p.avatar) : h.img,
        label: k === 'me' ? `${L(h.label)} (${p.name})` : (S.settings().family || {})[k] ? `${L(h.label)} (${S.settings().family[k]})` : L(h.label) }));
    if (n.choose === 'quest') return Object.entries(ST().quests).map(([k, q]) => ({ key: k, kind: 'quest', e: q.e, img: q.img, label: L(q.label) }));
    if (n.choose === 'friend') return Object.entries(ST().friends).map(([k, f]) => ({ key: k, kind: 'friend', e: f.e, img: f.img, label: L(f.F) }));
    return n.choose.map(o => ({ kind: 'go', e: o.e, img: o.img, label: L(o.label), go: o.go }));
  }

  function goNode(id) {
    if (!story) return;
    if (hook('gate', 'story').length) return;
    if (id.startsWith('@')) id = story.quest + '_' + id.slice(1);
    const n = ST().nodes[id];
    if (!n) { console.warn('Hiányzó mese-csomópont:', id); return go('home'); }
    story.node = id; story.tries = 0; story.locked = false; story.task = null; story.ready = true;
    const art = nodeArt(id, n);
    story.text = fill(L(n.text)); story.art = art.e; story.img = art.img; story.imgs = art.imgs || null;
    // feladat előtt egy csapattag bátorítja a főhőst (felváltva)
    const others = team().slice(1);
    if (n.task && others.length) {
      const k = story.sup = (story.sup || 0) + 1;
      const sup = ST().team.support[(k - 1) % ST().team.support.length];
      story.text += ' ' + L(sup).replace('{X}', shortName(others[(k - 1) % others.length]));
    }
    if (id !== 'start') story.log.push({ e: story.art, img: story.img, text: story.text });
    if (n.task) {
      const p = me();
      const games = n.task.games.map(GJ.findGame).filter(g => g && (!g.langs || g.langs.includes(GJ.lang())));
      story.task = GJ.taskFrom(pick(games), { level: story.level, age: p.age, name: p.name });
      story.total++;
      story.timed = !!n.task.timed || story.timedAll;
      story.ready = !story.timed; // időre menő feladat előtt „Készen állok!” gomb
    }
    renderStory();
    GJ.sfx('page');
    if (S.settings().autoSpeak) GJ.speak(story.text);
  }

  function renderStory() {
    const n = ST().nodes[story.node];
    let act = '';
    if (n.choose === 'hero') {
      // több szereplő választható; az első a főhős
      act = `<h3 class="sp-q">${esc(L(n.q))} <small>${t('stPickHint', { n: ST().team.max })}</small></h3>
        <div class="story-choices">${choiceOptions(n).map((o, i) => `<button class="choice-card pop" style="animation-delay:${i * 50}ms" data-act="stToggle" data-k="${o.key}">
          <span class="pick-badge"></span>
          ${o.img ? `<img class="cc-img" src="${o.img}" alt="">` : `<span class="cc-e">${o.e}</span>`}<span class="cc-l">${esc(o.label)}</span>
          <span class="lead-tag">${t('stLead')}</span></button>`).join('')}</div>
        <div class="pick-bar" id="pickBar"></div>`;
    } else if (n.choose) {
      act = `<h3 class="sp-q">${esc(L(n.q))} <small>${t('stChooseHint')}</small></h3>
        <div class="story-choices">${choiceOptions(n).map((o, i) => `<button class="choice-card pop" style="animation-delay:${i * 80}ms" data-act="stChoose" data-i="${i}">
          ${o.img ? `<img class="cc-img" src="${o.img}" alt="">` : `<span class="cc-e">${o.e}</span>`}<span class="cc-l">${esc(o.label)}</span></button>`).join('')}</div>`;
    } else if (n.task) {
      act = `<p class="sp-taskhint">${t('stTask')}</p>`;
      if (!story.ready) act += `<div class="center"><button class="big-btn yellow" data-act="stReady">${ico(t('stReady'))}</button></div>`;
      else act += `${story.timed ? timerHTML(TIME[story.level]) : ''}${taskBody(story.task)}${answersHTML(story.task, 'stAnswer')}<div class="msg" id="msg" aria-live="polite"></div>`;
    } else if (n.end) {
      act = `<div class="center"><button class="big-btn yellow" data-act="stFinish">${ico(t('stSeeBook'))}</button></div>`;
    } else {
      act = `<div class="center"><button class="big-btn green" data-act="stNext">${t('next')}</button></div>`;
    }
    render(`<div class="screen story-screen">
      <div class="playbar">
        <button class="icon-btn" data-act="stQuit" aria-label="${t('quit')}">✖</button>
        <div class="story-chip">📖 ${esc(gTitle(GJ.findGame('mesekeszito')))} · ${LVL_EMOJI[story.level - 1]}</div>
        <div class="pill star" id="rstars">⭐ ${story.stars}</div>
      </div>
      <div class="story-page pop">
        <div class="sp-art">${story.imgs && story.imgs.length > 1
          ? `<div class="team-row">${story.imgs.map(src => `<img class="team-img" src="${src}" alt="">`).join('')}</div>`
          : story.img ? `<img class="sp-img${story.img.includes('/scenes/') ? ' wide' : ''}" src="${story.img}" alt="">` : story.art}</div>
        <p class="sp-text">${esc(story.text)}</p>
        <button class="speak" data-act="stSpeak" aria-label="${t('readAloud')}">${ico('🔊')}</button>
      </div>
      <div class="story-act">${act}</div>
    </div>`);
    if (n.task && story.ready && story.timed && !story.locked) startTimer(TIME[story.level], storyTimeUp);
    if (n.choose === 'hero') updatePicks();
  }

  /* A kiválasztott szereplők jelölése újrarajzolás nélkül (hogy ne ugorjon az oldal) */
  function updatePicks() {
    const sel = story.picked;
    document.querySelectorAll('[data-act=stToggle]').forEach(b => {
      const pos = sel.indexOf(b.dataset.k);
      b.classList.toggle('picked', pos >= 0);
      b.classList.toggle('lead', pos === 0);
      b.querySelector('.pick-badge').textContent = pos === 0 ? '⭐' : pos > 0 ? String(pos + 1) : '';
    });
    const bar = document.getElementById('pickBar');
    if (bar) bar.innerHTML = sel.length
      ? `<button class="big-btn green" data-act="stHeroesDone">${esc(t('stPicked', { n: sel.length }))} ➜</button>` : '';
  }

  function storySuccess(el) {
    story.locked = true; stopTimer();
    const first = story.tries === 0;
    story.correct++; if (first) story.firstTry++;
    const fastB = story.timed ? 1 : 0;
    const gained = (first ? 2 : 1) + fastB;
    story.stars += gained;
    const p = addStars(gained, 1);
    GJ.sfx('correct'); GJ.confetti(...centerOf(el), 60);
    const n = ST().nodes[story.node], s = story;
    praiseModal(GJ.praise(p && p.name, first), gained, fastB ? [t('fastBonus')] : [], story.task.explain,
      () => { if (story === s) goNode(n.right); }, 1700);
  }
  function storyFail() {
    story.tries++; GJ.sfx('wrong');
    const msg = document.getElementById('msg');
    if (story.tries >= 2) {
      story.locked = true; stopTimer();
      revealCorrect(story.task);
      msg.innerHTML = revealBox(story.task, '', 'stWrong');
    } else msg.innerHTML = `<div class="encourage shake">${imgTag(GJ.MASCOT.encourage, 'enc-img')}<span>${esc(GJ.encourage())}</span></div>`;
  }
  function storyTimeUp() {
    if (!story || story.locked) return;
    story.locked = true; GJ.sfx('timeout');
    revealCorrect(story.task);
    document.getElementById('msg').innerHTML = revealBox(story.task, t('timeUp'), 'stWrong');
  }

  function finishStory() {
    const p = me(), hi = heroInfo(), tm = team(), multi = tm.length > 1, T = ST().team, q = ST().quests[story.quest];
    let endText = subFor(hi, L(hi.raw.ending));
    if (multi) endText += ' ' + L(T.promise).replace('{names}', namesList());
    const title = multi ? L(T.title).replace('{quest}', L(q.name)).replace('{names}', namesList()) : fill(L(q.title));
    const pages = story.log.concat([{ e: hi.e, img: hi.img, text: endText }]);
    const entry = {
      id: 's' + Date.now().toString(36), title, e: tm.map(x => x.e).join(''), img: hi.img,
      imgs: tm.map(x => x.img).filter(Boolean),
      date: Date.now(), author: p.name, lang: GJ.lang(), pages, closing: L(ST().closing)
    };
    const aw = award('mesekeszito', story.correct, story.total, story.firstTry, true);
    GJ.track('mese-kesz/' + story.quest, true);
    S.update(p.id, x => { x.stories.unshift(entry); x.stories = x.stories.slice(0, 30); });
    const newRank = GJ.rankFor(aw.p.stars).cur, startRank = story.startRank, earnedStars = story.stars + aw.bonus;
    const extra = hook('roundEnd', { game: GJ.findGame('mesekeszito'), correct: story.correct, total: story.total,
      firstTry: story.firstTry, level: story.level, t0: story.t0, story: true }, aw).join('');
    story = null; book = entry;
    render(`<div class="screen narrow center result">
      <div class="trophy bounce">${imgTag(GJ.MASCOT.trophy, 'trophy-img')}</div>
      <h2 class="title">${t('stSaved')}</h2>
      <div class="stars-earned pop">${t('starsPlus', { n: earnedStars })}</div>
      ${aw.perfect ? `<p class="perfect">${t('perfectBonus')}</p>` : ''}
      ${newRank.min !== startRank.min ? `<p class="rankup pop"><img class="rank-img" src="${newRank.img}" alt="">${t('newRank', { r: newRank.n })}</p>` : ''}
      ${stickersHTML(aw.got)}
      ${extra}
      ${bookHTML(entry)}
      <div class="row-btns">
        <button class="big-btn blue" data-act="readBook">${ico(t('stRead'))}</button>
        ${hook('bookButtons', entry).join('')}
        <button class="big-btn green" data-go="setup" data-arg="mesekeszito">${ico(t('stNew'))}</button>
        <button class="big-btn pink" data-go="library">${ico(t('stLibrary'))}</button>
        <button class="big-btn yellow" data-go="home">${ico(t('home'))}</button>
      </div>
    </div>`);
    celebrate(1, aw.got.length);
  }

  function bookHTML(s) {
    return `<article class="book pop">
      <div class="book-cover"><div class="bc-art">${s.imgs && s.imgs.length > 1
        ? `<div class="team-row">${s.imgs.map(src => `<img class="bc-img small" src="${src}" alt="">`).join('')}</div>`
        : s.img ? `<img class="bc-img" src="${s.img}" alt="">` : s.e}</div><h2>${esc(s.title)}</h2>
        <p>${esc(t('stWrittenBy', { n: s.author }))} · ${new Date(s.date).toLocaleDateString(LOCALE[s.lang] || 'hu-HU')}</p></div>
      ${s.pages.map(pg => `<div class="book-page">${artHTML(pg.img, pg.e, 'bp')}<p>${esc(pg.text)}</p></div>`).join('')}
      <p class="book-end">✨ ${esc(s.closing)} ✨</p>
    </article>`;
  }

  /* ==================================================================
     GOMBOK
     ================================================================== */
  const actions = {
    setLang(b) { GJ.setLang(b.dataset.v); GJ.sfx('click'); GJ.track('nyelv/' + b.dataset.v); go(cur.name, cur.arg); },
    pickProfile(b) { S.setCurrent(b.dataset.id); go('home'); },

    pfAge(b) {
      form.age = +b.dataset.v; b.parentElement.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
      if (form.grade == null) document.querySelectorAll('#pf-grades .chip').forEach(x => x.classList.toggle('on', +x.dataset.v === GJ.gradeForAge(form.age)));
    },
    pfGrade(b) { form.grade = +b.dataset.v; b.parentElement.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); },
    pfAvatar(b) {
      form.avatar = b.dataset.v;
      b.parentElement.querySelectorAll('.av').forEach(x => x.classList.toggle('on', x === b));
      const av = document.getElementById('pf-av'); av.innerHTML = GJ.avatarHTML(form.avatar);
      av.classList.remove('bounce'); void av.offsetWidth; av.classList.add('bounce');
    },
    pfColor(b) {
      form.color = b.dataset.v;
      b.parentElement.querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x === b));
      document.getElementById('pf-prev').style.setProperty('--c', form.color);
    },
    pfSave() {
      const name = document.getElementById('pf-name').value.trim();
      if (!name) { document.getElementById('pf-err').textContent = t('nameReq'); return; }
      const data = { name, age: form.age, avatar: form.avatar, color: form.color, grade: form.grade == null ? GJ.gradeForAge(form.age) : form.grade };
      if (form.id) { S.update(form.id, p => Object.assign(p, data)); go('parent', 'players'); }
      else {
        const p = S.add(data); S.setCurrent(p.id);
        GJ.sfx('sticker'); GJ.confetti(innerWidth / 2, innerHeight / 3, 90);
        go('home');
      }
    },

    /* nehézségválasztó */
    pickLvl(b) { setup.level = +b.dataset.v; b.parentElement.querySelectorAll('.lvl').forEach(x => x.classList.toggle('on', x === b)); GJ.sfx('click'); },
    toggleTimed(b) { setup.timed = !setup.timed; b.classList.toggle('on', setup.timed); GJ.sfx('click'); },
    startGame() {
      const p = me(); if (!p || !setup) return;
      S.update(p.id, x => { x.diff[setup.gid] = { level: setup.level, timed: setup.timed }; });
      const g = GJ.findGame(setup.gid);
      go(g && g.kind === 'story' ? 'story' : 'play', setup.gid);
    },

    /* játékkör */
    answer(b) {
      const r = round; if (!r || r.locked) return;
      const tk = r.task, o = tk.options[+b.dataset.i];
      if (String(o) === String(tk.answer)) { b.classList.add('right'); success(b); }
      else { b.classList.add('wrong'); b.disabled = true; fail(); }
    },
    inputCheck() {
      const r = round; if (!r || r.locked) return;
      const inp = document.getElementById('ans-in'); if (!inp) return;
      const norm = x => String(x).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
      const val = norm(inp.value); if (!val) { inp.focus(); return; }
      const ok = [r.task.answer].concat(r.task.accept || []).some(a => norm(a) === val);
      if (ok) { inp.classList.add('right'); success(inp); }
      else { inp.classList.add('wrong'); fail(); if (!r.locked) setTimeout(() => { inp.classList.remove('wrong'); inp.select(); }, 700); }
    },
    tile(b) {
      const r = round; if (!r || r.locked) return;
      const i = +b.dataset.i;
      if (r.placed.includes(i)) return;
      r.placed.push(i); GJ.sfx('click'); updateSlots();
      if (r.placed.length === r.task.answer.length) checkOrder();
    },
    unslot(b) {
      const r = round; if (!r || r.locked) return;
      const i = +b.dataset.i;
      if (i < r.placed.length) { r.placed.splice(i, 1); updateSlots(); }
    },
    speak() { const tk = (round && round.task) || (story && story.task); if (tk) GJ.speak(tk.speak || tk.prompt); },
    next() { const r = round; if (!r) return; r.idx++; nextTask(); },
    quit() {
      const r = round; if (!r) return go('home');
      if (r.idx === 0 && r.tries === 0) return go('subject', r.game.subject);
      stopTimer();
      modal(`<div class="pp-emoji">${imgTag(GJ.MASCOT.think, 'pp-img')}</div><div class="pp-text">${t('quitQ')}</div>
        <div class="pp-sub">${t('starsKept')}</div>
        <div class="row-btns"><button class="big-btn green" data-m="stay">${t('keepPlaying')}</button>
        <button class="big-btn red" data-m="leave">${t('leave')}</button></div>`,
        m => { if (m === 'leave') go('subject', r.game.subject); else if (round === r && !r.locked && r.timed) startTimer(r.timeSec, timeUp); });
    },

    /* mese */
    stNext() { const n = ST().nodes[story.node]; goNode(n.next); },
    stToggle(b) {
      const k = b.dataset.k, sel = story.picked, i = sel.indexOf(k);
      if (i >= 0) { sel.splice(i, 1); GJ.sfx('click'); updatePicks(); return; }
      if (sel.length >= ST().team.max) { GJ.toast(t('stPickHint', { n: ST().team.max })); return; }
      const add = () => { sel.push(k); GJ.sfx('click'); updatePicks(); };
      // testvéreknél rákérdezünk a névre, ha még nincs megadva
      const fam = S.settings().family || {};
      if (ST().askName.includes(k) && !fam[k]) {
        const h = ST().heroes[k];
        modal(`<img class="pp-img" src="${h.img}" alt="">
          <div class="pp-text">${esc(L(h.label))}</div>
          <div class="pp-sub">${t('stAskName')}</div>
          <input class="txt name-input" name="nm" maxlength="20" placeholder="${esc(t('stNamePh'))}" autocomplete="off">
          <div class="row-btns"><button class="big-btn blue" data-m="cancel">${t('cancel')}</button>
          <button class="big-btn green" data-m="ok">${t('stOk')}</button></div>`,
          (m, v) => {
            if (m !== 'ok' || !v.nm) return;
            const s = S.settings(); s.family = Object.assign({}, s.family, { [k]: v.nm }); S.saveSettings(s);
            const lbl = b.querySelector('.cc-l'); if (lbl) lbl.textContent = `${L(h.label)} (${v.nm})`;
            if (!story.picked.includes(k) && story.picked.length < ST().team.max) add();
          });
        return;
      }
      add();
    },
    stHeroesDone() {
      if (!story.picked.length) return;
      story.heroes = story.picked.slice(); story.hero = story.heroes[0];
      GJ.sfx('click'); goNode('intro');
    },
    stChoose(b) {
      const n = ST().nodes[story.node], o = choiceOptions(n)[+b.dataset.i];
      GJ.sfx('click');
      if (o.kind === 'hero') { story.hero = o.key; goNode('intro'); }
      else if (o.kind === 'quest') { story.quest = o.key; goNode(o.key + '_intro'); }
      else if (o.kind === 'friend') { story.friend = o.key; goNode('friend2'); }
      else goNode(o.go);
    },
    stReady() { story.ready = true; renderStory(); },
    stAnswer(b) {
      if (!story || story.locked) return;
      const tk = story.task, o = tk.options[+b.dataset.i];
      if (String(o) === String(tk.answer)) { b.classList.add('right'); storySuccess(b); }
      else { b.classList.add('wrong'); b.disabled = true; storyFail(); }
    },
    stWrong() { goNode(ST().nodes[story.node].wrong); },
    stSpeak() { if (story) GJ.speak(story.text); },
    stFinish() { finishStory(); },
    stQuit() {
      if (!story) return go('home');
      if (story.node === 'start') return go('subject', 'irodalom');
      const s = story; stopTimer();
      modal(`<div class="pp-emoji">${imgTag(GJ.MASCOT.think, 'pp-img')}</div><div class="pp-text">${t('quitQ')}</div>
        <div class="pp-sub">${t('starsKept')}</div>
        <div class="row-btns"><button class="big-btn green" data-m="stay">${t('keepPlaying')}</button>
        <button class="big-btn red" data-m="leave">${t('leave')}</button></div>`,
        m => {
          if (m === 'leave') go('subject', 'irodalom');
          else if (story === s && !s.locked && s.task && s.ready && s.timed) startTimer(TIME[s.level], storyTimeUp);
        });
    },
    readBook() {
      if (!book) return;
      GJ.speak([book.title, ...book.pages.map(p => p.text), book.closing].join(' '));
    },

    /* szülői sarok */
    gate() {
      const v = +document.getElementById('gate').value;
      if (v === gateAnswer) { parentOk = true; go('parent'); }
      else document.getElementById('gate-err').textContent = t('gateWrong');
    },
    parentExit() { parentOk = false; go(me() ? 'home' : 'profiles'); },
    delProfile(b) {
      const p = S.get(b.dataset.id); if (!p) return;
      modal(`<div class="pp-emoji">🗑️</div><div class="pp-text">${esc(t('delQ', { n: p.name }))}</div>
        <div class="pp-sub">${t('delNote')}</div>
        <div class="row-btns"><button class="big-btn blue" data-m="no">${t('cancel')}</button>
        <button class="big-btn red" data-m="yes">${t('delete')}</button></div>`,
        m => { if (m === 'yes') { S.remove(p.id); go('parent', 'players'); } });
    },
    addCustom() {
      const val = id => document.getElementById(id).value.trim();
      const q = val('cf-q'), a = val('cf-a');
      const wrong = [val('cf-w1'), val('cf-w2'), val('cf-w3')].filter(Boolean).filter(w => w !== a);
      const err = document.getElementById('cf-err');
      if (!q || !a) { err.textContent = t('cErrQA'); return; }
      if (!wrong.length) { err.textContent = t('cErrW'); return; }
      const list = S.custom();
      list.push({ id: 'c' + Date.now().toString(36), subject: document.getElementById('cf-subj').value,
        question: q, answer: a, wrong: [...new Set(wrong)], emoji: val('cf-e') });
      S.saveCustom(list);
      go('parent', 'custom');
      GJ.toast(t('cAdded'));
    },
    delCustom(b) { S.saveCustom(S.custom().filter(c => c.id !== b.dataset.id)); go('parent', 'custom'); },
    familySave() {
      const s = S.settings(), fam = {};
      document.querySelectorAll('[data-fam]').forEach(i => { const v = i.value.trim(); if (v) fam[i.dataset.fam] = v; });
      s.family = fam; S.saveSettings(s);
      document.getElementById('fam-msg').textContent = t('sFamilySaved');
      GJ.sfx('correct');
    },
    toggleSet(b) { const s = S.settings(); s[b.dataset.k] = !s[b.dataset.k]; S.saveSettings(s); b.classList.toggle('on', s[b.dataset.k]); },
    roundLen(b) {
      const s = S.settings(); s.roundLen = +b.dataset.v; S.saveSettings(s);
      b.parentElement.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
    },
    ttsDownload() { ttsStart(GJ.lang()); },
    async ttsRemove() { if (GJ.tts) { await GJ.tts.remove(); GJ.toast(t('ttsRemoved')); ttsStatus(); } },
    toggleStats(b) { const s = S.settings(); s.stats = s.stats === false; S.saveSettings(s); b.classList.toggle('on', s.stats); },
    fbRate(b) { fbStars = +b.dataset.v; b.parentElement.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); },
    fbSend() {
      const C = GJ.CONFIG || {}, text = (document.getElementById('fb-text').value || '').trim();
      if (!text && !fbStars) return;
      GJ.track('visszajelzes', true);
      if (C.feedbackForm) { window.open(C.feedbackForm, '_blank'); return; }
      const NL = String.fromCharCode(10);
      const body = (fbStars ? '⭐'.repeat(fbStars) + NL + NL : '') + text + NL + NL + '—' + NL +
        `${t('appName')} · ${GJ.lang().toUpperCase()} · ${new Date().toLocaleDateString()}`;
      const subject = `${t('appName')} – ${t('fbSubject')}`;
      location.href = `mailto:${C.feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      GJ.toast(t('fbThanks'));
    },
    install() {
      if (!installEvt) {
        // nincs automatikus telepítés (iPhone/iPad Safari, egyes Android-böngészők): képes útmutató
        modal(`<img class="pp-img" src="img/icon-192.png" alt="">
          <div class="pp-text">${t('install')}</div>
          ${installGuide()}
          <button class="big-btn green" data-m="ok">${t('stOk')}</button>`);
        return;
      }
      installEvt.prompt();
      installEvt.userChoice.finally(() => { installEvt = null; go(cur.name, cur.arg); });
    },
    export() {
      const data = JSON.stringify(S.exportAll(), null, 2);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      a.download = `okos-kaland-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
  };

  app.addEventListener('click', e => {
    const b = e.target.closest('[data-go],[data-act]');
    if (!b || b.disabled) return;
    if (b.dataset.go) { GJ.sfx('click'); go(b.dataset.go, b.dataset.arg); }
    else if (actions[b.dataset.act]) actions[b.dataset.act](b, e);
  });
  app.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'gate') actions.gate();
    if (e.target.id === 'pf-name') actions.pfSave();
    if (e.target.id === 'ans-in') actions.inputCheck();
  });
  app.addEventListener('change', e => {
    if (e.target.id !== 'importFile' || !e.target.files[0]) return;
    const fr = new FileReader();
    fr.onload = () => {
      const msg = document.getElementById('set-msg');
      try { S.importAll(JSON.parse(fr.result)); msg.textContent = t('sImportOk'); msg.className = 'ok'; }
      catch (err) { msg.textContent = '❌ ' + t('sImportBad'); msg.className = 'err'; }
    };
    fr.readAsText(e.target.files[0]);
  });

  /* ---------- Telepíthető alkalmazás (PWA) ---------- */
  // Offline gyorsítótár – csak weboldalként (http/https) kiszolgálva működik, fájlból megnyitva nem
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker hiba:', err));
  }
  // A böngésző telepítési ajánlatát elmentjük, és saját gombbal kínáljuk fel
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); installEvt = e;
    if (cur.name === 'profiles' || (cur.name === 'parent' && cur.arg === 'settings')) go(cur.name, cur.arg);
  });
  window.addEventListener('appinstalled', () => { installEvt = null; GJ.toast(t('installed')); GJ.track('telepites', true); });

  GJ.app = {
    on: (name, fn) => { (H[name] = H[name] || []).push(fn); },
    go, render, me, modal, closeModal, ico, imgTag, mascot, celebrate, addStars, bookHTML, layer, screens, actions, parentTabs,
    get cur() { return cur; }, get round() { return round; }, get story() { return story; }, get setup() { return setup; }
  };
  (GJ.features || []).forEach(f => { try { f(GJ.app); } catch (e) { console.warn('modul hiba:', e); } });

  // a cím is bekerül, így a GoatCounterben látszik, melyik oldalról jött (GitHub vagy saját aldomain)
  GJ.track('megnyitas/' + GJ.lang() + '/' + (location.hostname || 'helyi'));

  // Kezdőoldal mindig a plakátos „Ki játszik ma?” képernyő, a böngésző nyelvén
  go('profiles');
})();
