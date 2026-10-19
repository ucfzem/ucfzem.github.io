export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'verse'; text: string; reference?: string }
  | { type: 'footnote'; number: number; text: string }
  | { type: 'list'; items: string[] };

export interface Chapter {
  id: string;
  title: string;
  part: string;
  blocks: Block[];
}

export interface ChapterMeta {
  id: string;
  title: string;
  file: string;
}

export interface Part {
  id: string;
  title: string;
  chapters: ChapterMeta[];
}

export interface BookIndex {
  title: string;
  author: string;
  publisher: string;
  edition: string;
  parts: Part[];
}
