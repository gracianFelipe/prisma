from datetime import datetime, timezone
from pathlib import Path

import pytest

from esup_news.db import init_db, get_connection
from esup_news.ingestion.dedupe import insert_article
from esup_news.ingestion.normalizer import (
    NormalizedArticle,
    canonicalize_url,
    title_hash,
    url_hash,
)


@pytest.fixture()
def db(tmp_path: Path):
    db_path = tmp_path / "test.db"
    init_db(db_path)
    conn = get_connection(db_path)
    try:
        yield conn
    finally:
        conn.commit()
        conn.close()


def _build(url: str, title: str, source_domain: str = "exemplo.com"):
    canon = canonicalize_url(url)
    return NormalizedArticle(
        provider="newsdata",
        external_id=None,
        title=title,
        description=None,
        snippet=None,
        url=url,
        canonical_url=canon,
        url_hash=url_hash(canon),
        title_hash=title_hash(title),
        image_url=None,
        source_name=source_domain,
        source_domain=source_domain,
        published_at=datetime.now(timezone.utc).isoformat(),
        language="pt",
        api_categories=[],
        api_keywords=[],
        raw_payload={},
    )


def test_insert_new_article(db):
    art = _build("https://exemplo.com/a", "Notícia A")
    aid, is_new = insert_article(db, art)
    assert is_new is True
    assert aid is not None


def test_url_dup_with_tracking_params_blocked(db):
    a = _build("https://www.exemplo.com/a?utm_source=x", "Variante 1")
    b = _build("https://exemplo.com/a", "Variante 2 totalmente diferente")
    aid_a, new_a = insert_article(db, a)
    aid_b, new_b = insert_article(db, b)
    assert new_a is True
    assert new_b is False
    assert aid_b == aid_a


def test_title_dup_same_domain_blocked(db):
    a = _build("https://exemplo.com/path-a", "O STF decide sobre LGPD")
    b = _build("https://exemplo.com/path-b", "o stf, decide, sobre lgpd!")
    _, new_a = insert_article(db, a)
    _, new_b = insert_article(db, b)
    assert new_a is True
    assert new_b is False


def test_title_same_different_domain_allowed(db):
    a = _build("https://exemplo.com/x", "STF decide sobre LGPD", source_domain="exemplo.com")
    b = _build("https://outro.com/x", "STF decide sobre LGPD", source_domain="outro.com")
    _, new_a = insert_article(db, a)
    _, new_b = insert_article(db, b)
    assert new_a is True
    assert new_b is True


def test_trigger_creates_pending_decision(db):
    # Inserir artigo, criar curso e match, verificar pending automático
    art = _build("https://exemplo.com/trg", "Caso de teste do trigger")
    aid, _ = insert_article(db, art)

    db.execute(
        "INSERT INTO courses (slug, name, primary_provider, secondary_provider, query_languages) "
        "VALUES ('test', 'Teste', 'newsdata', 'thenewsapi', '[\"pt\"]')"
    )
    course_id = db.execute("SELECT id FROM courses WHERE slug='test'").fetchone()["id"]

    db.execute(
        "INSERT INTO article_course_matches "
        "(article_id, course_id, relevance_score, score_breakdown, matched_terms, created_at) "
        "VALUES (?, ?, 10, '[]', '[]', datetime('now'))",
        (aid, course_id),
    )

    row = db.execute(
        "SELECT decision FROM editorial_decisions WHERE article_id=? AND course_id=?",
        (aid, course_id),
    ).fetchone()
    assert row is not None
    assert row["decision"] == "pending"
