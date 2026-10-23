const CACHE = 'a3chab-cache-v1.3.8';
const CORE = [
  './',
  './index.html',
  './style.css?v=1.3.8',
  './app.js?v=1.3.8',
  './data.js?v=1.3.8',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];
const IMAGES = [
./images/affares.jpg,
./images/allal.jpg,
./images/alouka.jpg,
./images/arek_souss.jpg,
./images/argan.jpg,
./images/arz.jpg,
./images/azemmour.jpg,
./images/azir.jpg,
./images/babounj.jpg,
./images/bekkoula.jpg,
./images/beqqoula.jpg,
./images/berberis.jpg,
./images/bessbas.jpg,
./images/bsal.jpg,
./images/chahma.jpg,
./images/chendgoura.jpg,
./images/chib.jpg,
./images/chibt.jpg,
./images/chih-2.jpg,
./images/chih-3.jpg,
./images/chih.jpg,
./images/chih_ahmar.jpg,
./images/chih_azzrak.jpg,
./images/chih_khorassani.jpg,
./images/chlada.jpg,
./images/chouik.jpg,
./images/chouk_berri.jpg,
./images/chouk_lihoud.jpg,
./images/daghmouss.jpg,
./images/datura.jpg,
./images/defla.jpg,
./images/defla_berri.jpg,
./images/doum.jpg,
./images/drou.jpg,
./images/flio.jpg,
./images/flio_berri.jpg,
./images/ftila.jpg,
./images/ftila_berri.jpg,
./images/ghar.jpg,
./images/ghar_berri.jpg,
./images/ghessal.jpg,
./images/guelb.jpg,
./images/habat_baraka.jpg,
./images/habb_felfel.jpg,
./images/halhal.jpg,
./images/halhal_berri.jpg,
./images/harmal.jpg,
./images/harmel_blanc.jpg,
./images/harriga.jpg,
./images/harriga_sghira.jpg,
./images/hel.jpg,
./images/hendba.jpg,
./images/henna.jpg,
./images/herrast_lehjar.jpg,
./images/jaada.jpg,
./images/jeljlan.jpg,
./images/kafour.jpg,
./images/kamoun.jpg,
./images/kamoun_soufi.jpg,
./images/karfas.jpg,
./images/karkad.jpg,
./images/karkar.jpg,
./images/karmous.jpg,
./images/karmous_berri.jpg,
./images/karoun.jpg,
./images/karwiya.jpg,
./images/kebbar.jpg,
./images/kettan.jpg,
./images/khachkhach.jpg,
./images/kharou.jpg,
./images/kharroub.jpg,
./images/khatmi.jpg,
./images/khatmi_berri.jpg,
./images/khayyata.jpg,
./images/khebbiz.jpg,
./images/khella.jpg,
./images/khellala.jpg,
./images/khennour.jpg,
./images/khennour_berri.jpg,
./images/kherchaf.jpg,
./images/khezama.jpg,
./images/khobbiza.jpg,
./images/khobiza.jpg,
./images/khokh.jpg,
./images/kourkoum.jpg,
./images/kzber.jpg,
./images/lakhzama.jpg,
./images/lemlissa.jpg,
./images/lhelba.jpg,
./images/loubia.jpg,
./images/louiza.jpg,
./images/louz.jpg,
./images/march.jpg,
./images/marddouch.jpg,
./images/merriout.jpg,
./images/metnan.jpg,
./images/mkhinza.jpg,
./images/nafaa.jpg,
./images/nanaa.jpg,
./images/narenj.jpg,
./images/ouzal.jpg,
./images/qernoun.jpg,
./images/qorfa.jpg,
./images/qronfel.jpg,
./images/rayhane.jpg,
./images/rayhane_berri.jpg,
./images/rman.jpg,
./images/sabar.jpg,
./images/safsaf_berri.jpg,
./images/safssaf.jpg,
./images/salmia.jpg,
./images/salvia_montana.jpg,
./images/sambouk.jpg,
./images/sandarous.jpg,
./images/sanoubar.jpg,
./images/sdess.jpg,
./images/sedra.jpg,
./images/sena_makki.jpg,
./images/sendian.jpg,
./images/smaq.jpg,
./images/tayoun.jpg,
./images/tebbouna.jpg,
./images/thuya.jpg,
./images/tifah_berri.jpg,
./images/tifla.jpg,
./images/timija.jpg,
./images/tin.jpg,
./images/tirghist.jpg,
./images/tizghart.jpg,
./images/tmar.jpg,
./images/toubib.jpg,
./images/toum.jpg,
./images/tourenjane.jpg,
./images/tout_ssoud.jpg,
./images/toutia.jpg,
./images/tuffah.jpg,
./images/ward_beldi.jpg,
./images/wrak_zitoune.jpg,
./images/yazir.jpg,
./images/zaafran.jpg,
./images/zaatar.jpg,
./images/zaatar_berri.jpg,
./images/zaatar_berri_2.jpg,
./images/zaatar_kheli.jpg,
./images/zafzaf.jpg,
./images/zafzaf_berri.jpg,
./images/zaiitra.jpg,
./images/zanjabil.jpg,
./images/zerr.jpg,
./images/zira.jpg,
./images/zitoun.jpg
];
const CDN = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Amiri:wght@400;700&display=swap'
];

async function precacheAll(cache, urls, concurrency = 4) {
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      const u = urls[i++];
      try { await cache.add(u); }
      catch (e) { try { await new Promise((r) => setTimeout(r, 300)); await cache.add(u); } catch (_) {} }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

async function cacheCdn(cache, url) {
  for (let t = 0; t < 3; t++) {
    try { const r = await fetch(url, { mode: 'no-cors' }); if (r) { await cache.put(url, r); } return; }
    catch (e) { await new Promise((r) => setTimeout(r, 300)); }
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await precacheAll(cache, [...CORE, ...IMAGES]);
    await Promise.all(CDN.map((u) => cacheCdn(cache, u)));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('a3chab-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then((res) => {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    const fresh = /\.(?:html|js|css|json)$/.test(url.pathname) || url.pathname.endsWith('/');
    event.respondWith(
      fetch(req, fresh ? { cache: 'no-store' } : undefined).then((res) => {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});