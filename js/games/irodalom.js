/* Okos Kaland – IRODALOM játékok (hu / ro / en): mesék, versek, rímek, közmondások
 * A listák szabadon bővíthetők új sorokkal. (A Mesekészítő külön fájlban: mesekeszito.js)
 */
(function () {
  'use strict';
  const { pick, shuffle, options, esc } = GJ.u;

  /* 1. Mesekvíz -----------------------------------------------------------
   * Minden sor: e = kép, és nyelvenként [mese címe, kérdés, helyes válasz, rossz1, rossz2, rossz3].
   * Ha egy nyelv hiányzik, az a kérdés azon a nyelven nem jelenik meg. */
  const TALES = [
    { e: '👧🐺', hu: ['Piroska és a farkas', 'Milyen színű volt Piroska sapkája?', 'piros', 'kék', 'zöld', 'sárga'],
      ro: ['Scufița Roșie', 'Ce culoare avea scufița fetiței?', 'roșie', 'albastră', 'verde', 'galbenă'],
      en: ['Little Red Riding Hood', 'What colour was her hood?', 'red', 'blue', 'green', 'yellow'] },
    { e: '🧺', hu: ['Piroska és a farkas', 'Kinek vitt Piroska ennivalót?', 'a nagymamájának', 'a vadásznak', 'a királynak', 'a farkasnak'],
      ro: ['Scufița Roșie', 'Cui ducea Scufița Roșie mâncare?', 'bunicii', 'vânătorului', 'regelui', 'lupului'],
      en: ['Little Red Riding Hood', 'Who was she taking food to?', 'her grandmother', 'the hunter', 'the king', 'the wolf'] },
    { e: '👠', hu: ['Hamupipőke', 'Mit veszített el Hamupipőke a bálban?', 'a cipőjét', 'a koronáját', 'a kesztyűjét', 'a nyakláncát'],
      ro: ['Cenușăreasa', 'Ce a pierdut Cenușăreasa la bal?', 'pantoful', 'coroana', 'mănușa', 'colierul'],
      en: ['Cinderella', 'What did Cinderella lose at the ball?', 'her slipper', 'her crown', 'her glove', 'her necklace'] },
    { e: '🎃', hu: ['Hamupipőke', 'Mivé változott a tök a varázslattól?', 'hintóvá', 'palotává', 'hajóvá', 'almává'],
      ro: ['Cenușăreasa', 'În ce s-a transformat dovleacul?', 'într-o caleașcă', 'într-un palat', 'într-o corabie', 'într-un măr'],
      en: ['Cinderella', 'What did the pumpkin turn into?', 'a carriage', 'a palace', 'a ship', 'an apple'] },
    { e: '🍎', hu: ['Hófehérke', 'Hány törpénél lakott Hófehérke?', 'hét', 'három', 'öt', 'tíz'],
      ro: ['Albă-ca-Zăpada', 'La câți pitici a locuit Albă-ca-Zăpada?', 'șapte', 'trei', 'cinci', 'zece'],
      en: ['Snow White', 'How many dwarfs did Snow White live with?', 'seven', 'three', 'five', 'ten'] },
    { e: '🍎', hu: ['Hófehérke', 'Mitől aludt el Hófehérke?', 'egy mérgezett almától', 'egy altatódaltól', 'egy varázspálcától', 'egy tüskétől'],
      ro: ['Albă-ca-Zăpada', 'De la ce a adormit Albă-ca-Zăpada?', 'de la un măr otrăvit', 'de la un cântec de leagăn', 'de la o baghetă magică', 'de la un spin'],
      en: ['Snow White', 'What made Snow White fall asleep?', 'a poisoned apple', 'a lullaby', 'a magic wand', 'a thorn'] },
    { e: '🪞', hu: ['Hófehérke', 'Kitől kérdezte a gonosz királyné, ki a legszebb?', 'a varázstükörtől', 'a vadásztól', 'a törpéktől', 'a bagolytól'],
      ro: ['Albă-ca-Zăpada', 'Pe cine întreba regina cea rea cine e cea mai frumoasă?', 'oglinda fermecată', 'vânătorul', 'piticii', 'bufnița'],
      en: ['Snow White', 'Who did the wicked queen ask who was the fairest?', 'the magic mirror', 'the hunter', 'the dwarfs', 'the owl'] },
    { e: '🐷🐷🐷', hu: ['A három kismalac', 'Melyik házat nem tudta elfújni a farkas?', 'a téglaházat', 'a szalmaházat', 'a faházat', 'a sátrat'],
      ro: ['Cei trei purceluși', 'Ce casă nu a putut-o dărâma lupul?', 'casa de cărămidă', 'casa de paie', 'casa de lemn', 'cortul'],
      en: ['The Three Little Pigs', 'Which house could the wolf not blow down?', 'the brick house', 'the straw house', 'the wooden house', 'the tent'] },
    { e: '🌹', hu: ['Csipkerózsika', 'Mivel szúrta meg az ujját Csipkerózsika?', 'egy orsóval', 'egy tűvel', 'egy rózsatövissel', 'egy késsel'],
      ro: ['Frumoasa din pădurea adormită', 'Cu ce s-a înțepat la deget prințesa?', 'cu un fus', 'cu un ac', 'cu un spin de trandafir', 'cu un cuțit'],
      en: ['Sleeping Beauty', 'What did the princess prick her finger on?', 'a spindle', 'a needle', 'a rose thorn', 'a knife'] },
    { e: '😴', hu: ['Csipkerózsika', 'Hány évig aludt Csipkerózsika?', 'száz évig', 'egy évig', 'tíz évig', 'ezer évig'],
      ro: ['Frumoasa din pădurea adormită', 'Câți ani a dormit prințesa?', 'o sută de ani', 'un an', 'zece ani', 'o mie de ani'],
      en: ['Sleeping Beauty', 'How long did the princess sleep?', 'a hundred years', 'one year', 'ten years', 'a thousand years'] },
    { e: '🏠', hu: ['Jancsi és Juliska', 'Miből volt a boszorkány háza?', 'mézeskalácsból', 'jégből', 'kőből', 'szalmából'],
      ro: ['Hansel și Gretel', 'Din ce era făcută casa vrăjitoarei?', 'din turtă dulce', 'din gheață', 'din piatră', 'din paie'],
      en: ['Hansel and Gretel', "What was the witch's house made of?", 'gingerbread', 'ice', 'stone', 'straw'] },
    { e: '🎺', hu: ['A brémai muzsikusok', 'Melyik állat NEM volt a muzsikusok között?', 'a ló', 'a szamár', 'a kutya', 'a kakas'],
      ro: ['Muzicanții din Bremen', 'Care animal NU era printre muzicanți?', 'calul', 'măgarul', 'câinele', 'cocoșul'],
      en: ['The Bremen Town Musicians', 'Which animal was NOT one of the musicians?', 'the horse', 'the donkey', 'the dog', 'the rooster'] },
    { e: '🍯', hu: ['Micimackó', 'Mit szeret a legjobban Micimackó?', 'a mézet', 'a halat', 'a sárgarépát', 'a sajtot'],
      ro: ['Winnie de Pluș', 'Ce îi place cel mai mult lui Winnie de Pluș?', 'mierea', 'peștele', 'morcovii', 'brânza'],
      en: ['Winnie-the-Pooh', 'What does Pooh love most?', 'honey', 'fish', 'carrots', 'cheese'] },
    { e: '🤥', hu: ['Pinokkió', 'Mi történt Pinokkió orrával, amikor hazudott?', 'megnőtt', 'piros lett', 'eltűnt', 'zöld lett'],
      ro: ['Pinocchio', 'Ce se întâmpla cu nasul lui Pinocchio când mințea?', 'creștea', 'se înroșea', 'dispărea', 'se făcea verde'],
      en: ['Pinocchio', "What happened to Pinocchio's nose when he lied?", 'it grew longer', 'it turned red', 'it disappeared', 'it turned green'] },
    { e: '🪵', hu: ['Pinokkió', 'Miből faragták Pinokkiót?', 'fából', 'kőből', 'jégből', 'agyagból'],
      ro: ['Pinocchio', 'Din ce a fost cioplit Pinocchio?', 'din lemn', 'din piatră', 'din gheață', 'din lut'],
      en: ['Pinocchio', 'What was Pinocchio carved from?', 'wood', 'stone', 'ice', 'clay'] },
    { e: '🍲', hu: ['Kőleves', 'Mit tett a katona először a fazékba?', 'egy követ', 'egy krumplit', 'egy tojást', 'egy almát'],
      ro: ['Supa de piatră', 'Ce a pus soldatul primul în oală?', 'o piatră', 'un cartof', 'un ou', 'un măr'],
      en: ['Stone Soup', 'What did the soldier put in the pot first?', 'a stone', 'a potato', 'an egg', 'an apple'] },
    { e: '🦢', hu: ['A rút kiskacsa', 'Mivé nőtt fel a rút kiskacsa?', 'gyönyörű hattyúvá', 'libává', 'tyúkká', 'gólyává'],
      ro: ['Rățușca cea urâtă', 'În ce s-a transformat rățușca cea urâtă?', 'într-o lebădă frumoasă', 'într-o gâscă', 'într-o găină', 'într-o barză'],
      en: ['The Ugly Duckling', 'What did the ugly duckling grow into?', 'a beautiful swan', 'a goose', 'a hen', 'a stork'] },
    { e: '🧜‍♀️', hu: ['A kis hableány', 'Hol élt a kis hableány?', 'a tenger mélyén', 'egy toronyban', 'az erdőben', 'a felhők között'],
      ro: ['Mica sirenă', 'Unde trăia mica sirenă?', 'în adâncul mării', 'într-un turn', 'în pădure', 'printre nori'],
      en: ['The Little Mermaid', 'Where did the little mermaid live?', 'deep in the sea', 'in a tower', 'in the forest', 'among the clouds'] },
    { e: '👸', hu: ['Aranyhaj', 'Hol élt bezárva Aranyhaj?', 'egy magas toronyban', 'egy barlangban', 'egy hajón', 'egy kútban'],
      ro: ['Rapunzel', 'Unde era închisă Rapunzel?', 'într-un turn înalt', 'într-o peșteră', 'pe o corabie', 'într-o fântână'],
      en: ['Rapunzel', 'Where was Rapunzel locked away?', 'in a tall tower', 'in a cave', 'on a ship', 'in a well'] },
    { e: '🐐', hu: ['A farkas és a hét kecskegida', 'Hány kecskegida volt a mesében?', 'hét', 'három', 'öt', 'tíz'],
      ro: ['Capra cu trei iezi', 'Câți iezi avea capra?', 'trei', 'doi', 'cinci', 'șapte'],
      en: ['The Wolf and the Seven Little Kids', 'How many little goats were there?', 'seven', 'three', 'five', 'ten'] },
    // csak magyarul
    { e: '🐓', hu: ['A kiskakas gyémánt félkrajcárja', 'Mit talált a kiskakas a szemétdombon?', 'egy gyémánt félkrajcárt', 'egy aranytojást', 'egy kincsesládát', 'egy varázsgyűrűt'] },
    { e: '🐓', hu: ['A kiskakas gyémánt félkrajcárja', 'Ki vette el a kiskakas kincsét?', 'a török császár', 'a róka', 'a boszorkány', 'a molnár'] },
    { e: '🧂', hu: ['A só', 'Mihez hasonlította a legkisebb királylány, mennyire szereti az apját?', 'a sóhoz', 'a cukorhoz', 'a mézhez', 'az aranyhoz'] },
    { e: '👑', hu: ['Mátyás király meséi', 'Hogyan járta az országot Mátyás király, hogy ne ismerjék fel?', 'álruhában', 'repülő szőnyegen', 'láthatatlanul', 'hétmérföldes csizmában'] },
    { e: '🦊', hu: ['Fekete István: Vuk', 'Milyen állat Vuk?', 'kis róka', 'kis farkas', 'kis medve', 'kis nyuszi'] },
    { e: '🪿', hu: ['Ludas Matyi', 'Mit vitt eladni Matyi a vásárba?', 'libákat', 'tojásokat', 'almákat', 'kecskéket'] },
    { e: '🪿', hu: ['Ludas Matyi', 'Hányszor verte vissza Matyi Döbrögit?', 'háromszor', 'egyszer', 'kétszer', 'hétszer'] },
    { e: '🐞', hu: ['Bogyó és Babóca', 'Milyen állat Babóca?', 'katicabogár', 'csiga', 'méhecske', 'pillangó'] },
    { e: '🐌', hu: ['Bogyó és Babóca', 'Milyen állat Bogyó?', 'csigafiú', 'katicabogár', 'sünifiú', 'egérke'] },
    { e: '🐷', hu: ['Mazsola', 'Milyen állat Mazsola?', 'kismalac', 'kiscica', 'kiskutya', 'kisegér'] },
    { e: '🐕', hu: ['Frakk, a macskák réme', 'Milyen állat Frakk?', 'kutya', 'macska', 'róka', 'ló'] },
    // csak románul (Ion Creangă és népmesék)
    { e: '🐐', ro: ['Capra cu trei iezi', 'Care ied a scăpat ascunzându-se în horn?', 'cel mic', 'cel mare', 'cel mijlociu', 'niciunul'] },
    { e: '🐓', ro: ['Punguța cu doi bani', 'Ce a găsit cocoșul?', 'o punguță cu doi bani', 'un ou de aur', 'o comoară', 'un inel fermecat'] },
    { e: '🐓', ro: ['Punguța cu doi bani', 'Cine i-a luat cocoșului punguța?', 'boierul', 'vulpea', 'lupul', 'morarul'] },
    { e: '🐻', ro: ['Ursul păcălit de vulpe', 'Cu ce a pescuit ursul în lac?', 'cu coada', 'cu o undiță', 'cu o plasă', 'cu labele'] },
    // csak angolul
    { e: '🐻🐻🐻', en: ['Goldilocks and the Three Bears', 'Whose porridge was just right?', "Baby Bear's", "Daddy Bear's", "Mummy Bear's", "the wolf's"] },
    { e: '🌱', en: ['Jack and the Beanstalk', 'What did Jack swap the cow for?', 'magic beans', 'a golden egg', 'a horse', 'a sack of gold'] },
    { e: '🍪', en: ['The Gingerbread Man', 'Who ate the Gingerbread Man in the end?', 'the fox', 'the cow', 'the horse', 'the old woman'] },
    { e: '🐰', en: ['The Tale of Peter Rabbit', 'Whose garden did Peter Rabbit sneak into?', "Mr. McGregor's", "the king's", "the baker's", "the giant's"] }
  ];
  GJ.register({
    id: 'mesek', subject: 'irodalom', icon: '🏰',
    title: { hu: 'Mesekvíz', ro: 'Quiz de povești', en: 'Fairy tale quiz' },
    desc: { hu: 'Mennyire ismered a meséket?', ro: 'Cât de bine cunoști poveștile?', en: 'How well do you know the stories?' },
    make({ lang }) {
      const it = pick(TALES.filter(x => x[lang]));
      const [t, q, a, ...w] = it[lang];
      return {
        type: 'choice', key: q, prompt: q, speak: `${t}. ${q}`,
        big: `${GJ.pic(it.e)}<div class="book-title">📖 ${esc(t)}</div>`,
        options: options(a, shuffle(w)), answer: a, cols: 1
      };
    }
  });

  /* 2. Versfaragó – hiányzó szó mondókákban, versekben --------------------
   * v: szöveg (___ = hiányzó szó, \n = új sor); a: hiányzó szó; s: forrás */
  const POEMS = {
    hu: [
      { e: '🐄', v: 'Boci, boci tarka,\nse füle, se ___,\noda megyünk lakni,\nahol tejet kapni.', a: 'farka', s: 'Népi mondóka' },
      { e: '🐌', v: 'Csiga-biga, gyere ki,\nég a házad ideki,\nkapsz tejet, ___,\nholnapra is marad.', a: 'vajat', s: 'Népi mondóka' },
      { e: '🪶', v: 'Gólya, gólya, gilice,\nmitől véres a ___?', a: 'lábad', s: 'Népi mondóka' },
      { e: '🐰', v: 'Nyuszi ül a ___,\nülve szundikál.', a: 'fűben', s: 'Népi játék' },
      { e: '🧵', v: 'Lánc, lánc, eszterlánc,\neszterlánci ___.', a: 'cérna', s: 'Népi játék' },
      { e: '✋', v: 'Hüvelykujjam almafa,\nmutatóujjam ___.', a: 'megrázta', s: 'Népi mondóka' },
      { e: '🌬️', v: 'Tavaszi szél vizet ___,\nvirágom, virágom.', a: 'áraszt', s: 'Népdal' },
      { e: '🌿', v: 'Bújj, bújj, zöld ág,\nzöld ___.', a: 'levelecske', s: 'Népi játék' },
      { e: '🚂', v: 'Megy a gőzös, megy a gőzös\n___.', a: 'Kanizsára', s: 'Népdal' },
      { e: '🍒', v: 'Egy, megérett a ___,\nkettő, csipkebokor vessző.', a: 'meggy', s: 'Kiszámoló' },
      { e: '💨', v: 'Hej, Dunáról fúj a ___.', a: 'szél', s: 'Népdal' },
      { e: '👀', v: 'Az a szép, az a szép,\nakinek a szeme ___.', a: 'kék', s: 'Népdal' },
      { e: '🧚', v: 'Bóbita, Bóbita táncol,\nkörben az ___-sereg.', a: 'angyalka', s: 'Weöres Sándor: Bóbita' },
      { e: '🍂', v: 'Őszi éjjel\nizzik a ___\nruhája.', a: 'galagonya', s: 'Weöres Sándor: Galagonya' },
      { e: '🐔', v: 'Ej, mi a kő! ___, kend\nA szobában lakik itt bent?', a: 'tyúkanyó', s: 'Petőfi Sándor: Anyám tyúkja' },
      { e: '🍁', v: 'Itt van az ősz, itt van újra,\nS szép, mint mindig, ___.', a: 'énnekem', s: 'Petőfi Sándor: Itt van az ősz, itt van újra' }
    ],
    ro: [
      { e: '🐦', v: 'Somnoroase ___\nPe la cuiburi se adună,\nSe ascund în rămurele –\nNoapte bună!', a: 'păsărele', s: 'Mihai Eminescu: Somnoroase păsărele' },
      { e: '🐌', v: 'Melc, melc, ___,\nScoate coarne bourești.', a: 'codobelc', s: 'Poezie populară' },
      { e: '🐶', v: 'Cățeluș cu părul creț,\nFură ___ din coteț.', a: 'rața', s: 'Poezie populară' },
      { e: '🌲', v: 'Ce te legeni, ___,\nFără ploaie, fără vânt,\nCu crengile la pământ?', a: 'codrule', s: 'Mihai Eminescu: Ce te legeni…' },
      { e: '🌳', v: 'Codrule, codruțule,\nCe mai faci, ___?', a: 'drăguțule', s: 'Mihai Eminescu: Revedere' },
      { e: '❄️', v: 'Din văzduh cumplita iarnă\ncerne norii de ___.', a: 'zăpadă', s: 'Vasile Alecsandri: Iarna' },
      { e: '✨', v: 'A fost odată ca-n ___,\nA fost ca niciodată.', a: 'povești', s: 'Mihai Eminescu: Luceafărul' }
    ],
    en: [
      { e: '⭐', v: 'Twinkle, twinkle, little ___,\nHow I wonder what you are!', a: 'star', s: 'Nursery rhyme' },
      { e: '🥚', v: 'Humpty Dumpty sat on a ___,\nHumpty Dumpty had a great fall.', a: 'wall', s: 'Nursery rhyme' },
      { e: '🐑', v: 'Baa, baa, black sheep,\nHave you any ___?', a: 'wool', s: 'Nursery rhyme' },
      { e: '⛰️', v: 'Jack and Jill went up the ___\nTo fetch a pail of water.', a: 'hill', s: 'Nursery rhyme' },
      { e: '🐭', v: 'Hickory, dickory, dock,\nThe mouse ran up the ___.', a: 'clock', s: 'Nursery rhyme' },
      { e: '🐑', v: 'Mary had a little ___,\nIts fleece was white as snow.', a: 'lamb', s: 'Nursery rhyme' },
      { e: '🌧️', v: 'Rain, rain, go away,\nCome again another ___.', a: 'day', s: 'Nursery rhyme' },
      { e: '🚣', v: 'Row, row, row your ___,\nGently down the stream.', a: 'boat', s: 'Nursery rhyme' },
      { e: '🐄', v: 'Hey diddle diddle,\nThe cat and the fiddle,\nThe cow jumped over the ___.', a: 'moon', s: 'Nursery rhyme' },
      { e: '🚜', v: 'Old MacDonald had a ___,\nE-I-E-I-O!', a: 'farm', s: 'Nursery rhyme' },
      { e: '🐑', v: 'Little Bo-Peep has lost her ___\nAnd doesn\'t know where to find them.', a: 'sheep', s: 'Nursery rhyme' },
      { e: '👞', v: 'One, two,\nBuckle my ___.', a: 'shoe', s: 'Nursery rhyme' }
    ]
  };
  GJ.register({
    id: 'versek', subject: 'irodalom', icon: '🎵',
    title: { hu: 'Versfaragó', ro: 'Poezii cu goluri', en: 'Rhyme time' },
    desc: { hu: 'Melyik szó hiányzik a versből?', ro: 'Ce cuvânt lipsește din poezie?', en: 'Which word is missing?' },
    make({ lang }) {
      const list = POEMS[lang], it = pick(list);
      const html = esc(it.v).replace('___', '<span class="gap"></span>').replace(/\n/g, '<br>');
      const others = shuffle(list.filter(p => p !== it).map(p => p.a));
      const q = { hu: 'Melyik szó hiányzik?', ro: 'Ce cuvânt lipsește?', en: 'Which word is missing?' }[lang];
      return {
        type: 'choice', key: it.a, prompt: q,
        speak: q + ' ' + it.v.replace('___', '…').replace(/\n/g, ', '),
        big: `${GJ.pic(it.e)}<div class="poem">${html}</div><div class="source">— ${esc(it.s)}</div>`,
        options: options(it.a, others), answer: it.a, explain: it.s
      };
    }
  });

  /* 3. Rímkereső --------------------------------------------------------- */
  const RHYMES = {
    hu: [['kéz', 'méz'], ['hal', 'fal'], ['tó', 'hó'], ['tél', 'szél'], ['nap', 'kap'], ['mackó', 'zacskó'],
      ['szív', 'hív'], ['ló', 'szó'], ['kút', 'út'], ['tűz', 'fűz'], ['tojás', 'óriás'], ['szamár', 'madár'],
      ['alma', 'szalma'], ['bagoly', 'mosoly'], ['hinta', 'minta'], ['ház', 'gáz'], ['bors', 'gyors'],
      ['egér', 'kenyér'], ['pók', 'csók'], ['virág', 'világ'], ['csiga', 'biga'], ['kalap', 'alap'],
      ['cica', 'mica'], ['róka', 'móka'], ['torta', 'porta'], ['kecske', 'fecske']],
    ro: [['pisică', 'furnică'], ['casă', 'masă'], ['pom', 'om'], ['cal', 'mal'], ['nas', 'vas'], ['lună', 'bună'],
      ['soare', 'floare'], ['pâine', 'câine'], ['urs', 'curs'], ['lup', 'stup'], ['ploaie', 'oaie'], ['carte', 'parte'],
      ['brad', 'cad'], ['ou', 'nou'], ['măr', 'păr'], ['joc', 'foc'], ['rață', 'față'], ['melc', 'codobelc']],
    en: [['cat', 'hat'], ['dog', 'frog'], ['sun', 'bun'], ['bee', 'tree'], ['star', 'car'], ['cake', 'lake'],
      ['moon', 'spoon'], ['fish', 'dish'], ['mouse', 'house'], ['goat', 'boat'], ['king', 'ring'], ['snail', 'tail'],
      ['fox', 'box'], ['bed', 'red'], ['sock', 'clock'], ['light', 'night'], ['rain', 'train'], ['bug', 'rug'], ['hen', 'pen']]
  };
  // a szó „rímrésze”: az utolsó magánhangzótól a végéig (tó → ó, kéz → éz)
  const ending = w => {
    for (let i = w.length - 1; i >= 0; i--) if (GJ.u.isVowel(w[i]) || 'ăâîy'.includes(w[i])) return w.slice(i);
    return w;
  };
  GJ.register({
    id: 'rimek', subject: 'irodalom', icon: '🎶',
    title: { hu: 'Rímkereső', ro: 'Găsește rima', en: 'Find the rhyme' },
    desc: { hu: 'Melyik szó rímel?', ro: 'Care cuvânt rimează?', en: 'Which word rhymes?' },
    make({ lang }) {
      const list = RHYMES[lang], pair = pick(list);
      const flip = Math.random() < 0.5;
      const w = flip ? pair[1] : pair[0], ans = flip ? pair[0] : pair[1];
      const others = shuffle(list.filter(p => p !== pair).flat().filter(x => ending(x) !== ending(w) && ending(x) !== ending(ans)));
      const q = { hu: `Melyik szó rímel erre: „${w}”?`, ro: `Ce cuvânt rimează cu „${w}”?`, en: `Which word rhymes with “${w}”?` }[lang];
      return {
        type: 'choice', key: w, prompt: q, speak: q.replace(/[„”“]/g, ''),
        big: `<div class="word big-word">🎶 ${esc(w)}</div>`,
        hint: {
          hu: 'A rímelő szavak vége ugyanúgy cseng: kéz – méz.', ro: 'Cuvintele care rimează se termină la fel: casă – masă.',
          en: 'Rhyming words end with the same sound: cat – hat.'
        }[lang],
        options: options(ans, others), answer: ans, explain: `${w} – ${ans}`
      };
    }
  });

  /* 4. Közmondások ------------------------------------------------------- */
  const PROVERBS = {
    hu: [
      { v: 'Ki korán kel, ___ lel.', a: 'aranyat', x: 'Aki szorgalmas és korán kezd, annak sikerül a dolga.' },
      { v: 'Lassan járj, tovább ___.', a: 'érsz', x: 'Ha nem kapkodsz, többre jutsz.' },
      { v: 'Addig üsd a vasat, amíg ___.', a: 'meleg', x: 'Ha jó alkalom van, rögtön használd ki!' },
      { v: 'Aki másnak vermet ás, maga ___ bele.', a: 'esik', x: 'Aki másnak rosszat akar, magának árt vele.' },
      { v: 'Sok kicsi sokra ___.', a: 'megy', x: 'Sok apró dologból egyszer sok lesz.' },
      { v: 'Ajándék lónak ne nézd a ___.', a: 'fogát', x: 'Az ajándéknak örüljünk, ne keressük a hibáját!' },
      { v: 'Nem esik messze az alma a ___.', a: 'fájától', x: 'A gyerek gyakran hasonlít a szüleire.' },
      { v: 'Néma gyereknek anyja sem érti a ___.', a: 'szavát', x: 'Mondd el, mit szeretnél, különben nem tudnak segíteni!' },
      { v: 'Jobb ma egy veréb, mint holnap egy ___.', a: 'túzok', x: 'Jobb a kicsi, ami biztos, mint a nagy, ami bizonytalan.' },
      { v: 'Lassú víz partot ___.', a: 'mos', x: 'A csendes, kitartó munka is nagy eredményt hoz.' },
      { v: 'Nincsen rózsa ___ nélkül.', a: 'tövis', x: 'Minden szép dolognak van nehezebb oldala is.' },
      { v: 'Többet ésszel, mint ___.', a: 'erővel', x: 'Okos gondolkodással többre megyünk, mint erővel.' },
      { v: 'Aki keres, az ___.', a: 'talál', x: 'Aki kitartóan próbálkozik, sikerrel jár.' },
      { v: 'Egy fecske nem csinál ___.', a: 'nyarat', x: 'Egyetlen jel még nem jelenti, hogy valami biztosan megtörténik.' },
      { v: 'Amit ma megtehetsz, ne halaszd ___.', a: 'holnapra', x: 'Ne halogasd a feladataidat!' },
      { v: 'Madarat tolláról, embert ___.', a: 'barátjáról', x: 'Az embert a barátai alapján is megismerhetjük.' }
    ],
    ro: [
      { v: 'Cine se scoală de dimineață, departe ___.', a: 'ajunge', x: 'Cine e harnic și începe devreme reușește.' },
      { v: 'Ziua bună se cunoaște de ___.', a: 'dimineață', x: 'Un început bun arată cum va fi tot lucrul.' },
      { v: 'Graba strică ___.', a: 'treaba', x: 'Dacă te grăbești prea tare, greșești.' },
      { v: 'Ai carte, ai ___.', a: 'parte', x: 'Cine învață are o viață mai bună.' },
      { v: 'Prietenul la nevoie se ___.', a: 'cunoaște', x: 'Prietenul adevărat te ajută când ai nevoie.' },
      { v: 'Nu lăsa pe mâine ce poți face ___.', a: 'azi', x: 'Nu amâna treburile!' },
      { v: 'Ce ție nu-ți place, altuia nu-i ___.', a: 'face', x: 'Poartă-te cu alții cum vrei să se poarte ei cu tine.' },
      { v: 'Cine sapă groapa altuia cade singur în ___.', a: 'ea', x: 'Cine vrea răul altora își face rău sieși.' },
      { v: 'Calul de dar nu se caută la ___.', a: 'dinți', x: 'Bucură-te de cadou, nu-i căuta defecte!' },
      { v: 'Mai bine o vrabie în mână decât o ___ pe gard.', a: 'cioară', x: 'E mai bine puțin și sigur decât mult și nesigur.' },
      { v: 'Ochii care nu se văd se ___.', a: 'uită', x: 'Când nu ne vedem des, ne îndepărtăm.' },
      { v: 'Socoteala de acasă nu se potrivește cu cea din ___.', a: 'târg', x: 'Planurile nu ies mereu cum ne gândim.' }
    ],
    en: [
      { v: 'The early bird catches the ___.', a: 'worm', x: 'If you start early, you have the best chance.' },
      { v: 'Slow and steady wins the ___.', a: 'race', x: 'Calm, steady work beats rushing.' },
      { v: 'Practice makes ___.', a: 'perfect', x: 'The more you practise, the better you get.' },
      { v: 'Better late than ___.', a: 'never', x: 'Doing something late is better than not doing it at all.' },
      { v: 'An apple a day keeps the ___ away.', a: 'doctor', x: 'Eating healthy food keeps you well.' },
      { v: "Don't count your chickens before they ___.", a: 'hatch', x: "Don't be sure of something before it happens." },
      { v: 'Look before you ___.', a: 'leap', x: 'Think before you act.' },
      { v: 'Actions speak louder than ___.', a: 'words', x: 'What you do matters more than what you say.' },
      { v: 'Two heads are better than ___.', a: 'one', x: 'Working together helps solve problems.' },
      { v: "Where there's a will, there's a ___.", a: 'way', x: 'If you really want something, you will find a way.' },
      { v: 'Every cloud has a silver ___.', a: 'lining', x: 'Something good can come from something bad.' },
      { v: "Don't judge a book by its ___.", a: 'cover', x: "Don't decide about something just by how it looks." },
      { v: "Don't put all your eggs in one ___.", a: 'basket', x: "Don't rely on just one thing." }
    ]
  };
  GJ.register({
    id: 'kozmondasok', subject: 'irodalom', icon: '🦉',
    title: { hu: 'Közmondások', ro: 'Proverbe', en: 'Proverbs' },
    desc: { hu: 'Egészítsd ki a bölcs mondást!', ro: 'Completează proverbul!', en: 'Complete the wise saying!' },
    make({ lang }) {
      const list = PROVERBS[lang], it = pick(list);
      const others = shuffle(list.filter(p => p !== it).map(p => p.a));
      const q = { hu: 'Melyik szóval lesz teljes a közmondás?', ro: 'Ce cuvânt completează proverbul?', en: 'Which word completes the proverb?' }[lang];
      return {
        type: 'choice', key: it.a, prompt: q,
        speak: q + ' ' + it.v.replace('___', '…'),
        big: `<img class="task-img" src="img/ui/g-kozmondasok.webp" alt=""><div class="poem">${esc(it.v).replace('___', '<span class="gap"></span>')}</div>`,
        options: options(it.a, others), answer: it.a,
        explain: { hu: 'Jelentése: ', ro: 'Înțeles: ', en: 'Meaning: ' }[lang] + it.x
      };
    }
  });
})();
