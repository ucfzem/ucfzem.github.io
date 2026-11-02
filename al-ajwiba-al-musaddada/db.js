// db.js — تخزين الكتاب في IndexedDB (وليس localStorage) بسبب الحجم

const DB_NAME = 'ajwiba_book';
const DB_VERSION = 1;
const STORE = 'book';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function saveBook(book, rawText = '') {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').put({
      id: 'main',
      book,
      raw: rawText,
      savedAt: Date.now(),
    });
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function loadBook() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').get('main');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBook() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').delete('main');
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function exportBook() {
  const rec = await loadBook();
  if (!rec) return null;
  const blob = new Blob([JSON.stringify({ book: rec.book, raw: rec.raw, exportedAt: new Date().toISOString() }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'al-ajwiba-al-musaddada-backup.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}
