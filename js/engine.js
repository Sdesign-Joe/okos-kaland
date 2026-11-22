/* Okos Kaland – játékmotor: játékok nyilvántartása és feladatgenerálás
 *
 * ÚJ JÁTÉK FELVÉTELE: GJ.register({...}) – lásd README.md
 *
 * Egy játék leírása:
 *   id        egyedi azonosító (pl. 'szorzas')
 *   subject   'matek' | 'nyelvtan' | 'irodalom'
 *   title     megjelenő név – szöveg vagy { hu, ro, en }
 *   icon      emoji
 *   desc      rövid leírás – szöveg vagy { hu, ro, en }
 *   langs     (nem kötelező) mely nyelveken jelenjen meg, pl. ['hu']
 *   make(ctx) egy feladatot ad vissza; ctx = { level: 1|2|3, lang, age, name }
 *   kind      (nem kötelező) 'story' a Mesekészítőhöz – ilyenkor nincs make()
 *
 * Feladat (choice = választós):
 *   { type:'choice', prompt, big?, options:[...], answer, speak?, hint?, explain?, unit?,
 *     optionLabels?, cols?, key?, fixed? }
 * Feladat (order = sorba rakós):
 *   { type:'order', prompt, big?, items:[{t, label?}...], answer:[t...] }
 */
