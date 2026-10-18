import { get, set, del, keys } from 'idb-keyval';
import type { Block, BookIndex, Chapter } from './types';

const IMP_KEY = 'imported_book';
const USE_IMP = 'useImportedBook';

export function setUseImportedBook(v: boolean): void {
  try {
    if (v) localStorage.setItem(USE_IMP, 'true');
    else localStorage.removeItem(USE_IMP);
  } catch {}
}

export function useImportedBook(): boolean {
  try {
    return localStorage.getItem(USE_IMP) === 'true';
  } catch {
    return false;
  }
}

export async function saveImportedBook(payload: {
  index: BookIndex;
  chapters: Record<string, Chapter>;
}): Promise<void> {
  await set(IMP_KEY, payload);
  setUseImportedBook(true);
}

export async function loadImportedBook(): Promise<{
  index: BookIndex;
  chapters: Record<string, Chapter>;
} | null> {
  const v = await get(IMP_KEY);
  return v || null;
}

export async function clearImportedBook(): Promise<void> {
  try {
    await del(IMP_KEY);
  } catch {}
  setUseImportedBook(false);
}
