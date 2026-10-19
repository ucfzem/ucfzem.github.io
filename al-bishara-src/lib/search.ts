import { normalizeArabic } from './arabic';
import type { Block, BookIndex, Chapter } from './types';

export interface SearchUnit {
  chapterId: string;
  chapterTitle: string;
  partTitle: string;
  blockIndex: number;
  raw: string;
  norm: string;
}

let cachedIndex: SearchUnit[] | null = null;
let cachedSignature: string | null = null;

function partTitleFor(index: BookIndex, partId: string): string {
  return index.parts.find((p) => p.id === partId)?.title || partId;
}

export async function buildSearchIndex(
  index: BookIndex,
  chapters: Record<string, Chapter>
): Promise<SearchUnit[]> {
  // cheap signature: list of ids + lengths
  const sig = Object.keys(chapters)
    .sort()
    .map((k) => `${k}:${chapters[k]?.blocks?.length ?? 0}`)
    .join('|');
  if (cachedIndex && cachedSignature === sig) return cachedIndex;

  const units: SearchUnit[] = [];
  for (const p of index.parts) {
    const pTitle = p.title;
    for (const cm of p.chapters) {
      const ch = chapters[cm.id];
      if (!ch) continue;
      ch.blocks.forEach((b, i) => {
        const raw = blockText(b);
        units.push({
          chapterId: cm.id,
          chapterTitle: cm.title,
          partTitle: pTitle,
          blockIndex: i,
          raw,
          norm: normalizeArabic(raw),
        });
      });
    }
  }
  cachedIndex = units;
  cachedSignature = sig;
  return units;
}

function blockText(b: Block): string {
  switch (b.type) {
    case 'heading':
      return b.text;
    case 'paragraph':
      return b.text;
    case 'quote':
      return b.text;
    case 'verse':
      return b.text + (b.reference ? ' ' + b.reference : '');
    case 'footnote':
      return b.text;
    case 'list':
      return b.items.join(' ');
    default:
      return '';
  }
}
