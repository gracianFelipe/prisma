"""Orquestra a coleta: itera cursos, dispara primária, aplica fallback nos 4 gatilhos."""
from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from ..classification.matcher import classify_and_save
from ..config import settings
from ..providers.base import FetchResult
from ..providers.registry import get_provider
from .dedupe import insert_article
from .normalizer import NormalizedArticle
from .queries import build_queries_for_course

MIN_UNIQUE_FOR_NO_FALLBACK = 3
MIN_ABOVE_CUTOFF_FOR_NO_FALLBACK = 2


@dataclass
class CourseRunSummary:
    course_slug: str
    queries_run: int
    articles_received: int
    articles_new: int
    articles_duplicate: int
    articles_above_cutoff: int
    fallback_used: int
    fallback_reasons: list[str]


def _published_after_iso(hours: int) -> str:
    dt = datetime.now(timezone.utc) - timedelta(hours=hours)
    return dt.isoformat()


def _persist_articles(
    conn: sqlite3.Connection,
    articles: list[NormalizedArticle],
    *,
    cutoff: int,
) -> tuple[int, int, int]:
    """Insere artigos, classifica e retorna (new, dup, above_cutoff)."""
    new_count = dup_count = above_cutoff = 0
    for art in articles:
        article_id, is_new = insert_article(conn, art)
        if is_new and article_id is not None:
            new_count += 1
            matches = classify_and_save(conn, article_id, art, cutoff=cutoff)
            if matches:
                above_cutoff += 1
        else:
            dup_count += 1
    return new_count, dup_count, above_cutoff


def _log_job(
    conn: sqlite3.Connection,
    *,
    job_name: str,
    provider: str,
    course_id: int,
    query: str,
    is_fallback: bool,
    fallback_reason: str | None,
    started_at: str,
    result: FetchResult,
    new_count: int,
    dup_count: int,
    above_cutoff: int,
) -> None:
    conn.execute(
        """
        INSERT INTO job_logs (
          job_name, provider, course_id, query, is_fallback, fallback_reason,
          started_at, finished_at, status, http_status, requests_count,
          articles_received, articles_new, articles_duplicate, articles_above_cutoff,
          error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
        """,
        (
            job_name,
            provider,
            course_id,
            query,
            1 if is_fallback else 0,
            fallback_reason,
            started_at,
            datetime.now(timezone.utc).isoformat(),
            "success" if result.ok else ("empty" if not result.error else "error"),
            result.http_status,
            result.raw_count,
            new_count,
            dup_count,
            above_cutoff,
            result.error,
        ),
    )


def _fallback_reason(result: FetchResult, new_count: int, above_cutoff: int) -> str | None:
    if result.error and "http_error" in (result.error or ""):
        return "http_error"
    if result.http_status and result.http_status >= 400:
        return "http_error"
    if result.raw_count == 0:
        return "zero_results"
    if new_count < MIN_UNIQUE_FOR_NO_FALLBACK:
        return "low_unique"
    if above_cutoff < MIN_ABOVE_CUTOFF_FOR_NO_FALLBACK:
        return "low_quality"
    return None


def run_course(
    conn: sqlite3.Connection,
    course: dict,
    *,
    window_hours: int,
    job_name: str,
    limit: int,
    cutoff: int,
) -> CourseRunSummary:
    queries = build_queries_for_course(conn, course["id"])
    languages = json.loads(course["query_languages"])
    published_after = _published_after_iso(window_hours)

    primary = get_provider(course["primary_provider"])
    secondary = get_provider(course["secondary_provider"])

    summary = CourseRunSummary(
        course_slug=course["slug"],
        queries_run=0,
        articles_received=0,
        articles_new=0,
        articles_duplicate=0,
        articles_above_cutoff=0,
        fallback_used=0,
        fallback_reasons=[],
    )

    for query in queries:
        started_at = datetime.now(timezone.utc).isoformat()
        primary_result = primary.search(
            query, languages=languages, published_after=published_after, limit=limit
        )
        new_c, dup_c, above_c = _persist_articles(conn, primary_result.articles, cutoff=cutoff)
        _log_job(
            conn,
            job_name=job_name,
            provider=primary.name,
            course_id=course["id"],
            query=query,
            is_fallback=False,
            fallback_reason=None,
            started_at=started_at,
            result=primary_result,
            new_count=new_c,
            dup_count=dup_c,
            above_cutoff=above_c,
        )
        summary.queries_run += 1
        summary.articles_received += primary_result.raw_count
        summary.articles_new += new_c
        summary.articles_duplicate += dup_c
        summary.articles_above_cutoff += above_c

        reason = _fallback_reason(primary_result, new_c, above_c)
        if reason is not None:
            started_at = datetime.now(timezone.utc).isoformat()
            secondary_result = secondary.search(
                query, languages=languages, published_after=published_after, limit=limit
            )
            new_c2, dup_c2, above_c2 = _persist_articles(
                conn, secondary_result.articles, cutoff=cutoff
            )
            _log_job(
                conn,
                job_name=job_name,
                provider=secondary.name,
                course_id=course["id"],
                query=query,
                is_fallback=True,
                fallback_reason=reason,
                started_at=started_at,
                result=secondary_result,
                new_count=new_c2,
                dup_count=dup_c2,
                above_cutoff=above_c2,
            )
            summary.queries_run += 1
            summary.articles_received += secondary_result.raw_count
            summary.articles_new += new_c2
            summary.articles_duplicate += dup_c2
            summary.articles_above_cutoff += above_c2
            summary.fallback_used += 1
            summary.fallback_reasons.append(reason)

    return summary


def run_ingestion(
    conn: sqlite3.Connection,
    *,
    course_slugs: list[str] | None = None,
    window_hours: int | None = None,
    job_name: str = "incremental",
    limit: int | None = None,
    cutoff: int | None = None,
) -> list[CourseRunSummary]:
    where = "WHERE active = 1"
    params: tuple = ()
    if course_slugs:
        placeholders = ",".join("?" * len(course_slugs))
        where += f" AND slug IN ({placeholders})"
        params = tuple(course_slugs)

    courses = conn.execute(
        f"SELECT id, slug, name, primary_provider, secondary_provider, query_languages "
        f"FROM courses {where}",
        params,
    ).fetchall()

    summaries: list[CourseRunSummary] = []
    for course_row in courses:
        course = dict(course_row)
        summary = run_course(
            conn,
            course,
            window_hours=window_hours or settings.incremental_window_hours,
            job_name=job_name,
            limit=limit or settings.default_limit_per_query,
            cutoff=cutoff if cutoff is not None else settings.score_cutoff,
        )
        summaries.append(summary)
        conn.commit()
    return summaries
