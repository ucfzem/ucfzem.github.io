export type FontChoice = 'amiri' | 'naskh' | 'scheherazade';
export type ReadingTheme = 'paper' | 'sepia' | 'white';

export interface Settings {
  font: FontChoice;
  fontSize: number; // px
  lineHeight: number; // unitless
  justify: boolean;
  readingTheme: ReadingTheme;
  remember: boolean;
}

export const defaultSettings: Settings = {
  font: 'amiri',
  fontSize: 20,
  lineHeight: 2,
  justify: true,
  readingTheme: 'paper',
  remember: true,
};

const SETTINGS_KEY = 'bishara_settings';
const PROGRESS_KEY = 'bishara_progress';

export interface ProgressMap {
  [chapterId: string]: { y: number; ts: number };
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as ProgressMap;
  } catch {
    return {};
  }
}

export function saveProgress(map: ProgressMap): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function setChapterProgress(chapterId: string, y: number): void {
  const map = loadProgress();
  map[chapterId] = { y, ts: Date.now() };
  saveProgress(map);
}

export function lastReadChapter(): { id: string; y: number } | null {
  const map = loadProgress();
  let best: { id: string; y: number; ts: number } | null = null;
  for (const [id, val] of Object.entries(map)) {
    if (!best || val.ts > best.ts) best = { id, y: val.y, ts: val.ts };
  }
  return best ? { id: best.id, y: best.y } : null;
}

export const FONT_STACKS: Record<FontChoice, string> = {
  amiri: 'var(--font-amiri), Amiri, serif',
  naskh: 'var(--font-naskh), "Noto Naskh Arabic", serif',
  scheherazade: 'var(--font-scheherazade), "Scheherazade New", serif',
};
