import type { Block, BookIndex, Chapter } from './types';
import { BASE_PATH } from './const';
import { loadImportedBook, useImportedBook } from './imported';

export async function loadIndex(): Promise<BookIndex> {
  if (useImportedBook()) {
    const imp = await loadImportedBook();
    if (imp?.index) return imp.index;
  }
  const res = await fetch(`${BASE_PATH}/data/index.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error('index fetch failed');
  return (await res.json()) as BookIndex;
}

export async function loadChapter(chId: string): Promise<Chapter> {
  if (useImportedBook()) {
    const imp = await loadImportedBook();
    if (imp?.chapters?.[chId]) return imp.chapters[chId];
  }
  const res = await fetch(`${BASE_PATH}/data/${chId}.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`chapter ${chId} fetch failed`);
  return (await res.json()) as Chapter;
}
