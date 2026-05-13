"""Painel de curadoria — minimalista, editorial, inspirado em MAD."""
from __future__ import annotations

import json
from datetime import datetime, timezone

import streamlit as st

from esup_news.config import settings
from esup_news.db import connect

st.set_page_config(
    page_title="ESUP News — curadoria",
    page_icon="·",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- Estilo editorial mínimo ---
st.markdown(
    """
    <style>
      :root {
        --bg: #fafaf7;
        --fg: #111;
        --muted: #6b6b66;
        --line: #e8e6df;
        --accent: #111;
      }
      .stApp { background: var(--bg); }
      html, body, [class*="css"]  {
        font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
        color: var(--fg);
      }
      h1, h2, h3, h4 {
        font-family: "Times New Roman", Georgia, serif;
        letter-spacing: -0.01em;
        font-weight: 600;
      }
      h1 { font-size: 2.4rem; line-height: 1.05; margin: 0 0 .25rem 0; }
      .esup-eyebrow {
        text-transform: uppercase;
        letter-spacing: .18em;
        font-size: .72rem;
        color: var(--muted);
        margin-bottom: .25rem;
      }
      .esup-hr { border: 0; border-top: 1px solid var(--line); margin: 1.25rem 0; }
      .esup-card {
        border-top: 1px solid var(--line);
        padding: 1.1rem 0 .9rem 0;
      }
      .esup-meta {
        color: var(--muted);
        font-size: .82rem;
        letter-spacing: .02em;
      }
      .esup-score {
        display: inline-block;
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        font-size: .82rem;
        border: 1px solid var(--line);
        padding: 2px 8px;
        border-radius: 999px;
        margin-right: .5rem;
      }
      .esup-term {
        display: inline-block;
        font-size: .78rem;
        color: var(--muted);
        margin-right: .65rem;
      }
      a, a:visited { color: var(--fg); text-decoration: underline; text-underline-offset: 3px; }
      .stButton>button {
        border: 1px solid var(--fg);
        background: var(--bg);
        color: var(--fg);
        border-radius: 0;
        padding: .35rem 1rem;
        font-weight: 500;
        letter-spacing: .02em;
      }
      .stButton>button:hover { background: var(--fg); color: var(--bg); }
      section[data-testid="stSidebar"] { background: #f3f1ea; border-right: 1px solid var(--line); }
    </style>
    """,
    unsafe_allow_html=True,
)


# --- Helpers ---
def fetch_courses():
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, slug, name FROM courses WHERE active = 1 ORDER BY name"
        ).fetchall()
    return [dict(r) for r in rows]


def fetch_pending(
    course_id: int | None,
    provider: str | None,
    decision: str,
    only_primary: bool,
    limit: int = 50,
):
    where = ["1=1"]
    params: list = []
    if course_id:
        where.append("m.course_id = ?")
        params.append(course_id)
    if provider:
        where.append("a.provider = ?")
        params.append(provider)
    if decision != "all":
        where.append("COALESCE(d.decision, 'pending') = ?")
        params.append(decision)
    if only_primary:
        where.append("m.is_primary = 1")

    sql = f"""
        SELECT a.id AS article_id, m.course_id, c.name AS course_name, c.slug AS course_slug,
               a.title, a.description, a.snippet, a.url, a.source_name, a.source_domain,
               a.published_at, a.provider, a.image_url, a.language,
               m.relevance_score, m.matched_terms, m.score_breakdown,
               m.recency_bucket, m.provider_priority, m.is_primary,
               COALESCE(d.decision, 'pending') AS decision, d.reason
        FROM articles a
        JOIN article_course_matches m ON m.article_id = a.id
        JOIN courses c ON c.id = m.course_id
        LEFT JOIN editorial_decisions d
               ON d.article_id = a.id AND d.course_id = m.course_id
        WHERE {' AND '.join(where)}
        ORDER BY m.relevance_score DESC, a.published_at DESC
        LIMIT ?
    """
    params.append(limit)
    with connect() as conn:
        rows = conn.execute(sql, params).fetchall()
    return [dict(r) for r in rows]


def set_decision(article_id: int, course_id: int, decision: str, reason: str | None):
    now = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        conn.execute(
            """
            UPDATE editorial_decisions
               SET decision = ?, reason = ?, decided_by = ?, decided_at = ?
             WHERE article_id = ? AND course_id = ?
            """,
            (decision, reason, settings.curator_name, now, article_id, course_id),
        )


def fmt_date(iso: str) -> str:
    try:
        dt = datetime.fromisoformat((iso or "").replace("Z", "+00:00"))
        return dt.strftime("%d %b %Y · %H:%M UTC").lower()
    except Exception:
        return iso or ""


REASONS = ["", "good", "off_topic", "low_quality", "duplicate", "paywall", "outdated"]


