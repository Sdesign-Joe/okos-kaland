/* Okos Kaland – névtelen használati számláló (GoatCounter)
 * Csak akkor működik, ha:
 *   - a js/config.js-ben meg van adva a GoatCounter kód,
 *   - a program weboldalként fut (http/https), és van internet,
 *   - a szülő nem kapcsolta ki (Szülői sarok → Beállítások).
 * Semmilyen személyes adatot (név, életkor, eredmény) nem küld.
 */
(function () {
  'use strict';
  let ready = false, queue = [];
  const enabled = () => !!(GJ.CONFIG && GJ.CONFIG.goatcounter) && location.protocol.startsWith('http') &&
    GJ.store.settings().stats !== false;

  function load() {
    if (!enabled() || document.getElementById('gc-script')) return;
    window.goatcounter = { no_onload: true, allow_local: false };
    const s = document.createElement('script');
    s.id = 'gc-script'; s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = `https://${GJ.CONFIG.goatcounter}.goatcounter.com/count`;
    s.onload = () => { ready = true; queue.splice(0).forEach(send); };
    document.head.appendChild(s);
  }
  function send(ev) {
    try { window.goatcounter.count({ path: ev.path, title: ev.title || ev.path, event: !!ev.event }); } catch (e) { /* nem baj */ }
  }
  /** GJ.track('jatek/osszeadas') – oldal; GJ.track('telepites', true) – esemény */
  GJ.track = function (path, event) {
    if (!enabled()) return;
    const ev = { path: String(path).replace(/^\/?/, '/'), event };
    if (ready) send(ev); else { queue.push(ev); load(); }
  };
})();
