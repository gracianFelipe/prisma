"""Score de relevância v0.2 — cada componente preservado em score_breakdown."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from ..ingestion.normalizer import NormalizedArticle, strip_accents

POINTS = {
    "title_match": 5,
    "description_match": 3,
    "keywords_match": 4,
    "category_match": 2,
    "recency_24h": 3,
    "recency_72h": 1,
    "language_match": 2,
    "provider_primary": 1,
    "exclude_hit": -8,
}

# Mapa curso → categorias da API (NewsData.io / The News API usam strings genéricas)
COURSE_CATEGORIES: dict[str, set[str]] = {
    "direito": {"politics", "business", "world"},
    "administracao": {"business", "technology", "tech"},
    "sistemas-da-informacao": {"technology", "tech", "science", "business"},
    "processos-gerenciais": {"business", "technology", "tech"},
    "pedagogia": {"education", "science", "world"},
    "ciencias-contabeis": {"business", "politics"},
    "psicologia": {"health", "science", "lifestyle"},
}


@dataclass
class Keyword:
    term: str
    type: str  # include | exclude | boost
    language: str = "pt"
    weight: int = 1


@dataclass
class ScoreResult:
    score: int
    breakdown: list[dict]
    matched_terms: list[str]
    preferred_language_match: bool
    recency_bucket: str  # 24h | 72h | 7d | older
    provider_priority: bool


def _normalize_text(text: str) -> str:
    return strip_accents((text or "").lower())


def _term_in(text_norm: str, term_norm: str) -> bool:
    if not term_norm:
        return False
    if " " in term_norm:
        return term_norm in text_norm
    # palavra inteira p/ termo de uma palavra (evita "ia" casar em "social")
    return f" {term_norm} " in f" {text_norm} "


def _recency_bucket(published_at: str, now: datetime) -> tuple[str, int]:
    try:
        ts = published_at.replace("Z", "+00:00")
        dt = datetime.fromisoformat(ts)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
    except (ValueError, AttributeError):
        return "older", 0

    delta_h = (now - dt).total_seconds() / 3600
    if delta_h <= 24:
        return "24h", POINTS["recency_24h"]
    if delta_h <= 72:
        return "72h", POINTS["recency_72h"]
    if delta_h <= 24 * 7:
        return "7d", 0
    return "older", 0


def score_article_for_course(
    article: NormalizedArticle,
    keywords: list[Keyword],
    *,
    course_slug: str,
    preferred_languages: list[str],
    is_primary_provider: bool,
    now: datetime | None = None,
) -> ScoreResult:
    now = now or datetime.now(timezone.utc)
    breakdown: list[dict] = []
    matched_terms: list[str] = []

    title_norm = _normalize_text(article.title)
    desc_norm = _normalize_text(article.description or "")
    api_kw_text = " ".join(article.api_keywords) if article.api_keywords else ""
    kw_norm = _normalize_text(api_kw_text)

    has_exclude = False
    for kw in keywords:
        term_norm = _normalize_text(kw.term)
        if kw.type == "exclude":
            if (
                _term_in(title_norm, term_norm)
                or _term_in(desc_norm, term_norm)
                or _term_in(kw_norm, term_norm)
            ):
                breakdown.append({
                    "component": "exclude_hit",
                    "term": kw.term,
                    "points": POINTS["exclude_hit"],
                })
                has_exclude = True
        elif kw.type in ("include", "boost"):
            term_matched_here = False
            if _term_in(title_norm, term_norm):
                breakdown.append({
                    "component": "title_match",
                    "term": kw.term,
                    "field": "title",
                    "points": POINTS["title_match"],
                })
                term_matched_here = True
            if _term_in(desc_norm, term_norm):
                breakdown.append({
                    "component": "description_match",
                    "term": kw.term,
                    "field": "description",
                    "points": POINTS["description_match"],
                })
                term_matched_here = True
            if _term_in(kw_norm, term_norm):
                breakdown.append({
                    "component": "keywords_match",
                    "term": kw.term,
                    "field": "api_keywords",
                    "points": POINTS["keywords_match"],
                })
                term_matched_here = True

            if term_matched_here:
                matched_terms.append(kw.term)

    course_cats = COURSE_CATEGORIES.get(course_slug, set())
    article_cats = {c.lower() for c in (article.api_categories or [])}
    if course_cats & article_cats:
        breakdown.append({
            "component": "category_match",
            "categories": sorted(course_cats & article_cats),
            "points": POINTS["category_match"],
        })

    bucket, recency_points = _recency_bucket(article.published_at, now)
    if recency_points > 0:
        comp = "recency_24h" if bucket == "24h" else "recency_72h"
        breakdown.append({"component": comp, "points": recency_points})

    lang_match = bool(article.language) and article.language in preferred_languages
    if lang_match:
        breakdown.append({
            "component": "language_match",
            "language": article.language,
            "points": POINTS["language_match"],
        })

    if is_primary_provider:
        breakdown.append({
            "component": "provider_primary",
            "points": POINTS["provider_primary"],
        })

    if has_exclude:
        # exclude já entra como negativo no breakdown; não removemos os matches positivos
        # mas a soma pode ficar baixa o suficiente para cair abaixo do cutoff
        pass

    total = sum(int(b["points"]) for b in breakdown)

    return ScoreResult(
        score=total,
        breakdown=breakdown,
        matched_terms=sorted(set(matched_terms)),
        preferred_language_match=lang_match,
        recency_bucket=bucket,
        provider_priority=is_primary_provider,
    )
