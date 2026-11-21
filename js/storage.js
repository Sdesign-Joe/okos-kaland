/* Okos Kaland – adattárolás (a böngésző helyi tárolójában) */
(function () {
  'use strict';

  const mem = {}; // tartalék, ha a localStorage nem elérhető (pl. privát ablak)

  function load(key, def) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? (key in mem ? mem[key] : def) : JSON.parse(v);
    } catch (e) {
      return key in mem ? mem[key] : def;
    }
  }
  function save(key, val) {
    mem[key] = val;
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* nincs tároló */ }
  }

  const DEFAULT_SETTINGS = { sound: true, autoSpeak: false, roundLen: 8 }; // a nyelvet első induláskor a böngésző nyelvéből választjuk (i18n.js)

  const store = {
    profiles() { return load('gj_profiles', []).map(p => store.fix(p)); },
    saveProfiles(p) { save('gj_profiles', p); },
    get(id) { return store.profiles().find(p => p.id === id) || null; },

    /** régebbi profilok kiegészítése új mezőkkel */
    fix(p) {
      if (!p) return p;
      p.stickers = p.stickers || []; p.played = p.played || {};
      p.stories = p.stories || []; p.diff = p.diff || {};
      return p;
    },

    current() {
      const id = load('gj_current', null);
      return id ? store.get(id) : null;
    },
    setCurrent(id) { save('gj_current', id); },

    add(data) {
      const ps = store.profiles();
      const p = {
        id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: data.name, age: data.age, avatar: data.avatar, color: data.color,
        stars: 0, solved: 0, stickers: [], played: {}, stories: [], diff: {}, created: Date.now()
      };
      ps.push(p);
      store.saveProfiles(ps);
      return p;
    },

    update(id, fn) {
      const ps = store.profiles();
      const p = ps.find(x => x.id === id);
      if (!p) return null;
      fn(p);
      store.saveProfiles(ps);
      return p;
    },

    remove(id) {
      store.saveProfiles(store.profiles().filter(p => p.id !== id));
      if (load('gj_current', null) === id) store.setCurrent(null);
    },

    settings() { return Object.assign({}, DEFAULT_SETTINGS, load('gj_settings', {})); },
    saveSettings(s) { save('gj_settings', s); },

    custom() { return load('gj_custom', []); },
    saveCustom(c) { save('gj_custom', c); },

    exportAll() {
      return {
        app: 'okos-kaland', version: 1, exported: new Date().toISOString(),
        profiles: store.profiles(), settings: store.settings(), custom: store.custom()
      };
    },

    importAll(data) {
      if (!data || data.app !== 'okos-kaland' || !Array.isArray(data.profiles)) {
        throw new Error('Ez nem Okos Kaland mentésfájl.');
      }
      store.saveProfiles(data.profiles);
      if (data.settings) store.saveSettings(data.settings);
      if (Array.isArray(data.custom)) store.saveCustom(data.custom);
    }
  };

  GJ.store = store;
})();
