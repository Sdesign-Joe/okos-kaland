/* Okos Kaland – mesekönyv nyomtatása / PDF + adatátvitel másik eszközre QR-kóddal
 * A QR-kódos átvitel teljesen helyi: az adatok a képernyőn (QR-kód) és a kamerán át mennek
 * az egyik eszközről a másikra, semmilyen szerveren nem haladnak át.
 * Könyvtárak (js/vendor/): qrcode-generator (MIT), jsQR (Apache-2.0) – csak használatkor töltődnek be.
 */
(GJ.features = GJ.features || []).push(function (A) {
  'use strict';
  const S = GJ.store, t = GJ.t;

  GJ.addTexts({
    hu: { printBtn: '🖨️ Nyomtatás / PDF', printTip: 'Tipp: a nyomtatási ablakban a „Mentés PDF-ként” is választható.',
      qrT: '📲 Átvitel másik eszközre (QR-kód)', qrNote: 'Játékosok, csillagok, matricák, mesék és beállítások átvitele kamerával – internet és szerver nélkül.',
      qrSend: '📤 Küldés erről az eszközről', qrRecv: '📥 Fogadás erre az eszközre',
      qrSendT: 'Mutasd ezt a másik eszköznek', qrSendHelp: 'A másik eszközön: Szülői sarok → Beállítások → „Fogadás erre az eszközre”, és tartsd a kamerát a kódra, amíg minden rész beérkezik.',
      qrPart: '{i}. rész / {n}', qrRecvT: 'Irányítsd a kamerát a QR-kódra', qrGot: 'Beérkezett: {i} / {n}', qrWait: 'Keresem a kódot…',
      qrNoCam: 'Nem sikerült elindítani a kamerát. Engedélyezd a kamerát a böngészőben, vagy használd a „Mentés fájlba” lehetőséget.',
      qrOk: 'Megérkezett {n} játékos adata. Ezzel az eszközön lévő adatok helyére kerülnek. Folytatod?', qrDone: '✅ Az adatok átkerültek!', qrBad: '❌ Ez nem Okos Kaland átviteli kód.',
      qrYes: 'Igen, átveszem', close: 'Bezárás' },
    ro: { printBtn: '🖨️ Tipărește / PDF', printTip: 'Sfat: în fereastra de tipărire poți alege și „Salvează ca PDF”.',
      qrT: '📲 Transfer pe alt dispozitiv (cod QR)', qrNote: 'Jucători, stele, abțibilduri, povești și setări – transfer cu camera, fără internet și fără server.',
      qrSend: '📤 Trimite de pe acest dispozitiv', qrRecv: '📥 Primește pe acest dispozitiv',
      qrSendT: 'Arată acest cod celuilalt dispozitiv', qrSendHelp: 'Pe celălalt dispozitiv: Colțul părinților → Setări → „Primește pe acest dispozitiv” și ține camera spre cod până sosesc toate părțile.',
      qrPart: 'Partea {i} / {n}', qrRecvT: 'Îndreaptă camera spre codul QR', qrGot: 'Primite: {i} / {n}', qrWait: 'Caut codul…',
      qrNoCam: 'Camera nu a pornit. Permite accesul la cameră în browser sau folosește „Salvare în fișier”.',
      qrOk: 'Au sosit datele a {n} jucători. Vor înlocui datele de pe acest dispozitiv. Continui?', qrDone: '✅ Datele au fost transferate!', qrBad: '❌ Acesta nu este un cod de transfer.',
      qrYes: 'Da, preiau', close: 'Închide' },
    en: { printBtn: '🖨️ Print / PDF', printTip: 'Tip: in the print window you can also choose “Save as PDF”.',
      qrT: '📲 Move to another device (QR code)', qrNote: 'Players, stars, stickers, stories and settings – transferred with the camera, no internet or server needed.',
      qrSend: '📤 Send from this device', qrRecv: '📥 Receive on this device',
      qrSendT: 'Show this to the other device', qrSendHelp: 'On the other device: Parents’ corner → Settings → “Receive on this device”, and point the camera at the code until all parts arrive.',
      qrPart: 'Part {i} / {n}', qrRecvT: 'Point the camera at the QR code', qrGot: 'Received: {i} / {n}', qrWait: 'Looking for the code…',
      qrNoCam: 'Could not start the camera. Allow camera access in the browser, or use “Save to file”.',
      qrOk: 'Data for {n} players arrived. It will replace the data on this device. Continue?', qrDone: '✅ The data has been transferred!', qrBad: '❌ This is not a transfer code.',
      qrYes: 'Yes, take it', close: 'Close' }
  });

  /* =================== Mesekönyv nyomtatása =================== */
  A.on('bookButtons', () => `<button class="big-btn violet" data-act="printBook">${t('printBtn')}</button>`);
  A.actions.printBook = () => {
    GJ.toast(t('printTip'));
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    // a képek betöltődését megvárjuk (a „lusta” betöltésű képeket is azonnal letöltetjük), legfeljebb 4 mp-ig
    document.querySelectorAll('.book img').forEach(i => { i.loading = 'eager'; });
    const imgs = [...document.querySelectorAll('.book img')].filter(i => !i.complete);
    Promise.race([Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; }))), new Promise(r => setTimeout(r, 4000))]).then(() => setTimeout(() => { window.print(); setTimeout(done, 1500); }, 200));
  };

  /* =================== QR-kódos átvitel =================== */
  const loaded = {};
  const need = (name, src) => loaded[name] || (loaded[name] = new Promise((ok, bad) => {
    if (window[name]) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s);
  }));
  const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; };
  const canZip = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';
  async function pack(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    if (!canZip) return 'J' + b64u(raw);
    const z = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    return 'Z' + b64u(z);
  }
  async function unpack(str) {
    const bytes = unb64u(str.slice(1));
    const raw = str[0] === 'Z' ? new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()) : bytes;
    return JSON.parse(new TextDecoder().decode(raw));
  }
  const CHUNK = 600;
  GJ.qr = { pack, unpack, CHUNK };   // (próbákhoz is)

  A.on('settings', () => `<h3>${t('qrT')}</h3><p class="muted">${t('qrNote')}</p>
    <div class="row-btns left"><button class="mini-btn" data-act="qrSend">${t('qrSend')}</button>
      <button class="mini-btn" data-act="qrRecv">${t('qrRecv')}</button></div>`);

  let qrTimer = null, camStream = null, camLoop = false;
  const stopAll = () => {
    if (qrTimer) { clearInterval(qrTimer); qrTimer = null; }
    camLoop = false;
    if (camStream) { camStream.getTracks().forEach(tr => tr.stop()); camStream = null; }
  };

  A.actions.qrSend = async () => {
    await need('qrcode', 'js/vendor/qrcode.min.js');
    const data = await pack(S.exportAll());
    const id = Math.random().toString(36).slice(2, 6);
    const parts = []; for (let i = 0; i < data.length; i += CHUNK) parts.push(data.slice(i, i + CHUNK));
    const frames = parts.map((c, i) => `OKQR|${id}|${i + 1}|${parts.length}|${c}`);
    const svg = s => { const q = window.qrcode(0, 'L'); q.addData(s); q.make(); return q.createSvgTag({ cellSize: 6, margin: 4, scalable: true }); };
    const svgs = frames.map(svg);
    A.modal(`<h3>${t('qrSendT')}</h3><div class="qr-box" id="qr-box">${svgs[0]}</div>
      <p class="qr-part" id="qr-part">${parts.length > 1 ? t('qrPart', { i: 1, n: parts.length }) : ''}</p>
      <p class="muted"><small>${t('qrSendHelp')}</small></p>
      <button class="big-btn blue small" data-m="close">${t('close')}</button>`, stopAll);
    let k = 0;
    if (svgs.length > 1) qrTimer = setInterval(() => {
      const box = document.getElementById('qr-box'); if (!box) return stopAll();
      k = (k + 1) % svgs.length; box.innerHTML = svgs[k];
      document.getElementById('qr-part').textContent = t('qrPart', { i: k + 1, n: svgs.length });
    }, 900);
  };

  A.actions.qrRecv = async () => {
    await need('jsQR', 'js/vendor/jsQR.min.js');
    A.modal(`<h3>${t('qrRecvT')}</h3><div class="qr-cam"><video id="qr-video" playsinline muted></video></div>
      <p class="qr-part" id="qr-st">${t('qrWait')}</p>
      <button class="big-btn blue small" data-m="close">${t('close')}</button>`, stopAll);
    const st = document.getElementById('qr-st'), video = document.getElementById('qr-video');
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    } catch (e) { st.textContent = t('qrNoCam'); return; }
    video.srcObject = camStream; await video.play().catch(() => {});
    const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
    const got = {}; let id = null, total = 0;
    camLoop = true;
    const tick = async () => {
      if (!camLoop || !document.getElementById('qr-video')) return stopAll();
      if (video.readyState >= 2) {
        const w = Math.min(720, video.videoWidth), h = Math.round(video.videoHeight * w / video.videoWidth);
        cv.width = w; cv.height = h; cx.drawImage(video, 0, 0, w, h);
        const res = window.jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
        if (res && res.data) {
          const m = res.data.match(/^OKQR\|(\w+)\|(\d+)\|(\d+)\|(.*)$/s);
          if (!m) st.textContent = t('qrBad');
          else {
            if (id !== m[1]) { id = m[1]; total = +m[3]; Object.keys(got).forEach(k => delete got[k]); }
            got[m[2]] = m[4];
            const n = Object.keys(got).length;
            st.textContent = t('qrGot', { i: n, n: total });
            if (n === total) {
              stopAll();
              let data;
              try { data = await unpack(Array.from({ length: total }, (_, i) => got[i + 1]).join('')); } catch (e) { st.textContent = t('qrBad'); return; }
              A.closeModal();
              const n2 = (data.profiles || []).length;
              A.modal(`<p>${t('qrOk', { n: n2 })}</p><div class="row-btns"><button class="big-btn green small" data-m="ok">${t('qrYes')}</button>
                <button class="big-btn blue small" data-m="no">${t('close')}</button></div>`, mm => {
                if (mm !== 'ok') return;
                try { S.importAll(data); GJ.toast(t('qrDone')); GJ.sfx('sticker'); A.go('profiles'); } catch (e) { GJ.toast(t('qrBad')); }
              });
              return;
            }
          }
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
});
