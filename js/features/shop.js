/* Okos Kaland – Csillagbolt
 * A gyűjtött csillagokból háttereket, bagolyruhákat és új figurákat lehet „venni”.
 * A rang továbbra is az összes valaha gyűjtött csillagból jön – a vásárlás nem csökkenti.
 * Költhető csillag = p.stars − p.spent.
 *
 * ÚJ TÉTEL: a SHOP listába; kép nélküli tétel (pl. háttér) is lehet.
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const S = GJ.store, t = GJ.t, { esc } = GJ.u, L = GJ.L;

  GJ.addTexts({
    hu: { shopBtn: '🛍️ Csillagbolt', shopT: '🛍️ Csillagbolt', shopLead: 'Válts be csillagokat! A rangod nem csökken, csak a költhető csillagaid.',
      shopBal: 'Költhető: {n} ⭐', shopThemes: '🎨 Hátterek', shopOwl: '🦉 Bagolyruhák', shopAv: '🐾 Új figurák', shopFit: '👕 Figuraruhák', shopFitNone: 'Ruha nélkül', shopFitNeed: 'Előbb vegyél egy figurát az „Új figurák” fülön, aztán öltöztesd fel! 🐾',
      shopBuy: 'Megveszem', shopUse: 'Ezt kérem', shopOn: '✔ Használatban', shopNeed: 'Még {n} ⭐ kell', shopBought: 'Megvetted: {x}! 🎉',
      shopAsk: 'Megveszed ezt: {x}, {n} csillagért?', shopNo: 'Mégse', shopSoon: 'Hamarosan új ruhák és figurák érkeznek! ✨' },
    ro: { shopBtn: '🛍️ Magazinul de stele', shopT: '🛍️ Magazinul de stele', shopLead: 'Schimbă stelele pe surprize! Rangul tău nu scade, doar stelele de cheltuit.',
      shopBal: 'De cheltuit: {n} ⭐', shopThemes: '🎨 Fundaluri', shopOwl: '🦉 Haine pentru bufniță', shopAv: '🐾 Personaje noi', shopFit: '👕 Haine pentru personaj', shopFitNone: 'Fără haine', shopFitNeed: 'Mai întâi cumpără un personaj la „Personaje noi”, apoi îmbracă-l! 🐾',
      shopBuy: 'Cumpăr', shopUse: 'Vreau asta', shopOn: '✔ Folosit', shopNeed: 'Mai trebuie {n} ⭐', shopBought: 'Ai cumpărat: {x}! 🎉',
      shopAsk: 'Cumperi {x} pentru {n} stele?', shopNo: 'Renunț', shopSoon: 'În curând vin haine și personaje noi! ✨' },
    en: { shopBtn: '🛍️ Star shop', shopT: '🛍️ Star shop', shopLead: 'Swap your stars for treats! Your rank doesn’t go down, only your spendable stars.',
      shopBal: 'To spend: {n} ⭐', shopThemes: '🎨 Backgrounds', shopOwl: '🦉 Owl outfits', shopAv: '🐾 New characters', shopFit: '👕 Character outfits', shopFitNone: 'No outfit', shopFitNeed: 'First buy a character in “New characters”, then dress it up! 🐾',
      shopBuy: 'Buy', shopUse: 'Use this', shopOn: '✔ In use', shopNeed: '{n} more ⭐ needed', shopBought: 'You bought: {x}! 🎉',
      shopAsk: 'Buy {x} for {n} stars?', shopNo: 'Cancel', shopSoon: 'New outfits and characters are coming soon! ✨' }
  });

  /* ---------- Tételek ---------- */
  const SHOP = {
    theme: [
      { id: 'base', price: 0, n: { hu: 'Szivárvány', ro: 'Curcubeu', en: 'Rainbow' }, sw: ['#c9e6ff', '#ffe0f0', '#fff4cc'] },
      { id: 'ocean', price: 30, n: { hu: 'Tenger', ro: 'Mare', en: 'Ocean' }, sw: ['#a5e8ff', '#c3fae8', '#e7f5ff'] },
      { id: 'forest', price: 30, n: { hu: 'Erdő', ro: 'Pădure', en: 'Forest' }, sw: ['#c3f0c8', '#ebfbee', '#fff9db'] },
      { id: 'candy', price: 40, n: { hu: 'Cukorvár', ro: 'Castel de bomboane', en: 'Candy castle' }, sw: ['#ffd6e7', '#f3d9fa', '#fff0f6'] },
      { id: 'sunset', price: 40, n: { hu: 'Naplemente', ro: 'Apus', en: 'Sunset' }, sw: ['#ffd8a8', '#ffc9c9', '#fff3bf'] },
      { id: 'space', price: 60, n: { hu: 'Csillagos ég', ro: 'Cer înstelat', en: 'Starry sky' }, sw: ['#b9c4ff', '#d8c8ff', '#ffe3f1'] },
      { id: 'mint', price: 60, n: { hu: 'Mentafagyi', ro: 'Înghețată de mentă', en: 'Mint ice cream' }, sw: ['#c3fae8', '#e6fcf5', '#fff5f5'] },
      // csak az adventi naptárból (dec. 24.) szerezhető – addig nem látszik a boltban
      { id: 'winter', price: 0, special: true, n: { hu: 'Téli csoda', ro: 'Minune de iarnă', en: 'Winter wonder' }, sw: ['#d0e4ff', '#f1f6ff', '#ffffff'] }
    ],
    // képek: img/shop/owl-<id>.webp
    owl: [
      { id: 'crown', price: 50, n: { hu: 'Királyi korona', ro: 'Coroană regală', en: 'Royal crown' } },
      { id: 'pirate', price: 50, n: { hu: 'Kalóz', ro: 'Pirat', en: 'Pirate' } },
      { id: 'chef', price: 50, n: { hu: 'Szakács', ro: 'Bucătar', en: 'Chef' } },
      { id: 'explorer', price: 60, n: { hu: 'Felfedező', ro: 'Explorator', en: 'Explorer' } },
      { id: 'princess', price: 70, n: { hu: 'Hercegnő', ro: 'Prințesă', en: 'Princess' } },
      { id: 'wizard', price: 80, n: { hu: 'Varázsló', ro: 'Vrăjitor', en: 'Wizard' } },
      { id: 'hero', price: 90, n: { hu: 'Szuperhős', ro: 'Supererou', en: 'Superhero' } },
      { id: 'astronaut', price: 100, n: { hu: 'Űrhajós', ro: 'Astronaut', en: 'Astronaut' } },
      // csak az adventi naptárból (dec. 24.)
      { id: 'xmas', price: 0, special: true, n: { hu: 'Karácsonyi bagoly', ro: 'Bufnița de Crăciun', en: 'Christmas owl' } }
    ],
    // képek: img/shop/av-<id>.webp – a játékos figurája lesz
    avatar: [
      { id: 'hedgehog', price: 40, n: { hu: 'Sün', ro: 'Arici', en: 'Hedgehog' } },
      { id: 'sloth', price: 40, n: { hu: 'Lajhár', ro: 'Leneș', en: 'Sloth' } },
      { id: 'octopus', price: 50, n: { hu: 'Polip', ro: 'Caracatiță', en: 'Octopus' } },
      { id: 'dolphin', price: 50, n: { hu: 'Delfin', ro: 'Delfin', en: 'Dolphin' } },
      { id: 'dino', price: 60, n: { hu: 'Dínó', ro: 'Dinozaur', en: 'Dino' } },
      { id: 'robot', price: 70, n: { hu: 'Robot', ro: 'Robot', en: 'Robot' } },
      { id: 'astrocat', price: 80, n: { hu: 'Űrhajós cica', ro: 'Pisică astronaut', en: 'Astro cat' } },
      { id: 'dragon', price: 100, n: { hu: 'Sárkány', ro: 'Dragon', en: 'Dragon' } }
    ]
  };
  const CATS = [['theme', 'shopThemes'], ['owl', 'shopOwl'], ['avatar', 'shopAv'], ['fit', 'shopFit']];
  /* Figuraruhák: ugyanaz a 8 ruha, mint a baglyon, minden megvett figurához külön (img/shop/av-<figura>-<ruha>.webp).
   * A profil avatarja ilyenkor 'p:<figura>-<ruha>'. Tulajdon: owned.fit = ['hedgehog-crown', …]; utolsó ruha figuránként: equip.fit[<figura>]. */
  const figOf = p => { const a = String(p.avatar || ''); return a.startsWith('p:') ? a.slice(2).split('-')[0] : null; };
  const fitOf = p => { const a = String(p.avatar || ''); return a.startsWith('p:') ? (a.slice(2).split('-')[1] || 'none') : null; };
  const fitList = fig => [{ id: 'none', price: 0, n: { hu: t('shopFitNone'), ro: t('shopFitNone'), en: t('shopFitNone') } }].concat(SHOP.owl.filter(o => !o.special));
  const itemImg = (cat, it, fig) => (cat === 'owl' ? `img/shop/owl-${it.id}.webp` : cat === 'avatar' ? `img/shop/av-${it.id}.webp`
    : cat === 'fit' ? `img/shop/av-${fig}${it.id === 'none' ? '' : '-' + it.id}.webp` : null);

  const me = () => S.current();
  const balance = p => Math.max(0, (p.stars || 0) - (p.spent || 0));
  const owns = (p, cat, id) => id === 'base' || id === 'none' || ((p.owned || {})[cat] || []).includes(cat === 'fit' ? figOf(p) + '-' + id : id);
  const equipped = (p, cat) => (p.equip || {})[cat] || (cat === 'theme' ? 'base' : null);

  /* figurák: a profil avatarja lehet 'p:<id>' */
  const avImg0 = GJ.avatarImg;
  GJ.avatarImg = e => (String(e).startsWith('p:') ? `img/shop/av-${String(e).slice(2)}.webp` : avImg0(e));

  /* háttér alkalmazása */
  function applyTheme() {
    const p = me(), th = p ? equipped(p, 'theme') : 'base';
    if (th && th !== 'base') document.documentElement.setAttribute('data-theme', th); else document.documentElement.removeAttribute('data-theme');
  }
  A.on('homeTop', () => { applyTheme(); return ''; });
  A.on('homeMascot', p => {
    const o = equipped(p, 'owl');
    return o && SHOP.owl.some(x => x.id === o) ? A.imgTag(itemImg('owl', { id: o }), 'mascot-img') : null;
  });
  A.on('homeButtons', () => `<button class="big-btn violet" data-go="shop">${t('shopBtn')}</button>`);

  A.screens.shop = tab => {
    const p = me(); if (!p) return A.go('profiles');
    applyTheme();
    tab = tab || 'theme';
    const fig = figOf(p);
    const list = tab === 'fit' ? (fig ? fitList(fig) : []) : (SHOP[tab] || []).filter(it => !it.special || owns(p, tab, it.id));
    A.render(`<div class="screen">
      <div class="topbar"><button class="icon-btn" data-go="home" aria-label="${t('back')}">⬅</button>
        <h2>${t('shopT')}</h2><div class="pill star">${t('shopBal', { n: balance(p) })}</div></div>
      <p class="lead">${t('shopLead')}</p>
      <div class="tabs">${CATS.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-go="shop" data-arg="${k}">${t(n)}</button>`).join('')}</div>
      ${list.length ? `<div class="shop-grid">${list.map((it, i) => {
        const own = owns(p, tab, it.id), on = tab === 'avatar' ? fig === it.id : tab === 'fit' ? fitOf(p) === it.id : equipped(p, tab) === it.id;
        const img = itemImg(tab, it, fig);
        const art = img ? `<img class="shop-img" src="${img}" alt="">`
          : `<span class="shop-sw" style="background:linear-gradient(165deg,${it.sw.join(',')})"></span>`;
        const btn = on ? `<span class="shop-on">${t('shopOn')}</span>`
          : own ? `<button class="mini-btn" data-act="shopUse" data-c="${tab}" data-id="${it.id}">${t('shopUse')}</button>`
          : balance(p) >= it.price ? `<button class="mini-btn green" data-act="shopBuy" data-c="${tab}" data-id="${it.id}">${t('shopBuy')} · ${it.price} ⭐</button>`
          : `<span class="shop-need">${t('shopNeed', { n: it.price - balance(p) })}</span>`;
        return `<div class="shop-item pop ${on ? 'on' : ''}" style="animation-delay:${i * 40}ms">${art}<b>${esc(L(it.n))}</b>${btn}</div>`;
      }).join('')}</div>` : `<div class="card center"><p class="lead">${t(tab === 'fit' ? 'shopFitNeed' : 'shopSoon')}</p></div>`}
    </div>`);
  };

  function equip(cat, id) {
    const p = me(); if (!p) return;
    S.update(p.id, x => {
      x.equip = x.equip || {};
      if (cat === 'avatar') { const f = (x.equip.fit || {})[id]; x.avatar = 'p:' + id + (f && f !== 'none' ? '-' + f : ''); }
      else if (cat === 'fit') { const fig = figOf(x); if (!fig) return; x.equip.fit = x.equip.fit || {}; x.equip.fit[fig] = id; x.avatar = 'p:' + fig + (id === 'none' ? '' : '-' + id); }
      else x.equip[cat] = id;
    });
  }
  A.actions.shopBuy = b => {
    const p = me(), cat = b.dataset.c, it = (cat === 'fit' ? SHOP.owl : SHOP[cat] || []).find(x => x.id === b.dataset.id);
    if (!p || !it || balance(p) < it.price) return;
    A.modal(`<p>${esc(t('shopAsk', { x: L(it.n), n: it.price }))}</p>
      <div class="row-btns"><button class="big-btn green small" data-m="ok">${t('shopBuy')}</button><button class="big-btn blue small" data-m="no">${t('shopNo')}</button></div>`, m => {
      if (m !== 'ok') return;
      S.update(p.id, x => {
        x.spent = (x.spent || 0) + it.price;
        x.owned = x.owned || {}; x.owned[cat] = (x.owned[cat] || []).concat([cat === 'fit' ? figOf(x) + '-' + it.id : it.id]);
      });
      equip(cat, it.id);
      GJ.sfx('sticker'); GJ.confetti(innerWidth / 2, innerHeight / 3, 80); GJ.toast(t('shopBought', { x: L(it.n) }));
      A.go('shop', cat);
    });
  };
  A.actions.shopUse = b => { equip(b.dataset.c, b.dataset.id); GJ.sfx('click'); A.go('shop', b.dataset.c); };

  applyTheme();
});
