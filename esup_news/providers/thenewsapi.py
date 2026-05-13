"""Cliente The News API. Doc: https://www.thenewsapi.com/documentation"""
from __future__ import annotations

import httpx

from ..config import settings
from ..ingestion.normalizer import (
    NormalizedArticle,
    canonicalize_url,
    extract_domain,
    title_hash,
    url_hash,
)
from .base import FetchResult, NewsProvider

THENEWSAPI_BASE = "https://api.thenewsapi.com/v1/news/all"


class TheNewsApiProvider(NewsProvider):
    name = "thenewsapi"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.thenewsapi_api_key

    def search(
        self,
        query: str,
        *,
        languages: list[str],
        published_after: str,
        limit: int = 10,
    ) -> FetchResult:
        if not self.api_key:
            return FetchResult(self.name, query, None, [], 0, error="missing_api_key")

        params = {
            "api_token": self.api_key,
            "search": query,
            "search_fields": "title,description,keywords",
            "language": ",".join(languages),
            "published_after": published_after[:10],  # The News API aceita YYYY-MM-DD
            "sort": "published_at",
            "limit": str(min(limit, 100)),
        }

        try:
            with httpx.Client(timeout=settings.http_timeout_seconds) as client:
                resp = client.get(THENEWSAPI_BASE, params=params)
        except httpx.HTTPError as exc:
            return FetchResult(self.name, query, None, [], 0, error=f"http_error:{exc}")

        if resp.status_code >= 400:
            return FetchResult(
                self.name, query, resp.status_code, [], 0,
                error=f"http_{resp.status_code}:{resp.text[:200]}",
            )

        try:
            data = resp.json()
        except ValueError:
            return FetchResult(self.name, query, resp.status_code, [], 0, error="invalid_json")

        results = data.get("data") or []
        articles = [self._normalize(item, query) for item in results]
        articles = [a for a in articles if a is not None]

        return FetchResult(
            self.name, query, resp.status_code, articles, raw_count=len(results)
        )

    def _normalize(self, item: dict, query: str) -> NormalizedArticle | None:
        url = item.get("url") or ""
        title = (item.get("title") or "").strip()
        published = item.get("published_at")
        if not url or not title or not published:
            return None

        canonical = canonicalize_url(url)
        domain = extract_domain(canonical) or item.get("source") or ""

        # The News API retorna ISO 8601 com timezone. Normalizar para UTC com Z.
        published_iso = published
        if "+" not in published_iso and not published_iso.endswith("Z"):
            published_iso += "Z"

        categories = item.get("categories") or []
        keywords_raw = item.get("keywords") or ""
        if isinstance(keywords_raw, str):
            api_keywords = [k.strip() for k in keywords_raw.split(",") if k.strip()]
        else:
            api_keywords = list(keywords_raw)

        return NormalizedArticle(
            provider=self.name,
            external_id=item.get("uuid"),
            title=title,
            description=item.get("description"),
            snippet=item.get("snippet"),
            url=url,
            canonical_url=canonical,
            url_hash=url_hash(canonical),
            title_hash=title_hash(title),
            image_url=item.get("image_url"),
            source_name=item.get("source"),
            source_domain=domain,
            published_at=published_iso,
            language=item.get("language"),
            api_categories=categories,
            api_keywords=api_keywords,
            raw_payload=item,
            query_used=query,
        )
