"""Aplica scorer em todos os cursos e persiste matches."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone

from ..ingestion.normalizer import NormalizedArticle
from .scorer import Keyword, score_article_for_course


def load_courses(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        "SELECT id, slug, name, primary_provider, secondary_provider, query_languages "
        "FROM courses WHERE active = 1"
    ).fetchall()
    return [
        {
            "id": r["id"],
            "slug": r["slug"],
            "name": r["name"],
            "primary_provider": r["primary_provider"],
            "secondary_provider": r["secondary_provider"],
            "query_languages": json.loads(r["query_languages"]),
        }
        for r in rows
    ]


def load_keywords(conn: sqlite3.Connection, course_id: int) -> list[Keyword]:
    rows = conn.execute(
        "SELECT term, type, language, weight FROM keywords "
        "WHERE course_id = ? AND active = 1",
        (course_id,),
    ).fetchall()
    return [
        Keyword(term=r["term"], type=r["type"], language=r["language"], weight=r["weight"])
        for r in rows
    ]


def classify_and_save(
    conn: sqlite3.Connection,
    article_id: int,
    article: NormalizedArticle,
    *,
    cutoff: int,
) -> list[dict]:
    """Avalia o artigo contra todos os cursos. Salva matches com score >= cutoff.

    Retorna lista de matches salvos (dicts com course_slug e score).
    """
    courses = load_courses(conn)
    if not courses:
        return []

    now = datetime.now(timezone.utc)
    scored: list[dict] = []

    for course in courses:
        keywords = load_keywords(conn, course["id"])
        if not keywords:
            continue
        is_primary = article.provider == course["primary_provider"]
        result = score_article_for_course(
            article,
            keywords,
            course_slug=course["slug"],
            preferred_languages=course["query_languages"],
            is_primary_provider=is_primary,
            now=now,
        )
        if result.score >= cutoff and result.matched_terms:
            scored.append({
                "course": course,
                "result": result,
                "is_primary_provider": is_primary,
            })

    if not scored:
        return []

    max_score = max(s["result"].score for s in scored)
    saved = []
    created_at = now.isoformat()

    for s in scored:
        course = s["course"]
        result = s["result"]
        is_primary = 1 if result.score == max_score else 0
        try:
            conn.execute(
                """
                INSERT INTO article_course_matches (
                  article_id, course_id, relevance_score, score_breakdown,
                  matched_terms, preferred_language_match, recency_bucket,
                  provider_priority, is_primary, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    article_id,
                    course["id"],
                    result.score,
                    json.dumps(result.breakdown, ensure_ascii=False),
                    json.dumps(result.matched_terms, ensure_ascii=False),
                    1 if result.preferred_language_match else 0,
                    result.recency_bucket,
                    1 if s["is_primary_provider"] else 0,
                    is_primary,
                    created_at,
                ),
            )
            saved.append({
                "course_slug": course["slug"],
                "score": result.score,
                "is_primary": bool(is_primary),
            })
        except sqlite3.IntegrityError:
            # já existia match (rerun)
            pass

    return saved
