/* Okos Kaland – MATEK játékok (hu / ro / en) */
(function () {
  'use strict';
  const { rand, pick, shuffle, options } = GJ.u;

  /** Közeli, de rossz számok a válaszlehetőségekhez */
  function near(ans, steps, min = 0) {
    const c = [];
    for (const s of steps) c.push(ans + s, ans - s);
    return shuffle(c.filter(x => x >= min && x !== ans));
  }
  const eq = s => `<div class="eq">${s} = <span class="qmark">?</span></div>`;
  const ASK = { hu: 'Mennyi az eredmény?', ro: 'Cât face?', en: 'What is the answer?' };

  /* 1. Összeadás, kivonás */
  GJ.register({
    id: 'osszeadas', subject: 'matek', icon: '➕',
    title: { hu: 'Összeadás, kivonás', ro: 'Adunare și scădere', en: 'Adding & taking away' },
    desc: { hu: 'Adj össze és vonj ki!', ro: 'Adună și scade!', en: 'Add and subtract!' },
    make({ level, lang }) {
      const max = [20, 100, 1000][level - 1];
      const plus = Math.random() < 0.5;
      let a, b, ans;
      if (plus) { ans = rand(level === 1 ? 2 : 10, max); a = rand(1, ans - 1); b = ans - a; }
      else { a = rand(level === 1 ? 2 : 10, max); b = rand(1, a - 1); ans = a - b; }
      const op = plus ? '+' : '−';
      const word = { hu: plus ? 'meg' : 'mínusz', ro: plus ? 'plus' : 'minus', en: plus ? 'plus' : 'minus' }[lang];
      return {
        type: 'choice', key: a + op + b, prompt: ASK[lang],
        speak: { hu: `Mennyi ${a} ${word} ${b}?`, ro: `Cât face ${a} ${word} ${b}?`, en: `What is ${a} ${word} ${b}?` }[lang],
        big: eq(`${a} ${op} ${b}`),
        options: options(ans, near(ans, [1, 2, 10, 3, 5])), answer: ans
      };
    }
  });

  /* 2. Szorzótábla */
  const GROUP_EMOJI = ['🍎', '🍓', '🌸', '🐞', '⭐', '🍪'];
  GJ.register({
    id: 'szorzas', subject: 'matek', icon: '✖️',
    title: { hu: 'Szorzótábla', ro: 'Tabla înmulțirii', en: 'Times tables' },
    desc: { hu: 'Szorozz és ossz!', ro: 'Înmulțește și împarte!', en: 'Multiply and divide!' },
    make({ level, lang }) {
      const facs = level === 1 ? [2, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10];
      let a = pick(facs), b = rand(1, 10);
      if (Math.random() < 0.5) [a, b] = [b, a];

      if (level >= 2 && Math.random() < 0.3) { // osztás
        const prod = a * b, dv = lang === 'en' ? '÷' : ':';
        return {
          type: 'choice', key: prod + ':' + b, prompt: ASK[lang],
          speak: { hu: `Mennyi ${prod} osztva ${b}?`, ro: `Cât face ${prod} împărțit la ${b}?`, en: `What is ${prod} divided by ${b}?` }[lang],
          big: eq(`${prod} ${dv} ${b}`),
          options: options(a, near(a, [1, 2, 3])), answer: a,
          explain: { hu: 'Mert', ro: 'Pentru că', en: 'Because' }[lang] + ` ${a} × ${b} = ${prod}`
        };
      }
      const ans = a * b;
      let visual = '';
      if (a * b <= 30 && a <= 6 && b <= 6) {
        const e = pick(GROUP_EMOJI);
        visual = `<div class="groups">${Array(a).fill(`<span class="grp">${e.repeat(b)}</span>`).join('')}</div>`;
      }
      return {
        type: 'choice', key: a + 'x' + b, prompt: ASK[lang],
        speak: { hu: `Mennyi ${a} szorozva ${b}?`, ro: `Cât face ${a} ori ${b}?`, en: `What is ${a} times ${b}?` }[lang],
        big: eq(`${a} × ${b}`) + visual,
        options: options(ans, near(ans, [a, b, 1, 2, 10])), answer: ans,
        explain: visual ? { hu: `${a} csoport, mindegyikben ${b} → ${ans}`, ro: `${a} grupe a câte ${b} → ${ans}`, en: `${a} groups of ${b} → ${ans}` }[lang] : ''
      };
    }
  });

  /* 3. Számold meg!  [emoji, magyar név, román kérdés, angol többes szám] */
  const COUNT_POOL = [
    ['🍎', 'alma', 'Câte mere', 'apples'], ['🍓', 'eper', 'Câte căpșuni', 'strawberries'], ['⭐', 'csillag', 'Câte stele', 'stars'],
    ['🐞', 'katica', 'Câte buburuze', 'ladybirds'], ['🌸', 'virág', 'Câte flori', 'flowers'], ['🐟', 'hal', 'Câți pești', 'fish'],
    ['🎈', 'lufi', 'Câte baloane', 'balloons'], ['🍄', 'gomba', 'Câte ciuperci', 'mushrooms'], ['🦋', 'pillangó', 'Câți fluturi', 'butterflies'],
    ['🐥', 'csibe', 'Câți pui', 'chicks'], ['🍒', 'cseresznye', 'Câte cireșe', 'cherries'], ['🧁', 'muffin', 'Câte brioșe', 'cupcakes']
  ];
  GJ.register({
    id: 'szamlalo', subject: 'matek', icon: '🍎',
    title: { hu: 'Számold meg!', ro: 'Numără!', en: 'Count them!' },
    desc: { hu: 'Hány darab van a képen?', ro: 'Câte sunt în imagine?', en: 'How many can you see?' },
    make({ level, lang }) {
      const [lo, hi] = [[3, 10], [6, 16], [10, 24]][level - 1];
      const n = rand(lo, hi);
      const [e, hu, ro, en] = pick(COUNT_POOL);
      let items = Array(n).fill(e), mixed = false;
      if (level >= 2 && Math.random() < 0.5) {
        const [o] = pick(COUNT_POOL.filter(x => x[0] !== e));
        items = shuffle(items.concat(Array(rand(2, 7)).fill(o))); mixed = true;
      }
      const q = { hu: `Hány ${hu} van a képen?`, ro: `${ro} sunt în imagine?`, en: `How many ${en} are there?` }[lang];
      return {
        type: 'choice', key: e + n + mixed, prompt: `${q} ${e}`,
        speak: { hu: 'Számold meg! ', ro: 'Numără! ', en: 'Count them! ' }[lang] + q,
        big: `<div class="count-grid">${items.map(x => `<span>${x}</span>`).join('')}</div>`,
        options: options(n, near(n, [1, 2, 3], 1)), answer: n
      };
    }
  });

  /* 4. Kisebb, nagyobb, egyenlő */
  GJ.register({
    id: 'hasonlitas', subject: 'matek', icon: '🐊',
    title: { hu: 'Kisebb vagy nagyobb?', ro: 'Mai mic sau mai mare?', en: 'Bigger or smaller?' },
    desc: { hu: '<, > vagy = ?', ro: '<, > sau = ?', en: '<, > or = ?' },
    make({ level, lang }) {
      let L, R, Ls, Rs;
      if (level === 1) {
        L = rand(0, 20); R = Math.random() < 0.2 ? L : rand(0, 20); Ls = L; Rs = R;
      } else {
        const half = level === 2 ? 25 : 50;
        const a = rand(1, half), b = rand(1, half);
        L = a + b; Ls = `${a} + ${b}`;
        R = Math.random() < 0.25 ? L : Math.max(0, L + pick([-3, -2, -1, 1, 2, 3, -10, 10]));
        Rs = R;
        if (Math.random() < 0.5) { [L, R] = [R, L]; [Ls, Rs] = [Rs, Ls]; }
      }
      const ans = L < R ? '<' : L > R ? '>' : '=';
      return {
        type: 'choice', key: Ls + '?' + Rs, fixed: true,
        prompt: { hu: 'Melyik jel illik a helyére?', ro: 'Ce semn se potrivește?', en: 'Which sign fits?' }[lang],
        speak: { hu: 'Kisebb, nagyobb, vagy egyenlő?', ro: 'Mai mic, mai mare sau egal?', en: 'Smaller, bigger, or equal?' }[lang],
        big: `<div class="eq">${Ls} <span class="slot">?</span> ${Rs}</div>`,
        hint: {
          hu: '🐊 A krokodil szája mindig a nagyobb felé nyílik!',
          ro: '🐊 Gura crocodilului se deschide mereu spre numărul mai mare!',
          en: "🐊 The crocodile's mouth always opens towards the bigger number!"
        }[lang],
        options: ['<', '=', '>'], answer: ans, cols: 3
      };
    }
  });

  /* 5. Mi következik? (számsorozat) */
  GJ.register({
    id: 'sorozat', subject: 'matek', icon: '🔢',
    title: { hu: 'Mi jön ezután?', ro: 'Ce urmează?', en: 'What comes next?' },
    desc: { hu: 'Folytasd a számsort!', ro: 'Continuă șirul de numere!', en: 'Continue the number pattern!' },
    make({ level, lang }) {
      const steps = [[1, 2, 5, 10, -1, -2], [2, 3, 4, 5, 10, -2, -3, -5, -10], [3, 4, 6, 7, 8, 9, 25, 50, -4, -6, -7, -25]][level - 1];
      const s = pick(steps), as = Math.abs(s), len = 4;
      let start = s > 0 ? rand(0, level === 1 ? 10 : 40) : rand(as * len, as * len + (level === 1 ? 10 : 40));
      if (as >= 5) start = Math.round(start / as) * as;
      if (s < 0) start = Math.max(start, as * len);
      const seq = Array.from({ length: len }, (_, i) => start + s * i);
      const ans = start + s * len;
      const sg = (s > 0 ? '+' : '−') + as;
      return {
        type: 'choice', key: seq.join(','),
        prompt: { hu: 'Melyik szám jön ezután?', ro: 'Ce număr urmează?', en: 'Which number comes next?' }[lang],
        speak: { hu: 'Melyik szám jön ezután? ', ro: 'Ce număr urmează? ', en: 'Which number comes next? ' }[lang] + seq.join(', '),
        big: `<div class="seq">${seq.map(n => `<span class="bead">${n}</span>`).join('')}<span class="bead q">?</span></div>`,
        options: options(ans, near(ans, [as, 1, 2, as * 2])), answer: ans,
        explain: { hu: `Mindig ${sg} a lépés.`, ro: `Pasul este mereu ${sg}.`, en: `The step is always ${sg}.` }[lang]
      };
    }
  });

  /* 6. Perselypénz – nyelvenként a helyi érmékkel */
  const MONEY = {
    hu: { unit: 'Ft', pools: [[5, 10, 20, 50], [10, 20, 50, 100], [5, 10, 20, 50, 100, 200]],
      look: { 5: 'gold', 10: 'silver', 20: 'gold', 50: 'silver', 100: 'bi1', 200: 'bi2' } },
    ro: { unit: 'bani', pools: [[1, 5, 10], [5, 10, 50], [1, 5, 10, 50]],
      look: { 1: 'gold', 5: 'copper', 10: 'silver', 50: 'gold' } },
    en: { unit: 'p', pools: [[1, 2, 5, 10], [2, 5, 10, 20], [5, 10, 20, 50]],
      look: { 1: 'copper', 2: 'copper', 5: 'silver', 10: 'silver', 20: 'silver', 50: 'silver' } }
  };
  GJ.register({
    id: 'penz', subject: 'matek', icon: '🐷',
    title: { hu: 'Perselypénz', ro: 'Pușculița', en: 'Piggy bank' },
    desc: { hu: 'Számold össze az érméket!', ro: 'Adună monedele!', en: 'Add up the coins!' },
    make({ level, lang }) {
      const M = MONEY[lang];
      const n = rand(...[[2, 3], [3, 4], [3, 5]][level - 1]);
      const coins = Array.from({ length: n }, () => pick(M.pools[level - 1])).sort((a, b) => b - a);
      const sum = coins.reduce((a, b) => a + b, 0);
      const sep = lang === 'en' ? '' : ' ';
      return {
        type: 'choice', key: coins.join('+'),
        prompt: { hu: 'Mennyi pénz van a perselyben?', ro: 'Câți bani sunt în pușculiță?', en: 'How much money is in the piggy bank?' }[lang],
        speak: { hu: 'Számold össze az érméket! Mennyi pénz van a perselyben?', ro: 'Adună monedele! Câți bani sunt în pușculiță?', en: 'Add up the coins! How much money is in the piggy bank?' }[lang],
        big: `<div class="coins">${coins.map(c => `<span class="coin ${M.look[c]}"><b>${c}</b><small>${M.unit}</small></span>`).join('')}</div>`,
        options: options(sum, near(sum, [5, 10, 20, 50, 1, 2], 2)), answer: sum, unit: sep + M.unit,
        explain: coins.join(' + ') + ` = ${sum}${sep}${M.unit}`
      };
    }
  });

  /* 7. Hány óra van? */
  function clockSVG(h, m) {
    let s = '<svg viewBox="0 0 200 200" class="clock" role="img" aria-label="clock">';
    s += '<circle cx="100" cy="100" r="94" class="ck-rim"/><circle cx="100" cy="100" r="86" class="ck-face"/>';
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      s += `<line x1="100" y1="${big ? 18 : 20}" x2="100" y2="26" class="${big ? 'ck-tick5' : 'ck-tick'}" transform="rotate(${i * 6} 100 100)"/>`;
    }
    for (let i = 1; i <= 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      s += `<text x="${(100 + 62 * Math.cos(a)).toFixed(1)}" y="${(100 + 62 * Math.sin(a)).toFixed(1)}" class="ck-num">${i}</text>`;
    }
    const ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
    s += `<line x1="100" y1="100" x2="100" y2="58" class="ck-hour" transform="rotate(${ha} 100 100)"/>`;
    s += `<line x1="100" y1="100" x2="100" y2="34" class="ck-min" transform="rotate(${ma} 100 100)"/>`;
    s += '<circle cx="100" cy="100" r="7" class="ck-dot"/></svg>';
    return s;
  }
  function timeLabel(h, m, lang) {
    const nx = h % 12 + 1;
    if (lang === 'ro') return m === 0 ? `ora ${h}` : m === 15 ? `${h} și un sfert` : m === 30 ? `${h} și jumătate` : `${nx} fără un sfert`;
    if (lang === 'en') return m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}` : `quarter to ${nx}`;
    return m === 0 ? `${h} óra` : m === 15 ? `negyed ${nx}` : m === 30 ? `fél ${nx}` : `háromnegyed ${nx}`;
  }
  const CLOCK_TIPS = {
    hu: { 0: 'Egész óra: a nagymutató a 12-esen áll.', 15: 'Negyed: a nagymutató a 3-ason áll.', 30: 'Fél: a nagymutató a 6-oson áll.', 45: 'Háromnegyed: a nagymutató a 9-esen áll.' },
    ro: { 0: 'Ora fixă: acul mare stă pe 12.', 15: 'Și un sfert: acul mare stă pe 3.', 30: 'Și jumătate: acul mare stă pe 6.', 45: 'Fără un sfert: acul mare stă pe 9.' },
    en: { 0: "O'clock: the long hand points to 12.", 15: 'Quarter past: the long hand points to 3.', 30: 'Half past: the long hand points to 6.', 45: 'Quarter to: the long hand points to 9.' }
  };
  GJ.register({
    id: 'ora', subject: 'matek', icon: '⏰',
    title: { hu: 'Hány óra van?', ro: 'Cât e ceasul?', en: 'What time is it?' },
    desc: { hu: 'Olvasd le az órát!', ro: 'Citește ceasul!', en: 'Read the clock!' },
    make({ level, lang }) {
      const mins = level === 1 ? [0, 30] : [0, 15, 30, 45];
      const h = rand(1, 12), m = pick(mins);
      const ans = timeLabel(h, m, lang);
      const cands = [];
      for (const m2 of mins) {
        cands.push(timeLabel(h, m2, lang), timeLabel(h % 12 + 1, m2, lang), timeLabel((h + 10) % 12 + 1, m2, lang));
      }
      return {
        type: 'choice', key: h + ':' + m,
        prompt: { hu: 'Hány óra van?', ro: 'Cât e ceasul?', en: 'What time is it?' }[lang],
        big: clockSVG(h, m),
        options: options(ans, shuffle(cands)), answer: ans,
        hint: {
          hu: '⏱️ A rövid mutató az órát, a hosszú a perceket mutatja.',
          ro: '⏱️ Acul mic arată ora, acul mare arată minutele.',
          en: '⏱️ The short hand shows the hour, the long hand shows the minutes.'
        }[lang],
        explain: CLOCK_TIPS[lang][m]
      };
    }
  });
})();
