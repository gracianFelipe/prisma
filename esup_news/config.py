"""Carrega variáveis de ambiente e expõe constantes do projeto."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent

load_dotenv(PROJECT_ROOT / ".env")


def _get(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Variável de ambiente obrigatória ausente: {name}")
    return value


def _get_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    return int(raw) if raw not in (None, "") else default


@dataclass(frozen=True)
class Settings:
    newsdata_api_key: str
    thenewsapi_api_key: str
    database_path: Path
    score_cutoff: int
    incremental_window_hours: int
    weekly_window_hours: int
    default_limit_per_query: int
    http_timeout_seconds: int
    http_max_retries: int
    curator_name: str
    local_tz: str


def load_settings() -> Settings:
    db_path_raw = os.getenv("DATABASE_PATH", "data/esup_news.db")
    db_path = Path(db_path_raw)
    if not db_path.is_absolute():
        db_path = PROJECT_ROOT / db_path

    return Settings(
        newsdata_api_key=os.getenv("NEWSDATA_API_KEY", ""),
        thenewsapi_api_key=os.getenv("THENEWSAPI_API_KEY", ""),
        database_path=db_path,
        score_cutoff=_get_int("SCORE_CUTOFF", 6),
        incremental_window_hours=_get_int("INCREMENTAL_WINDOW_HOURS", 12),
        weekly_window_hours=_get_int("WEEKLY_WINDOW_HOURS", 168),
        default_limit_per_query=_get_int("DEFAULT_LIMIT_PER_QUERY", 10),
        http_timeout_seconds=_get_int("HTTP_TIMEOUT_SECONDS", 20),
        http_max_retries=_get_int("HTTP_MAX_RETRIES", 3),
        curator_name=os.getenv("CURATOR_NAME", "admin"),
        local_tz=os.getenv("LOCAL_TZ", "America/Sao_Paulo"),
    )


settings = load_settings()
