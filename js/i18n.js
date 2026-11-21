/* Okos Kaland – többnyelvűség (magyar · român · English)
 * Új szöveg felvétele: ugyanazt a kulcsot mindhárom nyelvhez add hozzá.
 * Ha egy kulcs hiányzik egy nyelvből, a magyar szöveg jelenik meg.
 */
(function () {
  'use strict';

  const D = {
    /* ============================== MAGYAR ============================== */
    hu: {
      appName: 'Okos Kaland',
      tagline: 'Játékos tanulás matekkal, nyelvtannal, mesékkel',
      whoPlays: 'Ki játszik ma?', welcome: 'Szia! Kezdjük el a kalandot!',
      newPlayer: 'Új játékos', parentCorner: '🔒 Szülői sarok', age: '{n} éves',
      editPlayer: 'Játékos szerkesztése', yourName: 'Mi a neved?', namePh: 'Írd be a neved',
      howOld: 'Hány éves vagy?', pickAvatar: 'Válassz figurát!', favColor: 'Mi a kedvenc színed?',
      save: 'Mentés ✔', letsGo: 'Kezdjük! 🚀', nameReq: 'Kérlek, írd be a neved! 🙂',
      greet: ['Szia, {n}! Mit tanulunk ma?', 'Örülök, hogy itt vagy, {n}!', 'Készen állsz egy új kalandra, {n}?',
        'Hurrá, {n} megjött! Játsszunk!', '{n}, ma is gyűjtsünk sok csillagot!'],
      toNextRank: 'Még {n} ⭐ és te leszel: {r}', gamesN: '{n} játék',
      myStickers: '🏅 Matricáim', switchPlayer: '👥 Játékosváltás', back: 'Vissza',
      best: '🏆 Legjobb: {b}/{t}', isNew: 'Új! ✨',
      subj_matek: 'Matek', subj_matek_d: 'Számolj, mérj, gondolkodj!',
      subj_nyelvtan: 'Nyelvtan', subj_nyelvtan_d: 'Betűk, szavak, mondatok',
      subj_irodalom: 'Mese és vers', subj_irodalom_d: 'Mesék, versek, rímek',
      chooseLevel: 'Milyen nehéz legyen?', lvl1: 'Könnyű', lvl2: 'Közepes', lvl3: 'Nehéz',
      lvl1d: 'Kezdőknek', lvl2d: 'Kis kihívás', lvl3d: 'Igazi bajnokoknak', forYou: 'Neked ajánlott',
      timed: '⏱️ Időre játszom', timedD: 'Minden feladatot időre kell megoldani. Időben adott jó válaszért +1 ⭐!',
      start: 'Indulás! 🚀',
      lightning: '⚡ Villámfeladat! Oldd meg időre!', timeUp: '⏰ Lejárt az idő!',
      fastBonus: '⚡ Időben! +1 bónusz', streakBonus: '🔥 3 jó válasz egymás után! +1 bónusz',
      next: 'Tovább ➜', correctWas: 'A helyes válasz:', nextTime: 'Semmi baj, legközelebb sikerülni fog! 💪',
      quitQ: 'Biztosan abbahagyod?', starsKept: 'A megszerzett csillagok megmaradnak! ⭐',
      keepPlaying: 'Játszom tovább', leave: 'Kilépek', readAloud: 'Felolvasás', quit: 'Kilépés',
      exCorrect: 'Helyesen: {w}',
      rPerfect: 'Hibátlan! Te vagy a bajnok!', rGreat: 'Nagyon ügyes voltál!', rGood: 'Szép munka!', rTry: 'Szép próbálkozás!',
      correctOf: '{c} / {t} helyes válasz', starsPlus: '⭐ +{n} csillag',
      perfectBonus: '✨ Hibátlan kör! +3 bónusz csillag ✨', newRank: '🎊 Új rangot értél el: {r}!', rankToast: '🎊 Új rang: {r}!',
      newSticker: 'Új matrica!', rareSticker: '✨ Ritka matrica! ✨',
      needSticker: 'Matricához legalább {n} jó válasz kell. Próbáld újra, menni fog! 💪',
      allStickers: 'Már minden matricát összegyűjtöttél! Ezért +5 ⭐ jár! 🎉',
      again: '🔁 Még egyszer', otherGame: '🎮 Másik játék', home: '🏠 Főoldal',
      albumLead: 'Minden befejezett körért matrica jár, hibátlan körért pedig ✨ritka✨ matrica!', rareLbl: 'ritka',
      gateText: 'Ez a rész a felnőtteknek szól. A belépéshez oldd meg:', gatePh: 'Eredmény', enter: 'Belépés', gateWrong: 'Ez nem jó. Próbáld újra!',
      tPlayers: '👥 Játékosok', tCustom: '💝 Saját feladatok', tSettings: '⚙️ Beállítások', tHelp: '❔ Súgó', madeBy: 'Készítette:', noVoice: '🔇 Ezen a készüléken nincs magyar hang. Töltsd le a beépített felolvasó hangot: Szülői sarok → Beállítások.',
      noPlayers: 'Még nincs játékos.', addPlayer: '➕ Új játékos', edit: '✏️ Szerkesztés', del: '🗑️ Törlés',
      summary: '⭐ {s} csillag · ✅ {d} megoldott feladat · 🏅 {k} matrica · 📖 {m} mese',
      thGame: 'Játék', thRounds: 'Körök', thBest: 'Legjobb', notPlayed: 'Még nem játszott.',
      delQ: 'Törlöd {n} profilját?', delNote: 'Minden csillaga, matricája és meséje elvész. Ez nem vonható vissza.',
      cancel: 'Mégsem', delete: 'Törlés',
      cIntro: 'Itt saját kérdéseket írhatsz a gyereknek (pl. az iskolai anyaghoz). A kérdések a választott tantárgyban <b>„Saját feladatok”</b> néven jelennek meg, minden nyelven.',
      cSubject: 'Tantárgy', cQuestion: 'Kérdés', cQPh: 'pl. Ki írta a Bóbita című verset?', cEmoji: 'Kép (emoji, nem kötelező)',
      cRight: '✅ Helyes válasz', cRightPh: 'pl. Weöres Sándor', cWrong: '❌ Rossz válasz {n}', cWrongPh: 'pl. Petőfi Sándor',
      optional: 'nem kötelező', cAdd: '➕ Feladat hozzáadása', cList: 'Felvett feladatok ({n})', cNone: 'Még nincs saját feladat.',
      cErrQA: 'Kérdés és helyes válasz megadása kötelező.', cErrW: 'Legalább egy (a helyestől eltérő) rossz válasz kell.',
      cAdded: '✅ Feladat hozzáadva!', customTitle: 'Saját feladatok', customDesc: 'A család által írt kérdések',
      sLang: '🌍 Nyelv', sSound: '🔊 Hangeffektek', sSpeak: '🗣️ Feladatok automatikus felolvasása',
      sSpeakNote: 'A 🔊 gomb mindig működik.',
      sVoice: '🗣️ Beépített felolvasó hang', sVoiceNote: 'A felolvasás a készülék saját hangját használja. Ha a készüléken nincs ilyen nyelvű hang, a program beépített hangja szól (magyarul Anna, angolul Jenny, románul Mihai). Ezt nyelvenként egyszer kell letölteni, utána internet nélkül is működik. Wi-Fi ajánlott.', ttsWait: '⏳ A felolvasó hang még töltődik, mindjárt kész…', ttsDevice: '✅ A készülék saját hangja szól', ttsNotNeeded: 'Nem szükséges',
      ttsGet: '⬇️ Letöltés (kb. {n} MB)', ttsDl: '⏳ Letöltés… {p}%', ttsReady: '✅ Letöltve', ttsErr: '❌ Nem sikerült, próbáld újra', ttsRemove: '🗑️ Törlés a készülékről', ttsRemoved: 'A felolvasó hang törölve.', ttsNo: 'Ez a böngésző túl régi a beépített felolvasóhoz.',
      ttsAskT: '🗣️ Felolvasó hang', ttsAsk: 'A felolvasáshoz egyszer le kell tölteni a beépített hangot (kb. {n} MB). Utána internet nélkül is működik. Wi-Fi ajánlott. Letöltsük most?', ttsYes: '⬇️ Letöltés', ttsLater: 'Most nem', ttsStarted: '⏳ A felolvasó hang letöltése elindult…', ttsDone: '✅ Kész! A felolvasó hang letöltve.',
      sFamily: '👪 Családtagok nevei a Mesekészítőben',
      sFamilyNote: 'Írd be a családtagok valódi nevét, és a mesében így fognak szerepelni (pl. „Kati, a kedves anyuka”). Üresen hagyva marad az alapnév.',
      sFamilySave: '💾 Nevek mentése', sFamilySaved: '✅ A nevek elmentve! A következő mesében már így szerepelnek.',
      install: '📲 Telepítés alkalmazásként', installed: '🎉 Az Okos Kaland telepítve! Az ikonja megtalálható az asztalon / kezdőképernyőn.',
      sApp: '📲 Alkalmazásként', sAppNote: 'Az Okos Kaland telepíthető: saját ikonnal indul, külön ablakban fut, és internet nélkül is működik. Ehhez a programot weboldalként kell megnyitni (nem fájlból); ilyenkor a böngésző felajánlja a telepítést.',
      instIOS: '<b>1.</b> Koppints a Safari <b>Megosztás</b> gombjára <span class="ios-share">⬆︎</span> (a képernyő alján vagy tetején).<br><b>2.</b> Görgess le, és válaszd a <b>„Főképernyőhöz adás”</b> lehetőséget.<br><b>3.</b> Koppints a <b>„Hozzáadás”</b> gombra – kész! 🎉',
      instAndroid: '<b>1.</b> Nyisd meg a böngésző <b>⋮ menüjét</b> (jobb felső sarok).<br><b>2.</b> Válaszd a <b>„Telepítés”</b> vagy <b>„Hozzáadás a kezdőképernyőhöz”</b> pontot.<br><b>3.</b> Erősítsd meg – kész! 🎉',
      tFeedback: '💌 Vélemény', fbSubject: 'visszajelzés',
      fbIntro: 'Írd meg, mi tetszett, mi nem, vagy milyen új játékot szeretnétek! Az üzenet a program készítőjéhez jut el.',
      fbRate: 'Mennyire tetszik a program?', fbPh: 'Ide írhatod a véleményed…', fbSend: '✉️ Küldés',
      fbPrivacy: 'Csak az kerül el, amit ide beírsz. A gyerekek nevét és eredményeit a program nem küldi el.',
      fbNotSet: 'A visszajelzés küldése még nincs beállítva (js/config.js).', fbThanks: '💌 Köszönjük a visszajelzést!',
      sStats: '📊 Névtelen használati statisztika', sStatsNote: 'Csak annyit számol, hányszor és melyik nyelven nyitották meg a programot, és melyik játékot indították. Személyes adatot nem küld.',
      sRound: '📝 Feladatok száma egy körben', sBackup: '💾 Mentés és visszatöltés',
      sBackupNote: 'Az adatok ebben a böngészőben tárolódnak. Másik gépre vagy böngészőbe mentéssel vihetők át.',
      sExport: '⬇️ Mentés fájlba', sImport: '⬆️ Visszatöltés fájlból', sImportOk: '✅ Sikeres visszatöltés!', sImportBad: 'Ez nem Okos Kaland mentésfájl.',
      hTitle: 'Hogyan működik?',
      hItems: [
        '<b>Nehézség:</b> minden játék előtt választható (Könnyű / Közepes / Nehéz); az életkornak megfelelőt ajánljuk.',
        '<b>Időre:</b> minden körben vannak ⚡ villámfeladatok, és bekapcsolható, hogy minden feladat időre menjen. Időben adott jó válaszért +1 ⭐.',
        '<b>Csillagok:</b> elsőre jó válasz 2 ⭐, másodikra 1 ⭐; 3 jó válasz egymás után +1 bónusz ⭐.',
        '<b>Matricák:</b> legalább félig jó kör után 1 matrica, hibátlan körért még egy ritka matrica + 3 ⭐.',
        '<b>Mesekészítő:</b> a gyerek döntései alakítják a hőst és a történetet, a feladatok eredménye a cselekményt. A kész mese a „Meséim” közé kerül.',
        '<b>Nyelv:</b> magyar, román és angol, az adott nyelvhez illő feladatokkal.',
        '<b>Felolvasás (🔊):</b> ha a készüléken van az adott nyelvű hang, azt használja. Ha nincs, a program saját, beépített hangja szól (magyarul Anna, angolul Jenny, románul Mihai): ezt nyelvenként egyszer kell letölteni (kb. 90 MB), utána internet nélkül is működik. A felolvasás a készüléken történik, a szöveg nem megy ki sehova. Rossz nyelvű hanggal a program nem olvas fel.'
      ],
      hExtTitle: 'Bővítés',
      hExt: 'Új kérdést legegyszerűbben a <b>Saját feladatok</b> fülön adhatsz hozzá. Új játékhoz, mesékhez vagy fordításokhoz lásd a <code>README.md</code> fájlt.',
      stLibrary: '📚 Meséim', stNone: 'Még nincs elmentett meséd. Készíts egyet a Mesekészítőben! 📖',
      stTask: '✨ Oldd meg a feladatot, hogy folytatódjon a mese!', stSeeBook: '📖 Nézzük a mesekönyvet!',
      stWrittenBy: 'Írta: {n}', stRead: '🔊 Felolvasom', stNew: '🔁 Új mese', stSaved: 'A meséd bekerült a Meséim közé! 📚',
      stChooseHint: 'Válassz! 👇', stReady: '⏱️ Készen állok!',
      stPickHint: 'Válassz 1–{n} szereplőt! Az elsőként kiválasztott lesz a főhős. ⭐',
      stPicked: 'Kezdődjön a mese! ({n} szereplő)', stLead: 'Főhős',
      stAskName: 'Hogy hívják? ✏️', stNamePh: 'Írd be a nevét', stOk: 'Rendben ✔'
    },

    /* ============================== ROMÂNĂ ============================== */
    ro: {
      appName: 'Aventura Isteață',
      tagline: 'Învățăm jucându-ne: matematică, limbă și povești',
      whoPlays: 'Cine se joacă azi?', welcome: 'Salut! Să începem aventura!',
      newPlayer: 'Jucător nou', parentCorner: '🔒 Colțul părinților', age: '{n} ani',
      editPlayer: 'Editează jucătorul', yourName: 'Cum te cheamă?', namePh: 'Scrie-ți numele',
      howOld: 'Câți ani ai?', pickAvatar: 'Alege un personaj!', favColor: 'Care e culoarea ta preferată?',
      save: 'Salvează ✔', letsGo: 'Să începem! 🚀', nameReq: 'Te rog, scrie-ți numele! 🙂',
      greet: ['Salut, {n}! Ce învățăm azi?', 'Ce bine că ești aici, {n}!', 'Ești gata de o nouă aventură, {n}?',
        'Ura, a venit {n}! Hai să ne jucăm!', '{n}, hai să adunăm multe stele azi!'],
      toNextRank: 'Încă {n} ⭐ și devii: {r}', gamesN: '{n} jocuri',
      myStickers: '🏅 Abțibildurile mele', switchPlayer: '👥 Schimbă jucătorul', back: 'Înapoi',
      best: '🏆 Record: {b}/{t}', isNew: 'Nou! ✨',
      subj_matek: 'Matematică', subj_matek_d: 'Socotește, măsoară, gândește!',
      subj_nyelvtan: 'Limbă', subj_nyelvtan_d: 'Litere, cuvinte, propoziții',
      subj_irodalom: 'Povești și poezii', subj_irodalom_d: 'Povești, poezii, rime',
      chooseLevel: 'Cât de greu să fie?', lvl1: 'Ușor', lvl2: 'Mediu', lvl3: 'Greu',
      lvl1d: 'Pentru început', lvl2d: 'O mică provocare', lvl3d: 'Pentru campioni', forYou: 'Recomandat ție',
      timed: '⏱️ Joc contra cronometru', timedD: 'Fiecare sarcină are timp limitat. Pentru răspuns corect la timp primești +1 ⭐!',
      start: 'Pornim! 🚀',
      lightning: '⚡ Sarcină fulger! Rezolv-o la timp!', timeUp: '⏰ A expirat timpul!',
      fastBonus: '⚡ La timp! +1 bonus', streakBonus: '🔥 3 răspunsuri corecte la rând! +1 bonus',
      next: 'Mai departe ➜', correctWas: 'Răspunsul corect:', nextTime: 'Nu-i nimic, data viitoare îți iese! 💪',
      quitQ: 'Sigur vrei să te oprești?', starsKept: 'Stelele câștigate rămân ale tale! ⭐',
      keepPlaying: 'Mai joc', leave: 'Ies', readAloud: 'Citește cu voce tare', quit: 'Ieșire',
      exCorrect: 'Corect: {w}',
      rPerfect: 'Fără greșeală! Ești campion!', rGreat: 'Foarte bine!', rGood: 'Frumos lucrat!', rTry: 'Frumoasă încercare!',
      correctOf: '{c} / {t} răspunsuri corecte', starsPlus: '⭐ +{n} stele',
      perfectBonus: '✨ Rundă perfectă! +3 stele bonus ✨', newRank: '🎊 Ai ajuns la un nou rang: {r}!', rankToast: '🎊 Rang nou: {r}!',
      newSticker: 'Abțibild nou!', rareSticker: '✨ Abțibild rar! ✨',
      needSticker: 'Pentru un abțibild ai nevoie de cel puțin {n} răspunsuri corecte. Mai încearcă, o să reușești! 💪',
      allStickers: 'Ai adunat deja toate abțibildurile! Primești +5 ⭐! 🎉',
      again: '🔁 Încă o dată', otherGame: '🎮 Alt joc', home: '🏠 Acasă',
      albumLead: 'Pentru fiecare rundă terminată primești un abțibild, iar pentru o rundă perfectă unul ✨rar✨!', rareLbl: 'rar',
      gateText: 'Această parte este pentru adulți. Ca să intri, rezolvă:', gatePh: 'Rezultat', enter: 'Intră', gateWrong: 'Nu e corect. Mai încearcă!',
      tPlayers: '👥 Jucători', tCustom: '💝 Sarcini proprii', tSettings: '⚙️ Setări', tHelp: '❔ Ajutor', madeBy: 'Realizat de:', noVoice: '🔇 Pe acest dispozitiv nu există voce în română. Descarcă vocea integrată: Colțul părinților → Setări.',
      noPlayers: 'Încă nu există jucători.', addPlayer: '➕ Jucător nou', edit: '✏️ Editează', del: '🗑️ Șterge',
      summary: '⭐ {s} stele · ✅ {d} sarcini rezolvate · 🏅 {k} abțibilduri · 📖 {m} povești',
      thGame: 'Joc', thRounds: 'Runde', thBest: 'Record', notPlayed: 'Nu a jucat încă.',
      delQ: 'Ștergi profilul lui {n}?', delNote: 'Toate stelele, abțibildurile și poveștile se vor pierde. Acțiunea nu poate fi anulată.',
      cancel: 'Renunță', delete: 'Șterge',
      cIntro: 'Aici poți scrie întrebări proprii pentru copil (de exemplu, din materia de la școală). Ele apar la materia aleasă, sub numele <b>„Sarcini proprii”</b>, în toate limbile.',
      cSubject: 'Materia', cQuestion: 'Întrebare', cQPh: 'ex. Cine a scris „Somnoroase păsărele”?', cEmoji: 'Imagine (emoji, opțional)',
      cRight: '✅ Răspuns corect', cRightPh: 'ex. Mihai Eminescu', cWrong: '❌ Răspuns greșit {n}', cWrongPh: 'ex. Ion Creangă',
      optional: 'opțional', cAdd: '➕ Adaugă sarcina', cList: 'Sarcini adăugate ({n})', cNone: 'Nu există încă sarcini proprii.',
      cErrQA: 'Întrebarea și răspunsul corect sunt obligatorii.', cErrW: 'Este nevoie de cel puțin un răspuns greșit (diferit de cel corect).',
      cAdded: '✅ Sarcină adăugată!', customTitle: 'Sarcini proprii', customDesc: 'Întrebări scrise de familie',
      sLang: '🌍 Limba', sSound: '🔊 Efecte sonore', sSpeak: '🗣️ Citirea automată a sarcinilor',
      sSpeakNote: 'Butonul 🔊 funcționează mereu.',
      sVoice: '🗣️ Voce de citire integrată', sVoiceNote: 'Citirea folosește vocea dispozitivului. Dacă dispozitivul nu are voce în limba respectivă, se folosește vocea integrată a programului (maghiară: Anna, engleză: Jenny, română: Mihai). Aceasta se descarcă o singură dată pe limbă, apoi merge și fără internet. Recomandat prin Wi-Fi.', ttsWait: '⏳ Vocea de citire încă se descarcă, imediat e gata…', ttsDevice: '✅ Se folosește vocea dispozitivului', ttsNotNeeded: 'Nu este necesar',
      ttsGet: '⬇️ Descarcă (cca {n} MB)', ttsDl: '⏳ Se descarcă… {p}%', ttsReady: '✅ Descărcată', ttsErr: '❌ Nu a reușit, încearcă din nou', ttsRemove: '🗑️ Șterge de pe dispozitiv', ttsRemoved: 'Vocea de citire a fost ștearsă.', ttsNo: 'Acest browser este prea vechi pentru vocea integrată.',
      ttsAskT: '🗣️ Voce de citire', ttsAsk: 'Pentru citire trebuie descărcată o singură dată vocea integrată (cca {n} MB). Apoi merge și fără internet. Recomandat prin Wi-Fi. O descărcăm acum?', ttsYes: '⬇️ Descarcă', ttsLater: 'Nu acum', ttsStarted: '⏳ Descărcarea vocii a început…', ttsDone: '✅ Gata! Vocea de citire este descărcată.',
      sFamily: '👪 Numele membrilor familiei în „Povestea mea”',
      sFamilyNote: 'Scrie numele adevărate ale membrilor familiei și așa vor apărea în poveste (ex. „Kati, mămica iubitoare”). Dacă lași gol, rămâne numele implicit.',
      sFamilySave: '💾 Salvează numele', sFamilySaved: '✅ Numele au fost salvate! Vor apărea în următoarea poveste.',
      install: '📲 Instalează ca aplicație', installed: '🎉 Aventura Isteață a fost instalată! Pictograma este pe desktop / ecranul de pornire.',
      sApp: '📲 Ca aplicație', sAppNote: 'Programul se poate instala: pornește cu propria pictogramă, rulează într-o fereastră separată și funcționează fără internet. Pentru asta trebuie deschis ca pagină web (nu din fișier); atunci browserul oferă instalarea.',
      instIOS: '<b>1.</b> Atinge butonul <b>Partajare</b> <span class="ios-share">⬆︎</span> din Safari (jos sau sus pe ecran).<br><b>2.</b> Derulează și alege <b>„Adaugă pe ecranul principal”</b>.<br><b>3.</b> Atinge <b>„Adaugă”</b> – gata! 🎉',
      instAndroid: '<b>1.</b> Deschide <b>meniul ⋮</b> al browserului (colțul din dreapta sus).<br><b>2.</b> Alege <b>„Instalează aplicația”</b> sau <b>„Adaugă pe ecranul de pornire”</b>.<br><b>3.</b> Confirmă – gata! 🎉',
      tFeedback: '💌 Părere', fbSubject: 'părere',
      fbIntro: 'Scrie-ne ce ți-a plăcut, ce nu sau ce joc nou ai vrea! Mesajul ajunge la autorul programului.',
      fbRate: 'Cât de mult îți place programul?', fbPh: 'Scrie aici părerea ta…', fbSend: '✉️ Trimite',
      fbPrivacy: 'Se trimite doar ce scrii aici. Programul nu trimite numele sau rezultatele copiilor.',
      fbNotSet: 'Trimiterea părerilor nu este încă configurată (js/config.js).', fbThanks: '💌 Mulțumim pentru părere!',
      sStats: '📊 Statistici anonime de utilizare', sStatsNote: 'Numără doar de câte ori și în ce limbă a fost deschis programul și ce joc a fost pornit. Nu trimite date personale.',
      sRound: '📝 Numărul de sarcini într-o rundă', sBackup: '💾 Salvare și restaurare',
      sBackupNote: 'Datele sunt păstrate în acest browser. Le poți muta pe alt dispozitiv printr-un fișier de salvare.',
      sExport: '⬇️ Salvează în fișier', sImport: '⬆️ Restaurează din fișier', sImportOk: '✅ Restaurare reușită!', sImportBad: 'Acesta nu este un fișier de salvare valid.',
      hTitle: 'Cum funcționează?',
      hItems: [
        '<b>Dificultate:</b> se alege înaintea fiecărui joc (Ușor / Mediu / Greu); recomandăm nivelul potrivit vârstei.',
        '<b>Contra cronometru:</b> în fiecare rundă există ⚡ sarcini fulger și se poate activa ca toate sarcinile să aibă timp limitat. Răspuns corect la timp: +1 ⭐.',
        '<b>Stele:</b> răspuns corect din prima 2 ⭐, din a doua 1 ⭐; 3 răspunsuri corecte la rând +1 ⭐ bonus.',
        '<b>Abțibilduri:</b> 1 abțibild după o rundă cel puțin pe jumătate corectă, plus unul rar și 3 ⭐ pentru o rundă perfectă.',
        '<b>Povestea mea:</b> alegerile copilului schimbă eroul și povestea, iar rezultatul sarcinilor schimbă acțiunea. Povestea gata se salvează la „Poveștile mele”.',
        '<b>Limba:</b> maghiară, română și engleză, cu sarcini potrivite fiecărei limbi.',
        '<b>Citire cu voce (🔊):</b> dacă dispozitivul are voce în limba respectivă, se folosește aceasta. Dacă nu, se folosește vocea integrată a programului (maghiară: Anna, engleză: Jenny, română: Mihai): se descarcă o singură dată pe limbă (cca 90 MB), apoi merge și fără internet. Citirea se face pe dispozitiv, textul nu este trimis nicăieri. Programul nu citește cu o voce în altă limbă.'
      ],
      hExtTitle: 'Extindere',
      hExt: 'Cel mai simplu adaugi întrebări noi în fila <b>Sarcini proprii</b>. Pentru jocuri, povești sau traduceri noi, vezi fișierul <code>README.md</code>.',
      stLibrary: '📚 Poveștile mele', stNone: 'Nu ai încă nicio poveste salvată. Creează una în „Povestea mea”! 📖',
      stTask: '✨ Rezolvă sarcina ca povestea să continue!', stSeeBook: '📖 Să vedem cartea de povești!',
      stWrittenBy: 'Autor: {n}', stRead: '🔊 Citește-mi', stNew: '🔁 Poveste nouă', stSaved: 'Povestea ta a fost salvată la Poveștile mele! 📚',
      stChooseHint: 'Alege! 👇', stReady: '⏱️ Sunt gata!',
      stPickHint: 'Alege 1–{n} personaje! Primul ales va fi eroul principal. ⭐',
      stPicked: 'Să înceapă povestea! ({n} personaje)', stLead: 'Erou principal',
      stAskName: 'Cum se numește? ✏️', stNamePh: 'Scrie numele', stOk: 'Gata ✔'
    },

    /* ============================== ENGLISH ============================== */
    en: {
      appName: 'Clever Quest',
      tagline: 'Playful learning with maths, language and stories',
      whoPlays: "Who's playing today?", welcome: "Hi! Let's start the adventure!",
      newPlayer: 'New player', parentCorner: "🔒 Parents' corner", age: '{n} years old',
      editPlayer: 'Edit player', yourName: "What's your name?", namePh: 'Type your name',
      howOld: 'How old are you?', pickAvatar: 'Pick a character!', favColor: "What's your favourite colour?",
      save: 'Save ✔', letsGo: "Let's go! 🚀", nameReq: 'Please type your name! 🙂',
      greet: ['Hi, {n}! What shall we learn today?', "I'm so glad you're here, {n}!", 'Ready for a new adventure, {n}?',
        "Hooray, {n} is here! Let's play!", "{n}, let's collect lots of stars today!"],
      toNextRank: '{n} more ⭐ and you become: {r}', gamesN: '{n} games',
      myStickers: '🏅 My stickers', switchPlayer: '👥 Switch player', back: 'Back',
      best: '🏆 Best: {b}/{t}', isNew: 'New! ✨',
      subj_matek: 'Maths', subj_matek_d: 'Count, measure, think!',
      subj_nyelvtan: 'Language', subj_nyelvtan_d: 'Letters, words, sentences',
      subj_irodalom: 'Stories & rhymes', subj_irodalom_d: 'Fairy tales, poems, rhymes',
      chooseLevel: 'How hard should it be?', lvl1: 'Easy', lvl2: 'Medium', lvl3: 'Hard',
      lvl1d: 'For starters', lvl2d: 'A little challenge', lvl3d: 'For real champions', forYou: 'Best for you',
      timed: '⏱️ Beat the clock', timedD: 'Every task has a time limit. Answer correctly in time for +1 ⭐!',
      start: "Let's go! 🚀",
      lightning: '⚡ Lightning task! Solve it in time!', timeUp: "⏰ Time's up!",
      fastBonus: '⚡ In time! +1 bonus', streakBonus: '🔥 3 correct in a row! +1 bonus',
      next: 'Next ➜', correctWas: 'The correct answer:', nextTime: "No worries, you'll get it next time! 💪",
      quitQ: 'Do you really want to stop?', starsKept: 'You keep the stars you earned! ⭐',
      keepPlaying: 'Keep playing', leave: 'Stop', readAloud: 'Read aloud', quit: 'Quit',
      exCorrect: 'Correct: {w}',
      rPerfect: "Perfect! You're the champion!", rGreat: 'Great job!', rGood: 'Nice work!', rTry: 'Good try!',
      correctOf: '{c} / {t} correct answers', starsPlus: '⭐ +{n} stars',
      perfectBonus: '✨ Perfect round! +3 bonus stars ✨', newRank: '🎊 You reached a new rank: {r}!', rankToast: '🎊 New rank: {r}!',
      newSticker: 'New sticker!', rareSticker: '✨ Rare sticker! ✨',
      needSticker: "You need at least {n} correct answers for a sticker. Try again – you can do it! 💪",
      allStickers: "You've collected every sticker! Here's +5 ⭐! 🎉",
      again: '🔁 Play again', otherGame: '🎮 Another game', home: '🏠 Home',
      albumLead: 'Every finished round earns a sticker, and a perfect round earns a ✨rare✨ one!', rareLbl: 'rare',
      gateText: 'This part is for grown-ups. To enter, solve:', gatePh: 'Answer', enter: 'Enter', gateWrong: 'Not quite. Try again!',
      tPlayers: '👥 Players', tCustom: '💝 My questions', tSettings: '⚙️ Settings', tHelp: '❔ Help', madeBy: 'Made by:', noVoice: '🔇 There is no English voice on this device. Download the built-in voice: Parents’ corner → Settings.',
      noPlayers: 'No players yet.', addPlayer: '➕ New player', edit: '✏️ Edit', del: '🗑️ Delete',
      summary: '⭐ {s} stars · ✅ {d} tasks solved · 🏅 {k} stickers · 📖 {m} stories',
      thGame: 'Game', thRounds: 'Rounds', thBest: 'Best', notPlayed: "Hasn't played yet.",
      delQ: "Delete {n}'s profile?", delNote: 'All stars, stickers and stories will be lost. This cannot be undone.',
      cancel: 'Cancel', delete: 'Delete',
      cIntro: 'Write your own questions for your child here (e.g. from school topics). They appear in the chosen subject as <b>“My questions”</b>, in every language.',
      cSubject: 'Subject', cQuestion: 'Question', cQPh: 'e.g. Who wrote “The Cat in the Hat”?', cEmoji: 'Picture (emoji, optional)',
      cRight: '✅ Correct answer', cRightPh: 'e.g. Dr. Seuss', cWrong: '❌ Wrong answer {n}', cWrongPh: 'e.g. Roald Dahl',
      optional: 'optional', cAdd: '➕ Add question', cList: 'Added questions ({n})', cNone: 'No questions yet.',
      cErrQA: 'A question and a correct answer are required.', cErrW: 'At least one wrong answer (different from the correct one) is needed.',
      cAdded: '✅ Question added!', customTitle: 'My questions', customDesc: 'Questions written by the family',
      sLang: '🌍 Language', sSound: '🔊 Sound effects', sSpeak: '🗣️ Read tasks aloud automatically',
      sSpeakNote: 'The 🔊 button always works.',
      sVoice: '🗣️ Built-in reading voice', sVoiceNote: 'Reading uses the device’s own voice. If the device has no voice for the language, the program’s built-in voice is used (Hungarian: Anna, English: Jenny, Romanian: Mihai). It is downloaded once per language, then it works offline too. Wi-Fi recommended.', ttsWait: '⏳ The reading voice is still downloading, almost ready…', ttsDevice: '✅ The device’s own voice is used', ttsNotNeeded: 'Not needed',
      ttsGet: '⬇️ Download (about {n} MB)', ttsDl: '⏳ Downloading… {p}%', ttsReady: '✅ Downloaded', ttsErr: '❌ Failed, please try again', ttsRemove: '🗑️ Remove from device', ttsRemoved: 'The reading voice was removed.', ttsNo: 'This browser is too old for the built-in voice.',
      ttsAskT: '🗣️ Reading voice', ttsAsk: 'To read aloud, the built-in voice needs to be downloaded once (about {n} MB). After that it works offline too. Wi-Fi recommended. Download it now?', ttsYes: '⬇️ Download', ttsLater: 'Not now', ttsStarted: '⏳ Downloading the reading voice…', ttsDone: '✅ Done! The reading voice is downloaded.',
      sFamily: '👪 Family names in the Story maker',
      sFamilyNote: 'Type the real names of family members and they will appear like that in the story (e.g. “Kate, the kind mum”). Leave empty to keep the default name.',
      sFamilySave: '💾 Save names', sFamilySaved: '✅ Names saved! They will appear in the next story.',
      install: '📲 Install as an app', installed: '🎉 Clever Quest is installed! Find its icon on your desktop / home screen.',
      sApp: '📲 As an app', sAppNote: 'The program can be installed: it starts from its own icon, runs in its own window and works offline. It must be opened as a web page (not from a file); the browser then offers to install it.',
      instIOS: '<b>1.</b> Tap the Safari <b>Share</b> button <span class="ios-share">⬆︎</span> (at the bottom or top of the screen).<br><b>2.</b> Scroll down and choose <b>“Add to Home Screen”</b>.<br><b>3.</b> Tap <b>“Add”</b> – done! 🎉',
      instAndroid: '<b>1.</b> Open the browser <b>⋮ menu</b> (top right corner).<br><b>2.</b> Choose <b>“Install app”</b> or <b>“Add to Home screen”</b>.<br><b>3.</b> Confirm – done! 🎉',
      tFeedback: '💌 Feedback', fbSubject: 'feedback',
      fbIntro: 'Tell us what you liked, what you did not, or which new game you would like! Your message goes to the creator of the program.',
      fbRate: 'How much do you like the program?', fbPh: 'Write your feedback here…', fbSend: '✉️ Send',
      fbPrivacy: "Only what you type here is sent. The program never sends children's names or results.",
      fbNotSet: 'Sending feedback is not set up yet (js/config.js).', fbThanks: '💌 Thank you for your feedback!',
      sStats: '📊 Anonymous usage statistics', sStatsNote: 'It only counts how often and in which language the program was opened and which game was started. No personal data is sent.',
      sRound: '📝 Tasks per round', sBackup: '💾 Backup & restore',
      sBackupNote: 'Data is stored in this browser. Use a backup file to move it to another device.',
      sExport: '⬇️ Save to file', sImport: '⬆️ Restore from file', sImportOk: '✅ Restored successfully!', sImportBad: 'This is not a valid backup file.',
      hTitle: 'How does it work?',
      hItems: [
        '<b>Difficulty:</b> chosen before each game (Easy / Medium / Hard); we recommend the one matching the age.',
        '<b>Against the clock:</b> every round has ⚡ lightning tasks, and you can turn on time limits for all tasks. Correct answer in time: +1 ⭐.',
        '<b>Stars:</b> right first time 2 ⭐, second time 1 ⭐; 3 correct in a row +1 bonus ⭐.',
        '<b>Stickers:</b> 1 sticker for a round at least half right, plus a rare one and 3 ⭐ for a perfect round.',
        "<b>Story maker:</b> the child's choices shape the hero and the story, and task results change the plot. Finished stories are saved in “My stories”.",
        '<b>Language:</b> Hungarian, Romanian and English, with tasks suited to each language.',
        '<b>Read aloud (🔊):</b> if the device has a voice for the language, it is used. If not, the program’s own built-in voice is used (Hungarian: Anna, English: Jenny, Romanian: Mihai): it is downloaded once per language (about 90 MB), then works offline too. Speech is generated on the device; no text is sent anywhere. The program never reads with a voice of another language.'
      ],
      hExtTitle: 'Adding content',
      hExt: 'The easiest way to add questions is the <b>My questions</b> tab. For new games, stories or translations, see <code>README.md</code>.',
      stLibrary: '📚 My stories', stNone: "You haven't saved any stories yet. Make one in the Story maker! 📖",
      stTask: '✨ Solve the task to continue the story!', stSeeBook: "📖 Let's see the storybook!",
      stWrittenBy: 'Written by {n}', stRead: '🔊 Read it to me', stNew: '🔁 New story', stSaved: 'Your story was saved in My stories! 📚',
      stChooseHint: 'Choose! 👇', stReady: "⏱️ I'm ready!",
      stPickHint: 'Pick 1–{n} characters! The first one you pick is the main hero. ⭐',
      stPicked: "Let's start the story! ({n} characters)", stLead: 'Main hero',
      stAskName: "What's their name? ✏️", stNamePh: 'Type the name', stOk: 'OK ✔'
    }
  };

  GJ.LANGS = [
    { id: 'hu', name: 'Magyar', speech: 'hu' },
    { id: 'ro', name: 'Română', speech: 'ro' },
    { id: 'en', name: 'English', speech: 'en' }
  ];

  /** A böngésző/telefon nyelve alapján: magyar, román, egyébként angol */
  GJ.browserLang = () => {
    const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || navigator.userLanguage || ''];
    for (const x of list) {
      const c = String(x).toLowerCase().slice(0, 2);
      if (c === 'hu' || c === 'en') return c;
      if (c === 'ro' || c === 'mo') return 'ro';
    }
    return 'en';
  };
  GJ.lang = () => {
    const st = GJ.store.settings(); // a mentett nyelv csak akkor számít, ha a felhasználó maga választotta
    return st.langChosen && D[st.lang] ? st.lang : GJ.browserLang();
  };
  GJ.setLang = l => {
    const s = GJ.store.settings(); s.lang = D[l] ? l : 'hu'; s.langChosen = true; GJ.store.saveSettings(s);
    document.documentElement.lang = s.lang;
    document.title = D[s.lang].appName;
  };
  /** A választott nyelvhez tartozó logó (img/logo-hu.webp, logo-ro.webp, logo-en.webp) */
  /* Arculati képek nyelvenként:
     poster = indítókép, logo = cím + bagoly (kezdőképernyő), title = csak a cím (fejléc) */
  const BRAND = {
    hu: { poster: 'img/poster-hu.webp', logo: 'img/logo-hu.webp', title: 'img/title-hu.webp' },
    ro: { poster: 'img/poster-ro.webp', logo: 'img/logo-ro.webp', title: 'img/title-ro.webp' },
    en: { poster: 'img/poster-en.webp', logo: 'img/logo-en.webp', title: 'img/title-en.webp' }
  };
  GJ.brand = () => BRAND[GJ.lang()] || BRAND.hu;
  GJ.logo = () => GJ.brand().logo;

  /** Lefordított szöveg; {név} helyőrzőkkel */
  GJ.t = (k, v) => {
    let s = D[GJ.lang()][k];
    if (s == null) s = D.hu[k];
    if (s == null) return k;
    if (Array.isArray(s)) s = GJ.u.pick(s);
    return v ? s.replace(/\{(\w+)\}/g, (m, n) => (v[n] != null ? v[n] : m)) : s;
  };
  /** Lefordított lista */
  GJ.tl = k => D[GJ.lang()][k] || D.hu[k] || [];
  /** {hu, ro, en} objektumból a megfelelő nyelvű érték */
  GJ.L = o => {
    if (o == null) return '';
    if (typeof o === 'object' && !Array.isArray(o)) return o[GJ.lang()] != null ? o[GJ.lang()] : (o.hu != null ? o.hu : '');
    return o;
  };

  /* Zászlók (SVG – Windows alatt az emoji-zászlók nem látszanak) */
  let fid = 0;
  GJ.flag = id => {
    if (id === 'hu') return '<svg viewBox="0 0 3 2" class="flag"><rect width="3" height="2" fill="#477050"/><rect width="3" height="1.333" fill="#fff"/><rect width="3" height=".667" fill="#CE2939"/></svg>';
    if (id === 'ro') return '<svg viewBox="0 0 3 2" class="flag"><rect width="1" height="2" fill="#002B7F"/><rect x="1" width="1" height="2" fill="#FCD116"/><rect x="2" width="1" height="2" fill="#CE1126"/></svg>';
    const n = ++fid;
    return `<svg viewBox="0 0 60 30" class="flag"><clipPath id="fs${n}"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="ft${n}"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#fs${n})"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#ft${n})" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>`;
  };

  document.documentElement.lang = GJ.lang();
  document.title = D[GJ.lang()].appName;
})();
