// sw.js — Service Worker for background uploads
const WORKER = 'https://ucfzem.azer-tyu199p.workers.dev';

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

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
