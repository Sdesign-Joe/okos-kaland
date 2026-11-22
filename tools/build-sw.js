/* Okos Kaland – service worker (offline gyorsítótár) előállítása.
 * Futtatás a program mappájában, minden fájlmódosítás után:   node tools/build-sw.js
 * Végigjárja a program fájljait, és elkészíti a sw.js-t a fájllistával és egy új verziószámmal,
 * így a telepített alkalmazás a következő indításkor frissül.
 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
/* ---------- Nyelvi belépőoldalak: ro.html, en.html (+ saját manifest) az index.html-ből ----------
 * Saját megosztási előnézet (Facebook, Messenger…), alkalmazásnév és alapnyelv nyelvenként.
 * Az aldomainek (pl. aventuraisteata.bimpex.ro) ezekre mutathatnak – lásd .htaccess. */
const SITE = 'https://sdesign-joe.github.io/okos-kaland/';
const PAGES = {
  ro: { name: 'Aventura Isteață', locale: 'ro_RO',
    title: 'Aventura Isteață – învățare prin joacă pentru copii de 7–9 ani',
    desc: 'Matematică, limbă și povești într-un singur joc – în română, maghiară și engleză. Gratuit, fără reclame și fără cont.',
    mdesc: 'Învățare prin joacă pentru copii de 7–9 ani: matematică, limbă, povești și poezii – în română, maghiară și engleză.' },
  en: { name: 'Clever Quest', locale: 'en_GB',
    title: 'Clever Quest – playful learning for ages 7–9',
    desc: 'Maths, language and stories in one game – in English, Hungarian and Romanian. Free, no ads, no sign-up.',
    mdesc: 'Playful learning for ages 7–9: maths, language, stories and poems – in English, Hungarian and Romanian.' }
};
const escA = x => x.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const indexSrc = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const baseManifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const [l, P] of Object.entries(PAGES)) {
  const meta = `<!--LANG-META-->
  <title>${escA(P.name)}</title>
  <meta name="description" content="${escA(P.mdesc)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escA(P.name)}">
  <meta property="og:title" content="${escA(P.title)}">
  <meta property="og:description" content="${escA(P.desc)}">
  <meta property="og:image" content="${SITE}img/og-${l}.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${P.locale}">
  <meta name="twitter:card" content="summary_large_image">
  <!--/LANG-META-->`;
  let h = indexSrc.replace(/<!--LANG-META-->[\s\S]*?<!--\/LANG-META-->/, meta)
    .replace(/<html lang="hu"[^>]*>/, `<html lang="${l}" data-page-lang="${l}">`)
    .replace(/href="manifest\.webmanifest"><!--MANIFEST-->/, `href="manifest-${l}.webmanifest"><!--MANIFEST-->`)
    .replace(/content="Okos Kaland"><!--APPTITLE-->/, `content="${escA(P.name)}"><!--APPTITLE-->`)
    .replace(/href="img\/logo-hu\.webp"><!--PRELOAD-->/, `href="img/logo-${l}.webp"><!--PRELOAD-->`);
  fs.writeFileSync(path.join(root, `${l}.html`), h);
  const m = Object.assign({}, baseManifest, { name: P.name, short_name: P.name, description: P.mdesc, lang: l, start_url: `./${l}.html`, id: `./${l}.html` });
  fs.writeFileSync(path.join(root, `manifest-${l}.webmanifest`), JSON.stringify(m, null, 2) + '\n');
}

const INCLUDE = ['index.html', 'ro.html', 'en.html', 'manifest.webmanifest', 'manifest-ro.webmanifest', 'manifest-en.webmanifest', 'favicon.ico', 'css', 'js', 'img'];
const files = [];
function walk(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return;
  if (fs.statSync(abs).isDirectory()) fs.readdirSync(abs).forEach(f => walk(path.join(rel, f)));
  else files.push('./' + rel.split(path.sep).join('/'));
}
INCLUDE.forEach(walk);
const version = 'okos-kaland-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);

const sw = `/* Okos Kaland – service worker (automatikusan generálva: node tools/build-sw.js) */
const CACHE = '${version}';
const FILES = ${JSON.stringify(files, null, 0).replace(/","/g, '",\n  "')};

// Telepítéskor minden fájl letöltődik → a program internet nélkül is működik
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
// Új verziónál a régi gyorsítótár törlődik
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('okos-kaland-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Először a gyorsítótárból; ami nincs benne (pl. betűtípus), azt a hálózatról kéri és elmenti
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // idegen címek (pl. a névtelen számláló) mindig a hálózatra mennek – kivéve a betűtípust
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !u.hostname.endsWith('fonts.googleapis.com') && !u.hostname.endsWith('fonts.gstatic.com')) return;
  // a beépített felolvasó nagy fájljait (tts/) a program maga tárolja – itt nem másoljuk még egyszer
  if (u.pathname.includes('/tts/')) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
`;
fs.writeFileSync(path.join(root, 'sw.js'), sw);
const size = files.reduce((a, f) => a + fs.statSync(path.join(root, f)).size, 0);
console.log(`sw.js kész: ${files.length} fájl, ${(size / 1048576).toFixed(1)} MB, verzió: ${version}`);
