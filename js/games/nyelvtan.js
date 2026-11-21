/* Okos Kaland – NYELVTAN játékok (hu / ro / en)
 * A szólisták szabadon bővíthetők: csak új sort kell hozzáadni a megfelelő nyelv listájához.
 */
(function () {
  'use strict';
  const { pick, shuffle, sample, options, splitHu, syllables, isVowel, article, cap, esc } = GJ.u;
  const gap = '<span class="gap"></span>';
  const exc = w => GJ.t('exCorrect', { w });
  /** betűkre bontás nyelvenként (magyarban a cs, sz, ny… egy betű) */
  const letters = (w, lang) => (lang === 'hu' ? splitHu(w) : [...w.toLowerCase()]);

  /* 1. J vagy LY? (csak magyar) ------------------------------------------ */
  const JLY = [
    ['gólya', '🪶'], ['bagoly', '🦉'], ['király', '🤴'], ['folyó', '🏞️'], ['hely', '📍'], ['lyuk', '🕳️'],
    ['mély', '🌊'], ['pehely', '❄️'], ['sirály', '🐦'], ['golyó', '🔮'], ['sólyom', '🦅'], ['kölyök', '🐾'],
    ['mosoly', '😊'], ['pulyka', '🦃'], ['zsemlye', '🥯'], ['kályha', '🔥'], ['fáklya', '🔦'], ['súly', '🏋️'],
    ['gulyás', '🍲'], ['szabály', '📜'], ['osztály', '🏫'], ['akadály', '🚧'], ['tavaly', '📅'], ['folyosó', '🚪'],
    ['fej', '🙂'], ['tej', '🥛'], ['száj', '👄'], ['papagáj', '🦜'], ['tojás', '🥚'], ['majom', '🐒'],
    ['vaj', '🧈'], ['sajt', '🧀'], ['hajó', '⛵'], ['ujj', '☝️'], ['játék', '🧸'], ['jég', '🧊'],
    ['ajtó', '🚪'], ['fejsze', '🪓'], ['bújócska', '🙈'], ['hajnal', '🌅'], ['kajak', '🛶'], ['tájkép', '🖼️']
  ];
  GJ.register({
    id: 'jly', subject: 'nyelvtan', icon: '🔤', langs: ['hu'],
    title: 'J vagy LY?', desc: 'Melyik betű hiányzik?',
    make() {
      const [w, e] = pick(JLY);
      const isLy = w.includes('ly');
      const i = isLy ? w.indexOf('ly') : w.indexOf('j');
      return {
        type: 'choice', key: w, prompt: 'Melyik betű hiányzik: j vagy ly?',
        speak: `Melyik betű hiányzik? j, vagy ly? A szó: ${w}`,
        big: `${GJ.pic(e)}<div class="word">${w.slice(0, i)}${gap}${w.slice(i + (isLy ? 2 : 1))}</div>`,
        options: ['j', 'ly'], answer: isLy ? 'ly' : 'j', cols: 2, explain: exc(w)
      };
    }
  });

  /* 2. Helyesírás-bajnok --------------------------------------------------- */
  const SPELL = {
    hu: [['virág', '🌸'], ['iskola', '🏫'], ['ceruza', '✏️'], ['kenyér', '🍞'], ['madár', '🐦'], ['cipő', '👟'],
      ['szivárvány', '🌈'], ['tükör', '🪞'], ['ablak', '🪟'], ['csillag', '⭐'], ['hóember', '⛄'], ['könyv', '📖'],
      ['füzet', '📒'], ['pillangó', '🦋'], ['sütemény', '🍰'], ['nagymama', '👵'], ['katica', '🐞'], ['repülő', '✈️'],
      ['fagylalt', '🍦'], ['kutya', '🐶'], ['kalap', '👒'], ['gyümölcs', '🍇'], ['csokoládé', '🍫'], ['ajándék', '🎁'],
      ['esernyő', '☂️'], ['teknős', '🐢'], ['nyuszi', '🐰'], ['mókus', '🐿️'], ['telefon', '📱'], ['labda', '⚽'],
      ['bicikli', '🚲'], ['autó', '🚗'], ['zsiráf', '🦒'], ['egér', '🐭'], ['sárkány', '🐉'], ['tűzoltó', '🧑‍🚒']],
    ro: [['pădure', '🌳'], ['fluture', '🦋'], ['căpșună', '🍓'], ['pisică', '🐱'], ['câine', '🐶'], ['pâine', '🍞'],
      ['ciocolată', '🍫'], ['înghețată', '🍦'], ['țestoasă', '🐢'], ['curcubeu', '🌈'], ['creion', '✏️'], ['mașină', '🚗'],
      ['bicicletă', '🚲'], ['girafă', '🦒'], ['șoarece', '🐭'], ['bunică', '👵'], ['umbrelă', '☂️'], ['fereastră', '🪟'],
      ['oglindă', '🪞'], ['prăjitură', '🍰'], ['telefon', '📱'], ['cadou', '🎁'], ['păpușă', '🪆'], ['iepure', '🐰'],
      ['floare', '🌸'], ['pasăre', '🐦'], ['lămâie', '🍋'], ['ciupercă', '🍄'], ['elefant', '🐘'], ['broscuță', '🐸']],
    // angolban kézzel írt tipikus hibák
    en: [['friend', '🤝', 'freind', 'frend', 'frient'], ['school', '🏫', 'skool', 'shool', 'scool'],
      ['butterfly', '🦋', 'buterfly', 'butterflie', 'butterfli'], ['rainbow', '🌈', 'rainbo', 'reinbow', 'rainbou'],
      ['elephant', '🐘', 'elefant', 'elephent', 'eliphant'], ['giraffe', '🦒', 'girafe', 'jiraffe', 'giraff'],
      ['chocolate', '🍫', 'chocolat', 'choclate', 'chocolet'], ['banana', '🍌', 'bananna', 'banan', 'bannana'],
      ['apple', '🍎', 'aple', 'appel', 'appl'], ['pencil', '✏️', 'pensil', 'pencel', 'pencill'],
      ['house', '🏠', 'hous', 'howse', 'houce'], ['flower', '🌸', 'flowr', 'flawer', 'flouer'],
      ['umbrella', '☂️', 'umbrela', 'umbrellar', 'umbrelle'], ['present', '🎁', 'presant', 'prezent', 'pressent'],
      ['bicycle', '🚲', 'bicicle', 'bycycle', 'bicycel'], ['window', '🪟', 'windo', 'windoe', 'windou'],
      ['mirror', '🪞', 'miror', 'mirrer', 'mirorr'], ['teacher', '🧑‍🏫', 'teecher', 'techer', 'teatcher'],
      ['strawberry', '🍓', 'strawbery', 'strawberrie', 'strowberry'], ['dragon', '🐉', 'dragun', 'dragen', 'draggon'],
      ['mouse', '🐭', 'mous', 'mowse', 'mouce'], ['rabbit', '🐰', 'rabit', 'rabbet', 'rabbitt'],
      ['penguin', '🐧', 'pengwin', 'penguine', 'pinguin'], ['turtle', '🐢', 'turtel', 'tertle', 'turtal'],
      ['birthday', '🎂', 'birtday', 'berthday', 'birthdai'], ['yellow', '💛', 'yelow', 'yello', 'yallow'],
      ['purple', '💜', 'purpel', 'perple', 'purpul'], ['orange', '🍊', 'orenge', 'oringe', 'orang'],
      ['monkey', '🐒', 'monky', 'munkey', 'monkee'], ['carrot', '🥕', 'carot', 'carrut', 'karrot']]
  };
  const TOG = {
    hu: { a: 'á', á: 'a', e: 'é', é: 'e', i: 'í', í: 'i', o: 'ó', ó: 'o', ö: 'ő', ő: 'ö', u: 'ú', ú: 'u', ü: 'ű', ű: 'ü' },
    ro: { ă: 'a', â: 'a', î: 'i', ș: 's', ț: 't', a: 'ă', i: 'î', s: 'ș', t: 'ț' }
  };
  function misspell(w, lang) {
    const t = letters(w, lang), out = new Set(), tog = TOG[lang];
    // román: az utolsó betűt nem cseréljük (pisică → pisica is helyes szó lenne)
    const last = lang === 'ro' ? t.length - 1 : t.length;
    t.forEach((x, i) => { if (i < last && tog[x]) { const c = t.slice(); c[i] = tog[x]; out.add(c.join('')); } });
    for (let i = 0; i < t.length - 1; i++) {
      if (t[i] === t[i + 1] && !isVowel(t[i])) { const c = t.slice(); c.splice(i, 1); out.add(c.join('')); }
    }
    for (let i = 1; i < t.length - 1; i++) {
      const x = t[i];
      if (x.length === 1 && /[a-zșțăâîáéíóöőúüű]/.test(x) && !isVowel(x) && !'ăâî'.includes(x) &&
        t[i - 1] !== x && t[i + 1] !== x && (isVowel(t[i + 1]) || 'ăâî'.includes(t[i + 1]))) {
        const c = t.slice(); c.splice(i, 0, x); out.add(c.join(''));
      }
    }
    out.delete(w);
    return [...out];
  }
  GJ.register({
    id: 'helyesiras', subject: 'nyelvtan', icon: '🏅',
    title: { hu: 'Helyesírás-bajnok', ro: 'Campionul scrierii corecte', en: 'Spelling champion' },
    desc: { hu: 'Melyik szó van jól írva?', ro: 'Care cuvânt e scris corect?', en: 'Which word is spelled right?' },
    make({ level, lang }) {
      const row = pick(SPELL[lang]);
      const [w, e] = row;
      const wrongs = lang === 'en' ? shuffle(row.slice(2)) : shuffle(misspell(w, lang));
      const q = { hu: 'Melyik szó van helyesen írva?', ro: 'Care cuvânt este scris corect?', en: 'Which word is spelled correctly?' }[lang];
      return {
        type: 'choice', key: w, prompt: q, speak: `${q} ${w}`,
        big: `${GJ.pic(e)}`,
        options: options(w, wrongs, level === 1 ? 3 : 4), answer: w, cols: 1
      };
    }
  });

  /* 3. Szótagoló ----------------------------------------------------------
   * magyar: automatikus szótagolás; román/angol: kötőjellel megadva */
  const SYL = {
    hu: [['nap', '☀️'], ['hal', '🐟'], ['ház', '🏠'], ['sün', '🦔'], ['alma', '🍎'], ['cica', '🐱'], ['autó', '🚗'],
      ['labda', '⚽'], ['virág', '🌸'], ['kutya', '🐶'], ['ceruza', '✏️'], ['banán', '🍌'], ['citrom', '🍋'],
      ['iskola', '🏫'], ['pillangó', '🦋'], ['katica', '🐞'], ['papagáj', '🦜'], ['nagymama', '👵'], ['repülő', '✈️'],
      ['csokoládé', '🍫'], ['televízió', '📺'], ['hóember', '⛄'], ['eper', '🍓'], ['egér', '🐭'], ['zsiráf', '🦒'],
      ['teknősbéka', '🐢'], ['kenyér', '🍞'], ['dinnye', '🍉'], ['uborka', '🥒'], ['paradicsom', '🍅'],
      ['krokodil', '🐊'], ['elefánt', '🐘'], ['oroszlán', '🦁'], ['mókus', '🐿️'], ['gomba', '🍄'], ['szivárvány', '🌈']],
    ro: [['soa-re', '☀️'], ['pe-ște', '🐟'], ['ca-să', '🏠'], ['măr', '🍎'], ['pi-si-că', '🐱'], ['câi-ne', '🐶'],
      ['flu-tu-re', '🦋'], ['cio-co-la-tă', '🍫'], ['te-le-vi-zor', '📺'], ['a-vi-on', '✈️'], ['ba-na-nă', '🍌'],
      ['lă-mâ-ie', '🍋'], ['școa-lă', '🏫'], ['e-le-fant', '🐘'], ['gi-ra-fă', '🦒'], ['urs', '🐻'], ['lup', '🐺'],
      ['cal', '🐴'], ['co-pac', '🌳'], ['floa-re', '🌸'], ['ma-și-nă', '🚗'], ['cro-co-dil', '🐊'], ['bi-ci-cle-tă', '🚲'],
      ['cur-cu-beu', '🌈'], ['în-ghe-ța-tă', '🍦'], ['stea', '⭐'], ['lu-nă', '🌙'], ['min-ge', '⚽'], ['car-te', '📖'],
      ['pa-pa-gal', '🦜'], ['bu-ni-că', '👵'], ['dra-gon', '🐉'], ['pin-gu-in', '🐧'], ['ie-pu-re', '🐰'], ['a-rici', '🦔'], ['mai-mu-ță', '🐒']],
    en: [['sun', '☀️'], ['fish', '🐟'], ['house', '🏠'], ['cat', '🐱'], ['dog', '🐶'], ['tree', '🌳'], ['star', '⭐'],
      ['ap-ple', '🍎'], ['rab-bit', '🐰'], ['tur-tle', '🐢'], ['but-ter-fly', '🦋'], ['ba-na-na', '🍌'], ['el-e-phant', '🐘'],
      ['um-brel-la', '☂️'], ['straw-ber-ry', '🍓'], ['rain-bow', '🌈'], ['pen-cil', '✏️'], ['tel-e-vi-sion', '📺'],
      ['croc-o-dile', '🐊'], ['kan-ga-roo', '🦘'], ['pen-guin', '🐧'], ['mon-key', '🐒'], ['ti-ger', '🐯'], ['flow-er', '🌸'],
      ['wa-ter-mel-on', '🍉'], ['hel-i-cop-ter', '🚁'], ['bi-cy-cle', '🚲'], ['dra-gon', '🐉'], ['u-ni-corn', '🦄'],
      ['ham-burg-er', '🍔'], ['pine-ap-ple', '🍍'], ['bal-loon', '🎈'], ['snow-man', '⛄'], ['car-rot', '🥕'], ['cat-er-pil-lar', '🐛']]
  };
  GJ.register({
    id: 'szotag', subject: 'nyelvtan', icon: '👏',
    title: { hu: 'Szótagoló', ro: 'Despărțim în silabe', en: 'Syllable clap' },
    desc: { hu: 'Hány szótagú a szó?', ro: 'Câte silabe are cuvântul?', en: 'How many syllables?' },
    make({ level, lang }) {
      const maxS = level === 1 ? 3 : level === 2 ? 4 : 5;
      const split = w => (lang === 'hu' ? syllables(w) : w.split('-'));
      const [raw, e] = pick(SYL[lang].filter(([w]) => split(w).length <= maxS));
      const parts = split(raw), w = parts.join('');
      const opts = level === 1 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5];
      const q = { hu: 'Hány szótagból áll ez a szó?', ro: 'Câte silabe are acest cuvânt?', en: 'How many syllables does this word have?' }[lang];
      return {
        type: 'choice', key: w, prompt: q, fixed: true,
        speak: `${q} ${w}`,
        big: `${GJ.pic(e)}<div class="word">${w}</div>`,
        hint: {
          hu: '👏 Tapsold el! Minden szótagban egy magánhangzó van.',
          ro: '👏 Bate din palme pentru fiecare silabă!', en: '👏 Clap once for each syllable!'
        }[lang],
        options: opts, answer: parts.length, cols: opts.length, explain: parts.join(' – ')
      };
    }
  });

  /* 4. Szókirakó (sorba rakós) ------------------------------------------- */
  const BUILD = {
    hu: [['ház', '🏠'], ['cica', '🐱'], ['hal', '🐟'], ['nap', '☀️'], ['méz', '🍯'], ['alma', '🍎'], ['béka', '🐸'],
      ['kutya', '🐶'], ['csiga', '🐌'], ['nyuszi', '🐰'], ['hajó', '⛵'], ['autó', '🚗'], ['labda', '⚽'],
      ['virág', '🌸'], ['tojás', '🥚'], ['zsiráf', '🦒'], ['banán', '🍌'], ['madár', '🐦'], ['citrom', '🍋'],
      ['eper', '🍓'], ['gomba', '🍄'], ['mókus', '🐿️'], ['pillangó', '🦋'], ['szivárvány', '🌈'], ['csillag', '⭐'],
      ['teknős', '🐢'], ['sárkány', '🐉'], ['hóember', '⛄'], ['oroszlán', '🦁'], ['katica', '🐞']],
    ro: [['măr', '🍎'], ['leu', '🦁'], ['urs', '🐻'], ['lup', '🐺'], ['cal', '🐴'], ['nor', '☁️'], ['casă', '🏠'],
      ['melc', '🐌'], ['stea', '⭐'], ['vacă', '🐄'], ['oaie', '🐑'], ['rață', '🦆'], ['lună', '🌙'], ['pește', '🐟'],
      ['soare', '☀️'], ['miere', '🍯'], ['câine', '🐶'], ['barcă', '⛵'], ['minge', '⚽'], ['pisică', '🐱'],
      ['broască', '🐸'], ['iepure', '🐰'], ['floare', '🌸'], ['girafă', '🦒'], ['banană', '🍌'], ['pasăre', '🐦'],
      ['lămâie', '🍋'], ['căpșună', '🍓'], ['ciupercă', '🍄'], ['fluture', '🦋'], ['curcubeu', '🌈'], ['dragon', '🐉']],
    en: [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['bee', '🐝'], ['cow', '🐄'], ['owl', '🦉'], ['egg', '🥚'],
      ['fish', '🐟'], ['frog', '🐸'], ['duck', '🦆'], ['bear', '🐻'], ['moon', '🌙'], ['star', '⭐'], ['tree', '🌳'],
      ['lion', '🦁'], ['ball', '⚽'], ['boat', '⛵'], ['bird', '🐦'], ['cake', '🎂'], ['house', '🏠'], ['apple', '🍎'],
      ['snail', '🐌'], ['lemon', '🍋'], ['horse', '🐴'], ['mouse', '🐭'], ['zebra', '🦓'], ['rabbit', '🐰'],
      ['flower', '🌸'], ['banana', '🍌'], ['dragon', '🐉'], ['turtle', '🐢'], ['monkey', '🐒'], ['giraffe', '🦒'],
      ['rainbow', '🌈'], ['penguin', '🐧'], ['butterfly', '🦋'], ['mushroom', '🍄'], ['strawberry', '🍓']]
  };
  GJ.register({
    id: 'szokirako', subject: 'nyelvtan', icon: '🧩',
    title: { hu: 'Szókirakó', ro: 'Construiește cuvântul', en: 'Word builder' },
    desc: { hu: 'Rakd ki a szót a betűkből!', ro: 'Formează cuvântul din litere!', en: 'Build the word from letters!' },
    make({ level, lang }) {
      const [lo, hi] = [[3, 4], [4, 5], [5, 10]][level - 1];
      const pool = BUILD[lang].filter(([w]) => { const n = letters(w, lang).length; return n >= lo && n <= hi; });
      const [w, e] = pick(pool);
      const ls = letters(w, lang);
      let items = ls.map(t => ({ t }));
      for (let i = 0; i < 10; i++) {
        items = shuffle(items);
        if (items.map(x => x.t).join('') !== ls.join('')) break;
      }
      return {
        type: 'order', key: w,
        prompt: { hu: 'Rakd ki a szót a betűkből!', ro: 'Formează cuvântul din litere!', en: 'Build the word from the letters!' }[lang],
        speak: { hu: 'Rakd ki a szót: ', ro: 'Formează cuvântul: ', en: 'Build the word: ' }[lang] + w,
        big: `${GJ.pic(e)}`,
        hint: {
          hu: 'Koppints a betűkre a helyes sorrendben! (A „cs”, „sz”, „ny” egy betű!)',
          ro: 'Atinge literele în ordinea corectă!', en: 'Tap the letters in the right order!'
        }[lang],
        items, answer: ls, explain: exc(w)
      };
    }
  });

  /* 5. Ábécérend (sorba rakós) ------------------------------------------- */
  const ABC = {
    hu: ['a', 'b', 'c', 'cs', 'd', 'dz', 'dzs', 'e', 'f', 'g', 'gy', 'h', 'i', 'j', 'k', 'l', 'ly', 'm', 'n', 'ny',
      'o', 'ö', 'p', 'q', 'r', 's', 'sz', 't', 'ty', 'u', 'ü', 'v', 'w', 'x', 'y', 'z', 'zs'],
    ro: [...'aăâbcdefghiîjklmnopqrsștțuvwxyz'],
    en: [...'abcdefghijklmnopqrstuvwxyz']
  };
  const FOLD = { á: 'a', é: 'e', í: 'i', ó: 'o', ő: 'ö', ú: 'u', ű: 'ü' };
  function firstRank(w, lang) {
    const lw = w.toLowerCase();
    const first = lang === 'hu' ? splitHu(lw.replace(/[áéíóőúű]/g, c => FOLD[c]))[0] : lw[0];
    return ABC[lang].indexOf(first);
  }
  const ABC_WORDS = {
    hu: [['alma', '🍎'], ['banán', '🍌'], ['cica', '🐱'], ['csiga', '🐌'], ['dinnye', '🍉'], ['egér', '🐭'],
      ['fa', '🌳'], ['gomba', '🍄'], ['gyík', '🦎'], ['hal', '🐟'], ['iskola', '🏫'], ['jégkrém', '🍦'],
      ['kutya', '🐶'], ['láma', '🦙'], ['macska', '🐈'], ['nyuszi', '🐰'], ['olló', '✂️'], ['őz', '🦌'],
      ['pók', '🕷️'], ['róka', '🦊'], ['sün', '🦔'], ['szilva', '🫐'], ['teve', '🐫'], ['tyúk', '🐔'],
      ['uborka', '🥒'], ['üveg', '🍾'], ['vonat', '🚂'], ['zebra', '🦓'], ['zsiráf', '🦒'], ['nap', '☀️'],
      ['labda', '⚽'], ['méh', '🐝'], ['bagoly', '🦉'], ['kakas', '🐓'], ['hajó', '⛵'], ['tojás', '🥚']],
    ro: [['albină', '🐝'], ['bufniță', '🦉'], ['casă', '🏠'], ['delfin', '🐬'], ['elefant', '🐘'], ['fluture', '🦋'],
      ['girafă', '🦒'], ['hipopotam', '🦛'], ['iepure', '🐰'], ['înghețată', '🍦'], ['jucărie', '🧸'], ['koala', '🐨'],
      ['leu', '🦁'], ['măr', '🍎'], ['nor', '☁️'], ['oaie', '🐑'], ['pisică', '🐱'], ['rață', '🦆'], ['soare', '☀️'],
      ['șarpe', '🐍'], ['tigru', '🐯'], ['țestoasă', '🐢'], ['urs', '🐻'], ['vacă', '🐄'], ['zebră', '🦓'],
      ['lup', '🐺'], ['câine', '🐶'], ['floare', '🌸'], ['minge', '⚽'], ['tren', '🚂']],
    en: [['apple', '🍎'], ['bear', '🐻'], ['cat', '🐱'], ['dog', '🐶'], ['elephant', '🐘'], ['fish', '🐟'],
      ['giraffe', '🦒'], ['house', '🏠'], ['igloo', '🧊'], ['jellyfish', '🪼'], ['kite', '🪁'], ['lion', '🦁'],
      ['moon', '🌙'], ['nest', '🪺'], ['owl', '🦉'], ['penguin', '🐧'], ['queen', '👸'], ['rabbit', '🐰'],
      ['snail', '🐌'], ['tiger', '🐯'], ['umbrella', '☂️'], ['violin', '🎻'], ['whale', '🐳'], ['yo-yo', '🪀'],
      ['zebra', '🦓'], ['banana', '🍌'], ['duck', '🦆'], ['frog', '🐸'], ['star', '⭐'], ['train', '🚂']]
  };
  GJ.register({
    id: 'betorend', subject: 'nyelvtan', icon: '🔠',
    title: { hu: 'Ábécérend', ro: 'Ordinea alfabetică', en: 'ABC order' },
    desc: { hu: 'Tedd sorba a szavakat!', ro: 'Pune cuvintele în ordine!', en: 'Put the words in order!' },
    make({ level, lang }) {
      const n = level === 1 ? 3 : 4;
      const chosen = [], used = new Set();
      for (const it of shuffle(ABC_WORDS[lang])) {
        const r = firstRank(it[0], lang);
        if (r < 0 || used.has(r)) continue;
        used.add(r); chosen.push(it);
        if (chosen.length === n) break;
      }
      const sorted = chosen.slice().sort((a, b) => firstRank(a[0], lang) - firstRank(b[0], lang)).map(x => x[0]);
      let items = chosen.map(([w, e]) => ({ t: w, label: `${e} ${w}` }));
      for (let i = 0; i < 10; i++) {
        items = shuffle(items);
        if (items.map(x => x.t).join() !== sorted.join()) break;
      }
      const q = { hu: 'Tedd ábécérendbe a szavakat!', ro: 'Pune cuvintele în ordine alfabetică!', en: 'Put the words in ABC order!' }[lang];
      return {
        type: 'order', key: sorted.join(','), prompt: q,
        speak: q + ' ' + chosen.map(x => x[0]).join(', '),
        hint: {
          hu: 'Nézd a szavak első betűjét! a, á, b, c, cs, d, e, é, f, g, gy, h…',
          ro: 'Uită-te la prima literă! a, ă, â, b, c, d, e, f, g, h, i, î, j…',
          en: 'Look at the first letter! a, b, c, d, e, f, g, h, i, j…'
        }[lang],
        items, answer: sorted, explain: sorted.join(' → ')
      };
    }
  });

  /* 6. Ellentétek --------------------------------------------------------- */
  const OPP = {
    hu: [['nagy', 'kicsi'], ['hideg', 'meleg'], ['nappal', 'éjszaka'], ['fent', 'lent'], ['gyors', 'lassú'],
      ['vidám', 'szomorú'], ['tele', 'üres'], ['hosszú', 'rövid'], ['magas', 'alacsony'], ['világos', 'sötét'],
      ['könnyű', 'nehéz'], ['új', 'régi'], ['nyitott', 'zárt'], ['sok', 'kevés'], ['erős', 'gyenge'],
      ['öreg', 'fiatal'], ['száraz', 'nedves'], ['tiszta', 'piszkos'], ['kemény', 'puha'], ['jó', 'rossz'],
      ['hangos', 'halk'], ['vastag', 'vékony'], ['közel', 'messze'], ['előre', 'hátra'], ['bent', 'kint'],
      ['eleje', 'vége'], ['nevet', 'sír'], ['ad', 'kap'], ['felmegy', 'lemegy'], ['édes', 'savanyú']],
    ro: [['mare', 'mic'], ['rece', 'cald'], ['zi', 'noapte'], ['sus', 'jos'], ['repede', 'încet'], ['vesel', 'trist'],
      ['plin', 'gol'], ['lung', 'scurt'], ['înalt', 'scund'], ['luminos', 'întunecat'], ['ușor', 'greu'], ['nou', 'vechi'],
      ['deschis', 'închis'], ['mult', 'puțin'], ['puternic', 'slab'], ['bătrân', 'tânăr'], ['uscat', 'ud'],
      ['curat', 'murdar'], ['tare', 'moale'], ['bun', 'rău'], ['gros', 'subțire'], ['aproape', 'departe'],
      ['înainte', 'înapoi'], ['înăuntru', 'afară'], ['dulce', 'acru'], ['zgomotos', 'liniștit'], ['a râde', 'a plânge'],
      ['a da', 'a primi'], ['a urca', 'a coborî'], ['primul', 'ultimul']],
    en: [['big', 'small'], ['cold', 'hot'], ['day', 'night'], ['up', 'down'], ['fast', 'slow'], ['happy', 'sad'],
      ['full', 'empty'], ['long', 'short'], ['high', 'low'], ['light', 'dark'], ['new', 'old'], ['open', 'closed'],
      ['many', 'few'], ['strong', 'weak'], ['wet', 'dry'], ['clean', 'dirty'], ['hard', 'soft'], ['good', 'bad'],
      ['thick', 'thin'], ['near', 'far'], ['in', 'out'], ['sweet', 'sour'], ['loud', 'quiet'], ['push', 'pull'],
      ['laugh', 'cry'], ['give', 'take'], ['first', 'last'], ['front', 'back'], ['early', 'late'], ['win', 'lose']]
  };
  GJ.register({
    id: 'ellentetek', subject: 'nyelvtan', icon: '↔️',
    title: { hu: 'Ellentétek', ro: 'Contrarii', en: 'Opposites' },
    desc: { hu: 'Mi a szó ellentéte?', ro: 'Care este opusul cuvântului?', en: "What's the opposite?" },
    make({ lang }) {
      const list = OPP[lang], pair = pick(list);
      const flip = Math.random() < 0.5;
      const w = flip ? pair[1] : pair[0], ans = flip ? pair[0] : pair[1];
      const others = shuffle(list.filter(p => p !== pair).flat());
      const q = {
        hu: `Mi ${article(w)} „${w}” szó ellentéte?`, ro: `Care este opusul cuvântului „${w}”?`, en: `What is the opposite of “${w}”?`
      }[lang];
      return {
        type: 'choice', key: w, prompt: q, speak: q.replace(/[„”“]/g, ''),
        big: `<div class="word big-word">${esc(w)} ↔ <span class="qmark">?</span></div>`,
        options: options(ans, others), answer: ans
      };
    }
  });

  /* 7. Mondatvégi írásjel ------------------------------------------------- */
  const SENT = {
    hu: [['Ma szép idő van', '.'], ['A cica a kanapén alszik', '.'], ['Anya finom levest főz', '.'],
      ['Holnap kirándulni megyünk', '.'], ['A fán sok alma terem', '.'], ['Esik az eső', '.'], ['Télen hull a hó', '.'],
      ['Hány éves vagy', '?'], ['Hol van a labdám', '?'], ['Mit eszünk ma ebédre', '?'], ['Ki jön velem játszani', '?'],
      ['Szereted a fagyit', '?'], ['Mikor indul a vonat', '?'], ['Miért kék az ég', '?'],
      ['Vigyázz, jön az autó', '!'], ['Gyere ide gyorsan', '!'], ['Csukd be az ajtót', '!'], ['Hurrá, nyertünk', '!'],
      ['Jaj, de szép ez a virág', '!'], ['Ne fuss az úttesten', '!'], ['Moss kezet evés előtt', '!']],
    ro: [['Astăzi este o zi frumoasă', '.'], ['Pisica doarme pe canapea', '.'], ['Mama gătește o supă bună', '.'],
      ['Mâine mergem în excursie', '.'], ['Plouă afară', '.'], ['Cartea este pe masă', '.'], ['Iarna ninge', '.'],
      ['Câți ani ai', '?'], ['Unde este mingea mea', '?'], ['Ce mâncăm azi la prânz', '?'], ['Cine vine să se joace cu mine', '?'],
      ['Îți place înghețata', '?'], ['Când pleacă trenul', '?'], ['De ce este cerul albastru', '?'],
      ['Atenție, vine mașina', '!'], ['Vino repede aici', '!'], ['Închide ușa', '!'], ['Ura, am câștigat', '!'],
      ['Ce floare frumoasă', '!'], ['Nu alerga pe stradă', '!'], ['Spală-te pe mâini', '!']],
    en: [['Today is a lovely day', '.'], ['The cat is sleeping on the sofa', '.'], ['Mum is cooking soup', '.'],
      ['We are going on a trip tomorrow', '.'], ['It is raining outside', '.'], ['The book is on the table', '.'], ['Snow falls in winter', '.'],
      ['How old are you', '?'], ['Where is my ball', '?'], ['What are we having for lunch', '?'], ['Who wants to play with me', '?'],
      ['Do you like ice cream', '?'], ['When does the train leave', '?'], ['Why is the sky blue', '?'],
      ['Watch out, a car is coming', '!'], ['Come here quickly', '!'], ['Close the door', '!'], ['Hooray, we won', '!'],
      ['What a beautiful flower', '!'], ["Don't run on the road", '!'], ['Wash your hands', '!']]
  };
  const PUNCT = {
    hu: { labels: { '.': '.  pont', '?': '?  kérdőjel', '!': '!  felkiáltójel' },
      why: { '.': 'Kijelentő mondat: pont kerül a végére.', '?': 'Kérdő mondat: kérdőjel kerül a végére.', '!': 'Felkiáltó vagy felszólító mondat: felkiáltójel kerül a végére.' },
      q: 'Milyen írásjel kerül a mondat végére?' },
    ro: { labels: { '.': '.  punct', '?': '?  semnul întrebării', '!': '!  semnul exclamării' },
      why: { '.': 'Propoziție enunțiativă: se pune punct.', '?': 'Propoziție interogativă: se pune semnul întrebării.', '!': 'Propoziție exclamativă sau imperativă: se pune semnul exclamării.' },
      q: 'Ce semn de punctuație se pune la sfârșit?' },
    en: { labels: { '.': '.  full stop', '?': '?  question mark', '!': '!  exclamation mark' },
      why: { '.': 'A statement ends with a full stop.', '?': 'A question ends with a question mark.', '!': 'An exclamation or a command ends with an exclamation mark.' },
      q: 'Which punctuation mark goes at the end?' }
  };
  GJ.register({
    id: 'irasjel', subject: 'nyelvtan', icon: '❓',
    title: { hu: 'Mondatvégi írásjel', ro: 'Semne de punctuație', en: 'End punctuation' },
    desc: { hu: 'Pont, kérdőjel vagy felkiáltójel?', ro: 'Punct, semnul întrebării sau al exclamării?', en: 'Full stop, question or exclamation mark?' },
    make({ lang }) {
      const [s, p] = pick(SENT[lang]), P = PUNCT[lang];
      return {
        type: 'choice', key: s, prompt: P.q, speak: `${P.q} ${s}`, fixed: true,
        big: `<div class="sentence">${esc(s)}${gap}</div>`,
        options: ['.', '?', '!'], answer: p, cols: 3, optionLabels: P.labels, explain: P.why[p]
      };
    }
  });

  /* 8. Nagy kezdőbetű ----------------------------------------------------- */
  const PROPER = {
    hu: [['Budapest', 'city'], ['Debrecen', 'city'], ['Szeged', 'city'], ['Pécs', 'city'], ['Győr', 'city'],
      ['Balaton', 'lake'], ['Duna', 'river'], ['Tisza', 'river'], ['Mátra', 'mountain'], ['Magyarország', 'country'],
      ['Anna', 'person'], ['Péter', 'person'], ['Lili', 'person'], ['Bence', 'person'], ['Zsófi', 'person'],
      ['Bodri', 'pet'], ['Cirmi', 'pet']],
    ro: [['București', 'city'], ['Cluj', 'city'], ['Iași', 'city'], ['Timișoara', 'city'], ['Brașov', 'city'],
      ['Dunărea', 'river'], ['Mureș', 'river'], ['Carpați', 'mountain'], ['România', 'country'],
      ['Ana', 'person'], ['Mihai', 'person'], ['Ioana', 'person'], ['Andrei', 'person'], ['Azorel', 'pet'], ['Grivei', 'pet']],
    en: [['London', 'city'], ['Paris', 'city'], ['Thames', 'river'], ['England', 'country'], ['Scotland', 'country'],
      ['Anna', 'person'], ['Peter', 'person'], ['Emma', 'person'], ['Ben', 'person'],
      ['Monday', 'day'], ['Friday', 'day'], ['Rex', 'pet'], ['Bella', 'pet']]
  };
  const COMMON = {
    hu: ['asztal', 'kutya', 'folyó', 'város', 'fiú', 'lány', 'hegy', 'tó', 'alma', 'iskola', 'cica', 'autó', 'ország',
      'virág', 'ceruza', 'ablak', 'labda', 'madár', 'kenyér', 'erdő'],
    ro: ['masă', 'câine', 'râu', 'oraș', 'băiat', 'fată', 'munte', 'lac', 'măr', 'școală', 'pisică', 'mașină', 'țară',
      'floare', 'creion', 'carte', 'minge', 'pasăre', 'pâine', 'pădure'],
    en: ['table', 'dog', 'river', 'city', 'boy', 'girl', 'mountain', 'lake', 'apple', 'school', 'cat', 'car', 'country',
      'flower', 'pencil', 'book', 'ball', 'bird', 'bread', 'forest']
  };
  const WHY = {
    hu: { city: 'A városok neve nagy kezdőbetűs.', lake: 'A tavak neve nagy kezdőbetűs.', river: 'A folyók neve nagy kezdőbetűs.',
      mountain: 'A hegyek neve nagy kezdőbetűs.', country: 'Az országok neve nagy kezdőbetűs.', person: 'Az emberek neve nagy kezdőbetűs.',
      pet: 'Az állatok neve is nagy kezdőbetűs.' },
    ro: { city: 'Numele orașelor se scriu cu literă mare.', river: 'Numele râurilor se scriu cu literă mare.',
      mountain: 'Numele munților se scriu cu literă mare.', country: 'Numele țărilor se scriu cu literă mare.',
      person: 'Numele oamenilor se scriu cu literă mare.', pet: 'Și numele animalelor se scriu cu literă mare.' },
    en: { city: 'Names of cities start with a capital letter.', river: 'Names of rivers start with a capital letter.',
      country: 'Names of countries start with a capital letter.', person: "People's names start with a capital letter.",
      pet: "Pets' names start with a capital letter too.", day: 'In English, days of the week start with a capital letter.' }
  };
  GJ.register({
    id: 'nagybetu', subject: 'nyelvtan', icon: '🅰️',
    title: { hu: 'Nagy kezdőbetű', ro: 'Literă mare', en: 'Capital letters' },
    desc: { hu: 'Melyiket írjuk nagybetűvel?', ro: 'Care se scrie cu literă mare?', en: 'Which needs a capital letter?' },
    make({ lang }) {
      const [p, kind] = pick(PROPER[lang]);
      const ans = p.toLowerCase();
      const q = { hu: 'Melyik szót írjuk nagy kezdőbetűvel?', ro: 'Care cuvânt se scrie cu literă mare?', en: 'Which word starts with a capital letter?' }[lang];
      return {
        type: 'choice', key: p, prompt: q, speak: q,
        big: '<img class="task-img" src="img/ui/g-nagybetu.webp" alt="">',
        options: options(ans, sample(COMMON[lang], 3)), answer: ans, cols: 2,
        explain: `${exc(cap(p))}. ${WHY[lang][kind]}`
      };
    }
  });
})();
