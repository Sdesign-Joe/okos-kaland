/* Okos Kaland – MESEKÉSZÍTŐ (interaktív, elágazó mese) hu / ro / en
 *
 * A gyerek döntései (hős, kaland, társ, útvonal) és a feladatok eredménye (jó / nem sikerült)
 * más-más cselekményt adnak. A végén a mese mesekönyvként elmenthető.
 *
 * Szövegekben használható helyőrzők (csak alanyesetben, hogy minden nyelven helyes maradjon):
 *   {H} a hős teljes neve   {h} a hős rövid neve   {F} a társ neve
 *   {intro} {trick} {help}  a hős / társ saját mondatai
 *
 * Csomópont-típusok:
 *   { e, text, next }                       – szöveg + Tovább gomb
 *   { e, text, choose: 'hero'|'quest'|'friend'|[...] } – választás
 *   { e, text, task: { games:[...], timed }, right, wrong } – feladat; az eredmény elágaztat
 *   { e, text, end: true }                  – befejezés
 * A '@' kezdetű cél a választott kaland előtagját kapja: '@path' → 'star_path'.
 */
(function () {
  'use strict';

  const HEROES = {
    fox: {
      e: '🦊', img: 'img/story/hero-fox.webp', label: { hu: 'Ravasz kis róka', ro: 'Vulpița isteață', en: 'Clever fox' },
      H: { hu: 'Rozi, a ravasz kis róka', ro: 'Roxi, vulpița isteață', en: 'Roxy the clever fox' },
      h: { hu: 'Rozi', ro: 'Roxi', en: 'Roxy' },
      intro: { hu: 'Rozi a nagy erdő szélén lakott, és mindennél jobban szerette a fejtörőket.',
        ro: 'Roxi locuia la marginea pădurii mari și iubea ghicitorile mai mult decât orice.',
        en: 'Roxy lived at the edge of the big forest and loved puzzles more than anything.' },
      trick: { hu: 'Rozi gyorsan kitalált egy okos tervet.', ro: 'Roxi a născocit repede un plan isteț.', en: 'Roxy quickly came up with a clever plan.' },
      ending: { hu: 'Rozi aznap megtanulta, hogy egy okos ötlet többet ér minden kincsnél.',
        ro: 'În ziua aceea, Roxi a învățat că o idee bună valorează mai mult decât orice comoară.',
        en: 'That day Roxy learned that a good idea is worth more than any treasure.' }
    },
    unicorn: {
      e: '🦄', img: 'img/story/hero-unicorn.webp', label: { hu: 'Varázslatos egyszarvú', ro: 'Unicorn fermecat', en: 'Magic unicorn' },
      H: { hu: 'Csillámka, a varázslatos egyszarvú', ro: 'Sclipici, unicornul fermecat', en: 'Sparkle the magic unicorn' },
      h: { hu: 'Csillámka', ro: 'Sclipici', en: 'Sparkle' },
      intro: { hu: 'Csillámka a szivárvány alatt legelészett, és a szarva minden reggel ezüstösen csillogott.',
        ro: 'Sclipici păștea sub curcubeu, iar cornul lui strălucea argintiu în fiecare dimineață.',
        en: 'Sparkle grazed beneath the rainbow, and every morning its horn shimmered like silver.' },
      trick: { hu: 'Csillámka megérintette a varázsszarvával, és minden ragyogni kezdett.',
        ro: 'Sclipici a atins totul cu cornul fermecat și totul a început să strălucească.',
        en: 'Sparkle touched it with the magic horn, and everything began to glow.' },
      ending: { hu: 'Csillámka szarva aznap este fényesebben ragyogott, mint valaha.',
        ro: 'În seara aceea, cornul lui Sclipici a strălucit mai tare ca oricând.',
        en: "That evening Sparkle's horn shone brighter than ever." }
    },
    dragon: {
      e: '🐉', img: 'img/story/hero-dragon.webp', label: { hu: 'Barátságos sárkány', ro: 'Dragon prietenos', en: 'Friendly dragon' },
      H: { hu: 'Lángi, a barátságos kis sárkány', ro: 'Flăcărel, dragonul prietenos', en: 'Ember the friendly dragon' },
      h: { hu: 'Lángi', ro: 'Flăcărel', en: 'Ember' },
      intro: { hu: 'Lángi egy hegytetőn lakott, és tüzet csak akkor fújt, ha pogácsát kellett sütni.',
        ro: 'Flăcărel locuia pe vârful unui munte și scuipa foc doar când trebuia să coacă biscuiți.',
        en: 'Ember lived on a mountaintop and only ever breathed fire to bake biscuits.' },
      trick: { hu: 'Lángi kitárta a szárnyait, és villámgyorsan odarepült.',
        ro: 'Flăcărel și-a desfăcut aripile și a zburat acolo ca fulgerul.',
        en: 'Ember spread both wings and flew there as fast as lightning.' },
      ending: { hu: 'Lángi aznap este büszkén repült egy kört a falu felett, és mindenki integetett neki.',
        ro: 'În seara aceea, Flăcărel a zburat mândru deasupra satului și toată lumea i-a făcut cu mâna.',
        en: 'That evening Ember flew proudly over the village, and everyone waved.' }
    },
    princess: {
      e: '👸', img: 'img/story/hero-princess.webp', label: { hu: 'Bátor hercegnő', ro: 'Prințesa curajoasă', en: 'Brave princess' },
      H: { hu: 'Panna hercegnő', ro: 'Prințesa Ana', en: 'Princess Penny' },
      h: { hu: 'Panna hercegnő', ro: 'Prințesa Ana', en: 'Princess Penny' },
      intro: { hu: 'Panna hercegnő nem szeretett egész nap a palotában ülni: inkább felfedezni járt.',
        ro: 'Prințesei Ana nu-i plăcea să stea toată ziua în palat: prefera să exploreze.',
        en: "Princess Penny didn't like sitting in the palace all day – she preferred exploring." },
      trick: { hu: 'Panna hercegnő bátran előrelépett, és kedves szavakkal szólt.',
        ro: 'Prințesa Ana a pășit curajoasă înainte și a vorbit cu blândețe.',
        en: 'Princess Penny stepped forward bravely and spoke kindly.' },
      ending: { hu: 'Panna hercegnő aznap megtanulta, hogy a bátorság és a kedvesség együtt a legerősebb varázslat.',
        ro: 'În ziua aceea, Prințesa Ana a învățat că, împreună, curajul și bunătatea sunt cea mai puternică vrajă.',
        en: 'That day Princess Penny learned that courage and kindness together are the strongest magic.' }
    },
    /* ---- Állatok ---- */
    dolphin: {
      e: '🐬', label: { hu: 'Vidám delfin', ro: 'Delfin vesel', en: 'Happy dolphin' },
      H: { hu: 'Bubi, a vidám kis delfin', ro: 'Delfi, delfinul vesel', en: 'Splash the happy dolphin' },
      h: { hu: 'Bubi', ro: 'Delfi', en: 'Splash' },
      intro: { hu: 'Bubi a tengerben lakott, de olyan nagyokat ugrott, hogy néha a szárazföldre is átlátogatott.',
        ro: 'Delfi locuia în mare, dar sărea atât de sus încât uneori ajungea și pe uscat.',
        en: 'Splash lived in the sea but could jump so high that sometimes it visited dry land too.' },
      trick: { hu: 'Bubi nagyot ugrott, és vidám csobbanással mindenkit felvidított.',
        ro: 'Delfi a făcut un salt uriaș și i-a înveselit pe toți cu o stropeală.',
        en: 'Splash made a giant leap and cheered everyone up with a happy splash.' },
      ending: { hu: 'Aznap este Bubi szivárványos vízpermetet fújt az égre, és mindenki tapsolt.',
        ro: 'În seara aceea, Delfi a suflat spre cer un jet de apă în culorile curcubeului și toți au aplaudat.',
        en: 'That evening Splash blew a rainbow spray into the sky, and everyone clapped.' }
    },
    panda: {
      e: '🐼', label: { hu: 'Kedves panda', ro: 'Ursuleț panda', en: 'Gentle panda' },
      H: { hu: 'Pamacs, a kedves pandamaci', ro: 'Pufi, ursulețul panda', en: 'Bamboo the gentle panda' },
      h: { hu: 'Pamacs', ro: 'Pufi', en: 'Bamboo' },
      intro: { hu: 'Pamacs a bambuszerdőben lakott, és mindenkinek szívesen adott egy nagy, puha ölelést.',
        ro: 'Pufi locuia în pădurea de bambus și dăruia tuturor îmbrățișări mari și pufoase.',
        en: 'Bamboo lived in the bamboo forest and loved giving everyone big, soft hugs.' },
      trick: { hu: 'Pamacs nyugodtan végiggondolta a dolgot, és puha mancsával megmutatta a megoldást.',
        ro: 'Pufi s-a gândit liniștit și a arătat soluția cu lăbuța lui pufoasă.',
        en: 'Bamboo thought it over calmly and pointed to the answer with a soft paw.' },
      ending: { hu: 'Pamacs aznap megtanulta, hogy a nyugalom és a türelem is szuperképesség.',
        ro: 'În ziua aceea, Pufi a învățat că răbdarea și liniștea sunt și ele superputeri.',
        en: 'That day Bamboo learned that patience and calm are superpowers too.' }
    },
    dachshund: {
      e: '🐕', label: { hu: 'Hosszú tacskó', ro: 'Cățel teckel', en: 'Little dachshund' },
      H: { hu: 'Kolbi, a hosszú kis tacskó', ro: 'Lungilă, cățelușul teckel', en: 'Noodle the little dachshund' },
      h: { hu: 'Kolbi', ro: 'Lungilă', en: 'Noodle' },
      intro: { hu: 'Kolbi olyan hosszú volt, hogy a farka még a szobában csóválódott, amikor az orra már a kertben szimatolt.',
        ro: 'Lungilă era atât de lung încât coada încă dădea din ea în casă când nasul lui adulmeca deja prin grădină.',
        en: 'Noodle was so long that its tail was still wagging indoors while its nose was already sniffing in the garden.' },
      trick: { hu: 'Kolbi beleszimatolt a levegőbe, és csalhatatlan orrával megtalálta a nyomot.',
        ro: 'Lungilă a adulmecat aerul și cu nasul lui fără greș a găsit urma.',
        en: 'Noodle sniffed the air and found the trail with an unbeatable nose.' },
      ending: { hu: 'Aznap este Kolbi boldogan csóválta a farkát, és mindenki megsimogatta a hosszú hátát.',
        ro: 'În seara aceea, Lungilă a dat fericit din coadă și toți l-au mângâiat pe spinarea lui lungă.',
        en: 'That evening Noodle wagged happily, and everyone patted its long, long back.' }
    },
    cat: {
      e: '🐈', label: { hu: 'Kíváncsi cica', ro: 'Pisicuță curioasă', en: 'Curious kitten' },
      H: { hu: 'Cirmi, a kíváncsi cica', ro: 'Miți, pisicuța curioasă', en: 'Whiskers the curious kitten' },
      h: { hu: 'Cirmi', ro: 'Miți', en: 'Whiskers' },
      intro: { hu: 'Cirmi mindenhová bekukucskált, és a legkisebb neszt is meghallotta.',
        ro: 'Miți se uita peste tot și auzea și cel mai mic foșnet.',
        en: 'Whiskers peeked into everything and could hear the tiniest rustle.' },
      trick: { hu: 'Cirmi hangtalanul odaosont, és egy ügyes ugrással célba ért.',
        ro: 'Miți s-a strecurat fără zgomot și a ajuns la țintă dintr-un salt îndemânatic.',
        en: 'Whiskers crept over silently and landed right on target with a clever jump.' },
      ending: { hu: 'Aznap este Cirmi elégedetten dorombolt, és összegömbölyödve elaludt a párnán.',
        ro: 'În seara aceea, Miți a tors mulțumită și a adormit ghemuită pe pernă.',
        en: 'That evening Whiskers purred happily and curled up to sleep on a cushion.' }
    },

    /* ---- Családtagok ---- */
    mom: {
      e: '👩', label: { hu: 'Anya', ro: 'Mama', en: 'Mum' },
      H: { hu: 'egy kedves anyuka, akit mindenki csak Anyának hívott', ro: 'o mămică iubitoare pe care toți o strigau Mama', en: 'a kind mum whom everyone simply called Mum' },
      h: { hu: 'Anya', ro: 'Mama', en: 'Mum' },
      intro: { hu: 'Anya mindig tudta, hogyan lehet egy rossz napból is jó napot varázsolni.',
        ro: 'Mama știa mereu cum să transforme o zi rea într-una bună.',
        en: 'Mum always knew how to turn a bad day into a good one.' },
      trick: { hu: 'Anya mindenkit megölelt, és nyugodt hangon azt mondta: „Együtt menni fog!”',
        ro: 'Mama i-a îmbrățișat pe toți și a spus liniștit: „Împreună o să reușim!”',
        en: 'Mum gave everyone a hug and said calmly: “Together we can do it!”' },
      ending: { hu: 'Aznap este Anya mesét olvasott, és mindenki tudta: vele minden kaland biztonságos.',
        ro: 'În seara aceea, Mama a citit o poveste și toți au știut că lângă ea orice aventură e în siguranță.',
        en: 'That evening Mum read a bedtime story, and everyone knew every adventure is safe with her.' }
    },
    dad: {
      e: '👨', label: { hu: 'Apa', ro: 'Tata', en: 'Dad' },
      H: { hu: 'egy vidám apuka, akit mindenki csak Apának hívott', ro: 'un tătic vesel pe care toți îl strigau Tata', en: 'a cheerful dad whom everyone simply called Dad' },
      h: { hu: 'Apa', ro: 'Tata', en: 'Dad' },
      intro: { hu: 'Apa mindent meg tudott javítani, és ő ismerte a legviccesebb vicceket.',
        ro: 'Tata putea repara orice și știa cele mai amuzante glume.',
        en: 'Dad could fix anything and knew the funniest jokes.' },
      trick: { hu: 'Apa feltűrte az ingujját, és egy mókás ötlettel mindenkit megnevettetett.',
        ro: 'Tata și-a suflecat mânecile și i-a făcut pe toți să râdă cu o idee năstrușnică.',
        en: 'Dad rolled up his sleeves and made everyone laugh with a funny idea.' },
      ending: { hu: 'Aznap este Apa jót nevetett, és megígérte, hogy holnap újabb kalandra indulnak.',
        ro: 'În seara aceea, Tata a râs cu poftă și a promis că mâine vor porni într-o nouă aventură.',
        en: 'That evening Dad laughed heartily and promised a new adventure tomorrow.' }
    },
    grandma: {
      e: '👵', label: { hu: 'Nagyi', ro: 'Bunica', en: 'Grandma' },
      H: { hu: 'egy mosolygós nagymama, akit mindenki csak Nagyinak hívott', ro: 'o bunică zâmbitoare pe care toți o strigau Bunica', en: 'a smiling grandma whom everyone simply called Grandma' },
      h: { hu: 'Nagyi', ro: 'Bunica', en: 'Grandma' },
      intro: { hu: 'Nagyi kertjében nőttek a legszebb virágok, a konyhájából pedig mindig sütiillat áradt.',
        ro: 'Bunica avea cele mai frumoase flori din sat, iar din bucătăria ei mirosea mereu a prăjituri.',
        en: 'Grandma grew the prettiest flowers, and her kitchen always smelled of fresh cookies.' },
      trick: { hu: 'Nagyi elővett a kosarából egy varázslatos sütit, és mindenki új erőre kapott.',
        ro: 'Bunica a scos din coș o prăjitură fermecată și toți au prins puteri noi.',
        en: 'Grandma took a magic cookie from her basket, and everyone felt strong again.' },
      ending: { hu: 'Aznap este Nagyi forró kakaót főzött, és mindenki hozzábújva hallgatta a mese végét.',
        ro: 'În seara aceea, Bunica a făcut cacao caldă și toți s-au cuibărit lângă ea să asculte sfârșitul poveștii.',
        en: 'That evening Grandma made hot cocoa, and everyone snuggled up to hear the end of the story.' }
    },
    grandpa: {
      e: '👴', label: { hu: 'Papa', ro: 'Bunicul', en: 'Grandpa' },
      H: { hu: 'egy bölcs nagypapa, akit mindenki csak Papának hívott', ro: 'un bunic înțelept pe care toți îl strigau Bunicul', en: 'a wise grandpa whom everyone simply called Grandpa' },
      h: { hu: 'Papa', ro: 'Bunicul', en: 'Grandpa' },
      intro: { hu: 'Papa fiatalon sokat utazott, és mindenre tudott egy jó történetet.',
        ro: 'Bunicul călătorise mult în tinerețe și avea o poveste bună pentru orice.',
        en: 'Grandpa had travelled a lot when he was young and had a good story for everything.' },
      trick: { hu: 'Papa elővette a régi iránytűjét, és megmutatta a helyes irányt.',
        ro: 'Bunicul și-a scos busola veche și a arătat direcția cea bună.',
        en: 'Grandpa took out his old compass and pointed the right way.' },
      ending: { hu: 'Aznap este Papa a kandalló mellett mesélt, és megsúgta: ez volt az egyik legszebb kalandja.',
        ro: 'În seara aceea, Bunicul a povestit lângă șemineu și a șoptit că aceasta a fost una dintre cele mai frumoase aventuri ale lui.',
        en: 'That evening by the fireplace, Grandpa whispered that this had been one of his best adventures ever.' }
    },

    sister: {
      e: '👧', label: { hu: 'Lánytesó', ro: 'Surioara', en: 'Sister' },
      H: { hu: 'egy vidám kislány, akit mindenki csak Tesónak hívott', ro: 'o fetiță veselă pe care toți o strigau Surioara', en: 'a cheerful girl whom everyone simply called Sis' },
      h: { hu: 'Tesó', ro: 'Surioara', en: 'Sis' },
      intro: { hu: 'Tesó imádott rajzolni, és mindig volt nála egy doboz színes ceruza.',
        ro: 'Surioara adora să deseneze și avea mereu la ea o cutie cu creioane colorate.',
        en: 'Sis loved drawing and always carried a box of coloured pencils.' },
      trick: { hu: 'Tesó gyorsan lerajzolta a tervet, és mindenki megértette, mit kell tenni.',
        ro: 'Surioara a desenat repede planul și toți au înțeles ce trebuie făcut.',
        en: 'Sis quickly drew a plan, and everyone understood what to do.' },
      ending: { hu: 'Aznap este Tesó lerajzolta az egész kalandot, és a rajz a hűtőre került.',
        ro: 'În seara aceea, Surioara a desenat toată aventura, iar desenul a ajuns pe frigider.',
        en: 'That evening Sis drew the whole adventure, and the picture went up on the fridge.' }
    },
    brother: {
      e: '👦', label: { hu: 'Fiútesó', ro: 'Frățiorul', en: 'Brother' },
      H: { hu: 'egy bátor kisfiú, akit mindenki csak Tesónak hívott', ro: 'un băiețel curajos pe care toți îl strigau Frățiorul', en: 'a brave boy whom everyone simply called Bro' },
      h: { hu: 'Tesó', ro: 'Frățiorul', en: 'Bro' },
      intro: { hu: 'Tesó volt a leggyorsabb futó az utcában, és sosem hagyta cserben a barátait.',
        ro: 'Frățiorul era cel mai rapid alergător de pe stradă și nu-și lăsa niciodată prietenii la greu.',
        en: 'Bro was the fastest runner on the street and never let his friends down.' },
      trick: { hu: 'Tesó nekifutott, és egy hatalmas ugrással átlendült az akadályon.',
        ro: 'Frățiorul și-a luat avânt și a sărit peste obstacol dintr-un salt uriaș.',
        en: 'Bro took a run-up and leapt over the obstacle in one giant jump.' },
      ending: { hu: 'Aznap este Tesó büszkén mesélte el mindenkinek, hogy együtt mindenre képesek.',
        ro: 'În seara aceea, Frățiorul a povestit mândru tuturor că împreună pot face orice.',
        en: 'That evening Bro proudly told everyone that together they can do anything.' }
    },

    // Második testvérek: a nevüket a gyerek / szülő adja meg (első kiválasztáskor rákérdezünk)
    sister2: {
      e: '👧', img: 'img/story/hero-sister2.webp', label: { hu: 'Lánytesó (2.)', ro: 'Surioara (2)', en: 'Sister (2)' },
      H: { hu: 'egy kedves kislány, akit mindenki csak Testvérkének hívott', ro: 'o fetiță drăguță pe care toți o strigau Surioara mică', en: 'a sweet girl whom everyone simply called Little Sis' },
      h: { hu: 'Testvérke', ro: 'Surioara mică', en: 'Little Sis' },
      intro: { hu: '{h} volt a család legjobb mesemondója, és mindig tudott egy vicces történetet.',
        ro: '{h} era cea mai bună povestitoare din familie și știa mereu o poveste amuzantă.',
        en: '{h} was the best storyteller in the family and always knew a funny tale.' },
      trick: { hu: '{h} vidám dalra fakadt, és mindenkinek visszatért a bátorsága.',
        ro: '{h} a început să cânte vesel și tuturor le-a revenit curajul.',
        en: '{h} burst into a happy song, and everyone felt brave again.' },
      ending: { hu: 'Aznap este {h} új mesét talált ki a kalandról, és mindenki tapsolt.',
        ro: 'În seara aceea, {h} a inventat o poveste nouă despre aventură și toți au aplaudat.',
        en: 'That evening {h} made up a brand-new story about the adventure, and everyone clapped.' }
    },
    brother2: {
      e: '👦', img: 'img/story/hero-brother2.webp', label: { hu: 'Fiútesó (2.)', ro: 'Frățiorul (2)', en: 'Brother (2)' },
      H: { hu: 'egy ügyes kisfiú, akit mindenki csak Öcsinek hívott', ro: 'un băiețel îndemânatic pe care toți îl strigau Frățiorul mic', en: 'a handy boy whom everyone simply called Little Bro' },
      h: { hu: 'Öcsi', ro: 'Frățiorul mic', en: 'Little Bro' },
      intro: { hu: '{h} imádott építeni, és bármiből tudott valami csodát összerakni.',
        ro: '{h} adora să construiască și putea face o minunăție din orice.',
        en: '{h} loved building and could make something amazing out of anything.' },
      trick: { hu: '{h} villámgyorsan összeszerelt egy ügyes kis szerkezetet, ami kisegítette őket.',
        ro: '{h} a construit repede un dispozitiv isteț care i-a ajutat.',
        en: '{h} quickly built a clever little gadget that helped them out.' },
      ending: { hu: 'Aznap este {h} megépítette az egész kaland makettjét, és büszkén megmutatta mindenkinek.',
        ro: 'În seara aceea, {h} a construit macheta întregii aventuri și le-a arătat-o mândru tuturor.',
        en: 'That evening {h} built a model of the whole adventure and proudly showed it to everyone.' }
    },

    // A gyerek maga lesz a hős (a nevét és a figuráját a profilból vesszük)
    me: {
      e: null, label: { hu: 'Én magam!', ro: 'Chiar eu!', en: 'Me!' },
      H: null, h: null,
      intro: { hu: '{h} egy kis házban lakott, és nagyon szerette a kalandokat.',
        ro: '{h} locuia într-o căsuță și iubea tare mult aventurile.',
        en: '{h} lived in a little house and loved adventures.' },
      trick: { hu: '{h} mély levegőt vett, és bátran előrelépett.',
        ro: '{h} a tras aer în piept și a pășit înainte cu curaj.',
        en: '{h} took a deep breath and stepped forward bravely.' },
      ending: { hu: '{h} aznap este mosolyogva aludt el, és arról álmodott, milyen kaland vár még rá.',
        ro: 'În seara aceea, {h} a adormit zâmbind și a visat la noi aventuri.',
        en: 'That night {h} fell asleep smiling, dreaming of the next adventure.' }
    }
  };

  const FRIENDS = {
    owl: { e: '🦉', img: 'img/story/friend-owl.webp', F: { hu: 'Bölcs Bagoly', ro: 'Bufnița cea înțeleaptă', en: 'Wise Owl' },
      help: { hu: 'Bölcs Bagoly fentről mindent látott, és mindig tudta, merre kell menni.',
        ro: 'Bufnița cea înțeleaptă vedea totul de sus și știa mereu încotro s-o apuce.',
        en: 'Wise Owl could see everything from above and always knew the way.' } },
    bunny: { e: '🐰', img: 'img/story/friend-bunny.webp', F: { hu: 'Ugri nyuszi', ro: 'Iepurașul Țopăilă', en: 'Hoppy the bunny' },
      help: { hu: 'Ugri nyuszi villámgyorsan előreszaladt, és kikémlelte az utat.',
        ro: 'Iepurașul Țopăilă alerga repede înainte și cerceta drumul.',
        en: 'Hoppy the bunny raced ahead to check the path.' } },
    turtle: { e: '🐢', img: 'img/story/friend-turtle.webp', F: { hu: 'Teki teknős', ro: 'Țestoasa Tica', en: 'Shelly the turtle' },
      help: { hu: 'Teki teknős lassan, de biztosan haladt, és sosem tévedt el.',
        ro: 'Țestoasa Tica mergea încet, dar sigur, și nu se rătăcea niciodată.',
        en: 'Shelly the turtle went slowly but surely and never got lost.' } }
  };

  const QUESTS = {
    star: { e: '⭐', label: { hu: 'Leesett egy csillag az égről', ro: 'O stea a căzut din cer', en: 'A star fell from the sky' },
      title: { hu: '{h} és az elveszett csillag', ro: '{h} și steaua pierdută', en: '{h} and the Lost Star' } },
    sea: { e: '🐚', label: { hu: 'A tenger királynője segítséget kért', ro: 'Regina mării a cerut ajutor', en: 'The Queen of the Sea asked for help' },
      title: { hu: '{h} és a varázsgyöngy', ro: '{h} și perla fermecată', en: '{h} and the Magic Pearl' } },
    cake: { e: '🎂', label: { hu: 'Eltűnt a születésnapi torta', ro: 'Tortul aniversar a dispărut', en: 'The birthday cake went missing' },
      title: { hu: '{h} és az eltűnt torta', ro: '{h} și tortul dispărut', en: '{h} and the Missing Cake' } }
  };

  // Feladatfajták a kapukhoz (csak választós játékok)
  const MATH = ['osszeadas', 'szamlalo', 'sorozat', 'hasonlitas'];
  const WORD = ['ellentetek', 'rimek', 'szotag'];
  const MIX = ['osszeadas', 'szamlalo', 'ellentetek', 'rimek'];

  const WHICH_WAY = { hu: 'Merre menjenek tovább?', ro: 'Încotro să meargă?', en: 'Which way should they go?' };

  const N = {
    start: { e: '📖✨', img: 'img/ui/g-mesekeszito.webp', text: { hu: 'Készítsünk együtt mesét! Te döntöd el, mi történjen benne.',
      ro: 'Hai să facem împreună o poveste! Tu hotărăști ce se întâmplă.', en: "Let's make a story together! You decide what happens." },
      q: { hu: 'Ki legyen a mesénk hőse?', ro: 'Cine să fie eroul poveștii?', en: 'Who should be the hero of our story?' },
      choose: 'hero' },
    intro: { e: '🏡', text: { hu: 'Egyszer volt, hol nem volt, élt egyszer {H}. {intro}',
      ro: 'A fost odată ca niciodată {H}. {intro}', en: 'Once upon a time, there was {H}. {intro}' }, next: 'quest' },
    quest: { e: '🌅', img: 'img/ui/owl-think.webp', text: { hu: 'Egy reggel {h} valami különös dologra lett figyelmes…',
      ro: 'Într-o dimineață, {h} a observat ceva ciudat…', en: 'One morning, {h} noticed something strange…' },
      q: { hu: 'Mi történt?', ro: 'Ce s-a întâmplat?', en: 'What happened?' }, choose: 'quest' },
    friend: { e: '🎒', text: { hu: '{h} bátran továbbindult. Egy jó barát azonban mindig jól jön!',
      ro: '{h} a pornit mai departe cu curaj. Dar un prieten bun prinde mereu bine!',
      en: '{h} carried on bravely. But a good friend always helps!' },
      q: { hu: 'Ki tartson vele?', ro: 'Cine să vină în aventură?', en: 'Who should come along?' }, choose: 'friend' },
    friend2: { e: '🤝', text: { hu: 'Így hát {F} is csatlakozott. {help}', ro: 'Așa că i s-a alăturat și {F}. {help}', en: 'So {F} came along too. {help}' },
      next: '@path' },

    /* ---------------- Az elveszett csillag ---------------- */
    star_intro: { e: '⭐🌲', text: {
      hu: 'Az égről lepottyant egy kicsi csillag, és most az erdő mélyén sírdogál. Ha estig nem jut vissza, sötét marad az éjszaka. {h} azonnal útnak indult.',
      ro: 'O steluță a căzut din cer și acum plânge în adâncul pădurii. Dacă nu se întoarce până diseară, noaptea va rămâne întunecată. {h} a pornit imediat la drum.',
      en: "A little star fell from the sky and is now crying deep in the forest. If it doesn't get back by evening, the night will stay dark. {h} set off at once." },
      next: 'star_gate1' },
    star_gate1: { e: '🐿️', text: {
      hu: 'Az erdő kapujánál egy öreg mókus állt. „Csak az mehet tovább, aki megoldja a feladványomat!”',
      ro: 'La poarta pădurii stătea o veveriță bătrână. „Trece doar cine îmi rezolvă ghicitoarea!”',
      en: 'An old squirrel stood at the forest gate. “Only those who solve my puzzle may pass!”' },
      task: { games: MATH }, right: 'star_g1r', wrong: 'star_g1w' },
    star_g1r: { e: '🌰', text: {
      hu: '„Ügyes vagy!” – kiáltotta a mókus, és kitárta a kaput. Útravalóul még egy marék mogyorót is adott.',
      ro: '„Bravo!” a strigat veverița și a deschis poarta. A dat și o mână de alune pentru drum.',
      en: '“Well done!” cried the squirrel, opening the gate – and handed over a pawful of hazelnuts for the journey.' }, next: 'friend' },
    star_g1w: { e: '🤫', text: {
      hu: 'A mókus kedvesen mosolygott: „Majdnem! De aki ilyen bátran próbálkozik, azt átengedem.” És megmutatott egy titkos ösvényt.',
      ro: 'Veverița a zâmbit: „Aproape! Dar cine încearcă cu atâta curaj poate trece.” Și a arătat o potecă secretă.',
      en: 'The squirrel smiled kindly: “Almost! But anyone who tries so bravely may pass.” And it showed them a secret path.' }, next: 'friend' },
    star_path: { e: '🌲', text: { hu: 'Az erdő közepén két út vált el egymástól.', ro: 'În mijlocul pădurii, drumul se despărțea în două.',
      en: 'In the middle of the forest, the path split in two.' }, q: WHICH_WAY,
      choose: [
        { e: '🌉', label: { hu: 'Át a hídon, a patak felett', ro: 'Peste podul de deasupra pârâului', en: 'Over the bridge across the stream' }, go: 'star_bridge' },
        { e: '🕯️', label: { hu: 'A szentjánosbogarak barlangján át', ro: 'Prin peștera licuricilor', en: 'Through the glow-worm cave' }, go: 'star_cave' }
      ] },
    star_bridge: { e: '🌉', text: {
      hu: 'A régi fahíd recsegett-ropogott. A közepén egy tábla állt: „Aki át akar kelni, előbb számoljon!”',
      ro: 'Podul vechi de lemn scârțâia. La mijloc era un semn: „Cine vrea să treacă, mai întâi să socotească!”',
      en: 'The old wooden bridge creaked and groaned. In the middle was a sign: “Whoever wants to cross must count first!”' },
      task: { games: ['osszeadas', 'szamlalo'] }, right: 'star_br_r', wrong: 'star_br_w' },
    star_br_r: { e: '✨', text: {
      hu: 'A híd deszkái erre szépen összezárultak, és mindenki száraz lábbal átért a túlpartra.',
      ro: 'Scândurile podului s-au prins bine laolaltă și toți au ajuns pe malul celălalt cu picioarele uscate.',
      en: 'The bridge planks snapped neatly together, and everyone crossed to the other side with dry feet.' }, next: 'star_final' },
    star_br_w: { e: '💦', text: {
      hu: 'Hoppá! Egy deszka megbillent, és {h} belecsobbant a patakba. Szerencsére sekély volt – csak a lába lett vizes, és jót nevettek rajta.',
      ro: 'Hopa! O scândură s-a clătinat și {h} a căzut în pârâu. Din fericire, apa era mică – s-au udat doar picioarele și au râs cu toții.',
      en: 'Oops! A plank wobbled and {h} splashed into the stream. Luckily it was shallow – only feet got wet, and everyone laughed.' }, next: 'star_final' },
    star_cave: { e: '🕯️', text: {
      hu: 'A barlangban ezernyi szentjánosbogár világított. „Segítünk, ha megfejted a rejtvényünket!” – zümmögték.',
      ro: 'În peșteră străluceau mii de licurici. „Te ajutăm dacă dezlegi ghicitoarea noastră!” au bâzâit ei.',
      en: 'Thousands of glow-worms lit up the cave. “We will help if you solve our riddle!” they hummed.' },
      task: { games: WORD }, right: 'star_cv_r', wrong: 'star_cv_w' },
    star_cv_r: { e: '✨', text: {
      hu: 'A szentjánosbogarak fényes ösvényt raktak ki, amely egyenesen a kijárathoz vezetett.',
      ro: 'Licuricii au făcut o cărare strălucitoare care ducea drept spre ieșire.',
      en: 'The glow-worms made a shining path that led straight to the exit.' }, next: 'star_final' },
    star_cv_w: { e: '🐞', text: {
      hu: 'A bogarak fénye egy pillanatra kialudt, de egy kicsi bogárka megsajnálta őket, és a saját lámpásával kivezette őket.',
      ro: 'Luminile s-au stins o clipă, dar un licurici mic i-a ajutat și i-a condus afară cu lămpița lui.',
      en: 'The lights flickered out for a moment, but one tiny glow-worm felt sorry for them and led them out with its own little lantern.' }, next: 'star_final' },
    star_final: { e: '⭐🌳⏳', text: {
      hu: 'És ott, egy hatalmas tölgyfa tövében ült a kis csillag! {trick} De vigyázat: lemenőben a nap! Oldd meg gyorsan a feladatot, mielőtt besötétedik!',
      ro: 'Și acolo, la rădăcina unui stejar uriaș, stătea steluța! {trick} Dar atenție: soarele apune! Rezolvă repede, până nu se întunecă!',
      en: 'And there, at the foot of a huge oak tree, sat the little star! {trick} But hurry – the sun is setting! Solve it quickly before it gets dark!' },
      task: { games: MIX, timed: true }, right: 'star_end_r', wrong: 'star_end_w' },
    star_end_r: { e: '🌟', end: true, text: {
      hu: 'Épp időben! A csillag felrepült az égre, és aznap éjjel ő ragyogott a legfényesebben. Azóta minden este rákacsint {h} ablakára.',
      ro: 'Exact la timp! Steluța a zburat înapoi pe cer și în noaptea aceea a strălucit cel mai tare. De atunci, în fiecare seară, face cu ochiul spre fereastra prietenilor ei.',
      en: "Just in time! The star flew back into the sky and shone the brightest that night. Ever since, it winks at {h}'s window every evening." } },
    star_end_w: { e: '🏔️', end: true, text: {
      hu: 'A nap lement, de a kis csillag nem csüggedt: {F} segítségével felmásztak a legmagasabb hegyre, és onnan visszaugrott az égre. Kicsit késve, de annál boldogabban ragyogott.',
      ro: 'Soarele a apus, dar steluța nu s-a descurajat: împreună cu {F} au urcat pe cel mai înalt munte, iar de acolo ea a sărit înapoi pe cer. Puțin cam târziu, dar a strălucit și mai fericită.',
      en: "The sun had set, but the little star didn't give up: with {F}'s help they climbed the highest mountain, and from there it jumped back into the sky. A little late, but it shone happier than ever." } },

    /* ---------------- A varázsgyöngy ---------------- */
    sea_intro: { e: '🐚🌊', text: {
      hu: 'A tenger királynője elveszítette a varázsgyöngyét. A gyöngy nélkül elhalványulnak a korallok színei. {h} beült egy kagylóhajóba, és elindult a tenger felé.',
      ro: 'Regina mării și-a pierdut perla fermecată. Fără ea, coralii își pierd culorile. {h} s-a urcat într-o bărcuță-scoică și a pornit spre mare.',
      en: 'The Queen of the Sea has lost her magic pearl. Without it, the corals lose their colours. {h} climbed into a seashell boat and set off to sea.' },
      next: 'sea_gate1' },
    sea_gate1: { e: '🦀', text: {
      hu: 'A parton egy rák őrizte az utat. „Csipp-csipp! Csak az mehet a vízhez, aki megoldja a feladványomat!”',
      ro: 'Pe plajă, un crab păzea drumul. „Cip-cip! Ajunge la apă doar cine îmi rezolvă ghicitoarea!”',
      en: 'On the beach, a crab guarded the way. “Snip-snip! Only those who solve my puzzle may reach the water!”' },
      task: { games: MATH }, right: 'sea_g1r', wrong: 'sea_g1w' },
    sea_g1r: { e: '🦀🎉', text: {
      hu: 'A rák elégedetten csattogtatta az ollóját, és félreállt az útból.',
      ro: 'Crabul a clănțănit mulțumit din clești și s-a dat la o parte.',
      en: 'The crab clicked its claws happily and stepped aside.' }, next: 'friend' },
    sea_g1w: { e: '🦀🤗', text: {
      hu: '„Nem baj!” – mondta a rák. – „Aki próbálkozik, az már félig nyert.” És félreállt az útból.',
      ro: '„Nu-i nimic!” a zis crabul. „Cine încearcă a câștigat deja pe jumătate.” Și s-a dat la o parte.',
      en: '“Never mind!” said the crab. “Trying is already half the win.” And it stepped aside.' }, next: 'friend' },
    sea_path: { e: '🌊', text: { hu: 'A víz alatt két út vezetett a királynő palotájához.', ro: 'Sub apă, două drumuri duceau spre palatul reginei.',
      en: "Under the water, two paths led to the Queen's palace." }, q: WHICH_WAY,
      choose: [
        { e: '🐠', label: { hu: 'A színes korallkerten át', ro: 'Prin grădina de corali', en: 'Through the colourful coral garden' }, go: 'sea_coral' },
        { e: '🐙', label: { hu: 'Az óriás polip barlangján át', ro: 'Prin peștera caracatiței uriașe', en: "Through the giant octopus's cave" }, go: 'sea_octo' }
      ] },
    sea_coral: { e: '🐠🪸', text: {
      hu: 'A korallkertben vidám halacskák úszkáltak. „Ha megoldod a feladatunkat, megmutatjuk, merre van a gyöngy!”',
      ro: 'În grădina de corali înotau peștișori veseli. „Dacă rezolvi sarcina noastră, îți arătăm unde e perla!”',
      en: 'Cheerful little fish swam in the coral garden. “Solve our task and we will show you where the pearl is!”' },
      task: { games: WORD }, right: 'sea_co_r', wrong: 'sea_co_w' },
    sea_co_r: { e: '🫧', text: {
      hu: 'A halacskák csillogó buborékösvényt fújtak, amely egyenesen a gyöngyhöz vezetett.',
      ro: 'Peștișorii au suflat o cărare de bule strălucitoare care ducea drept la perlă.',
      en: 'The fish blew a sparkling bubble trail that led straight to the pearl.' }, next: 'sea_final' },
    sea_co_w: { e: '🐴', text: {
      hu: 'A halacskák összevissza úszkáltak, de végül egy kis csikóhal megmutatta a helyes irányt.',
      ro: 'Peștișorii s-au învârtit de colo-colo, dar până la urmă un căluț de mare a arătat direcția bună.',
      en: 'The fish swam every which way, but in the end a little seahorse pointed the right way.' }, next: 'sea_final' },
    sea_octo: { e: '🐙', text: {
      hu: 'A barlangban egy óriás polip szundikált. Felébredt, és így szólt: „Ha megoldod a feladatomat, segítek!”',
      ro: 'În peșteră moțăia o caracatiță uriașă. S-a trezit și a spus: „Dacă îmi rezolvi sarcina, te ajut!”',
      en: 'A giant octopus was dozing in the cave. It woke up and said: “Solve my task and I will help you!”' },
      task: { games: ['hasonlitas', 'sorozat', 'ellentetek'] }, right: 'sea_oc_r', wrong: 'sea_oc_w' },
    sea_oc_r: { e: '🐙💙', text: {
      hu: 'A polip elmosolyodott, és mind a nyolc karjával az utat mutatta. Kiderült, hogy nagyon barátságos!',
      ro: 'Caracatița a zâmbit și a arătat drumul cu toate cele opt brațe. S-a dovedit că era foarte prietenoasă!',
      en: 'The octopus smiled and pointed the way with all eight arms. It turned out to be very friendly!' }, next: 'sea_final' },
    sea_oc_w: { e: '🐙➡️', text: {
      hu: 'A polip vakarta a fejét, aztán nevetve tintafelhőt fújt, ami nyilat rajzolt a vízbe – arra kellett menni.',
      ro: 'Caracatița s-a scărpinat în cap, apoi a suflat râzând un nor de cerneală care a desenat o săgeată în apă – pe acolo era drumul.',
      en: 'The octopus scratched its head, then laughed and puffed out an ink cloud shaped like an arrow – that was the way to go.' }, next: 'sea_final' },
    sea_final: { e: '🦪⏳', text: {
      hu: 'A gyöngyöt egy óriási kagyló őrizte, amely lassan csukódni kezdett! {trick} Gyorsan, oldd meg a feladatot, mielőtt bezárul!',
      ro: 'Perla era păzită de o scoică uriașă care începea să se închidă! {trick} Repede, rezolvă sarcina până nu se închide!',
      en: 'The pearl was guarded by a giant clam that was slowly closing! {trick} Quick, solve the task before it shuts!' },
      task: { games: MIX, timed: true }, right: 'sea_end_r', wrong: 'sea_end_w' },
    sea_end_r: { e: '🌈🐚', end: true, text: {
      hu: 'Sikerült! A gyöngy visszakerült a királynőhöz, és a korallok újra szivárványszínekben ragyogtak. A királynő hálából egy ezüstkagylót adott ajándékba.',
      ro: 'Reușită! Perla s-a întors la regină, iar coralii au strălucit din nou în culorile curcubeului. Drept mulțumire, regina a dăruit o scoică de argint.',
      en: 'Success! The pearl went back to the Queen, and the corals glowed in rainbow colours again. To say thank you, the Queen gave a silver shell as a gift.' } },
    sea_end_w: { e: '💬🦪', end: true, text: {
      hu: 'A kagyló bezárult, de {F} kedvesen megkopogtatta, és szépen megkérte. A kagyló kinyílt, és odaadta a gyöngyöt – mert a kedves szó csodákra képes!',
      ro: 'Scoica s-a închis, dar {F} a bătut încet în ea și a rugat-o frumos. Scoica s-a deschis și a dat perla – pentru că o vorbă bună face minuni!',
      en: 'The clam shut tight, but {F} knocked gently and asked nicely. The clam opened and gave up the pearl – because kind words work wonders!' } },

    /* ---------------- Az eltűnt torta ---------------- */
    cake_intro: { e: '🎂🧸', text: {
      hu: 'Ma van Mackó születésnapja, de a nagy csokitorta eltűnt a kamrából! Csak morzsák maradtak utána. {h} azonnal nyomozni kezdett.',
      ro: 'Azi e ziua Ursulețului, dar tortul mare de ciocolată a dispărut din cămară! Au rămas doar firimituri. {h} a început imediat investigația.',
      en: "Today is Teddy's birthday, but the big chocolate cake has vanished from the pantry! Only crumbs are left. {h} started investigating at once." },
      next: 'cake_gate1' },
    cake_gate1: { e: '🔒', text: {
      hu: 'A kamra ajtaja zárva volt. A zárra ez volt írva: „Oldd meg a feladatot, és kinyílok!”',
      ro: 'Ușa cămării era încuiată. Pe lacăt scria: „Rezolvă sarcina și mă deschid!”',
      en: 'The pantry door was locked. On the lock it said: “Solve the task and I will open!”' },
      task: { games: MATH }, right: 'cake_g1r', wrong: 'cake_g1w' },
    cake_g1r: { e: '🔓', text: {
      hu: 'Kattant a zár, és az ajtó kinyílt. Bent friss morzsák vezettek az ablakhoz.',
      ro: 'Lacătul a făcut clic și ușa s-a deschis. Înăuntru, firimituri proaspete duceau spre fereastră.',
      en: 'Click! The lock opened. Inside, fresh crumbs led to the window.' }, next: 'friend' },
    cake_g1w: { e: '🪟', text: {
      hu: 'A zár nem nyílt ki, de az ablak résnyire nyitva volt! {h} bekukucskált, és morzsákat látott a párkányon.',
      ro: 'Lacătul nu s-a deschis, dar fereastra era întredeschisă! {h} s-a uitat înăuntru și a văzut firimituri pe pervaz.',
      en: "The lock didn't open, but the window was ajar! {h} peeked in and spotted crumbs on the sill." }, next: 'friend' },
    cake_path: { e: '🍪', text: { hu: 'A morzsák két irányba vezettek.', ro: 'Firimiturile duceau în două direcții.',
      en: 'The crumbs led in two directions.' }, q: WHICH_WAY,
      choose: [
        { e: '🌻', label: { hu: 'A virágos kert felé', ro: 'Spre grădina cu flori', en: 'Towards the flower garden' }, go: 'cake_garden' },
        { e: '🏚️', label: { hu: 'A régi malom felé', ro: 'Spre moara veche', en: 'Towards the old mill' }, go: 'cake_mill' }
      ] },
    cake_garden: { e: '🐝🌻', text: {
      hu: 'A kertben méhecskék zümmögtek. „Láttuk a tolvajt! Elmondjuk, ki volt, ha megoldod a feladatunkat!”',
      ro: 'În grădină bâzâiau albinuțe. „L-am văzut pe hoț! Îți spunem cine a fost dacă rezolvi sarcina noastră!”',
      en: 'Bees were buzzing in the garden. “We saw the thief! We will tell you who it was if you solve our task!”' },
      task: { games: WORD }, right: 'cake_ga_r', wrong: 'cake_ga_w' },
    cake_ga_r: { e: '🐭', text: {
      hu: '„Egy kis egérke volt, csokis bajusszal!” – zümmögték a méhek, és megmutatták, merre szaladt.',
      ro: '„A fost un șoricel cu mustățile pline de ciocolată!” au bâzâit albinele și au arătat încotro a fugit.',
      en: '“It was a little mouse with chocolate on its whiskers!” buzzed the bees, and showed which way it ran.' }, next: 'cake_final' },
    cake_ga_w: { e: '🐞', text: {
      hu: 'A méhek összevissza zümmögtek, de egy katicabogár odasúgta: „A padlás felé szaladt valaki csokis bajusszal!”',
      ro: 'Albinele au bâzâit care-ncotro, dar o buburuză a șoptit: „Cineva cu mustăți de ciocolată a fugit spre pod!”',
      en: 'The bees all buzzed at once, but a ladybird whispered: “Someone with chocolate whiskers ran up to the attic!”' }, next: 'cake_final' },
    cake_mill: { e: '🏚️', text: {
      hu: 'A malomban egy öreg molnár őrölte a lisztet. „Segítek, ha megoldod a feladatomat!”',
      ro: 'La moară, un morar bătrân măcina făină. „Te ajut dacă îmi rezolvi sarcina!”',
      en: 'At the mill, an old miller was grinding flour. “I will help if you solve my task!”' },
      task: { games: ['hasonlitas', 'sorozat', 'ellentetek'] }, right: 'cake_mi_r', wrong: 'cake_mi_w' },
    cake_mi_r: { e: '👴', text: {
      hu: '„Egy egérke volt az!” – nevetett a molnár. – „Láttam, ahogy a padlásra cipelte a tortát.”',
      ro: '„A fost un șoricel!” a râs morarul. „L-am văzut cărând tortul în pod.”',
      en: '“It was a mouse!” laughed the miller. “I saw it dragging the cake up to the attic.”' }, next: 'cake_final' },
    cake_mi_w: { e: '👂', text: {
      hu: 'A molnár elgondolkodott, aztán a padlás felé mutatott, ahonnan halk rágcsálás hallatszott.',
      ro: 'Morarul s-a gândit puțin, apoi a arătat spre pod, de unde se auzea un ronțăit.',
      en: 'The miller thought for a moment, then pointed to the attic, where a quiet nibbling could be heard.' }, next: 'cake_final' },
    cake_final: { e: '🐭🎂⏳', text: {
      hu: 'A padláson ott ült egy kis egérke a tortával. „Bocsánat, csak meg akartam kóstolni!” – pityergett. {trick} De sietni kell, mert mindjárt kezdődik a zsúr! Oldd meg időre!',
      ro: 'În pod stătea un șoricel cu tortul. „Iertare, voiam doar să gust!” a scâncit el. {trick} Dar trebuie să se grăbească, petrecerea începe imediat! Rezolvă la timp!',
      en: 'In the attic sat a little mouse with the cake. “Sorry, I just wanted a taste!” it sniffled. {trick} But hurry – the party is about to start! Solve it in time!' },
      task: { games: MIX, timed: true }, right: 'cake_end_r', wrong: 'cake_end_w' },
    cake_end_r: { e: '🥳🎂', end: true, text: {
      hu: 'Épp időben értek vissza! A torta szinte egész volt, és Mackó az egérkét is meghívta a zsúrra. Együtt fújták el a gyertyákat, és ez lett a legvidámabb születésnap.',
      ro: 'Au ajuns exact la timp! Tortul era aproape întreg, iar Ursulețul l-a invitat și pe șoricel la petrecere. Au suflat împreună în lumânări și a fost cea mai veselă zi de naștere.',
      en: 'They got back just in time! The cake was almost whole, and Teddy invited the mouse to the party too. They blew out the candles together, and it was the happiest birthday ever.' } },
    cake_end_w: { e: '🍰🍰', end: true, text: {
      hu: 'Kicsit elkéstek, de nem baj: {F} és az egérke gyorsan sütött egy új tortát. Mackó annyira örült, hogy két tortája is lett!',
      ro: 'Au întârziat puțin, dar nu-i nimic: {F} și șoricelul au copt repede un tort nou. Ursulețul s-a bucurat atât de tare – acum avea două torturi!',
      en: 'They were a little late, but never mind: {F} and the mouse quickly baked a new cake. Teddy was so happy – now there were two cakes!' } }
  };

  // Hősportrék: img/story/hero-<kulcs>.webp (a „me” hősnél a gyerek saját figurája látszik)
  Object.entries(HEROES).forEach(([k, h]) => { if (!h.img && k !== 'me') h.img = `img/story/hero-${k}.webp`; });

  // Rajzolt jelenetképek: img/scenes/<csomópont>.webp
  ['quest', 'friend',
    'star_intro', 'star_gate1', 'star_g1r', 'star_g1w', 'star_path', 'star_bridge', 'star_br_r', 'star_br_w', 'star_cave',
    'star_cv_r', 'star_cv_w', 'star_final', 'star_end_r', 'star_end_w',
    'sea_intro', 'sea_gate1', 'sea_g1r', 'sea_g1w', 'sea_path', 'sea_coral', 'sea_co_r', 'sea_co_w', 'sea_octo',
    'sea_oc_r', 'sea_oc_w', 'sea_final', 'sea_end_r', 'sea_end_w',
    'cake_intro', 'cake_gate1', 'cake_g1r', 'cake_g1w', 'cake_path', 'cake_garden', 'cake_ga_r', 'cake_ga_w', 'cake_mill',
    'cake_mi_r', 'cake_mi_w', 'cake_final', 'cake_end_r', 'cake_end_w'
  ].forEach(id => { if (N[id]) N[id].img = `img/scenes/${id}.webp`; });

  /* Csapatmese: ha több szereplőt választ a gyerek, ezek a mondatok szövik bele őket a cselekménybe.
     {H} = a szereplő teljes neve, {X} = rövid neve, {names} = mindenki rövid neve felsorolva, {quest} = a kaland neve */
  const TEAM = {
    max: 5,
    joins: { hu: 'Vele tartott még {H}.', ro: 'Alături era și {H}.', en: 'And along came {H}.' },
    support: [
      { hu: '{X} odasúgta: „Menni fog, bízom benned!”', ro: '{X} a șoptit: „O să reușești, am încredere în tine!”', en: '{X} whispered: “You can do it – I believe in you!”' },
      { hu: '{X} is közelebb hajolt, hogy együtt gondolkodjanak.', ro: 'S-a apropiat și {X}, ca să se gândească împreună.', en: '{X} leaned in so they could think it through together.' },
      { hu: '{X} szurkolt a leghangosabban: „Hajrá, hajrá!”', ro: '{X} a încurajat cel mai tare: „Hai, hai, hai!”', en: '{X} cheered the loudest: “Go, go, go!”' }
    ],
    together: { hu: 'Most mindenki összefogott.', ro: 'Acum toți și-au unit puterile.', en: 'Now everyone worked together.' },
    promise: { hu: '{names} pedig megfogadták, hogy a következő kalandra is együtt indulnak.',
      ro: 'Iar {names} și-au promis că vor porni împreună și în următoarea aventură.',
      en: 'And {names} promised to go on their next adventure together.' },
    and: { hu: 'és', ro: 'și', en: 'and' },
    title: { hu: '{quest} – {names} kalandja', ro: '{quest} – o aventură cu {names}', en: '{quest} – an adventure with {names}' }
  };
  QUESTS.star.name = { hu: 'Az elveszett csillag', ro: 'Steaua pierdută', en: 'The Lost Star' };
  QUESTS.sea.name = { hu: 'A varázsgyöngy', ro: 'Perla fermecată', en: 'The Magic Pearl' };
  QUESTS.cake.name = { hu: 'Az eltűnt torta', ro: 'Tortul dispărut', en: 'The Missing Cake' };
  N.start.q = { hu: 'Kik legyenek a mesénk szereplői?', ro: 'Cine să fie personajele poveștii?', en: 'Who should be in our story?' };

  /* Családtagok saját neve (Szülői sarok → Beállítások). {n} = a beírt név */
  const FAMILY = {
    mom: { hu: '{n}, a kedves anyuka', ro: '{n}, mămica iubitoare', en: '{n}, the kind mum' },
    dad: { hu: '{n}, a vidám apuka', ro: '{n}, tăticul vesel', en: '{n}, the cheerful dad' },
    grandma: { hu: '{n}, a mosolygós nagymama', ro: '{n}, bunica zâmbitoare', en: '{n}, the smiling grandma' },
    grandpa: { hu: '{n}, a bölcs nagypapa', ro: '{n}, bunicul înțelept', en: '{n}, the wise grandpa' },
    sister: { hu: '{n}, a vidám lánytesó', ro: '{n}, surioara veselă', en: '{n}, the cheerful sister' },
    brother: { hu: '{n}, a bátor fiútesó', ro: '{n}, frățiorul curajos', en: '{n}, the brave brother' },
    sister2: { hu: '{n}, a mesemondó lánytesó', ro: '{n}, surioara povestitoare', en: '{n}, the storytelling sister' },
    brother2: { hu: '{n}, az ügyes fiútesó', ro: '{n}, frățiorul îndemânatic', en: '{n}, the handy brother' }
  };
  // Ezeknél a szereplőknél kiválasztáskor rákérdezünk a névre, ha még nincs megadva
  const ASK_NAME = ['sister', 'brother', 'sister2', 'brother2'];

  GJ.STORY = {
    family: FAMILY, askName: ASK_NAME,
    team: TEAM,
    heroes: HEROES, friends: FRIENDS, quests: QUESTS, nodes: N,
    closing: { hu: 'Itt a vége, fuss el véle!', ro: 'Și-am încălecat pe-o șa și v-am spus povestea așa.', en: 'The End.' }
  };

  GJ.register({
    id: 'mesekeszito', subject: 'irodalom', icon: '📖', kind: 'story',
    title: { hu: 'Mesekészítő', ro: 'Povestea mea', en: 'Story maker' },
    desc: { hu: 'Te döntöd el, mi történjen!', ro: 'Tu hotărăști ce se întâmplă!', en: 'You decide what happens!' }
  });
})();
