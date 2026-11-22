/* Okos Kaland – új játékok (hu / ro / en)
 *   szoveges      Szöveges feladatok (matek)
 *   mertekegyseg  Mértékegységek (matek)
 *   alakzatok     Síkidomok, alakzatok (matek)
 *   diktalas      Diktálás – meghallgatja és leírja (nyelvtan)
 *   olvasas       Olvasásértés – rövid történet + kérdés (irodalom)
 * A listák szabadon bővíthetők.
 */
(function () {
  'use strict';
  const { pick, rand, shuffle, options, esc } = GJ.u;

  /* ====================== 1. Szöveges feladatok ====================== */
  const NAMES = { hu: ['Lili', 'Bence', 'Anna', 'Máté', 'Zsófi', 'Dani'], ro: ['Ana', 'Mihai', 'Ioana', 'Andrei', 'Maria', 'Luca'], en: ['Lily', 'Ben', 'Emma', 'Jack', 'Mia', 'Sam'] };
  // tárgyak: magyar alanyeset + tárgyeset; román egyes/többes; angol többes
  const OBJ = [
    { e: '🍎', hu: ['alma', 'almát'], ro: ['măr', 'mere'], en: 'apples' },
    { e: '🔵', hu: ['golyó', 'golyót'], ro: ['bilă', 'bile'], en: 'marbles' },
    { e: '⭐', hu: ['matrica', 'matricát'], ro: ['abțibild', 'abțibilduri'], en: 'stickers' },
    { e: '✏️', hu: ['ceruza', 'ceruzát'], ro: ['creion', 'creioane'], en: 'pencils' },
    { e: '🌸', hu: ['virág', 'virágot'], ro: ['floare', 'flori'], en: 'flowers' },
    { e: '⚽', hu: ['labda', 'labdát'], ro: ['minge', 'mingi'], en: 'balls' }
  ];
  // román számnév + főnév: 1 măr, 5 mere, 21 de mere
  const roN = (n, o) => (n === 1 ? `1 ${o.ro[0]}` : `${n} ${(n % 100 === 0 || n % 100 >= 20) ? 'de ' : ''}${o.ro[1]}`);
  const STORIES = {
    add: {
      hu: (N, o, a, b) => `${N} kosarában ${a} ${o.hu[0]} van. Kap még ${b} ${o.hu[1]}. Hány ${o.hu[0]} lesz a kosárban?`,
      ro: (N, o, a, b) => `${N} are în coș ${roN(a, o)}. Mai primește ${roN(b, o)}. Câte ${o.ro[1]} are acum în coș?`,
      en: (N, o, a, b) => `${N} has ${a} ${o.en} in a basket and gets ${b} more. How many ${o.en} are there now?`
    },
    sub: {
      hu: (N, o, a, b) => `${N} ${a} ${o.hu[1]} gyűjtött össze. Ebből ${b} ${o.hu[1]} elajándékozott. Hány ${o.hu[0]} maradt neki?`,
      ro: (N, o, a, b) => `${N} a strâns ${roN(a, o)}. A dăruit ${roN(b, o)}. Câte ${o.ro[1]} i-au rămas?`,
      en: (N, o, a, b) => `${N} collected ${a} ${o.en} and gave away ${b}. How many ${o.en} are left?`
    },
    more: {
      hu: (N, o, a, b) => `Az egyik dobozban ${a} ${o.hu[0]} van, a másikban ${b} ${o.hu[0]}val több. Hány ${o.hu[0]} van a második dobozban?`,
      ro: (N, o, a, b) => `Într-o cutie sunt ${roN(a, o)}, iar în cealaltă cu ${b} mai multe. Câte ${o.ro[1]} sunt în a doua cutie?`,
      en: (N, o, a, b) => `One box has ${a} ${o.en}; the other has ${b} more. How many ${o.en} are in the second box?`
    },
    mul: {
      hu: (N, o, a, b) => `Egy dobozban ${a} ${o.hu[0]} van. Hány ${o.hu[0]} van ${b} dobozban?`,
      ro: (N, o, a, b) => `Într-o cutie sunt ${roN(a, o)}. Câte ${o.ro[1]} sunt în ${b} ${b >= 20 ? 'de ' : ''}cutii?`,
      en: (N, o, a, b) => `A box holds ${a} ${o.en}. How many ${o.en} are in ${b} boxes?`
    },
    div: {
      hu: (N, o, a, b) => `${N} ${a} ${o.hu[1]} egyenlően szétoszt ${b} barátja között. Hányat kap egy barát?`,
      ro: (N, o, a, b) => `${N} împarte ${roN(a, o)} în mod egal la ${b} prieteni. Câte primește fiecare?`,
      en: (N, o, a, b) => `${N} shares ${a} ${o.en} equally between ${b} friends. How many does each friend get?`
    }
  };
  // a „val/vel” rag a tárgy nevéhez: alma→almával stb. (kézzel, a hasonulás miatt)
  const VAL = { alma: 'almával', golyó: 'golyóval', matrica: 'matricával', ceruza: 'ceruzával', virág: 'virággal', labda: 'labdával' };
  STORIES.more.hu = (N, o, a, b) => `Az egyik dobozban ${a} ${o.hu[0]} van, a másikban ${b} ${VAL[o.hu[0]]} több. Hány ${o.hu[0]} van a második dobozban?`;

  GJ.register({
    id: 'szoveges', subject: 'matek', icon: '📝', grades: [1, 2, 3, 4],
    title: { hu: 'Szöveges feladatok', ro: 'Probleme', en: 'Word problems' },
    desc: { hu: 'Olvasd el, és számold ki!', ro: 'Citește și calculează!', en: 'Read it and work it out!' },
    make({ level, lang }) {
      const max = [20, 100, 1000][level - 1];
      const kinds = level === 1 ? ['add', 'sub', 'more'] : level === 2 ? ['add', 'sub', 'more', 'mul'] : ['add', 'sub', 'more', 'mul', 'div'];
      const k = pick(kinds), o = pick(OBJ), N = pick(NAMES[lang] || NAMES.hu);
      let a, b, ans;
      if (k === 'add' || k === 'more') { ans = rand(level === 1 ? 5 : 20, max); a = rand(2, ans - 2); b = ans - a; }
      else if (k === 'sub') { a = rand(level === 1 ? 6 : 20, max); b = rand(2, a - 2); ans = a - b; }
      else if (k === 'mul') { a = rand(2, 10); b = rand(2, level === 2 ? 5 : 10); ans = a * b; }
      else { b = rand(2, 6); ans = rand(2, 10); a = b * ans; }
      const q = STORIES[k][lang](N, o, a, b);
      const wr = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, k === 'sub' ? a + b : Math.abs(a - b)].filter(x => x > 0 && x !== ans);
      return {
        type: 'choice', key: q, prompt: q, speak: q,
        big: `<div class="pic-row">${GJ.pic(o.e)}</div>`,
        options: options(ans, shuffle(wr), 4), answer: ans
      };
    }
  });

  /* ====================== 2. Mértékegységek ====================== */
  const UNIT_Q = [
    { hu: 'Mivel mérjük egy ceruza hosszát?', ro: 'Cu ce măsurăm lungimea unui creion?', en: 'Which unit do we use for the length of a pencil?', a: 'cm', w: ['kg', 'l'], e: '✏️' },
    { hu: 'Mivel mérjük, mennyi víz fér a vödörbe?', ro: 'Cu ce măsurăm câtă apă încape în găleată?', en: 'Which unit tells us how much water fits in a bucket?', a: 'l', w: ['cm', 'kg'], e: '🪣' },
    { hu: 'Mivel mérjük egy zsák krumpli tömegét?', ro: 'Cu ce măsurăm greutatea unui sac de cartofi?', en: 'Which unit do we use for the weight of a sack of potatoes?', a: 'kg', w: ['l', 'm'], e: '🥔' },
    { hu: 'Mivel mérjük az udvar hosszát?', ro: 'Cu ce măsurăm lungimea curții?', en: 'Which unit do we use for the length of a playground?', a: 'm', w: ['kg', 'l'], e: '🏡' },
    { hu: 'Mivel mérjük két város távolságát?', ro: 'Cu ce măsurăm distanța dintre două orașe?', en: 'Which unit do we use for the distance between two towns?', a: 'km', w: ['cm', 'kg'], e: '🚗' },
    { hu: 'Mivel mérjük egy alma tömegét?', ro: 'Cu ce măsurăm greutatea unui măr?', en: 'Which unit do we use for the weight of an apple?', a: 'g', w: ['km', 'l'], e: '🍎' },
    { hu: 'Mivel mérjük, mennyi tej van egy pohárban?', ro: 'Cu ce măsurăm cât lapte este într-un pahar?', en: 'Which unit tells us how much milk is in a glass?', a: 'ml', w: ['g', 'm'], e: '🥛' },
    { hu: 'Mivel mérjük, meddig tart egy tanóra?', ro: 'Cu ce măsurăm cât durează o oră de curs?', en: 'Which unit do we use for how long a lesson lasts?', a: { hu: 'perc', ro: 'minute', en: 'minutes' }, w: [{ hu: 'méter', ro: 'metri', en: 'metres' }, { hu: 'liter', ro: 'litri', en: 'litres' }], e: '⏰' }
  ];
  const UNAME = {
    cm: { hu: 'centiméter', ro: 'centimetru', en: 'centimetre' }, m: { hu: 'méter', ro: 'metru', en: 'metre' }, km: { hu: 'kilométer', ro: 'kilometru', en: 'kilometre' },
    g: { hu: 'gramm', ro: 'gram', en: 'gram' }, kg: { hu: 'kilogramm', ro: 'kilogram', en: 'kilogram' },
    ml: { hu: 'milliliter', ro: 'mililitru', en: 'millilitre' }, l: { hu: 'liter', ro: 'litru', en: 'litre' }
  };
  // átváltások: [nagy egység, kicsi egység, szorzó, szintektől]
  const CONV = [
    ['m', 'cm', 100, 2], ['kg', 'g', 1000, 3], ['l', 'ml', 1000, 3], ['km', 'm', 1000, 3],
    [{ hu: ['óra', 'óra'], ro: ['oră', 'ore'], en: ['hour', 'hours'] }, { hu: 'perc', ro: 'minute', en: 'minutes' }, 60, 2],
    [{ hu: ['nap', 'nap'], ro: ['zi', 'zile'], en: ['day', 'days'] }, { hu: 'óra', ro: 'ore', en: 'hours' }, 24, 2],
    [{ hu: ['hét', 'hét'], ro: ['săptămână', 'săptămâni'], en: ['week', 'weeks'] }, { hu: 'nap', ro: 'zile', en: 'days' }, 7, 2],
    [{ hu: ['év', 'év'], ro: ['an', 'ani'], en: ['year', 'years'] }, { hu: 'hónap', ro: 'luni', en: 'months' }, 12, 2]
  ];
  GJ.register({
    id: 'mertekegyseg', subject: 'matek', icon: '📏', grades: [1, 2, 3, 4],
    title: { hu: 'Mértékegységek', ro: 'Unități de măsură', en: 'Units of measure' },
    desc: { hu: 'Hossz, tömeg, űrtartalom, idő', ro: 'Lungime, masă, capacitate, timp', en: 'Length, weight, capacity, time' },
    make({ level, lang }) {
      if (level === 1 || Math.random() < 0.3) {
        const it = pick(UNIT_Q), lab = x => (typeof x === 'object' ? x[lang] : x);
        const a = lab(it.a), w = it.w.map(lab);
        const nice = {}; [a].concat(w).forEach(u => { nice[u] = UNAME[u] ? `${u} (${UNAME[u][lang]})` : u; });
        return { type: 'choice', key: it.hu, prompt: it[lang], speak: it[lang], big: GJ.pic(it.e), options: options(a, w, 3), answer: a, optionLabels: nice, cols: 1, fixed: true };
      }
      const pool = CONV.filter(c => c[3] <= level);
      const [big, small, f] = pick(pool);
      const n = rand(1, level === 2 ? 5 : 9);
      const bigL = typeof big === 'object' ? big[lang][n === 1 ? 0 : 1] : big, smallL = typeof small === 'object' ? small[lang] : small;
      let q = `${n} ${bigL} = ? ${smallL}`, ans = n * f;
      if (level === 3 && f === 100 && Math.random() < 0.5) { const extra = rand(5, 95); q = `${n} ${bigL} ${extra} ${smallL} = ? ${smallL}`; ans = n * f + extra; }
      const prompt = { hu: 'Váltsd át!', ro: 'Transformă!', en: 'Convert!' }[lang];
      const wr = [ans + f, ans - f, n * 10, n * (f === 60 ? 100 : 60), ans + 10, ans * 10].filter(x => x > 0 && x !== ans);
      return { type: 'choice', key: q, prompt, speak: prompt + ' ' + q.replace('?', '…'), big: `<div class="big-eq">${esc(q)}</div>`, options: options(ans, shuffle(wr), 4), answer: ans };
    }
  });

  /* ====================== 3. Alakzatok ====================== */
  const SHAPES = [
    { id: 'tri', sides: 3, n: { hu: 'háromszög', ro: 'triunghi', en: 'triangle' }, svg: c => `<polygon points="50,8 94,88 6,88" fill="${c}"/>` },
    { id: 'sq', sides: 4, n: { hu: 'négyzet', ro: 'pătrat', en: 'square' }, svg: c => `<rect x="12" y="12" width="76" height="76" rx="4" fill="${c}"/>` },
    { id: 'rect', sides: 4, n: { hu: 'téglalap', ro: 'dreptunghi', en: 'rectangle' }, svg: c => `<rect x="4" y="24" width="92" height="52" rx="4" fill="${c}"/>` },
    { id: 'circ', sides: 0, n: { hu: 'kör', ro: 'cerc', en: 'circle' }, svg: c => `<circle cx="50" cy="50" r="42" fill="${c}"/>` },
    { id: 'pent', sides: 5, n: { hu: 'ötszög', ro: 'pentagon', en: 'pentagon' }, svg: c => `<polygon points="50,6 94,38 77,92 23,92 6,38" fill="${c}"/>` },
    { id: 'hex', sides: 6, n: { hu: 'hatszög', ro: 'hexagon', en: 'hexagon' }, svg: c => `<polygon points="27,8 73,8 96,50 73,92 27,92 4,50" fill="${c}"/>` }
  ];
  const SCOL = ['#ff6fa8', '#4dabf7', '#51cf66', '#ffa94d', '#845ef7', '#fcc419', '#20c997'];
  const shapeSVG = (s, c, size = 120) => `<svg class="shape" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${s.svg(c)}</svg>`;
  GJ.register({
    id: 'alakzatok', subject: 'matek', icon: '🔺', grades: [0, 1, 2, 3],
    title: { hu: 'Alakzatok', ro: 'Figuri geometrice', en: 'Shapes' },
    desc: { hu: 'Háromszög, négyzet, kör…', ro: 'Triunghi, pătrat, cerc…', en: 'Triangle, square, circle…' },
    make({ level, lang }) {
      const kind = level === 1 ? 'name' : level === 2 ? pick(['name', 'sides']) : pick(['sides', 'count', 'count']);
      if (kind === 'count') {
        const target = pick(SHAPES), items = [];
        const n = rand(2, 5); for (let i = 0; i < n; i++) items.push(target);
        const others = SHAPES.filter(s => s !== target); for (let i = 0; i < rand(3, 5); i++) items.push(pick(others));
        const PL = {
          hu: { tri: 'háromszöget', sq: 'négyzetet', rect: 'téglalapot', circ: 'kört', pent: 'ötszöget', hex: 'hatszöget' },
          ro: { tri: 'triunghiuri', sq: 'pătrate', rect: 'dreptunghiuri', circ: 'cercuri', pent: 'pentagoane', hex: 'hexagoane' },
          en: { tri: 'triangles', sq: 'squares', rect: 'rectangles', circ: 'circles', pent: 'pentagons', hex: 'hexagons' }
        };
        const prompt = { hu: `Hány ${PL.hu[target.id]} látsz?`, ro: `Câte ${PL.ro[target.id]} vezi?`, en: `How many ${PL.en[target.id]} can you see?` }[lang];
        return { type: 'choice', key: prompt + n, prompt, speak: prompt,
          big: `<div class="shape-row">${shuffle(items).map(s => shapeSVG(s, pick(SCOL), 54)).join('')}</div>`,
          options: options(n, [n + 1, n - 1, n + 2].filter(x => x > 0), 4), answer: n };
      }
      const s = pick(level === 1 ? SHAPES.slice(0, 4) : SHAPES), col = pick(SCOL);
      if (kind === 'sides') {
        const sh = s.id === 'circ' ? pick(SHAPES.filter(x => x.sides)) : s;
        const prompt = { hu: 'Hány oldala van ennek az alakzatnak?', ro: 'Câte laturi are această figură?', en: 'How many sides does this shape have?' }[lang];
        return { type: 'choice', key: prompt + sh.id, prompt, speak: prompt, big: shapeSVG(sh, col), options: options(sh.sides, [3, 4, 5, 6, 8].filter(x => x !== sh.sides), 4), answer: sh.sides, cols: 2 };
      }
      const prompt = { hu: 'Mi a neve ennek az alakzatnak?', ro: 'Cum se numește această figură?', en: 'What is this shape called?' }[lang];
      const names = (level === 1 ? SHAPES.slice(0, 4) : SHAPES).map(x => x.n[lang]);
      return { type: 'choice', key: prompt + s.id, prompt, speak: prompt, big: shapeSVG(s, col), options: options(s.n[lang], shuffle(names.filter(x => x !== s.n[lang])), level === 1 ? 3 : 4), answer: s.n[lang], cols: 2 };
    }
  });

  /* ====================== 4. Diktálás ====================== */
  const DICT = {
    hu: [['ház', 'kút', 'tó', 'alma', 'labda', 'cica', 'kutya', 'hal', 'nap', 'hold', 'fa', 'ló', 'sapka', 'toll', 'méz', 'tej'],
      ['virág', 'iskola', 'ceruza', 'mókus', 'csiga', 'barack', 'nyuszi', 'szoba', 'gomba', 'tücsök', 'zsiráf', 'sárga', 'piros', 'cipő'],
      ['kenyér', 'sütemény', 'papucs', 'hattyú', 'szerda', 'könyvtár', 'gyönyörű', 'csütörtök', 'szivárvány', 'nyaklánc', 'pillangó', 'tengeri']],
    ro: [['casă', 'mama', 'tata', 'pom', 'cal', 'lup', 'nas', 'lună', 'sare', 'apă', 'pere', 'oaie', 'dop', 'nor'],
      ['școală', 'pisică', 'câine', 'floare', 'mână', 'pădure', 'ceas', 'carte', 'roșu', 'verde', 'pește', 'ușă'],
      ['fluture', 'bicicletă', 'prieten', 'grădină', 'ciocolată', 'castel', 'înghețată', 'curcubeu', 'vrăbiuță', 'țară', 'ghiozdan', 'șosete']],
    en: [['cat', 'dog', 'sun', 'hat', 'bed', 'pig', 'cup', 'red', 'box', 'fish', 'egg', 'bus', 'ten', 'map'],
      ['house', 'apple', 'green', 'chair', 'train', 'sheep', 'clock', 'happy', 'water', 'horse', 'tiger', 'shoe'],
      ['elephant', 'beautiful', 'castle', 'rainbow', 'butterfly', 'friend', 'school', 'purple', 'Wednesday', 'kitchen', 'giraffe', 'birthday']]
  };
  // román: a régi (cédillás) ş/ţ betűket is elfogadjuk
  const roAlt = w => [w.replace(/ș/g, 'ş').replace(/ț/g, 'ţ').replace(/Ș/g, 'Ş').replace(/Ț/g, 'Ţ')];
  GJ.register({
    id: 'diktalas', subject: 'nyelvtan', icon: '🎧', grades: [1, 2, 3, 4],
    title: { hu: 'Diktálás', ro: 'Dictare', en: 'Dictation' },
    desc: { hu: 'Hallgasd meg, és írd le!', ro: 'Ascultă și scrie!', en: 'Listen and write it!' },
    make({ level, lang }) {
      const w = pick(DICT[lang][level - 1]);
      const prompt = { hu: 'Írd le, amit hallasz!', ro: 'Scrie ce auzi!', en: 'Write what you hear!' }[lang];
      return {
        type: 'input', key: w, prompt, speak: w, autoSpeak: true, answer: w, accept: lang === 'ro' ? roAlt(w) : [],
        placeholder: { hu: 'ide írd…', ro: 'scrie aici…', en: 'type here…' }[lang],
        big: `<button class="big-speak" data-act="speak" aria-label="🔊">🔊</button>
          <p class="muted"><small>${{ hu: 'Koppints a hangszóróra, ha újra hallani szeretnéd.', ro: 'Atinge difuzorul ca să asculți din nou.', en: 'Tap the speaker to hear it again.' }[lang]}</small></p>`
      };
    }
  });

  /* ====================== 5. Olvasásértés ====================== */
  const READ = {
    hu: [
      ['Bori kiscicája, Pamacs, nagyon szereti a tejet. Reggel mindig az ajtó előtt vár, és hangosan nyávog. Ha Bori megsimogatja, dorombolni kezd.', '🐱',
        [['Hogy hívják a kiscicát?', 'Pamacs', 'Bori', 'Cirmi'], ['Mit szeret nagyon Pamacs?', 'a tejet', 'a halat', 'a sajtot'], ['Mit csinál, ha Bori megsimogatja?', 'dorombol', 'nyávog', 'elszalad']]],
      ['Szombaton Peti és a nagypapája horgászni mentek a tóhoz. Peti fogott egy kis halat, de visszaengedte a vízbe. Hazafelé fagyit ettek.', '🎣',
        [['Hová mentek szombaton?', 'a tóhoz', 'az erdőbe', 'a boltba'], ['Kivel ment Peti?', 'a nagypapájával', 'az anyukájával', 'a barátjával'], ['Mit csinált Peti a hallal?', 'visszaengedte', 'megette', 'hazavitte']]],
      ['Az erdő szélén élt egy sün, Tüske. Ősszel sok almát gyűjtött, mert téli álomra készült. A levelek alatt puha ágyat készített magának.', '🦔',
        [['Mi volt a sün neve?', 'Tüske', 'Mókus', 'Pamacs'], ['Mit gyűjtött ősszel?', 'almát', 'diót', 'gombát'], ['Hová készített ágyat?', 'a levelek alá', 'a fára', 'a házba']]],
      ['Ma esik az eső, ezért Anna nem mehet ki a kertbe. Inkább rajzol: egy nagy szivárványt fest a papírra. Mire elkészül, kisüt a nap.', '🌈',
        [['Miért nem mehet ki Anna?', 'mert esik az eső', 'mert beteg', 'mert sötét van'], ['Mit fest Anna?', 'szivárványt', 'házat', 'kutyát'], ['Mi történik a végén?', 'kisüt a nap', 'havazni kezd', 'Anna elalszik']]],
      ['A kis vonat minden reggel elindul az állomásról. Három piros kocsit húz, bennük gyerekek ülnek. A vonat az állatkertbe viszi őket.', '🚂',
        [['Hány kocsit húz a vonat?', 'hármat', 'kettőt', 'ötöt'], ['Milyen színűek a kocsik?', 'pirosak', 'kékek', 'zöldek'], ['Hová viszi a vonat a gyerekeket?', 'az állatkertbe', 'az iskolába', 'a tengerhez']]]
    ],
    ro: [
      ['Pisicuța Ioanei se numește Pufi și iubește laptele. Dimineața o așteaptă mereu la ușă și miaună tare. Când Ioana o mângâie, Pufi începe să toarcă.', '🐱',
        [['Cum se numește pisicuța?', 'Pufi', 'Ioana', 'Miți'], ['Ce iubește Pufi?', 'laptele', 'peștele', 'brânza'], ['Ce face Pufi când Ioana o mângâie?', 'toarce', 'miaună', 'fuge']]],
      ['Sâmbătă, Andrei și bunicul lui au mers la pescuit la lac. Andrei a prins un pește mic, dar l-a eliberat în apă. Pe drum spre casă au mâncat înghețată.', '🎣',
        [['Unde au mers sâmbătă?', 'la lac', 'în pădure', 'la magazin'], ['Cu cine a mers Andrei?', 'cu bunicul', 'cu mama', 'cu un prieten'], ['Ce a făcut Andrei cu peștele?', 'l-a eliberat', 'l-a mâncat', 'l-a dus acasă']]],
      ['La marginea pădurii trăia un arici pe nume Țepișor. Toamna aduna multe mere, pentru că se pregătea de somnul de iarnă. Sub frunze și-a făcut un pat moale.', '🦔',
        [['Cum se numea ariciul?', 'Țepișor', 'Pufi', 'Ronțăilă'], ['Ce aduna toamna?', 'mere', 'nuci', 'ciuperci'], ['Unde și-a făcut patul?', 'sub frunze', 'în copac', 'în casă']]],
      ['Azi plouă, așa că Maria nu poate ieși în grădină. În schimb, pictează un curcubeu mare pe hârtie. Până termină, iese soarele.', '🌈',
        [['De ce nu poate ieși Maria?', 'pentru că plouă', 'pentru că e bolnavă', 'pentru că e întuneric'], ['Ce pictează Maria?', 'un curcubeu', 'o casă', 'un câine'], ['Ce se întâmplă la sfârșit?', 'iese soarele', 'începe să ningă', 'Maria adoarme']]],
      ['Trenulețul pleacă în fiecare dimineață din gară. Trage trei vagoane roșii, în care stau copii. Trenulețul îi duce la grădina zoologică.', '🚂',
        [['Câte vagoane trage trenulețul?', 'trei', 'două', 'cinci'], ['Ce culoare au vagoanele?', 'roșii', 'albastre', 'verzi'], ['Unde îi duce pe copii?', 'la grădina zoologică', 'la școală', 'la mare']]]
    ],
    en: [
      ['Lily’s kitten is called Fluffy and she loves milk. Every morning she waits by the door and miaows loudly. When Lily strokes her, Fluffy starts to purr.', '🐱',
        [['What is the kitten called?', 'Fluffy', 'Lily', 'Tom'], ['What does Fluffy love?', 'milk', 'fish', 'cheese'], ['What does Fluffy do when Lily strokes her?', 'she purrs', 'she miaows', 'she runs away']]],
      ['On Saturday, Ben and his grandad went fishing at the lake. Ben caught a little fish, but he let it go back into the water. On the way home they had ice cream.', '🎣',
        [['Where did they go on Saturday?', 'to the lake', 'to the woods', 'to the shop'], ['Who did Ben go with?', 'his grandad', 'his mum', 'a friend'], ['What did Ben do with the fish?', 'he let it go', 'he ate it', 'he took it home']]],
      ['At the edge of the forest lived a hedgehog called Spike. In autumn he gathered lots of apples, because he was getting ready for his winter sleep. He made a soft bed under the leaves.', '🦔',
        [['What was the hedgehog called?', 'Spike', 'Fluffy', 'Nutty'], ['What did he gather in autumn?', 'apples', 'nuts', 'mushrooms'], ['Where did he make his bed?', 'under the leaves', 'in a tree', 'in a house']]],
      ['It is raining today, so Emma can’t go out into the garden. Instead, she paints a big rainbow on paper. By the time she finishes, the sun comes out.', '🌈',
        [['Why can’t Emma go out?', 'because it is raining', 'because she is ill', 'because it is dark'], ['What does Emma paint?', 'a rainbow', 'a house', 'a dog'], ['What happens at the end?', 'the sun comes out', 'it starts to snow', 'Emma falls asleep']]],
      ['The little train leaves the station every morning. It pulls three red carriages full of children. The train takes them to the zoo.', '🚂',
        [['How many carriages does the train pull?', 'three', 'two', 'five'], ['What colour are the carriages?', 'red', 'blue', 'green'], ['Where does the train take the children?', 'to the zoo', 'to school', 'to the seaside']]]
    ]
  };
  GJ.register({
    id: 'olvasas', subject: 'irodalom', icon: '📰', grades: [1, 2, 3, 4],
    title: { hu: 'Olvasásértés', ro: 'Citesc și înțeleg', en: 'Reading' },
    desc: { hu: 'Olvasd el a történetet, és válaszolj!', ro: 'Citește povestea și răspunde!', en: 'Read the story and answer!' },
    make({ lang }) {
      const [text, e, qs] = pick(READ[lang]), [q, a, ...w] = pick(qs);
      return { type: 'choice', key: q, prompt: q, speak: text + ' ' + q, fixed: true, cols: 1,
        big: `${GJ.pic(e)}<p class="reading">${esc(text)}</p>`, options: options(a, w, 3), answer: a };
    }
  });
})();
