"""Cliente NewsData.io. Doc: https://newsdata.io/documentation"""
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

NEWSDATA_BASE = "https://newsdata.io/api/1/news"


class NewsDataProvider(NewsProvider):
    name = "newsdata"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.newsdata_api_key

    def search(
        self,
        query: str,
        *,
        languages: list[str],
        published_after: str,  # ISO 8601 UTC
        limit: int = 10,
    ) -> FetchResult:
        if not self.api_key:
            return FetchResult(self.name, query, None, [], 0, error="missing_api_key")

        params: dict[str, str] = {
            "apikey": self.api_key,
            "q": query,
            "language": ",".join(languages),
            "size": str(min(limit, 10)),
        }
        if "pt" in languages and "en" not in languages:
            params["country"] = "br"

        try:
            with httpx.Client(timeout=settings.http_timeout_seconds) as client:
                resp = client.get(NEWSDATA_BASE, params=params)
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

        results = data.get("results") or []
        articles = [self._normalize(item, query) for item in results]
        articles = [a for a in articles if a is not None]

        return FetchResult(
            self.name, query, resp.status_code, articles, raw_count=len(results)
        )

    def _normalize(self, item: dict, query: str) -> NormalizedArticle | None:
        url = item.get("link") or ""
        title = (item.get("title") or "").strip()
        published = item.get("pubDate")
        if not url or not title or not published:
            return None

        canonical = canonicalize_url(url)
        domain = extract_domain(canonical) or item.get("source_id") or ""

        # NewsData returns "YYYY-MM-DD HH:MM:SS" UTC; converter para ISO 8601
        published_iso = published.replace(" ", "T")
        if "T" in published_iso and not published_iso.endswith("Z") and "+" not in published_iso:
            published_iso += "Z"

        categories = item.get("category") or []
        if isinstance(categories, str):
            categories = [categories]

        return NormalizedArticle(
            provider=self.name,
            external_id=item.get("article_id"),
            title=title,
            description=item.get("description"),
            snippet=item.get("content"),
            url=url,
            canonical_url=canonical,
            url_hash=url_hash(canonical),
            title_hash=title_hash(title),
            image_url=item.get("image_url"),
            source_name=item.get("source_id") or item.get("source_name"),
            source_domain=domain,
            published_at=published_iso,
            language=item.get("language"),
            api_categories=categories,
            api_keywords=item.get("keywords") or [],
            raw_payload=item,
            query_used=query,
        )
