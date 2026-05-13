"""Seed dos 7 cursos da ESUP com configuração de fonte primária/secundária."""
from __future__ import annotations

import json
import sqlite3

COURSES = [
    {
        "slug": "direito",
        "name": "Direito",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
    {
        "slug": "administracao",
        "name": "Administração",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt", "en"],
    },
    {
        "slug": "sistemas-da-informacao",
        "name": "Sistemas da Informação",
        "primary_provider": "thenewsapi",
        "secondary_provider": "newsdata",
        "query_languages": ["en", "pt"],
    },
    {
        "slug": "processos-gerenciais",
        "name": "Processos Gerenciais",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt", "en"],
    },
    {
        "slug": "pedagogia",
        "name": "Pedagogia",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
    {
        "slug": "ciencias-contabeis",
        "name": "Ciências Contábeis",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
    {
        "slug": "psicologia",
        "name": "Psicologia",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
]


def seed_courses(conn: sqlite3.Connection) -> int:
    inserted = 0
    for c in COURSES:
        cur = conn.execute(
            """
            INSERT INTO courses (slug, name, primary_provider, secondary_provider, query_languages, active)
            VALUES (?, ?, ?, ?, ?, 1)
            ON CONFLICT(slug) DO UPDATE SET
              name = excluded.name,
              primary_provider = excluded.primary_provider,
              secondary_provider = excluded.secondary_provider,
              query_languages = excluded.query_languages,
              active = 1
            """,
            (
                c["slug"],
                c["name"],
                c["primary_provider"],
                c["secondary_provider"],
                json.dumps(c["query_languages"]),
            ),
        )
        inserted += cur.rowcount
    return inserted
