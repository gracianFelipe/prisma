"""Relatórios de validação do protótipo."""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

import pandas as pd


def coverage_by_course_and_provider(conn: sqlite3.Connection) -> pd.DataFrame:
    rows = conn.execute(
        """
        SELECT c.slug AS curso,
               a.provider,
               COUNT(*) AS coletados,
               SUM(CASE WHEN d.decision='approved' THEN 1 ELSE 0 END) AS aprovados,
               SUM(CASE WHEN d.decision='rejected' THEN 1 ELSE 0 END) AS rejeitados,
               SUM(CASE WHEN d.decision='pending'  THEN 1 ELSE 0 END) AS pendentes
        FROM articles a
        JOIN article_course_matches m ON m.article_id = a.id
        JOIN courses c ON c.id = m.course_id
        LEFT JOIN editorial_decisions d
               ON d.article_id = a.id AND d.course_id = m.course_id
        GROUP BY c.slug, a.provider
        ORDER BY c.slug, a.provider
        """
    ).fetchall()
    df = pd.DataFrame([dict(r) for r in rows])
    if df.empty:
        return df
    df["taxa_aprovacao"] = (
        df["aprovados"] / df["coletados"].replace(0, pd.NA) * 100
    ).round(1)
    return df


def keyword_precision(conn: sqlite3.Connection, min_volume: int = 5) -> pd.DataFrame:
    rows = conn.execute(
        """
        SELECT m.matched_terms, m.course_id, d.decision
        FROM article_course_matches m
        LEFT JOIN editorial_decisions d
               ON d.article_id = m.article_id AND d.course_id = m.course_id
        """
    ).fetchall()
    stats: dict[tuple[int, str], dict[str, int]] = {}
    for r in rows:
        terms = json.loads(r["matched_terms"] or "[]")
        for t in terms:
            key = (r["course_id"], t)
            s = stats.setdefault(key, {"volume": 0, "approved": 0, "rejected": 0, "pending": 0})
            s["volume"] += 1
            dec = r["decision"] or "pending"
            if dec == "approved":
                s["approved"] += 1
            elif dec == "rejected":
                s["rejected"] += 1
            else:
                s["pending"] += 1

    course_names = {
        row["id"]: row["slug"]
        for row in conn.execute("SELECT id, slug FROM courses").fetchall()
    }

    data = []
    for (course_id, term), s in stats.items():
        if s["volume"] < min_volume:
            continue
        decided = s["approved"] + s["rejected"]
        precision = (s["approved"] / decided * 100) if decided else None
        data.append({
            "curso": course_names.get(course_id, str(course_id)),
            "termo": term,
            "volume": s["volume"],
            "aprovados": s["approved"],
            "rejeitados": s["rejected"],
            "pendentes": s["pending"],
            "precisao_pct": round(precision, 1) if precision is not None else None,
        })

    df = pd.DataFrame(data)
    if not df.empty:
        df = df.sort_values(["curso", "precisao_pct"], ascending=[True, False], na_position="last")
    return df


def score_bucket_stats(conn: sqlite3.Connection) -> pd.DataFrame:
    rows = conn.execute(
        """
        SELECT m.relevance_score, d.decision
        FROM article_course_matches m
        LEFT JOIN editorial_decisions d
               ON d.article_id = m.article_id AND d.course_id = m.course_id
        """
    ).fetchall()

    buckets = {"0-4": [0, 4], "5-8": [5, 8], "9-12": [9, 12], "13+": [13, 999]}
    data = []
    for label, (lo, hi) in buckets.items():
        total = approved = rejected = pending = 0
        for r in rows:
            if r["relevance_score"] is None:
                continue
            if not (lo <= r["relevance_score"] <= hi):
                continue
            total += 1
            dec = r["decision"] or "pending"
            if dec == "approved":
                approved += 1
            elif dec == "rejected":
                rejected += 1
            else:
                pending += 1
        decided = approved + rejected
        precision = (approved / decided * 100) if decided else None
        data.append({
            "faixa": label,
            "matches": total,
            "aprovados": approved,
            "rejeitados": rejected,
            "pendentes": pending,
            "precisao_pct": round(precision, 1) if precision is not None else None,
        })
    return pd.DataFrame(data)


def fallback_summary(conn: sqlite3.Connection) -> pd.DataFrame:
    rows = conn.execute(
        """
        SELECT provider,
               COALESCE(fallback_reason, '-') AS motivo,
               is_fallback,
               COUNT(*) AS execucoes,
               SUM(articles_received) AS recebidos,
               SUM(articles_new) AS novos,
               SUM(articles_above_cutoff) AS acima_cutoff
        FROM job_logs
        GROUP BY provider, motivo, is_fallback
        ORDER BY provider, motivo
        """
    ).fetchall()
    return pd.DataFrame([dict(r) for r in rows])


def export_xlsx(conn: sqlite3.Connection, out_path: Path) -> Path:
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        coverage_by_course_and_provider(conn).to_excel(writer, sheet_name="cobertura", index=False)
        keyword_precision(conn).to_excel(writer, sheet_name="keywords", index=False)
        score_bucket_stats(conn).to_excel(writer, sheet_name="score_faixas", index=False)
        fallback_summary(conn).to_excel(writer, sheet_name="fallback", index=False)
    return out_path
