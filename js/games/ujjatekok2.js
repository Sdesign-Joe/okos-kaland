/* Okos Kaland – új játékok, 2. csomag (hu / ro / en)
 *   bolt       Boltocska – mennyit fizetsz, mennyi a visszajáró (helyi pénznemmel)
 *   naptar     Napok, hónapok, évszakok
 *   szorzosor  Szorzósor-gyakorló – a gyerek választ sort, és látja, melyik megy már
 * (A betűírás a js/features/trace.js-ben van, mert saját feladattípus.)
 */
(function () {
  'use strict';
  const { pick, rand, shuffle, options, esc, article } = GJ.u;
  const near = (ans, steps, min = 1) => shuffle([...new Set(steps.flatMap(s => [ans + s, ans - s]))].filter(x => x >= min && x !== ans));

  /* ====================== 1. Boltocska ====================== */
  const WARES = [
    ['🍎', 'alma', 'măr', 'apple'], ['🍌', 'banán', 'banană', 'banana'], ['🥐', 'kifli', 'corn', 'croissant'], ['🧃', 'üdítő', 'suc', 'juice'],
    ['🍫', 'csoki', 'ciocolată', 'chocolate'], ['✏️', 'ceruza', 'creion', 'pencil'], ['📒', 'füzet', 'caiet', 'notebook'], ['🎈', 'lufi', 'balon', 'balloon'],
    ['🧸', 'maci', 'ursuleț', 'teddy'], ['⚽', 'labda', 'minge', 'ball'], ['🍦', 'fagyi', 'înghețată', 'ice cream'], ['🖍️', 'zsírkréta', 'creioane', 'crayons']
  ];
  const CUR = {
    hu: { fmt: n => `${n} Ft`, price: [[10, 50, 10], [20, 400, 10], [100, 1500, 50]], pay: [100, 200, 500, 1000, 2000, 5000] },
    ro: { fmt: n => `${n} ${n === 1 ? 'leu' : 'lei'}`, price: [[1, 5, 1], [2, 30, 1], [5, 90, 1]], pay: [10, 20, 50, 100, 200] },
    en: { fmt: n => `£${n}`, price: [[1, 5, 1], [2, 20, 1], [5, 60, 1]], pay: [10, 20, 50, 100] }
  };
  const priceOf = ([a, b, st]) => rand(a / st, b / st) * st;
  GJ.register({
    id: 'bolt', subject: 'matek', icon: '🛒', grades: [1, 2, 3, 4],
    title: { hu: 'Boltocska', ro: 'La magazin', en: 'The little shop' },
    desc: { hu: 'Mennyit fizetsz? Mennyi a visszajáró?', ro: 'Cât plătești? Cât primești rest?', en: 'How much to pay? How much change?' },
    make({ level, lang }) {
      const C = CUR[lang], range = C.price[level - 1];
      const nItems = level === 3 ? pick([2, 3]) : level === 2 ? 2 : pick([1, 2]);
      const items = shuffle(WARES).slice(0, nItems).map(w => ({ e: w[0], n: w[{ hu: 1, ro: 2, en: 3 }[lang]], p: priceOf(range) }));
      const sum = items.reduce((a, b) => a + b.p, 0);
      const step = range[2];
      const tags = `<div class="shop-row">${items.map(it => `<span class="ptag">${GJ.pic(it.e)}<small>${esc(it.n)}</small><b>${esc(C.fmt(it.p))}</b></span>`).join('')}</div>`;
      const labels = ns => { const o = {}; ns.forEach(n => { o[n] = C.fmt(n); }); return o; };
      const change = nItems === 1 || Math.random() < 0.5;
      if (change) {
        const note = C.pay.find(x => x > sum) || C.pay[C.pay.length - 1];
        const ans = note - sum;
        const q = { hu: `${C.fmt(note)}-os pénzzel fizetsz. Mennyi a visszajáró?`, ro: `Plătești cu ${C.fmt(note)}. Cât primești rest?`, en: `You pay with ${C.fmt(note)}. How much change do you get?` }[lang];
        const opts = options(ans, near(ans, [step, step * 2, step * 5, step * 10]), 4);
        return { type: 'choice', key: 'c' + items.map(i => i.e + i.p).join() + note, prompt: q, speak: q,
          big: tags + `<div class="pay-with">💵 <b>${esc(C.fmt(note))}</b></div>`,
          options: opts, optionLabels: labels(opts), answer: ans,
          explain: `${C.fmt(note)} − ${C.fmt(sum)} = ${C.fmt(ans)}` };
      }
      const q = { hu: 'Mennyit fizetsz, ha mindet megveszed?', ro: 'Cât plătești dacă le cumperi pe toate?', en: 'How much do you pay for all of them?' }[lang];
      const opts = options(sum, near(sum, [step, step * 2, step * 10]), 4);
      return { type: 'choice', key: 's' + items.map(i => i.e + i.p).join(), prompt: q, speak: q, big: tags,
        options: opts, optionLabels: labels(opts), answer: sum,
        explain: items.map(i => C.fmt(i.p)).join(' + ') + ` = ${C.fmt(sum)}` };
    }
  });

  /* ====================== 2. Napok, hónapok, évszakok ====================== */
  const CAL = {
    hu: { d: ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'],
      m: ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'],
      s: ['tél', 'tavasz', 'nyár', 'ősz'], sIn: ['tél', 'tavasz', 'nyár', 'ősz'] },
    ro: { d: ['luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă', 'duminică'],
      m: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
      s: ['iarna', 'primăvara', 'vara', 'toamna'], sIn: ['iarnă', 'primăvară', 'vară', 'toamnă'] },
    en: { d: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      m: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      s: ['winter', 'spring', 'summer', 'autumn'], sIn: ['winter', 'spring', 'summer', 'autumn'] }
  };
  const SEASON_E = ['⛄', '🌷', '☀️', '🍂'];
  const seasonOf = mi => Math.floor(((mi + 1) % 12) / 3);   // dec–feb = tél (0)
  const A = w => `${article(w)} ${w}`;                       // magyar névelő: a / az
  const Q = {
    nextDay: (L, x) => ({ hu: `Melyik nap jön ${A(x)} után?`, ro: `Ce zi vine după ${x}?`, en: `Which day comes after ${x}?` })[L],
    prevDay: (L, x) => ({ hu: `Melyik nap van ${A(x)} előtt?`, ro: `Ce zi este înainte de ${x}?`, en: `Which day comes before ${x}?` })[L],
    yesterday: (L, x) => ({ hu: `Ma ${x} van. Milyen nap volt tegnap?`, ro: `Azi este ${x}. Ce zi a fost ieri?`, en: `Today is ${x}. What day was it yesterday?` })[L],
    dayAfter: (L, x) => ({ hu: `Ma ${x} van. Milyen nap lesz holnapután?`, ro: `Azi este ${x}. Ce zi va fi poimâine?`, en: `Today is ${x}. What day will it be the day after tomorrow?` })[L],
    nextMonth: (L, x) => ({ hu: `Melyik hónap jön ${A(x)} után?`, ro: `Ce lună vine după ${x}?`, en: `Which month comes after ${x}?` })[L],
    prevMonth: (L, x) => ({ hu: `Melyik hónap van ${A(x)} előtt?`, ro: `Ce lună este înainte de ${x}?`, en: `Which month comes before ${x}?` })[L],
    season: (L, x) => ({ hu: `Melyik évszakban van ${A(x)}?`, ro: `În ce anotimp este luna ${x}?`, en: `Which season is ${x} in?` })[L],
    nextSeason: (L, x) => ({ hu: `Melyik évszak jön ${A(x)} után?`, ro: `Ce anotimp vine după ${x}?`, en: `Which season comes after ${x}?` })[L],
    monthNo: (L, x) => ({ hu: `Hányadik hónap ${A(x)}?`, ro: `A câta lună a anului este ${x}?`, en: `Which month of the year is ${x}? (number)` })[L]
  };
  const COUNTS = [
    [{ hu: 'Hány napból áll egy hét?', ro: 'Câte zile are o săptămână?', en: 'How many days are there in a week?' }, 7, [5, 6, 8, 10]],
    [{ hu: 'Hány hónap van egy évben?', ro: 'Câte luni are un an?', en: 'How many months are there in a year?' }, 12, [10, 11, 7, 24]],
    [{ hu: 'Hány évszak van egy évben?', ro: 'Câte anotimpuri are un an?', en: 'How many seasons are there in a year?' }, 4, [3, 5, 2, 12]],
    [{ hu: 'Hány nap van a hétvégén?', ro: 'Câte zile are weekendul?', en: 'How many days are there in a weekend?' }, 2, [1, 3, 5, 7]]
  ];
  GJ.register({
    id: 'naptar', subject: 'matek', icon: '📅', grades: [0, 1, 2, 3],
    title: { hu: 'Napok és hónapok', ro: 'Zile și luni', en: 'Days and months' },
    desc: { hu: 'A hét napjai, hónapok, évszakok', ro: 'Zilele săptămânii, lunile, anotimpurile', en: 'Days of the week, months, seasons' },
    make({ level, lang }) {
      const C = CAL[lang];
      const kinds = level === 1 ? ['nextDay', 'season', 'count', 'nextSeason']
        : level === 2 ? ['nextDay', 'prevDay', 'yesterday', 'nextMonth', 'season', 'nextSeason']
        : ['prevDay', 'dayAfter', 'nextMonth', 'prevMonth', 'monthNo', 'season'];
      const k = pick(kinds);
      const big = (e, w) => `${GJ.pic(e)}${w ? `<div class="big-word">${esc(w)}</div>` : ''}`;
      const mk = (q, ans, wrong, e, w, extra) => Object.assign({ type: 'choice', key: k + q, prompt: q, speak: q, big: big(e, w), options: options(ans, shuffle(wrong), 4), answer: ans }, extra || {});
      if (k === 'count') { const [q, a, w] = pick(COUNTS); return mk(q[lang], a, w, '📅'); }
      if (['nextDay', 'prevDay', 'yesterday', 'dayAfter'].includes(k)) {
        const i = rand(0, 6), d = C.d[i];
        const off = { nextDay: 1, prevDay: -1, yesterday: -1, dayAfter: 2 }[k];
        const ans = C.d[(i + off + 7) % 7];
        return mk(Q[k](lang, d), ans, C.d.filter(x => x !== ans && x !== d), '🗓️', d,
          { explain: C.d.slice(i).concat(C.d.slice(0, i)).slice(0, 4).join(' → ') });
      }
      if (k === 'nextMonth' || k === 'prevMonth') {
        const i = rand(0, 11), off = k === 'nextMonth' ? 1 : -1, ans = C.m[(i + off + 12) % 12];
        return mk(Q[k](lang, C.m[i]), ans, [C.m[(i + 2) % 12], C.m[(i - 2 + 12) % 12], C.m[(i - off + 12) % 12], C.m[(i + 6) % 12]], '📆', C.m[i]);
      }
      if (k === 'monthNo') {
        const i = rand(0, 11);
        return mk(Q.monthNo(lang, C.m[i]), i + 1, [i, i + 2, i + 3, 12 - i].filter(x => x > 0 && x <= 12 && x !== i + 1), '📆', C.m[i]);
      }
      if (k === 'nextSeason') {
        const i = rand(0, 3), ans = C.s[(i + 1) % 4];
        return mk(Q.nextSeason(lang, C.sIn[i]), ans, C.s.filter(x => x !== ans), SEASON_E[i], C.s[i], { cols: 2 });
      }
      const mi = rand(0, 11), si = seasonOf(mi);
      return mk(Q.season(lang, C.m[mi]), C.s[si], C.s.filter((_, j) => j !== si), '📆', C.m[mi],
        { cols: 2, optionLabels: Object.fromEntries(C.s.map((s, j) => [s, `${SEASON_E[j]} ${s}`])) });
    }
  });

  /* ====================== 3. Szorzósor-gyakorló ====================== */
  // A választott sor a profilban: p.ttRow ('2'…'10' vagy 'mix'); eredmények: p.tables[sor] = { ok, n }
  const rowOf = () => { const p = GJ.store.current(); return (p && p.ttRow) || '2'; };
  GJ.register({
    id: 'szorzosor', subject: 'matek', icon: '🧮', grades: [2, 3, 4],
    title: { hu: 'Szorzósor-gyakorló', ro: 'Exersez tabla înmulțirii', en: 'Times-table trainer' },
    desc: { hu: 'Válassz egy sort, és gyakorold!', ro: 'Alege un rând și exersează!', en: 'Pick a table and practise it!' },
    make({ level, lang }) {
      const sel = rowOf(), row = sel === 'mix' ? rand(2, 10) : +sel, a = rand(1, 10), prod = row * a;
      const seq = Array.from({ length: 10 }, (_, i) => row * (i + 1)).join(', ');
      const explain = { hu: `A ${row}-es sor: ${seq}`, ro: `Rândul lui ${row}: ${seq}`, en: `The ${row} times table: ${seq}` }[lang];
      if (level === 3 && Math.random() < 0.35) {
        const dv = lang === 'en' ? '÷' : ':';
        return { type: 'choice', key: prod + dv + row, ttRow: row, prompt: { hu: 'Mennyi az eredmény?', ro: 'Cât face?', en: 'What is the answer?' }[lang],
          speak: { hu: `Mennyi ${prod} osztva ${row}?`, ro: `Cât face ${prod} împărțit la ${row}?`, en: `What is ${prod} divided by ${row}?` }[lang],
          big: `<div class="eq">${prod} ${dv} ${row} = <span class="qmark">?</span></div>`,
          options: options(a, near(a, [1, 2, 3])), answer: a, explain: `${row} × ${a} = ${prod}` };
      }
      const [x, y] = level >= 2 && Math.random() < 0.5 ? [a, row] : [row, a];
      return { type: 'choice', key: x + 'x' + y, ttRow: row, prompt: { hu: 'Mennyi az eredmény?', ro: 'Cât face?', en: 'What is the answer?' }[lang],
        speak: { hu: `Mennyi ${x} szorozva ${y}?`, ro: `Cât face ${x} ori ${y}?`, en: `What is ${x} times ${y}?` }[lang],
        big: `<div class="eq">${x} × ${y} = <span class="qmark">?</span></div>`,
        options: options(prod, near(prod, [row, 1, 2, row * 2, 10])), answer: prod, explain };
    }
  });

  GJ.ttStars = rec => {
    if (!rec || !rec.n) return 0;
    const acc = rec.ok / rec.n;
    return rec.ok >= 40 && acc >= 0.9 ? 3 : rec.ok >= 20 && acc >= 0.8 ? 2 : rec.ok >= 8 && acc >= 0.7 ? 1 : 0;
  };
})();
