/* Okos Kaland – nyelvspecifikus nyelvtani játékok
 *   ro: aai (â sau î), ortograme (s-a/sa, i-a/ia, ce-a/cea…)
 *   en: aan (a vagy an), plural (többes szám)
 * (A magyar j/ly a nyelvtan.js-ben van.) A listák szabadon bővíthetők.
 */
(function () {
  'use strict';
  const { pick, shuffle, options, esc } = GJ.u;

  /* ---------- RO: â sau î ---------- */
  const AI = [
    ['c_ine', 'â', 'câine', '🐶'], ['p_ine', 'â', 'pâine', '🍞'], ['m_ine', 'â', 'mâine', '📅'], ['m_nă', 'â', 'mână', '✋'],
    ['r_u', 'â', 'râu', '🏞️'], ['v_nt', 'â', 'vânt', '🌬️'], ['c_ntec', 'â', 'cântec', '🎵'], ['l_nă', 'â', 'lână', '🧶'],
    ['rom_n', 'â', 'român', '🇷🇴'], ['g_scă', 'â', 'gâscă', '🪿'], ['_nger', 'î', 'înger', '👼'], ['_nalt', 'î', 'înalt', '🦒'],
    ['_ncet', 'î', 'încet', '🐢'], ['_not', 'î', 'înot', '🏊'], ['_nghețată', 'î', 'înghețată', '🍦'], ['cobor_', 'î', 'coborî', '⬇️'],
    ['hotăr_', 'î', 'hotărî', '🤔'], ['_mbrăcăminte', 'î', 'îmbrăcăminte', '👕'], ['_ntuneric', 'î', 'întuneric', '🌑'], ['_mpărat', 'î', 'împărat', '👑']
  ];
  GJ.register({
    id: 'aai', subject: 'nyelvtan', icon: '✍️', langs: ['ro'], grades: [1, 2, 3, 4],
    title: { hu: 'â vagy î?', ro: 'â sau î?', en: 'â or î?' },
    desc: { hu: 'Román helyesírás', ro: 'Scrie corect cu â sau î!', en: 'Romanian spelling' },
    make() {
      const [w, a, full, e] = pick(AI);
      const q = 'Ce literă lipsește: â sau î?';
      return { type: 'choice', key: full, prompt: q, speak: q, fixed: true, cols: 2,
        big: `${GJ.pic(e)}<div class="big-word">${esc(w).replace('_', '<span class="gap"></span>')}</div>`,
        options: ['â', 'î'], answer: a, explain: `${full} – „î” se scrie la începutul și la sfârșitul cuvântului, „â” în interior.` };
    }
  });

  /* ---------- RO: ortograme ---------- */
  const ORT = [
    ['Copilul ___ dus la școală.', 's-a', 'sa'], ['Ana își iubește pisica ___.', 'sa', 's-a'],
    ['Copiii ___ jucat în parc.', 's-au', 'sau'], ['Vrei mere ___ pere?', 'sau', 's-au'],
    ['Bunica ___ dat o carte.', 'i-a', 'ia'], ['___ umbrela, că plouă!', 'Ia', 'I-a'],
    ['Aceasta este ___ mai frumoasă floare.', 'cea', 'ce-a'], ['___ spus doamna învățătoare?', 'Ce-a', 'Cea'],
    ['Tu ___ venit ieri la joacă.', 'n-ai', 'nai'], ['Ciobanul cântă la ___.', 'nai', 'n-ai'],
    ['Tata ___ ajutat pe Andrei.', 'l-a', 'la'], ['Mergem ___ bunici.', 'la', 'l-a'],
    ['Tu ___ chemat?', 'm-ai', 'mai'], ['Vreau ___ multă ciocolată.', 'mai', 'm-ai'],
    ['Afară plouă ___.', 'iar', 'i-ar'], ['Mihai ___ da o bomboană.', 'i-ar', 'iar'],
    ['Elevii ___ făcut temele.', 'și-au', 'și au'], ['Pisica ___ găsit puii.', 'și-a', 'și a']
  ];
  GJ.register({
    id: 'ortograme', subject: 'nyelvtan', icon: '🔗', langs: ['ro'], grades: [2, 3, 4],
    title: { hu: 'Ortogramák', ro: 'Ortograme', en: 'Romanian spelling pairs' },
    desc: { hu: 's-a / sa, i-a / ia…', ro: 's-a / sa, i-a / ia, ce-a / cea…', en: 's-a / sa, i-a / ia…' },
    make() {
      const [s, a, w] = pick(ORT);
      const q = 'Alege forma corectă!';
      return { type: 'choice', key: s, prompt: q, speak: q, fixed: true, cols: 2,
        big: `<div class="big-sentence">${esc(s).replace('___', '<span class="gap"></span>')}</div>`,
        options: shuffle([a, w]), answer: a, explain: s.replace('___', a) };
    }
  });

  /* ---------- EN: a or an ---------- */
  const AAN = [
    ['apple', 'an', '🍎'], ['egg', 'an', '🥚'], ['orange', 'an', '🍊'], ['umbrella', 'an', '☂️'], ['elephant', 'an', '🐘'],
    ['ice cream', 'an', '🍦'], ['owl', 'an', '🦉'], ['octopus', 'an', '🐙'], ['ant', 'an', '🐜'], ['igloo', 'an', '🧊'],
    ['cat', 'a', '🐱'], ['dog', 'a', '🐶'], ['banana', 'a', '🍌'], ['pencil', 'a', '✏️'], ['house', 'a', '🏠'],
    ['tree', 'a', '🌳'], ['ball', 'a', '⚽'], ['rabbit', 'a', '🐰'], ['car', 'a', '🚗'], ['fish', 'a', '🐟']
  ];
  GJ.register({
    id: 'aan', subject: 'nyelvtan', icon: '🅰️', langs: ['en'], grades: [1, 2],
    title: { hu: 'a vagy an?', ro: 'a sau an?', en: 'a or an?' },
    desc: { hu: 'Angol névelő', ro: 'Articolul în engleză', en: 'Choose the right word' },
    make() {
      const [w, a, e] = pick(AAN);
      const q = 'Which word goes in the gap: a or an?';
      return { type: 'choice', key: w, prompt: q, speak: q, fixed: true, cols: 2,
        big: `${GJ.pic(e)}<div class="big-word"><span class="gap"></span> ${esc(w)}</div>`,
        options: ['a', 'an'], answer: a, explain: `${a} ${w} – we use “an” before a vowel sound (a, e, i, o, u).` };
    }
  });

  /* ---------- EN: plurals ---------- */
  const PLURAL = [
    ['cat', 'cats', ['cates', 'caties'], '🐱'], ['dog', 'dogs', ['doges', 'dogies'], '🐶'], ['box', 'boxes', ['boxs', 'boxies'], '📦'],
    ['bus', 'buses', ['buss', 'busies'], '🚌'], ['fox', 'foxes', ['foxs', 'foxies'], '🦊'], ['baby', 'babies', ['babys', 'babyes'], '👶'],
    ['puppy', 'puppies', ['puppys', 'puppyes'], '🐕'], ['leaf', 'leaves', ['leafs', 'leafes'], '🍃'], ['wolf', 'wolves', ['wolfs', 'wolfes'], '🐺'],
    ['mouse', 'mice', ['mouses', 'mices'], '🐭'], ['child', 'children', ['childs', 'childrens'], '🧒'], ['foot', 'feet', ['foots', 'feets'], '🦶'],
    ['tooth', 'teeth', ['tooths', 'teeths'], '🦷'], ['sheep', 'sheep', ['sheeps', 'sheepes'], '🐑'], ['man', 'men', ['mans', 'mens'], '👨'],
    ['tomato', 'tomatoes', ['tomatos', 'tomatoies'], '🍅'], ['dish', 'dishes', ['dishs', 'dishies'], '🍽️'], ['watch', 'watches', ['watchs', 'watchies'], '⌚']
  ];
  GJ.register({
    id: 'plural', subject: 'nyelvtan', icon: '👯', langs: ['en'], grades: [2, 3, 4],
    title: { hu: 'Többes szám', ro: 'Pluralul', en: 'Plurals' },
    desc: { hu: 'Angol többes szám', ro: 'Pluralul în engleză', en: 'One cat, two cats!' },
    make({ level }) {
      const pool = level === 1 ? PLURAL.filter(p => p[1] === p[0] + 's' || p[1] === p[0] + 'es') : PLURAL;
      const [sg, pl, w, e] = pick(pool);
      const q = `One ${sg}, two …?`;
      return { type: 'choice', key: sg, prompt: q, speak: `One ${sg}, two what?`, fixed: true, cols: 3,
        big: `${GJ.pic(e)}<div class="big-word">one ${esc(sg)} → two <span class="gap"></span></div>`,
        options: options(pl, w, 3), answer: pl };
    }
  });
})();
