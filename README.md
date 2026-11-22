# 🦉 Okos Kaland · Aventura Isteață · Clever Quest

Játékos tanulóprogram 7–8 éves gyerekeknek: **matek**, **nyelvtan**, **mesék és versek** –
**magyarul** (alapértelmezett), **románul** és **angolul**.
Nem kell hozzá telepítés és internet sem (csak a szép betűtípushoz).

## Indítás

Kattints duplán az **`index.html`** fájlra: megnyílik a böngészőben (Chrome, Edge, Firefox, Safari).
A nyelv a jobb felső sarokban (🇭🇺 HU · 🇷🇴 RO · 🇬🇧 EN) vagy a Szülői sarok → Beállítások alatt váltható.

> Az adatok (játékosok, csillagok, matricák, mesék) **abban a böngészőben** tárolódnak, ahol a játék fut.
> Másik gépre a *Szülői sarok → Beállítások → Mentés fájlba / Visszatöltés* gombokkal vihetők át.

### Telepítés alkalmazásként (PWA)

A program telepíthető: saját ikonnal indul, külön ablakban fut, és **internet nélkül is működik**.
Ehhez weboldalként kell megnyitni (fájlból – `index.html` dupla kattintással – nem telepíthető):

- **Ezen a gépen:** indítsd az **`Okos Kaland inditasa.bat`** fájlt (Python kell hozzá) → a böngészőben
  kattints a **„📲 Telepítés alkalmazásként”** gombra (vagy a címsor melletti telepítés ikonra).
  Telepítés után az alkalmazás már a .bat nélkül, internet nélkül is indul.
- **Tableten / telefonon:** a mappát fel kell tölteni egy ingyenes tárhelyre (pl. GitHub Pages, Netlify),
  majd a böngészőben: Android/Chrome → „Telepítés”, iPad/Safari → Megosztás → „Főképernyőhöz adás”.
- **Fájlok módosítása után** futtasd: `node tools/build-sw.js` – ez frissíti az offline gyorsítótárat,
  és a telepített alkalmazás a következő indításkor átveszi a változásokat.

## Mit tud?

| | |
|---|---|
| 👥 **Több játékos** | név, életkor, saját figura és kedvenc szín |
| 🌍 **3 nyelv** | teljes felület + a nyelvhez illő feladatok (szavak, versek, mesék, pénz, óra) |
| 🐢🐰🦁 **Nehézség** | minden játék előtt választható: Könnyű / Közepes / Nehéz (az életkorhoz illőt ajánlja) |
| ⏱️ **Időre** | minden körben ⚡ villámfeladatok; bekapcsolható, hogy minden feladat időre menjen |
| 📖 **Mesekészítő** | a gyerek döntései és a feladatok eredménye alakítja a mesét (720 különböző mese) |
| ⭐ **Csillagok** | elsőre jó 2 ⭐, másodikra 1 ⭐, időben +1 ⭐, 3 egymás utáni jó válasz +1 ⭐ |
| 🎉 **Dicséretek** | változatos dicséret mindhárom nyelven (néha a gyerek nevével), konfetti, hang |
| 🏅 **Matricaalbum** | 50 gyűjthető matrica, hibátlan körért ritka ✨ matrica |
| 🐣→👑 **Rangok** | Kis Felfedező → … → Szuper Zseni |
| 🔊 **Felolvasás** | minden kérdés és a teljes mese felolvastatható (a gépen elérhető hanggal) |
| 🔒 **Szülői sarok** | statisztika, profilok, saját feladatok, nyelv, mentés |

### Játékok

- **Matek (7):** Összeadás-kivonás · Szorzótábla · Számold meg! · Kisebb vagy nagyobb? · Mi jön ezután? · Perselypénz (Ft / bani / penny) · Hány óra van?
- **Nyelvtan (8):** J vagy LY? *(csak magyarul)* · Helyesírás · Szótagoló · Szókirakó · Ábécérend · Ellentétek · Mondatvégi írásjel · Nagy kezdőbetű
- **Mese és vers (5):** 📖 Mesekészítő · Mesekvíz · Versfaragó · Rímkereső · Közmondások

### A Mesekészítő működése

1. A gyerek kiválasztja a **hőst**: róka, egyszarvú, sárkány, hercegnő – vagy **saját magát**.
2. Kiválasztja a **kalandot**: elveszett csillag, varázsgyöngy vagy eltűnt torta.
3. **Feladatot** old meg (kapu): ha sikerül, az egyik irányba folytatódik a mese, ha nem, egy másik (szintén vidám) irányba.
4. Kiválaszt egy **társat** (bagoly, nyuszi, teknős) és egy **útvonalat** – mindkettő más jelenetet ad.
5. A **végső feladat mindig időre megy** („Készen állok!” gomb után indul az óra) – ettől függ a befejezés.
6. A kész mese **mesekönyvként** jelenik meg, a gyerek nevével szerzőként, és a **Meséim** polcra kerül.

## Bővítés

### 1. Programozás nélkül: Saját feladatok
*Szülői sarok* (a kapunál egy szorzást kell megoldani) → **💝 Saját feladatok**.
Adj meg kérdést, helyes választ és 1–3 rossz választ. A kérdések a választott tantárgyban
„Saját feladatok” játékként jelennek meg, minden nyelven.

