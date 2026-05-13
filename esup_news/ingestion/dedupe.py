"""Inserção dedupe-aware de artigos.

A deduplicação bloqueante é feita pelas UNIQUE constraints:
- UNIQUE(url_hash)
- UNIQUE(title_hash, source_domain)

Este módulo trata os IntegrityError dessas constraints como duplicata silenciosa.
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone

from .normalizer import NormalizedArticle


def insert_article(
    conn: sqlite3.Connection, article: NormalizedArticle
) -> tuple[int | None, bool]:
    """Tenta inserir. Retorna (article_id, is_new). Se duplicata, is_new=False."""
    fetched_at = datetime.now(timezone.utc).isoformat()
    try:
        cur = conn.execute(
            """
            INSERT INTO articles (
              provider, external_id, title, description, snippet, url, canonical_url,
              url_hash, title_hash, image_url, source_name, source_domain,
              published_at, fetched_at, language, api_categories, query_used, raw_payload
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                article.provider,
                article.external_id,
                article.title,
                article.description,
                article.snippet,
                article.url,
                article.canonical_url,
                article.url_hash,
                article.title_hash,
                article.image_url,
                article.source_name,
                article.source_domain,
                article.published_at,
                fetched_at,
                article.language,
                json.dumps(article.api_categories, ensure_ascii=False),
                article.query_used,
                json.dumps(article.raw_payload, ensure_ascii=False, default=str),
            ),
        )
        return cur.lastrowid, True
    except sqlite3.IntegrityError:
        existing = conn.execute(
            "SELECT id FROM articles WHERE url_hash = ? OR (title_hash = ? AND source_domain = ?)",
            (article.url_hash, article.title_hash, article.source_domain),
        ).fetchone()
        return (existing["id"] if existing else None), False
