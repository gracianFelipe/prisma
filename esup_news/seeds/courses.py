"""Seed dos 8 temas do The Prism com configuração de fonte primária/secundária."""
from __future__ import annotations

import json
import sqlite3

COURSES = [
    {
        "slug": "justica",
        "name": "Justiça",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
    {
        "slug": "negocios",
        "name": "Negócios",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt", "en"],
    },
    {
        "slug": "tecnologia",
        "name": "Tecnologia",
        "primary_provider": "thenewsapi",
        "secondary_provider": "newsdata",
        "query_languages": ["en", "pt"],
    },
    {
        "slug": "gestao",
        "name": "Gestão",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt", "en"],
    },
    {
        "slug": "educacao",
        "name": "Educação",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
    {
        "slug": "financas",
        "name": "Finanças",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
    {
        "slug": "comportamento",
        "name": "Comportamento",
        "primary_provider": "newsdata",
        "secondary_provider": "thenewsapi",
        "query_languages": ["pt"],
    },
    {
        "slug": "saude",
        "name": "Saúde",
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
