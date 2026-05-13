from datetime import datetime, timezone

from esup_news.classification.scorer import Keyword, POINTS, score_article_for_course
from esup_news.ingestion.normalizer import NormalizedArticle


def _make_article(
    title="STF decide sobre LGPD e direito digital",
    description="Tribunal analisa caso de proteção de dados",
    language="pt",
    provider="newsdata",
    api_categories=None,
    api_keywords=None,
    published_at=None,
):
    return NormalizedArticle(
        provider=provider,
        external_id="x",
        title=title,
        description=description,
        snippet=None,
        url="https://exemplo.com/n",
        canonical_url="https://exemplo.com/n",
        url_hash="h1",
        title_hash="h2",
        image_url=None,
        source_name="Exemplo",
        source_domain="exemplo.com",
        published_at=published_at or datetime.now(timezone.utc).isoformat(),
        language=language,
        api_categories=api_categories or [],
        api_keywords=api_keywords or [],
        raw_payload={},
    )


def test_score_title_match_and_recency():
    art = _make_article()
    kws = [Keyword(term="LGPD", type="include"), Keyword(term="STF", type="include")]
    r = score_article_for_course(
        art, kws,
        course_slug="direito",
        preferred_languages=["pt"],
        is_primary_provider=True,
    )
    # title_match (LGPD) + title_match (STF) + recency_24h + language_match + provider_primary
    expected_min = POINTS["title_match"] * 2 + POINTS["recency_24h"] + POINTS["language_match"] + POINTS["provider_primary"]
    assert r.score >= expected_min
    assert "LGPD" in r.matched_terms
    assert "STF" in r.matched_terms
    assert r.recency_bucket == "24h"
    assert r.preferred_language_match is True
    assert r.provider_priority is True


def test_score_exclude_pulls_down():
    art = _make_article(title="Reportagem sobre celebridades famosas")
    kws = [
        Keyword(term="reportagem", type="include"),
        Keyword(term="celebridades", type="exclude"),
    ]
    r = score_article_for_course(
        art, kws,
        course_slug="direito",
        preferred_languages=["pt"],
        is_primary_provider=False,
    )
    has_exclude = any(b["component"] == "exclude_hit" for b in r.breakdown)
    assert has_exclude
    assert r.score < POINTS["title_match"] + POINTS["recency_24h"] + POINTS["language_match"]


def test_score_breakdown_sums_to_score():
    art = _make_article(api_keywords=["LGPD", "tribunal"])
    kws = [Keyword(term="LGPD", type="include")]
    r = score_article_for_course(
        art, kws,
        course_slug="direito",
        preferred_languages=["pt"],
        is_primary_provider=True,
    )
    assert r.score == sum(int(b["points"]) for b in r.breakdown)


def test_category_match():
    art = _make_article(api_categories=["politics"])
    kws = [Keyword(term="LGPD", type="include")]
    r = score_article_for_course(
        art, kws,
        course_slug="direito",
        preferred_languages=["pt"],
        is_primary_provider=False,
    )
    cats = [b for b in r.breakdown if b["component"] == "category_match"]
    assert len(cats) == 1
    assert cats[0]["points"] == POINTS["category_match"]


def test_no_match_returns_no_terms():
    art = _make_article(title="Receita de bolo de cenoura")
    kws = [Keyword(term="LGPD", type="include")]
    r = score_article_for_course(
        art, kws,
        course_slug="direito",
        preferred_languages=["pt"],
        is_primary_provider=False,
    )
    assert r.matched_terms == []