# --- Sidebar ---
with st.sidebar:
    st.markdown('<div class="esup-eyebrow">esup news</div>', unsafe_allow_html=True)
    st.markdown("### curadoria")
    courses = fetch_courses()
    course_options = {c["name"]: c["id"] for c in courses}
    course_pick = st.selectbox("curso", ["todos"] + list(course_options.keys()))
    course_id = None if course_pick == "todos" else course_options[course_pick]

    provider_pick = st.selectbox("fonte", ["todas", "newsdata", "thenewsapi"])
    provider = None if provider_pick == "todas" else provider_pick

    decision_pick = st.selectbox("estado", ["pending", "approved", "rejected", "all"])
    only_primary = st.toggle("apenas curso primário", value=True)
    limit = st.slider("itens", 10, 200, 50, step=10)


# --- Header ---
st.markdown('<div class="esup-eyebrow">painel editorial · v0.2</div>', unsafe_allow_html=True)
st.markdown("# ESUP News")
st.markdown('<hr class="esup-hr" />', unsafe_allow_html=True)


# --- Métricas mínimas ---
with connect() as conn:
    pending_total = conn.execute(
        "SELECT COUNT(*) AS n FROM editorial_decisions WHERE decision='pending'"
    ).fetchone()["n"]
    approved_total = conn.execute(
        "SELECT COUNT(*) AS n FROM editorial_decisions WHERE decision='approved'"
    ).fetchone()["n"]
    rejected_total = conn.execute(
        "SELECT COUNT(*) AS n FROM editorial_decisions WHERE decision='rejected'"
    ).fetchone()["n"]
    articles_total = conn.execute("SELECT COUNT(*) AS n FROM articles").fetchone()["n"]

cols = st.columns(4)
for col, label, value in zip(
    cols,
    ("artigos", "pendentes", "aprovados", "rejeitados"),
    (articles_total, pending_total, approved_total, rejected_total),
):
    col.markdown(
        f"<div class='esup-eyebrow'>{label}</div>"
        f"<div style='font-size:1.8rem;font-weight:600;'>{value}</div>",
        unsafe_allow_html=True,
    )

st.markdown('<hr class="esup-hr" />', unsafe_allow_html=True)


# --- Lista ---
items = fetch_pending(course_id, provider, decision_pick, only_primary, limit=limit)

if not items:
    st.markdown(
        "<div class='esup-meta'>nada por aqui. rode <code>python -m esup_news.cli ingest --all --window=12h</code> para coletar.</div>",
        unsafe_allow_html=True,
    )

for it in items:
    with st.container():
        st.markdown('<div class="esup-card">', unsafe_allow_html=True)

        terms = json.loads(it["matched_terms"] or "[]")
        terms_html = "".join(f"<span class='esup-term'>{t}</span>" for t in terms[:8])

        st.markdown(
            f"<div class='esup-eyebrow'>{it['course_name']} · {it['provider']}</div>",
            unsafe_allow_html=True,
        )
        st.markdown(f"### {it['title']}")
        st.markdown(
            f"<div class='esup-meta'>"
            f"<span class='esup-score'>score {it['relevance_score']}</span>"
            f"{it['source_name'] or it['source_domain']} · {fmt_date(it['published_at'])} · "
            f"{it['recency_bucket'] or '-'} · {it['language'] or '-'}"
            f"</div>",
            unsafe_allow_html=True,
        )

        if it["description"]:
            st.markdown(
                f"<div style='margin-top:.6rem;'>{it['description']}</div>",
                unsafe_allow_html=True,
            )

        if terms:
            st.markdown(
                f"<div style='margin-top:.5rem;'>{terms_html}</div>",
                unsafe_allow_html=True,
            )

        st.markdown(
            f"<div class='esup-meta' style='margin-top:.5rem;'><a href='{it['url']}' target='_blank'>"
            "abrir notícia original →</a></div>",
            unsafe_allow_html=True,
        )

        c1, c2, c3, _ = st.columns([1, 1, 2, 4])
        key_prefix = f"{it['article_id']}_{it['course_id']}"
        with c1:
            if st.button("aprovar", key=f"a_{key_prefix}"):
                set_decision(it["article_id"], it["course_id"], "approved", None)
                st.rerun()
        with c2:
            if st.button("rejeitar", key=f"r_{key_prefix}"):
                reason = st.session_state.get(f"reason_{key_prefix}") or None
                set_decision(it["article_id"], it["course_id"], "rejected", reason)
                st.rerun()
        with c3:
            st.selectbox(
                "motivo",
                REASONS,
                key=f"reason_{key_prefix}",
                label_visibility="collapsed",
            )

        with st.expander("score_breakdown"):
            st.json(json.loads(it["score_breakdown"] or "[]"))

        st.markdown("</div>", unsafe_allow_html=True)
