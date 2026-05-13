"""Conexão e schema do SQLite. Schema é idempotente — pode rodar várias vezes."""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  primary_provider TEXT NOT NULL,
  secondary_provider TEXT NOT NULL,
  query_languages TEXT NOT NULL,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  term TEXT NOT NULL,
  type TEXT CHECK(type IN ('include','exclude','boost')) DEFAULT 'include',
  weight INTEGER DEFAULT 1,
  language TEXT DEFAULT 'pt',
  active INTEGER DEFAULT 1,
  UNIQUE(course_id, term, language)
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY,
  provider TEXT NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  snippet TEXT,
  url TEXT NOT NULL,
  canonical_url TEXT,
  url_hash TEXT NOT NULL,
  title_hash TEXT NOT NULL,
  image_url TEXT,
  source_name TEXT,
  source_domain TEXT,
  published_at TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  language TEXT,
  api_categories TEXT,
  query_used TEXT,
  raw_payload TEXT,
  UNIQUE(url_hash),
  UNIQUE(title_hash, source_domain)
);

CREATE TABLE IF NOT EXISTS article_course_matches (
  id INTEGER PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  relevance_score INTEGER NOT NULL,
  score_breakdown TEXT NOT NULL,
  matched_terms TEXT NOT NULL,
  preferred_language_match INTEGER DEFAULT 0,
  recency_bucket TEXT,
  provider_priority INTEGER DEFAULT 0,
  is_primary INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(article_id, course_id)
);

CREATE TABLE IF NOT EXISTS editorial_decisions (
  id INTEGER PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  decision TEXT CHECK(decision IN ('approved','rejected','pending')) DEFAULT 'pending',
  reason TEXT,
  decided_by TEXT,
  decided_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(article_id, course_id)
);

CREATE TABLE IF NOT EXISTS job_logs (
  id INTEGER PRIMARY KEY,
  job_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  course_id INTEGER REFERENCES courses(id),
  query TEXT,
  is_fallback INTEGER DEFAULT 0,
  fallback_reason TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT,
  http_status INTEGER,
  requests_count INTEGER DEFAULT 1,
  articles_received INTEGER DEFAULT 0,
  articles_new INTEGER DEFAULT 0,
  articles_duplicate INTEGER DEFAULT 0,
  articles_above_cutoff INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS soft_duplicate_suspects (
  id INTEGER PRIMARY KEY,
  article_a_id INTEGER NOT NULL,
  article_b_id INTEGER NOT NULL,
  similarity_ratio REAL NOT NULL,
  detected_at TEXT NOT NULL,
  reviewed INTEGER DEFAULT 0,
  is_real_duplicate INTEGER,
  UNIQUE(article_a_id, article_b_id)
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_provider ON articles(provider);
CREATE INDEX IF NOT EXISTS idx_matches_course ON article_course_matches(course_id, relevance_score);
CREATE INDEX IF NOT EXISTS idx_decisions_pending ON editorial_decisions(decision, course_id);
CREATE INDEX IF NOT EXISTS idx_joblogs_fallback ON job_logs(is_fallback, fallback_reason);

CREATE TRIGGER IF NOT EXISTS trg_create_pending_decision
AFTER INSERT ON article_course_matches
BEGIN
  INSERT OR IGNORE INTO editorial_decisions (article_id, course_id, decision, created_at)
  VALUES (NEW.article_id, NEW.course_id, 'pending', datetime('now'));
END;
"""


def get_connection(db_path: Path | None = None) -> sqlite3.Connection:
    path = db_path or settings.database_path
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn


@contextmanager
def connect(db_path: Path | None = None) -> Iterator[sqlite3.Connection]:
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path: Path | None = None) -> Path:
    """Cria/atualiza schema. Idempotente."""
    path = db_path or settings.database_path
    with connect(path) as conn:
        conn.executescript(SCHEMA)
    return path
