"""Detector offline de duplicatas suaves (cross-fonte, mesmo dia)."""
from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta, timezone
from difflib import SequenceMatcher

from ..ingestion.normalizer import normalize_title

SIMILARITY_THRESHOLD = 0.80


def detect_soft_duplicates(conn: sqlite3.Connection, *, since_hours: int = 24) -> int:
    """Compara artigos do mesmo dia. Marca pares com similaridade >= threshold."""
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=since_hours)).isoformat()
    rows = conn.execute(
        "SELECT id, title, source_domain, published_at FROM articles "
        "WHERE published_at >= ? ORDER BY published_at",
        (cutoff,),
    ).fetchall()

    if len(rows) < 2:
        return 0

    by_day: dict[str, list[sqlite3.Row]] = {}
    for r in rows:
        day = (r["published_at"] or "")[:10]
        by_day.setdefault(day, []).append(r)

    inserted = 0
    detected_at = datetime.now(timezone.utc).isoformat()

    for day, items in by_day.items():
        normalized = [(r, normalize_title(r["title"])) for r in items]
        for i in range(len(normalized)):
            a, a_norm = normalized[i]
            if not a_norm:
                continue
            for j in range(i + 1, len(normalized)):
                b, b_norm = normalized[j]
                if not b_norm:
                    continue
                if a["source_domain"] == b["source_domain"]:
                    continue
                ratio = SequenceMatcher(None, a_norm, b_norm).ratio()
                if ratio < SIMILARITY_THRESHOLD:
                    continue
                a_id, b_id = sorted([a["id"], b["id"]])
                try:
                    conn.execute(
                        "INSERT INTO soft_duplicate_suspects "
                        "(article_a_id, article_b_id, similarity_ratio, detected_at) "
                        "VALUES (?, ?, ?, ?)",
                        (a_id, b_id, ratio, detected_at),
                    )
                    inserted += 1
                except sqlite3.IntegrityError:
                    pass
    conn.commit()
    return inserted
