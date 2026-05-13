"""Constrói as queries de busca a partir das keywords de um curso.

Estratégia: separar keywords ativas em lotes e juntar com operador OR (|).
The News API e NewsData.io aceitam o pipe como OR.
"""
from __future__ import annotations

import sqlite3

# Quantos termos por consulta. Termos demais sobrecarregam a query e reduzem precisão.
TERMS_PER_QUERY = 6


def build_queries_for_course(conn: sqlite3.Connection, course_id: int) -> list[str]:
    rows = conn.execute(
        "SELECT term FROM keywords WHERE course_id = ? AND type = 'include' AND active = 1 "
        "ORDER BY weight DESC, id ASC",
        (course_id,),
    ).fetchall()
    terms = [r["term"] for r in rows]
    if not terms:
        return []

    batches: list[list[str]] = []
    for i in range(0, len(terms), TERMS_PER_QUERY):
        batches.append(terms[i : i + TERMS_PER_QUERY])

    queries = []
    for batch in batches:
        quoted = [f'"{t}"' if " " in t else t for t in batch]
        queries.append(" OR ".join(quoted))
    return queries
