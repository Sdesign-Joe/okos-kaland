/* Okos Kaland – beépített felolvasó (Piper), a készülék hangjaitól függetlenül
 *
 * Minden a böngészőben történik: a szöveg nem megy ki sehova.
 *   tts/ort/     – ONNX Runtime (a hangmodell futtatója)
 *   tts/piper/   – kiejtési szabályok (espeak-ng, piper_phonemize)
 *   tts/voices/  – a hangok: hu = Anna, en = Jenny, ro = Mihai
 * Első használatkor nyelvenként kb. 93 MB töltődik le (motor + hang), ez a készüléken marad
 * (Cache API, „okos-tts-v1”), így utána internet nélkül is működik.
 */
(function () {
  'use strict';
  const BASE = 'tts/';
  const VOICE = { hu: 'hu_HU-anna-medium', en: 'en_GB-jenny_dioco-medium', ro: 'ro_RO-mihai-medium' };
  const CACHE = 'okos-tts-v1';
  const ENGINE_FILES = ['ort/ort.wasm.min.js', 'piper/piper_phonemize.js', 'piper/piper_phonemize.wasm', 'piper/piper_phonemize.data'];
  const voiceFiles = lang => ['voices/' + VOICE[lang] + '.onnx.json', 'voices/' + VOICE[lang] + '.onnx'];

  const supported = typeof WebAssembly === 'object' && typeof BigInt64Array === 'function' &&
    typeof fetch === 'function' && !!(window.AudioContext || window.webkitAudioContext);

  /* ---------- letöltés gyorsítótárral és folyamatjelzéssel ---------- */
  async function openCache() { try { return await caches.open(CACHE); } catch (e) { return null; } }
  async function isCached(path) {
    const c = await openCache(); if (!c) return false;
    try { return !!(await c.match(BASE + path)); } catch (e) { return false; }
  }
  async function getFile(path, onBytes) {
    const url = BASE + path, c = await openCache();
    if (c) { const hit = await c.match(url).catch(() => null); if (hit) return hit; }
    const res = await fetch(url);
    if (!res.ok) throw new Error('download ' + res.status + ' ' + path);
    let body = res;
    if (onBytes && res.body && res.body.getReader) {
      // a beérkező bájtokat számoljuk a folyamatjelzőhöz
      const reader = res.body.getReader(), parts = [];
      for (;;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); onBytes(value.length); }
      body = new Response(new Blob(parts), { headers: res.headers });
    }
    if (c) { try { await c.put(url, body.clone()); } catch (e) { /* nincs elég hely – memóriából megy tovább */ } }
    return body;
  }
  async function headSize(path) {
    try { const r = await fetch(BASE + path, { method: 'HEAD' }); return +r.headers.get('content-length') || 0; } catch (e) { return 0; }
  }
  const blobURL = async (path, onBytes) => URL.createObjectURL(await (await getFile(path, onBytes)).blob());
  function loadScript(src) {
    return new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('script ' + src)); document.head.appendChild(s); });
  }

  /* ---------- motor (egyszer töltődik be) ---------- */
  let enginePromise = null, phonMod = null, phonCb = null;
  function loadEngine(onBytes) {
    if (enginePromise) return enginePromise;
    enginePromise = (async () => {
      // a futtatót és a kiejtőt a gyorsítótárból (blob) töltjük, így offline is megy
      const [ortJs, phonJs, phonWasm, phonData] = await Promise.all(ENGINE_FILES.map(f => blobURL(f, onBytes)));
      if (!window.ort) await loadScript(ortJs);
      if (!window.createPiperPhonemize) await loadScript(phonJs);
      window.ort.env.wasm.numThreads = 1;           // több szálhoz „cross-origin isolation” kellene
      window.ort.env.wasm.proxy = false;
      // az ONNX futtató wasm-ját is a gyorsítótárból adjuk (SIMD-es, ha a böngésző tudja)
      const simd = WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
      const ortWasm = await blobURL(simd ? 'ort/ort-wasm-simd.wasm' : 'ort/ort-wasm.wasm', onBytes);
      window.ort.env.wasm.wasmPaths = { 'ort-wasm-simd.wasm': ortWasm, 'ort-wasm.wasm': ortWasm };
      phonMod = await window.createPiperPhonemize({
        print: d => { if (phonCb) { const cb = phonCb; phonCb = null; try { cb(JSON.parse(d)); } catch (e) { cb(null); } } },
        printErr: () => {},
        locateFile: u => (u.endsWith('.wasm') ? phonWasm : u.endsWith('.data') ? phonData : u)
      });
      return true;
    })();
    enginePromise.catch(() => { enginePromise = null; });
    return enginePromise;
  }

  /* ---------- hangok (egyszerre csak egy van a memóriában) ---------- */
  let voice = null;                // { lang, cfg, sess }
  const voiceLoading = {};
  function loadVoice(lang, onBytes) {
    if (voice && voice.lang === lang) return Promise.resolve(voice);
    if (voiceLoading[lang]) return voiceLoading[lang];
    const p = voiceLoading[lang] = (async () => {
      await loadEngine(onBytes);
      const [jf, mf] = voiceFiles(lang);
      const cfg = await (await getFile(jf, onBytes)).json();
      const buf = await (await getFile(mf, onBytes)).arrayBuffer();
      const sess = await window.ort.InferenceSession.create(buf, { executionProviders: ['wasm'] });
      if (voice && voice.sess && voice.sess.release) { try { voice.sess.release(); } catch (e) { /* */ } }
      voice = { lang, cfg, sess };
      return voice;
    })();
    p.catch(() => {}).then(() => { delete voiceLoading[lang]; });
    return p;
  }

  function phonemize(text, cfg) {
    return new Promise(res => {
      phonCb = res;
      try { phonMod.callMain(['-l', cfg.espeak.voice, '--input', JSON.stringify([{ text }]), '--espeak_data', '/espeak-ng-data']); }
      catch (e) { phonCb = null; res(null); }
    });
  }
  // egyszerre egy szintézis fut (a kiejtő modul nem párhuzamosítható)
  let chain = Promise.resolve();
  function synth(text, v) {
    const job = chain.then(async () => {
      const ph = await phonemize(text, v.cfg);
      if (!ph || !ph.phoneme_ids || !ph.phoneme_ids.length) return null;
      const ids = ph.phoneme_ids, ort = window.ort, inf = v.cfg.inference;
      const out = await v.sess.run({
        input: new ort.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
        input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
        scales: new ort.Tensor('float32', Float32Array.from([inf.noise_scale, inf.length_scale * 1.05, inf.noise_w]), [3])
      });
      return { pcm: out.output.data, rate: v.cfg.audio.sample_rate };
    });
    chain = job.catch(() => {});
    return job;
  }

  /* ---------- lejátszás ---------- */
  let actx = null, playing = [], token = 0;
  function ctx() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  }
  // iOS: a hangot az első érintéskor „fel kell oldani”
  ['pointerdown', 'touchend', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (supported) ctx(); }, { once: true, passive: true }));
  function stop() {
    token++;
    playing.forEach(s => { try { s.stop(); } catch (e) { /* */ } }); playing = [];
  }
  // mondatokra bontjuk: az első mondat hamar megszólal, a többi közben készül
  function sentences(text) {
    const clean = String(text)
      .replace(/<[^>]*>/g, ' ')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ' ')
      .replace(/_{2,}/g, '…').replace(/\s+/g, ' ').trim();
    const parts = clean.match(/[^.!?…]+[.!?…]*["”»]?\s*/g) || [clean];
    const out = [];
    parts.forEach(p => { p = p.trim(); if (!p) return; if (out.length && (p.length < 12 || out[out.length - 1].length < 12)) out[out.length - 1] += ' ' + p; else out.push(p); });
    return out;
  }
  async function speakPiper(text, lang) {
    stop();
    const my = token, v = await loadVoice(lang);
    if (my !== token) return;
    const ac = ctx();
    let at = ac.currentTime + 0.05;
    for (const s of sentences(text)) {
      const r = await synth(s, v);
      if (my !== token) return;
      if (!r) continue;
      const buf = ac.createBuffer(1, r.pcm.length, r.rate);
      if (buf.copyToChannel) buf.copyToChannel(r.pcm, 0); else buf.getChannelData(0).set(r.pcm);
      const src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination);
      at = Math.max(at, ac.currentTime + 0.02);
      src.start(at); at += buf.duration + 0.18;
      playing.push(src);
      src.onended = () => { playing = playing.filter(x => x !== src); };
    }
  }

  /* ---------- nyilvános felület ---------- */
  const state = {};   // lang → 'ready' | 'downloading' | 'error'
  let progressCb = null;
  async function downloadedLangs(lang) {
    const all = ENGINE_FILES.concat(voiceFiles(lang));
    for (const f of all) if (!(await isCached(f))) return false;
    return true;
  }
  /** Letöltés indítása (pl. a Beállításokból). onProgress(0..1) */
  async function download(lang, onProgress) {
    if (!supported) throw new Error('unsupported');
    if (state[lang] === 'downloading') return voiceLoading[lang] || enginePromise;
    state[lang] = 'downloading';
    const files = ENGINE_FILES.concat(['ort/ort-wasm-simd.wasm'], voiceFiles(lang));
    let total = 0, got = 0;
    for (const f of files) if (!(await isCached(f))) total += await headSize(f);
    progressCb = onProgress || null;
    const onBytes = n => { got += n; if (progressCb && total) progressCb(Math.min(0.99, got / total)); };
    try {
      await loadVoice(lang, onBytes);
      state[lang] = 'ready'; if (progressCb) progressCb(1);
    } catch (e) { state[lang] = 'error'; throw e; } finally { progressCb = null; }
  }

  GJ.tts = {
    supported,
    VOICE,
    /** kész-e (letöltve) az adott nyelvre */
    async isReady(lang) { return supported && (state[lang] === 'ready' || await downloadedLangs(lang)); },
    isDownloading: lang => state[lang] === 'downloading',
    download,
    stop,
    /** Felolvasás: true, ha a beépített hang szólal meg */
    async speak(text, lang) {
      if (!supported || !text) return false;
      if (!(await this.isReady(lang))) return false;
      try { await speakPiper(text, lang); return true; } catch (e) { console.warn('TTS hiba:', e); return false; }
    },
    /** a teljes beépített felolvasó törlése a készülékről */
    async remove() { stop(); voice = null; Object.keys(state).forEach(k => delete state[k]); try { await caches.delete(CACHE); } catch (e) { /* */ } },
    async sizeMB(lang) { let t = 0; for (const f of ENGINE_FILES.concat(['ort/ort-wasm-simd.wasm'], voiceFiles(lang))) t += await headSize(f); return Math.round(t / 1048576); }
  };
})();
