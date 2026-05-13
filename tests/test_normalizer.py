from esup_news.ingestion.normalizer import (
    canonicalize_url,
    extract_domain,
    normalize_title,
    title_hash,
    url_hash,
)


def test_canonicalize_removes_tracking_params():
    raw = "https://www.exemplo.com.br/noticia/foo?utm_source=newsletter&utm_medium=email&id=42#sec-1"
    assert canonicalize_url(raw) == "https://exemplo.com.br/noticia/foo?id=42"


def test_canonicalize_strips_trailing_slash_and_lowercases_host():
    assert canonicalize_url("HTTPS://WWW.Example.COM/Path/") == "https://example.com/Path"


def test_canonicalize_handles_empty():
    assert canonicalize_url("") == ""


def test_url_hash_is_stable():
    a = canonicalize_url("https://www.x.com/a?utm_source=x")
    b = canonicalize_url("https://x.com/a")
    assert url_hash(a) == url_hash(b)


def test_normalize_title_aggressive():
    t = "A reforma TRIBUTÁRIA e o STF: o que muda em 2026?"
    norm = normalize_title(t)
    assert "stf" in norm
    assert "reforma" in norm
    assert "tributaria" in norm
    assert ":" not in norm and "?" not in norm
    assert "  " not in norm


def test_normalize_title_removes_stopwords():
    t = "O gato e o rato no telhado"
    norm = normalize_title(t)
    # 'o', 'e', 'no' devem sumir
    assert "gato" in norm
    assert "rato" in norm
    assert "telhado" in norm
    assert " o " not in f" {norm} "


def test_title_hash_equal_for_variations():
    h1 = title_hash("STF decide sobre LGPD em 2026")
    h2 = title_hash("o stf, decide, sobre lgpd em 2026.")
    assert h1 == h2


def test_extract_domain_strips_www():
    assert extract_domain("https://www.folha.uol.com.br/path") == "folha.uol.com.br"
    assert extract_domain("https://G1.globo.com/x") == "g1.globo.com"
