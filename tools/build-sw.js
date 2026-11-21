/* Okos Kaland – service worker (offline gyorsítótár) előállítása.
 * Futtatás a program mappájában, minden fájlmódosítás után:   node tools/build-sw.js
 * Végigjárja a program fájljait, és elkészíti a sw.js-t a fájllistával és egy új verziószámmal,
 * így a telepített alkalmazás a következő indításkor frissül.
 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const INCLUDE = ['index.html', 'manifest.webmanifest', 'favicon.ico', 'css', 'js', 'img'];
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
