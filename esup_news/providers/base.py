"""Interface comum dos provedores de notícias."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from ..ingestion.normalizer import NormalizedArticle


@dataclass
class FetchResult:
    """Resultado de uma chamada de provedor."""
    provider: str
    query: str
    http_status: int | None
    articles: list[NormalizedArticle]
    raw_count: int
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None and self.http_status is not None and 200 <= self.http_status < 300


class NewsProvider(ABC):
    name: str = "abstract"

    @abstractmethod
    def search(
        self,
        query: str,
        *,
        languages: list[str],
        published_after: str,
        limit: int = 10,
    ) -> FetchResult:
        """Busca artigos. Retorna FetchResult já normalizado."""
        raise NotImplementedError
