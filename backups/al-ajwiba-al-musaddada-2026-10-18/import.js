// import.js — منطق صفحة /import
import { parseBook, bookStats } from './parser.js';
import { saveBook, loadBook, deleteBook, exportBook } from './db.js';

const $ = (id) => document.getElementById(id);
const ta = $('bookText');
const preview = $('importPreview');

function statsHtml(s) {
  return `<b>العنوان:</b> ${s.title || '—'} · <b>الفصول:</b> ${s.chapterCount} · <b>الكلمات:</b> ${s.wordCount}`;
}

function doPreview() {
  const text = ta.value;
  if (!text.trim()) { preview.innerHTML = 'لا يوجد نص للمعاينة.'; return; }
  const book = parseBook(text);
  const s = bookStats(book);
  preview.innerHTML = '✅ تمكّن المحلل من قراءة النص: ' + statsHtml(s) + ' · <b>مقدمة:</b> ' + (book.intro ? 'نعم' : 'لا');
}

$('btnPreview').addEventListener('click', doPreview);

$('fileInput').addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => { ta.value = r.result; doPreview(); };
  r.readAsText(f, 'utf-8');
});

$('btnSave').addEventListener('click', async () => {
  const text = ta.value;
  if (!text.trim()) { alert('الصق النص أولاً.'); return; }
  const book = parseBook(text);
  if (!book.chapters.length) { alert('لم يُعثر على أي فصل (استخدم ## لبداية كل فصل).'); return; }
  await saveBook(book, text);
  const s = bookStats(book);
  preview.innerHTML = '💾 تم الحفظ في قاعدة بيانات المتصفح (IndexedDB). ' + statsHtml(s);
  alert('تم حفظ الكتاب. افتح القارئ لبدء الاستخدام.');
});

$('btnExport').addEventListener('click', async () => {
  const ok = await exportBook();
  if (!ok) alert('لا يوجد كتاب محفوظ للتصدير.');
});

$('btnDelete').addEventListener('click', async () => {
  if (!confirm('سيتم حذف الكتاب المحفوظ. متابعة؟')) return;
  await deleteBook();
  preview.innerHTML = '🗑️ تم حذف الكتاب.';
});

// تحميل الكتاب الحالي عند الفتح
(async function init() {
  const rec = await loadBook();
  if (rec) {
    ta.value = rec.raw || '';
    const s = bookStats(rec.book);
    preview.innerHTML = '📖 الكتاب المحفوظ حالياً: ' + statsHtml(s);
  }
})();
