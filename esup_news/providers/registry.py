"""Registro de provedores por nome."""
from __future__ import annotations

from .base import NewsProvider
from .newsdata import NewsDataProvider
from .thenewsapi import TheNewsApiProvider


def get_provider(name: str) -> NewsProvider:
    if name == "newsdata":
        return NewsDataProvider()
    if name == "thenewsapi":
        return TheNewsApiProvider()
    raise ValueError(f"Provider desconhecido: {name}")
