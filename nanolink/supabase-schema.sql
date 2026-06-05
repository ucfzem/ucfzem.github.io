-- ═══════════════════════════════════════════════════════
--  NanoLink — Supabase Schema
--  Exécute ça dans l'éditeur SQL de ton projet Supabase
-- ═══════════════════════════════════════════════════════

-- ── 1. Table des liens ──
CREATE TABLE IF NOT EXISTS links (
  id        SERIAL PRIMARY KEY,
  slug      TEXT UNIQUE NOT NULL,
  url       TEXT NOT NULL,
  clicks    INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_links_slug ON links (slug);

-- ── 2. Table des événements de clic (pour l'analytics quotidien) ──
CREATE TABLE IF NOT EXISTS click_events (
  id         SERIAL PRIMARY KEY,
  slug       TEXT NOT NULL REFERENCES links(slug) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_click_events_slug ON click_events (slug);
CREATE INDEX IF NOT EXISTS idx_click_events_date ON click_events (clicked_at);

-- ── 3. Row-Level Security (RLS) ──
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

-- Permet l'accès public en lecture/écriture (nécessaire pour le worker + frontend)
-- En production, tu peux restreindre avec des politiques plus fines
CREATE POLICY "Allow public read links"  ON links  FOR SELECT USING (true);
CREATE POLICY "Allow public insert links" ON links  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update links" ON links  FOR UPDATE USING (true);
CREATE POLICY "Allow public read click_events"  ON click_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert click_events" ON click_events FOR INSERT WITH CHECK (true);
