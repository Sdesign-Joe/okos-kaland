/* Okos Kaland – segédfüggvények */
window.GJ = window.GJ || {};

(function () {
  'use strict';

  const VOWELS = 'aáeéiíoóöőuúüű';
  // Magyar többjegyű betűk (a hosszabbtól a rövidebb felé)
  const MULTI = ['dzs', 'cs', 'dz', 'gy', 'ly', 'ny', 'sz', 'ty', 'zs'];

  const u = {
    rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    sample(arr, n) { return u.shuffle(arr).slice(0, n); },

    esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    /** Válaszlehetőségek: a helyes + egyedi rossz válaszok, összekeverve. */
    options(answer, wrongs, n = 4) {
      const seen = new Set([String(answer)]);
      const out = [answer];
      for (const w of wrongs) {
        if (out.length >= n) break;
        const k = String(w);
        if (!seen.has(k)) { seen.add(k); out.push(w); }
      }
      return u.shuffle(out);
    },

    isVowel(ch) { return ch.length === 1 && VOWELS.includes(ch.toLowerCase()); },

    /** Szó felbontása magyar betűkre: "gyöngy" → ["gy","ö","n","gy"] */
    splitHu(word) {
      const w = word.toLowerCase();
      const out = [];
      let i = 0;
      while (i < w.length) {
        const m = MULTI.find(x => w.startsWith(x, i));
        if (m) { out.push(m); i += m.length; } else { out.push(w[i]); i++; }
      }
      return out;
    },

    /** Szótagolás: "ceruza" → ["ce","ru","za"] (egyszerű szavakra) */
    syllables(word) {
      const toks = u.splitHu(word);
      const vi = [];
      toks.forEach((t, i) => { if (u.isVowel(t)) vi.push(i); });
      if (vi.length <= 1) return [word.toLowerCase()];
      const parts = [];
      let start = 0;
      for (let k = 0; k < vi.length - 1; k++) {
        const v = vi[k], nv = vi[k + 1];
        const cons = nv - v - 1;
        const cut = cons === 0 ? v + 1 : nv - 1; // az utolsó mássalhangzó a következő szótagba megy
        parts.push(toks.slice(start, cut).join(''));
        start = cut;
      }
      parts.push(toks.slice(start).join(''));
      return parts;
    },

    /** Névelő: "a" vagy "az" */
    article(word) { return u.isVowel(word[0]) ? 'az' : 'a'; },

    cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  };

  GJ.u = u;
})();