### 2. Beépített listák bővítése
A `js/games/` fájljaiban a listák nyelvenként (`hu`, `ro`, `en`) vannak, csak új sort kell beírni:

```js
// js/games/irodalom.js – Mesekvíz: nyelvenként [cím, kérdés, helyes, rossz1, rossz2, rossz3]
{ e: '🐻', hu: ['Mese címe', 'Kérdés?', 'helyes', 'rossz 1', 'rossz 2', 'rossz 3'],
           ro: ['Titlu', 'Întrebare?', 'corect', 'greșit 1', 'greșit 2', 'greșit 3'] },   // az en elhagyható

// js/games/irodalom.js – Versfaragó (a ___ a hiányzó szó helye, \n új sor)
ro: [ { e: '🌙', v: 'Primul vers,\nal doilea ___.', a: 'cuvânt', s: 'Autor: Titlu' }, ... ]

// js/games/nyelvtan.js – Ellentétek
en: [ ['big', 'small'], ['new word', 'its opposite'], ... ]
```

### 3. Új mesejelenet vagy új kaland
A `js/games/mesekeszito.js` fájlban a `QUESTS` közé vegyél fel egy új kalandot (pl. `forest`),
majd írd meg a jeleneteit `forest_intro`, `forest_gate1`, `forest_g1r`, `forest_g1w`, `forest_path`,
`forest_final`, `forest_end_r`, `forest_end_w` néven – a meglévő három kaland mintájára, mindhárom nyelven.
A szövegekben `{h}` a hős neve, `{F}` a társ neve, `{trick}` a hős különleges mondata.

### 4. Teljesen új játék
Hozz létre egy új fájlt, pl. `js/games/sajat.js`, és vedd fel az `index.html`-be a többi játék mellé:

```js
GJ.register({
  id: 'allathangok', subject: 'irodalom', icon: '🐮',
  title: { hu: 'Állathangok', ro: 'Sunetele animalelor', en: 'Animal sounds' },
  desc:  { hu: 'Melyik állat mondja?', ro: 'Ce animal face așa?', en: 'Which animal says it?' },
  // langs: ['hu'],            // ha csak bizonyos nyelveken jelenjen meg
  make({ level, lang }) {      // level: 1 könnyű, 2 közepes, 3 nehéz
    const [allat, hang] = GJ.u.pick([['🐮', 'mú'], ['🐶', 'vau'], ['🐱', 'miau']]);
    return {
      type: 'choice',
      prompt: { hu: 'Mit mond ez az állat?', ro: 'Ce spune acest animal?', en: 'What does this animal say?' }[lang],
      big: `<div class="emoji-xl">${allat}</div>`,
      options: GJ.u.options(hang, ['mú', 'vau', 'miau']),
      answer: hang,
      explain: '' // nem kötelező: a helyes válasz után megjelenő magyarázat
    };
  }
});
```

### 5. Felület szövegei / új nyelv
A gombok és feliratok a `js/i18n.js` fájlban vannak, nyelvenként. Új nyelvhez másold le az `en` blokkot,
fordítsd le, vedd fel a `GJ.LANGS` listába – és a játékfájlokban egészítsd ki a nyelvi listákat.

## Fájlok

```
index.html               – a program belépési pontja
css/style.css            – megjelenés
js/util.js               – segédfüggvények (keverés, magyar betűk, szótagolás)
js/storage.js            – adatmentés a böngészőben
js/i18n.js               – a felület szövegei 3 nyelven, zászlók
js/rewards.js            – dicséretek, matricák, rangok, hangok, konfetti, felolvasás
js/engine.js             – játékmotor (játékok regisztrálása, nehézség)
js/games/matek.js        – matekjátékok
js/games/nyelvtan.js     – nyelvtani játékok
js/games/irodalom.js     – mesekvíz, versek, rímek, közmondások
js/games/mesekeszito.js  – az interaktív Mesekészítő
js/app.js                – képernyők, játékmenet, időzítő, mesekönyv
```

## Bővítő modulok (js/features/)

A program magja (`js/app.js`) bővítési pontokat ad (`GJ.app.on('roundEnd', …)` stb.); a modulok ezekre kapcsolódnak:

| Fájl | Mit tud |
|---|---|
| `learning.js` | Gyakorold a hibáidat, automatikus nehézség, napi küldetés + sorozat, szülői kimutatás, állítható napi időkorlát |
| `shop.js` | Csillagbolt (hátterek; bagolyruhák és figurák: `GJ.SHOP_OWL`, `GJ.SHOP_AVATAR` + képek az `img/shop/` mappában) |
| `share.js` | Mesekönyv nyomtatása / PDF, adatátvitel másik eszközre QR-kóddal (szerver nélkül) |

Saját szövegek: `GJ.addTexts({ hu: {...}, ro: {...}, en: {...} })`.

## Nyelvenkénti címek

- `index.html` – a böngésző nyelvén indul; `ro.html`, `en.html` – román / angol alapnyelv, saját megosztási előnézettel és alkalmazásnévvel (ezeket a `node tools/build-sw.js` készíti az `index.html`-ből).
- Aldomainek alapnyelve: `js/config.js` → `domainLang`. A nyelv mindenhol átváltható.
