// sw.js — Service Worker for background uploads + offline precache
const WORKER = 'https://ucfzem.azer-tyu199p.workers.dev';

const CACHE = 'droppy-v1.0.1';
const PRECACHE = ['./', './index.html', './get.html', './assets/avatar.png'];
const CDN = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'
];

const uploadResults = new Map();
const activeUploads = new Map();

self.addEventListener('message', (event) => {
  const { type } = event.data;

  if (type === 'UPLOAD_FILE') {
    const { file, filename, password, fileIndex, totalFiles, uploadId } = event.data;

    activeUploads.set(`${uploadId}-${fileIndex}`, { filename, status: 'uploading' });

    notifyClients({ type: 'UPLOAD_STARTED', fileIndex, totalFiles, filename, uploadId });

    event.waitUntil(
      fetch(`${WORKER}/droppy/upload`, {
        method: 'POST',
        headers: {
          'X-Filename': encodeURIComponent(filename),
          'X-Password': password || '',
          'Content-Type': 'application/octet-stream'
        },
        body: file
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
          const data = await res.json();
          if (!uploadResults.has(uploadId)) {
            uploadResults.set(uploadId, { id: data.id, files: [], password });
          }
          uploadResults.get(uploadId).files.push({ filename, success: true });
          activeUploads.set(`${uploadId}-${fileIndex}`, { filename, status: 'done', result: data });

          notifyClients({
            type: 'FILE_COMPLETE',
            fileIndex,
            totalFiles,
            filename,
            uploadId,
            result: data,
            allDone: uploadResults.get(uploadId).files.length === totalFiles
          });
        })
        .catch((error) => {
          activeUploads.set(`${uploadId}-${fileIndex}`, { filename, status: 'error', error: error.message });
          notifyClients({
            type: 'FILE_ERROR',
            fileIndex,
            totalFiles,
            filename,
            uploadId,
            error: error.message
          });
        })
    );
  }

  if (type === 'GET_RESULTS') {
    const { uploadId } = event.data;
    const result = uploadResults.get(uploadId);
    if (result && event.source) {
      event.source.postMessage({
        type: 'UPLOAD_RESULTS',
        uploadId,
        result
      });
    }
  }

  if (type === 'GET_PENDING') {
    const pending = [];
    activeUploads.forEach((value, key) => {
      if (value.status === 'uploading') pending.push({ key, ...value });
    });
    const completed = [];
    uploadResults.forEach((value, key) => {
      completed.push({ uploadId: key, ...value });
    });
    if (event.source) {
      event.source.postMessage({
        type: 'PENDING_STATUS',
        pending,
        completed
      });
    }
  }
});

function notifyClients(msg) {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(client => client.postMessage(msg));
  });
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map((u) => cache.add(u).catch(() => {})));
    await Promise.all(CDN.map((u) =>
      fetch(u, { mode: 'no-cors' }).then((r) => { if (r) return cache.put(u, r); }).catch(() => {})
    ));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('droppy-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')).then((r) => r || caches.match('./')))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
    })
  );
});
