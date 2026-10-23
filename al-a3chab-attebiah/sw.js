const CACHE = 'a3chab-cache-v1.3.7';
const CORE = [
  './',
  './index.html',
  './style.css?v=1.3.7',
  './app.js?v=1.3.7',
  './data.js?v=1.3.7',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];
const IMAGES = [
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/affares.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/allal.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/alouka.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/arek_souss.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/argan.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/arz.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/azemmour.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/azir.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/babounj.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/bekkoula.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/beqqoula.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/berberis.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/bessbas.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/bsal.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chahma.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chendgoura.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chib.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chibt.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chih-2.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chih-3.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chih.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chih_ahmar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chih_azzrak.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chih_khorassani.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chlada.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chouik.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chouk_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/chouk_lihoud.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/daghmouss.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/datura.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/defla.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/defla_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/doum.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/drou.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/flio.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/flio_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/ftila.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/ftila_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/ghar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/ghar_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/ghessal.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/guelb.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/habat_baraka.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/habb_felfel.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/halhal.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/halhal_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/harmal.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/harmel_blanc.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/harriga.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/harriga_sghira.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/hel.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/hendba.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/henna.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/herrast_lehjar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/jaada.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/jeljlan.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kafour.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kamoun.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kamoun_soufi.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/karfas.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/karkad.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/karkar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/karmous.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/karmous_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/karoun.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/karwiya.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kebbar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kettan.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khachkhach.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kharou.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kharroub.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khatmi.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khatmi_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khayyata.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khebbiz.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khella.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khellala.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khennour.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khennour_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kherchaf.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khezama.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khobbiza.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khobiza.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/khokh.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kourkoum.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/kzber.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/lakhzama.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/lemlissa.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/lhelba.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/loubia.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/louiza.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/louz.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/march.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/marddouch.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/merriout.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/metnan.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/mkhinza.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/nafaa.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/nanaa.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/narenj.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/ouzal.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/qernoun.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/qorfa.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/qronfel.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/rayhane.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/rayhane_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/rman.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sabar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/safsaf_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/safssaf.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/salmia.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/salvia_montana.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sambouk.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sandarous.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sanoubar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sdess.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sedra.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sena_makki.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/sendian.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/smaq.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tayoun.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tebbouna.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/thuya.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tifah_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tifla.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/timija.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tin.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tirghist.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tizghart.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tmar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/toubib.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/toum.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tourenjane.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tout_ssoud.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/toutia.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/tuffah.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/ward_beldi.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/wrak_zitoune.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/yazir.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zaafran.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zaatar.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zaatar_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zaatar_berri_2.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zaatar_kheli.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zafzaf.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zafzaf_berri.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zaiitra.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zanjabil.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zerr.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zira.jpg',
  './/tmp/opencode/ucfzem.github.io/al-a3chab-attebiah/images/zitoun.jpg',
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
