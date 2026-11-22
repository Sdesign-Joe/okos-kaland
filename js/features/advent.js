/* Okos Kaland – Adventi naptár (december 1–24)
 * Minden nap kinyílik egy ablak, ha a gyerek aznap teljesítette a napi küldetést.
 * A kimaradt napok ablakai is kinyithatók egy teljesített napon (gyerekbarát).
 * Mögöttük: csillagok, matrica (minden 6. nap), a 24.-én a téli háttér a Csillagboltba.
 * November 20-tól január 6-ig látszik a kezdőlapon (decemberig csak „hamarosan” felirattal).
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const S = GJ.store, t = GJ.t, { esc } = GJ.u;

  GJ.addTexts({
    hu: { advBtn: '🎄 Adventi naptár', advT: '🎄 Adventi naptár', advSoon: 'December 1-jén nyílik az első ablak! Minden nap egy meglepetés vár. ✨',
      advLead: 'Teljesítsd a mai küldetést, és nyisd ki a mai ablakot!', advNeed: 'Előbb teljesítsd a mai küldetést! 🎯', advLocked: 'Ez az ablak még zárva van – december {d}. ⏳',
      advStars: '+{n} ⭐', advSticker: 'Új matrica az albumodba!', advTheme: 'Ajándék: Téli háttér és karácsonyi bagolyruha a Csillagboltban! ❄️🎅', advOver: 'Boldog karácsonyt! 🎄',
      advWish: ['Ma mondj egy kedves szót valakinek! 💛', 'Tudtad? A hópelyhek mind hatágúak. ❄️', 'Készíts egy rajzot a családodnak! 🎨', 'Tudtad? A pingvinek a Déli-sarkon élnek. 🐧',
        'Segíts ma otthon egy kicsit! 🧹', 'Tudtad? A rénszarvasok szeme télen kékre vált. 🦌', 'Énekelj el egy téli dalt! 🎶', 'Tudtad? A fenyőfa télen is zöld marad. 🌲'] },
    ro: { advBtn: '🎄 Calendarul de Advent', advT: '🎄 Calendarul de Advent', advSoon: 'Prima fereastră se deschide pe 1 decembrie! În fiecare zi te așteaptă o surpriză. ✨',
      advLead: 'Îndeplinește misiunea zilei și deschide fereastra de azi!', advNeed: 'Mai întâi îndeplinește misiunea zilei! 🎯', advLocked: 'Fereastra aceasta e încă închisă – {d} decembrie. ⏳',
      advStars: '+{n} ⭐', advSticker: 'Un abțibild nou în album!', advTheme: 'Cadou: fundalul de iarnă și haina de Crăciun a bufniței în Magazinul de stele! ❄️🎅', advOver: 'Crăciun fericit! 🎄',
      advWish: ['Azi spune un cuvânt frumos cuiva! 💛', 'Știai? Toți fulgii de nea au șase colțuri. ❄️', 'Fă un desen pentru familia ta! 🎨', 'Știai? Pinguinii trăiesc la Polul Sud. 🐧',
        'Ajută puțin acasă azi! 🧹', 'Știai? Ochii renilor devin albaștri iarna. 🦌', 'Cântă un cântec de iarnă! 🎶', 'Știai? Bradul rămâne verde și iarna. 🌲'] },
    en: { advBtn: '🎄 Advent calendar', advT: '🎄 Advent calendar', advSoon: 'The first door opens on 1 December! A surprise awaits every day. ✨',
      advLead: 'Complete today’s mission, then open today’s door!', advNeed: 'Complete today’s mission first! 🎯', advLocked: 'This door is still closed – {d} December. ⏳',
      advStars: '+{n} ⭐', advSticker: 'A new sticker for your album!', advTheme: 'Gift: the Winter background and the Christmas owl outfit in the Star shop! ❄️🎅', advOver: 'Merry Christmas! 🎄',
      advWish: ['Say something kind to someone today! 💛', 'Did you know? Every snowflake has six points. ❄️', 'Draw a picture for your family! 🎨', 'Did you know? Penguins live at the South Pole. 🐧',
        'Help a little at home today! 🧹', 'Did you know? Reindeer eyes turn blue in winter. 🦌', 'Sing a winter song! 🎶', 'Did you know? Fir trees stay green all winter. 🌲'] }
  });

  GJ.adventNow = () => new Date();   // teszteléshez felülírható
  const state = () => {
    const d = GJ.adventNow(), m = d.getMonth(), day = d.getDate();
    return { year: m === 0 ? d.getFullYear() - 1 : d.getFullYear(), show: (m === 10 && day >= 20) || m === 11 || (m === 0 && day <= 6),
      open: m === 11 ? Math.min(24, day) : m === 0 ? 24 : 0 };
  };
  const DOOR_E = ['⭐', '❄️', '🎁', '🔔', '🕯️', '🍪', '⛄', '🎄', '🦌', '🧦', '🍬', '🌟'];
  const reward = d => (d === 24 ? { stars: 10, theme: true } : d % 6 === 0 ? { stars: 3, sticker: true } : { stars: 3 + (d % 3) });
  // ablakok sorrendje a rácson (vegyesen, mint az igazi naptáron)
  const ORDER = [7, 15, 1, 22, 10, 4, 18, 12, 24, 3, 20, 9, 14, 6, 21, 2, 17, 11, 23, 5, 13, 19, 8, 16];
  const opened = p => (p.advent && p.advent.year === state().year ? p.advent.opened : []);

  A.on('homeButtons', () => (state().show ? `<button class="big-btn red" data-go="advent">${t('advBtn')}</button>` : ''));

  A.screens.advent = () => {
    const p = S.current(); if (!p) return A.go('profiles');
    const s = state(), own = opened(p), dl = GJ.dailyOf ? GJ.dailyOf(p) : { done: true };
    A.render(`<div class="screen">
      <div class="topbar"><button class="icon-btn" data-go="home" aria-label="${t('back')}">⬅</button><h2>${t('advT')}</h2>
        <div class="pill">${own.length}/24</div></div>
      <p class="lead">${s.open ? (dl.done ? t('advLead') : t('advNeed')) : t('advSoon')}</p>
      <div class="adv-grid">${ORDER.map((d, i) => {
        const isOpen = own.includes(d), can = d <= s.open;
        return isOpen ? `<div class="adv-door open" style="animation-delay:${i * 25}ms"><span class="adv-e">${DOOR_E[d % DOOR_E.length]}</span><small>${d}</small></div>`
          : `<button class="adv-door ${can ? 'ready' : 'locked'}" data-act="advOpen" data-d="${d}" style="animation-delay:${i * 25}ms"><b>${d}</b>${can ? '' : '<small>🔒</small>'}</button>`;
      }).join('')}</div>
      ${own.length === 24 ? `<p class="lead center">${t('advOver')}</p>` : ''}
    </div>`);
  };

  A.actions.advOpen = b => {
    const p = S.current(); if (!p) return;
    const d = +b.dataset.d, s = state();
    if (d > s.open) { GJ.toast(t('advLocked', { d })); return; }
    if (GJ.dailyOf && !GJ.dailyOf(p).done) { GJ.toast(t('advNeed')); return; }
    if (opened(p).includes(d)) return;
    const rw = reward(d);
    let sticker = null;
    S.update(p.id, x => {
      if (!x.advent || x.advent.year !== s.year) x.advent = { year: s.year, opened: [] };
      x.advent.opened.push(d);
      if (rw.sticker) {
        const own = new Set(x.stickers || []);
        const pool = GJ.STICKERS.filter(k => !own.has(k.id) && !k.rare);
        sticker = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
        if (sticker) x.stickers = (x.stickers || []).concat([sticker.id]);
      }
      if (rw.theme) {
        x.owned = x.owned || {}; x.owned.theme = (x.owned.theme || []).filter(v => v !== 'winter').concat(['winter']);
        x.owned.owl = (x.owned.owl || []).filter(v => v !== 'xmas').concat(['xmas']);
        x.equip = x.equip || {}; x.equip.theme = 'winter'; x.equip.owl = 'xmas';
      }
    });
    A.addStars(rw.stars, 0);
    b.classList.add('opening'); GJ.sfx('sticker');
    const r = b.getBoundingClientRect(); GJ.confetti(r.left + r.width / 2, r.top + r.height / 2, 90);
    const wishes = GJ.tl('advWish');
    setTimeout(() => A.modal(`<div class="adv-reveal"><div class="adv-big bounce">${DOOR_E[d % DOOR_E.length]}</div>
        <h3>${d}.</h3><p class="pp-sub">${t('advStars', { n: rw.stars })}</p>
        ${sticker ? `<p><img class="stk-img" src="${sticker.img}" alt="" style="width:90px"><br>${t('advSticker')}</p>` : ''}
        ${rw.theme ? `<p><b>${t('advTheme')}</b></p>` : ''}
        <p class="lead">${esc(wishes[(d - 1) % wishes.length])}</p>
        <button class="big-btn green small" data-m="ok">OK</button></div>`, () => A.go('advent')), 450);
  };
});
