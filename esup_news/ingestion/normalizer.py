"""Normalização de URLs e títulos para deduplicação e hashing."""
from __future__ import annotations

import hashlib
import re
import unicodedata
from dataclasses import dataclass
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

TRACKING_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "utm_id", "utm_name", "utm_brand", "utm_social", "utm_social-type",
    "gclid", "fbclid", "mc_cid", "mc_eid", "_ga", "_gl", "yclid",
    "msclkid", "icid", "ref", "ref_src", "ref_url", "trk", "share",
    "spm", "fbclid", "igshid",
}

PT_STOPWORDS = {
    "a", "o", "as", "os", "um", "uma", "uns", "umas",
    "de", "da", "do", "das", "dos", "em", "no", "na", "nos", "nas",
    "para", "por", "pelo", "pela", "com", "sem", "sob", "sobre",
    "que", "se", "e", "ou", "mas", "como", "também",
    "é", "foi", "ser", "está", "são",
    "ao", "à", "aos", "às",
    "the", "a", "an", "of", "in", "on", "to", "for", "and", "or", "with",
}


def strip_accents(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")


def canonicalize_url(url: str) -> str:
    """Remove parâmetros de tracking, fragmento, normaliza host para minúsculas."""
    if not url:
        return ""
    parts = urlsplit(url.strip())
    scheme = parts.scheme.lower() or "https"
    netloc = parts.netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]

    query_pairs = [
        (k, v) for k, v in parse_qsl(parts.query, keep_blank_values=False)
        if k.lower() not in TRACKING_PARAMS
    ]
    query_pairs.sort()
    query = urlencode(query_pairs)

    path = parts.path
    if path.endswith("/") and len(path) > 1:
        path = path.rstrip("/")

    return urlunsplit((scheme, netloc, path, query, ""))


def url_hash(canonical: str) -> str:
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def normalize_title(title: str) -> str:
    """lowercase, sem acentos, sem pontuação, sem stopwords, espaços únicos."""
    if not title:
        return ""
    t = strip_accents(title.lower())
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    tokens = [w for w in t.split() if w not in PT_STOPWORDS and len(w) > 1]
    return " ".join(tokens)


def title_hash(title: str) -> str:
    return hashlib.sha256(normalize_title(title).encode("utf-8")).hexdigest()


def extract_domain(url: str) -> str:
    if not url:
        return ""
    netloc = urlsplit(url).netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]
    return netloc


@dataclass
class NormalizedArticle:
    provider: str
    external_id: str | None
    title: str
    description: str | None
    snippet: str | None
    url: str
    canonical_url: str
    url_hash: str
    title_hash: str
    image_url: str | None
    source_name: str | None
    source_domain: str
    published_at: str  # ISO 8601 UTC
    language: str | None
    api_categories: list[str]
    api_keywords: list[str]
    raw_payload: dict
    query_used: str | None = None