(function () {
  'use strict';
  const { esc, pick, options } = GJ.u;

  GJ.SUBJECTS = {
    matek: { id: 'matek', icon: '🔢', img: 'img/ui/subj-matek.webp', get title() { return GJ.t('subj_matek'); }, get desc() { return GJ.t('subj_matek_d'); } },
    nyelvtan: { id: 'nyelvtan', icon: '✏️', img: 'img/ui/subj-nyelvtan.webp', get title() { return GJ.t('subj_nyelvtan'); }, get desc() { return GJ.t('subj_nyelvtan_d'); } },
    irodalom: { id: 'irodalom', icon: '📚', img: 'img/ui/subj-irodalom.webp', get title() { return GJ.t('subj_irodalom'); }, get desc() { return GJ.t('subj_irodalom_d'); } }
  };

  /* Kabala (bagoly) különböző hangulatokban */
  GJ.MASCOT = {
    hello: 'img/ui/owl-hello.webp', think: 'img/ui/owl-think.webp', cheer: 'img/ui/owl-cheer.webp',
    encourage: 'img/ui/owl-encourage.webp', trophy: 'img/ui/owl-trophy.webp'
  };
  /* Nehézségi szintek képei */
  GJ.LEVEL_IMG = ['img/story/friend-turtle.webp', 'img/story/friend-bunny.webp', 'img/ui/lvl-lion.webp'];

  /* Beépített játékok rajzolt ikonjai: img/ui/g-<id>.webp
     Új játéknál megadható saját kép: GJ.register({ ..., img: 'img/ui/sajat.webp' }); ha nincs, az emoji (icon) látszik. */
  const GAME_IMG = ['osszeadas', 'szorzas', 'szamlalo', 'hasonlitas', 'sorozat', 'penz', 'ora', 'jly', 'helyesiras',
    'szotag', 'szokirako', 'betorend', 'ellentetek', 'irasjel', 'nagybetu', 'mesekeszito', 'mesek', 'versek', 'rimek', 'kozmondasok'];

  GJ.games = [];
  GJ.register = function (g) {
    if (!g || !g.id || (!g.make && g.kind !== 'story') || !GJ.SUBJECTS[g.subject]) {
      console.warn('Hibás játékleírás:', g); return;
    }
    if (GJ.games.some(x => x.id === g.id)) { console.warn('Már létező játék:', g.id); return; }
    if (!g.img && GAME_IMG.includes(g.id)) g.img = `img/ui/g-${g.id}.webp`;
    GJ.games.push(g);
  };

  /** Ajánlott nehézségi szint az életkor alapján */
  GJ.levelFor = age => (age <= 7 ? 1 : age === 8 ? 2 : 3);

  /* ---------- Osztályok (tanterv szerinti ajánlás) ----------
     0 = óvoda / előkészítő, 1–4 = osztály. A profilban megadható; ha nincs, az életkorból becsüljük.
     A játékok „grades” mezője mondja meg, melyik osztályoknak ajánlott (a magyar és a román tanterv
     témáihoz igazítva: 1. o. 20-as, 2. o. 100-as számkör + szorzótábla, 3. o. 1000-es számkör). */
  GJ.gradeForAge = age => Math.max(0, Math.min(4, (age || 7) - 6));
  GJ.gradeOf = p => (p && p.grade != null ? p.grade : GJ.gradeForAge(p && p.age));
  GJ.levelForProfile = p => { const g = GJ.gradeOf(p); return g <= 1 ? 1 : g === 2 ? 2 : 3; };
  const GRADES = {
    osszeadas: [1, 2, 3, 4], szorzas: [2, 3, 4], szamlalo: [0, 1], hasonlitas: [0, 1, 2], sorozat: [1, 2, 3], penz: [1, 2, 3],
    ora: [2, 3], jly: [2, 3, 4], helyesiras: [1, 2, 3], szotag: [0, 1, 2], szokirako: [0, 1, 2], betorend: [2, 3],
    ellentetek: [1, 2, 3], irasjel: [1, 2], nagybetu: [1, 2], mesekeszito: [0, 1, 2, 3, 4], mesek: [0, 1, 2, 3],
    versek: [0, 1, 2, 3], rimek: [0, 1, 2], kozmondasok: [3, 4]
  };
  GJ.isRecommended = (g, p) => { const gr = g.grades || GRADES[g.id]; return !!(gr && p && gr.includes(GJ.gradeOf(p))); };

  const available = g => !g.langs || g.langs.includes(GJ.lang());

  /** Szülők által felvett saját feladatok – tantárgyanként egy „játék” */
  function customGame(subject) {
    const items = GJ.store.custom().filter(c => c.subject === subject);
    if (!items.length) return null;
    return {
      id: 'sajat-' + subject, subject, icon: '💝',
      get title() { return GJ.t('customTitle'); }, get desc() { return GJ.t('customDesc'); },
      maxRounds: items.length,
      make() {
        const it = pick(items);
        return {
          type: 'choice', key: it.id, prompt: it.question, speak: it.question, fixed: true,
          big: it.emoji ? GJ.pic(esc(it.emoji)) : '',
          options: options(it.answer, it.wrong, 4), answer: it.answer, cols: 1
        };
      }
    };
  }

  GJ.gamesFor = function (subject) {
    const list = GJ.games.filter(g => g.subject === subject && available(g));
    const c = customGame(subject);
    if (c) list.push(c);
    return list;
  };

  GJ.findGame = function (id) {
    return GJ.games.find(g => g.id === id) ||
      (String(id).startsWith('sajat-') ? customGame(id.slice(6)) : null);
  };

  /** Feladat a megadott játékból (nehézséghez igazítva) */
  GJ.taskFrom = function (game, ctx) {
    const t = game.make(Object.assign({ lang: GJ.lang() }, ctx));
    // Könnyű szinten 4 helyett 3 válaszlehetőség
    if (t.type === 'choice' && ctx.level === 1 && !t.fixed && t.options.length >= 4) {
      const wrong = t.options.filter(o => String(o) !== String(t.answer)).slice(0, 2);
      t.options = GJ.u.shuffle([t.answer, ...wrong]);
      if (!t.cols || t.cols === 2) t.cols = 3;
    }
    return t;
  };

  /** Új feladat, lehetőleg olyan, ami ebben a körben még nem volt */
  GJ.makeTask = function (game, ctx, seen) {
    let t;
    for (let i = 0; i < 40; i++) {
      t = GJ.taskFrom(game, ctx);
      const k = t.key != null ? String(t.key) : t.prompt + '|' + (t.big || '') + '|' + t.answer;
      if (!seen.has(k)) { seen.add(k); return t; }
    }
    return t;
  };
})();
