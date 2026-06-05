-- NanoLink — Cloudflare D1 Schema
-- Exécuter : wrangler d1 execute nanolink --file=d1-schema.sql

CREATE TABLE IF NOT EXISTS links (
  slug TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS click_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  clicked_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (slug) REFERENCES links(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_click_events_slug ON click_events(slug);
CREATE INDEX IF NOT EXISTS idx_click_events_date ON click_events(clicked_at);
