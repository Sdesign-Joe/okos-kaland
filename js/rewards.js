/* Okos Kaland – jutalmak: dicséretek, matricák, rangok, hangok, konfetti, felolvasás */
(function () {
  'use strict';
  const { pick } = GJ.u;

  /* ---------- Dicséretek (nyelvenként) ---------- */
  const PRAISE_EMOJI = ['🌟', '👏', '🤩', '🎉', '🥳', '⭐', '💪', '🧠', '🏆', '🌈', '💯', '🎈', '✨', '🪄', '☀️', '🔬', '🎯', '🎩'];
  const PRAISE = {
    hu: ['Szuper vagy!', 'Ügyes vagy!', 'Hű, de okos vagy!', 'Fantasztikus!', 'Bravó!', 'Csillagos ötös!',
      'Ez az!', 'Zseniális!', 'Igazi bajnok vagy!', 'Nagyszerű!', 'Tökéletes!', 'Szép munka!',
      'Hibátlan!', 'Varázslatos!', 'Ragyogó!', 'Ügyes kis tudós!', 'Pontosan így!', 'Le a kalappal!'],
    ro: ['Super!', 'Bravo!', 'Ce minte sclipitoare!', 'Fantastic!', 'Felicitări!', 'Nota 10!',
      'Așa da!', 'Genial!', 'Ești un geniu!', 'Minunat!', 'Perfect!', 'Frumos lucrat!',
      'Fără greșeală!', 'Magic!', 'Strălucit!', 'Mic savant!', 'Exact așa!', 'Jos pălăria!'],
    en: ['Super!', 'Well done!', 'How clever!', 'Fantastic!', 'Bravo!', 'Gold star!',
      "That's it!", 'Brilliant!', "You're a champion!", 'Wonderful!', 'Perfect!', 'Great job!',
      'Flawless!', 'Magical!', 'Dazzling!', 'Little scientist!', 'Spot on!', 'Hats off!']
  };
  const PRAISE_NAMED = {
    hu: ['{n}, ez remek volt!', 'Büszke vagyok rád, {n}!', '{n}, te egy kis zseni vagy!', 'Látod, {n}? Megy ez!', 'Hurrá, {n}! Telitalálat!'],
    ro: ['{n}, a fost minunat!', 'Sunt mândră de tine, {n}!', '{n}, ești un mic geniu!', 'Vezi, {n}? Îți iese!', 'Ura, {n}! Ai nimerit!'],
    en: ['{n}, that was great!', "I'm proud of you, {n}!", "{n}, you're a little genius!", 'See, {n}? You can do it!', 'Hooray, {n}! Bullseye!']
  };
  const PRAISE_RETRY = {
    hu: ['Megvan! Kitartó vagy!', 'Sikerült! Nem adtad fel!', 'Ez az! Másodszorra is ér!', 'Ügyes! A gyakorlás mestert tesz!'],
    ro: ['Ai reușit! Nu ai renunțat!', 'Bravo! Perseverența câștigă!', 'Așa da! Și a doua oară contează!', 'Super! Exercițiul te face mai bun!'],
    en: ['Got it! You kept trying!', "You did it! You didn't give up!", 'Yes! Second time counts too!', 'Nice! Practice makes perfect!']
  };
  const ENCOURAGE = {
    hu: ['Majdnem! Próbáld újra! 🙂', 'Semmi baj, gondold át még egyszer! 🤔', 'Hoppá! Nézd meg még egyszer! 👀',
      'Nem baj, a hibákból tanulunk! 💪', 'Közel jársz! Még egy próba! 🍀'],
    ro: ['Aproape! Mai încearcă! 🙂', 'Nu-i nimic, mai gândește-te o dată! 🤔', 'Hopa! Mai uită-te o dată! 👀',
      'Nu-i bai, din greșeli învățăm! 💪', 'Ești foarte aproape! Încă o dată! 🍀'],
    en: ['Almost! Try again! 🙂', 'No worries, think it over once more! 🤔', 'Oops! Have another look! 👀',
      "That's okay, we learn from mistakes! 💪", 'So close! One more try! 🍀']
  };
  const of = obj => obj[GJ.lang()] || obj.hu;

  let lastPraise = '';
  GJ.praise = function (name, firstTry) {
    if (!firstTry) return { text: pick(of(PRAISE_RETRY)), e: pick(['💪', '🌟', '👍', '🎈']) };
    let res;
    do {
      if (name && Math.random() < 0.3) {
        res = { text: pick(of(PRAISE_NAMED)).replace('{n}', name), e: pick(['💖', '🌟', '🎉', '🦄']) };
      } else {
        const list = of(PRAISE), i = Math.floor(Math.random() * list.length);
        res = { text: list[i], e: PRAISE_EMOJI[i] };
      }
    } while (res.text === lastPraise);
    lastPraise = res.text;
    return res;
  };
  GJ.encourage = () => pick(of(ENCOURAGE));

  /* ---------- Matricák ---------- */
  // név: 'magyar|román|angol'
  GJ.STICKERS = [
    ['cica', '🐱', 'Cica|Pisicuță|Kitten'], ['kutyus', '🐶', 'Kutyus|Cățeluș|Puppy'], ['nyuszi', '🐰', 'Nyuszi|Iepuraș|Bunny'],
    ['roka', '🦊', 'Róka|Vulpe|Fox'], ['panda', '🐼', 'Panda|Panda|Panda'], ['koala', '🐨', 'Koala|Koala|Koala'],
    ['oroszlan', '🦁', 'Oroszlán|Leu|Lion'], ['tigris', '🐯', 'Tigris|Tigru|Tiger'], ['beka', '🐸', 'Béka|Broscuță|Frog'],
    ['teknos', '🐢', 'Teknős|Țestoasă|Turtle'], ['delfin', '🐬', 'Delfin|Delfin|Dolphin'], ['balna', '🐳', 'Bálna|Balenă|Whale'],
    ['pillango', '🦋', 'Pillangó|Fluture|Butterfly'], ['katica', '🐞', 'Katica|Buburuză|Ladybird'], ['meh', '🐝', 'Méhecske|Albinuță|Bee'],
    ['bagoly', '🦉', 'Bagoly|Bufniță|Owl'], ['papagaj', '🦜', 'Papagáj|Papagal|Parrot'], ['flamingo', '🦩', 'Flamingó|Flamingo|Flamingo'],
    ['pingvin', '🐧', 'Pingvin|Pinguin|Penguin'], ['sun', '🦔', 'Sün|Arici|Hedgehog'], ['mokus', '🐿️', 'Mókus|Veveriță|Squirrel'],
    ['zsiraf', '🦒', 'Zsiráf|Girafă|Giraffe'], ['elefant', '🐘', 'Elefánt|Elefant|Elephant'], ['csillag', '⭐', 'Csillag|Stea|Star'],
    ['hold', '🌙', 'Hold|Lună|Moon'], ['nap', '☀️', 'Nap|Soare|Sun'], ['viragok', '🌸', 'Virág|Floare|Blossom'],
    ['napraforgo', '🌻', 'Napraforgó|Floarea-soarelui|Sunflower'], ['tulipan', '🌷', 'Tulipán|Lalea|Tulip'],
    ['gomba', '🍄', 'Gomba|Ciupercă|Mushroom'], ['eper', '🍓', 'Eper|Căpșună|Strawberry'], ['cseresznye', '🍒', 'Cseresznye|Cireșe|Cherries'],
    ['dinnye', '🍉', 'Dinnye|Pepene|Watermelon'], ['muffin', '🧁', 'Muffin|Brioșă|Cupcake'], ['nyaloka', '🍭', 'Nyalóka|Acadea|Lollipop'],
    ['fagyi', '🍦', 'Fagyi|Înghețată|Ice cream'], ['lufi', '🎈', 'Lufi|Balon|Balloon'], ['masni', '🎀', 'Masni|Fundă|Bow'],
    ['maci', '🧸', 'Maci|Ursuleț|Teddy'], ['festek', '🎨', 'Festék|Acuarele|Paints'], ['sarkany', '🪁', 'Papírsárkány|Zmeu|Kite'],
    ['korhinta', '🎠', 'Körhinta|Carusel|Carousel'],
    // Ritka matricák – hibátlan körért
    ['unikornis', '🦄', 'Unikornis|Unicorn|Unicorn', 1], ['korona', '👑', 'Korona|Coroană|Crown', 1],
    ['gyemant', '💎', 'Gyémánt|Diamant|Diamond', 1], ['kastely', '🏰', 'Kastély|Castel|Castle', 1],
    ['szivarvany', '🌈', 'Szivárvány|Curcubeu|Rainbow', 1], ['raketa', '🚀', 'Rakéta|Rachetă|Rocket', 1],
    ['sarkanygyik', '🐉', 'Sárkány|Dragon|Dragon', 1], ['tunder', '🧚', 'Tündér|Zână|Fairy', 1]
  ].map(([id, e, n, rare]) => {
    const [hu, ro, en] = n.split('|');
    return { id, e, img: `img/stickers/${id}.webp`, names: { hu, ro, en }, rare: !!rare, get n() { return GJ.L(this.names); } };
  });

  /* Feladatképek: az emojihoz tartozó rajzolt kép (ha van), különben marad az emoji.
     Új kép felvétele: GJ.PICS['🍌'] = 'img/pics/banan.webp'; */
  GJ.PICS = {};
  GJ.STICKERS.forEach(s => { GJ.PICS[s.e] = s.img; });
  Object.assign(GJ.PICS, {
    '🐕': 'img/stickers/kutyus.webp', '🐻': 'img/avatars/bear.webp', '🐒': 'img/avatars/monkey.webp',
    '👵': 'img/story/hero-grandma.webp', '👸': 'img/story/hero-princess.webp'
  });
  GJ.pic = (e, cls = 'pic-img') => {
    const src = GJ.PICS[e];
    return src ? `<img class="${cls}" src="${src}" alt="" draggable="false" onerror="this.outerHTML='<div class=&quot;emoji-xl&quot;>${e}</div>'">`
      : `<div class="emoji-xl">${e}</div>`;
  };

  /* Játékosfigurák rajzolt képe (a profilban az emoji tárolódik) */
  const AVATAR_IMG = {
    '🦄': 'unicorn', '🐱': 'cat', '🐶': 'dog', '🐰': 'bunny', '🦊': 'fox', '🐼': 'panda', '🐨': 'koala', '🐸': 'frog',
    '🦁': 'lion', '🐯': 'tiger', '🐧': 'penguin', '🦉': 'owl', '🐻': 'bear', '🐵': 'monkey', '🐞': 'ladybird', '🦋': 'butterfly'
  };
  GJ.avatarImg = e => (AVATAR_IMG[e] ? `img/avatars/${AVATAR_IMG[e]}.webp` : null);
  GJ.avatarHTML = (e, cls = 'av-img') => {
    const src = GJ.avatarImg(e);
    return src ? `<img class="${cls}" src="${src}" alt="" draggable="false">` : e;
  };

  /* ---------- Rangok (összegyűjtött csillagok alapján) ---------- */
  GJ.RANKS = [
    [0, '🐣', 'Kis Felfedező|Mic Explorator|Little Explorer'],
    [15, '🐝', 'Szorgos Méhecske|Albinuța Harnică|Busy Bee'],
    [40, '🐿️', 'Kíváncsi Mókus|Veverița Curioasă|Curious Squirrel'],
    [80, '🦉', 'Okos Bagoly|Bufnița Isteață|Clever Owl'],
    [150, '🦊', 'Tudós Róka|Vulpea Învățată|Wise Fox'],
    [250, '🦁', 'Bátor Oroszlán|Leul Curajos|Brave Lion'],
    [400, '🌈', 'Szivárvány Bajnok|Campionul Curcubeu|Rainbow Champion'],
    [600, '🧙', 'Csillag Varázsló|Vrăjitorul Stelelor|Star Wizard'],
    [900, '🧚', 'Tudás Tündér|Zâna Cunoașterii|Knowledge Fairy'],
    [1300, '👑', 'Szuper Zseni|Super Geniu|Super Genius']
  ].map(([min, e, n], i) => {
    const [hu, ro, en] = n.split('|');
    return { min, e, img: `img/ranks/r${i + 1}.webp`, names: { hu, ro, en }, get n() { return GJ.L(this.names); } };
  });
  GJ.rankFor = function (stars) {
    let i = 0;
    GJ.RANKS.forEach((r, k) => { if (stars >= r.min) i = k; });
    return { cur: GJ.RANKS[i], next: GJ.RANKS[i + 1] || null };
  };

  /* ---------- Hangok (Web Audio, külső fájl nélkül) ---------- */
  let ctx = null;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type = 'triangle', vol = 0.18) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const SOUNDS = {
    click: () => tone(700, 0, 0.07, 'sine', 0.06),
    correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.28)),
    wrong: () => { tone(330, 0, 0.18, 'sine', 0.12); tone(262, 0.15, 0.28, 'sine', 0.12); },
    fanfare: () => [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.32, 'square', 0.06)),
    sticker: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.07, 0.22, 'sine', 0.1)),
    tick: () => tone(1200, 0, 0.05, 'square', 0.04),
    timeout: () => [440, 370, 311, 262].forEach((f, i) => tone(f, i * 0.12, 0.2, 'triangle', 0.12)),
    page: () => [660, 880].forEach((f, i) => tone(f, i * 0.06, 0.12, 'sine', 0.06))
  };
  GJ.sfx = function (name) {
    if (!GJ.store.settings().sound) return;
    try { SOUNDS[name] && SOUNDS[name](); } catch (e) { /* hang nélkül is megy */ }
  };

  /* ---------- Felolvasás (a választott nyelv hangjával, ha a gépen elérhető) ---------- */
  const SPEECH = { hu: 'hu-HU', ro: 'ro-RO', en: 'en-GB' };
  GJ.speak = function (text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      speechSynthesis.cancel();
      const lang = GJ.lang();
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = SPEECH[lang];
      const voices = speechSynthesis.getVoices();
      const v = voices.find(v => v.lang && v.lang.replace('_', '-') === SPEECH[lang]) ||
        voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang));
      if (v) ut.voice = v;
      ut.rate = 0.9; ut.pitch = 1.1;
      speechSynthesis.speak(ut);
    } catch (e) { /* nincs felolvasás */ }
  };
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  /* ---------- Konfetti ---------- */
  const cv = document.getElementById('confetti');
  const cx = cv.getContext('2d');
  const COLORS = ['#ff6fa8', '#ffd43b', '#51cf66', '#4dabf7', '#845ef7', '#ffa94d', '#20c997'];
  let parts = [], running = false;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  addEventListener('resize', resize); resize();

  function star(x, y, r) {
    cx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r / 2.2 : r;
      cx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    cx.closePath(); cx.fill();
  }
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.y < cv.height + 40 && p.life > 0);
    for (const p of parts) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c;
      if (p.star) star(0, 0, p.s * 0.8); else cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      cx.restore();
    }
    if (parts.length) requestAnimationFrame(loop); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
  }
  GJ.confetti = function (x = innerWidth / 2, y = innerHeight / 2, n = 70) {
    if (reduce) n = Math.min(n, 15);
    for (let i = 0; i < n; i++) {
      parts.push({
        x, y, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
        s: 7 + Math.random() * 9, c: pick(COLORS), rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.3, life: 160, star: Math.random() < 0.35
      });
    }
    if (!running) { running = true; requestAnimationFrame(loop); }
  };

  /* ---------- Felugró üzenet (toast) ---------- */
  let toastTimer;
  GJ.toast = function (text) {
    const t = document.getElementById('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  };
})();
