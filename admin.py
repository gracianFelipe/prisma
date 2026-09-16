"""Painel interno de curadoria do The Prism.

Não é o produto público. É a ferramenta administrativa usada pelo curador
para aprovar/rejeitar notícias coletadas. Otimizado para clareza, contraste
alto e velocidade de decisão.
"""
from __future__ import annotations

import html
import json
from datetime import datetime, timezone

import streamlit as st

from esup_news.config import settings
from esup_news.db import connect
from esup_news.ingestion.normalizer import is_http_url

st.set_page_config(
    page_title="The Prism — Curadoria",
    page_icon=":newspaper:",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ----------------------------------------------------------------------------
# Estilo: limpo, alto contraste, foco em legibilidade.
# Funciona com o tema padrão do Streamlit (escuro ou claro do usuário).
# ----------------------------------------------------------------------------
st.markdown(
    """
    <style>
      .block-container { padding-top: 1.5rem; max-width: 1280px; }
      h1, h2, h3 { font-weight: 600; }
      h1 { font-size: 1.6rem !important; margin-bottom: 0.25rem !important; }

      .prisma-tag {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 3px 8px;
        border-radius: 4px;
        margin-right: 6px;
      }
      .tag-curso   { background: #1f3a5f; color: #fff; }
      .tag-score   { background: #c8a96a; color: #1a1a18; }
      .tag-fonte   { background: #2a2a28; color: #e8e6df; }
      .tag-tempo   { background: #3a2a18; color: #f5d29a; }
      .tag-pending { background: #5a4a1a; color: #fff5d0; }
      .tag-approved{ background: #1a4a2a; color: #d0f5d0; }
      .tag-rejected{ background: #4a1a1a; color: #f5d0d0; }

      .prisma-title {
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.3;
        margin: 0.6rem 0 0.5rem 0;
      }
      .prisma-subtitle {
        font-size: 0.95rem;
        line-height: 1.5;
        opacity: 0.85;
        margin-bottom: 0.6rem;
      }
      .prisma-meta {
        font-size: 0.82rem;
        opacity: 0.7;
        margin-bottom: 0.5rem;
      }
      .prisma-terms {
        font-size: 0.78rem;
        opacity: 0.75;
        margin-top: 0.5rem;
      }
      .prisma-divider { border-top: 1px solid rgba(120,120,120,0.25); margin: 1.5rem 0; }

      /* Botões legíveis em qualquer tema */
      .stButton > button {
        font-weight: 600;
        border-radius: 6px;
      }

      /* Métricas no topo */
      [data-testid="stMetricValue"] {
        font-size: 1.6rem !important;
        font-weight: 700 !important;
      }
      [data-testid="stMetricLabel"] {
        font-size: 0.78rem !important;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
    </style>
    """,
    unsafe_allow_html=True,
)


# ----------------------------------------------------------------------------
# Funções de acesso a dados
# ----------------------------------------------------------------------------
def fetch_courses():
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, slug, name FROM courses WHERE active = 1 ORDER BY name"
        ).fetchall()
    return [dict(r) for r in rows]


def fetch_totals():
    with connect() as conn:
        articles = conn.execute("SELECT COUNT(*) AS n FROM articles").fetchone()["n"]
        pending = conn.execute(
            "SELECT COUNT(*) AS n FROM editorial_decisions WHERE decision='pending'"
        ).fetchone()["n"]
        approved = conn.execute(
            "SELECT COUNT(*) AS n FROM editorial_decisions WHERE decision='approved'"
        ).fetchone()["n"]
        rejected = conn.execute(
            "SELECT COUNT(*) AS n FROM editorial_decisions WHERE decision='rejected'"
        ).fetchone()["n"]
    return articles, pending, approved, rejected


def fetch_per_course_pending():
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT c.name AS nome, COUNT(*) AS pendentes
            FROM editorial_decisions d
            JOIN courses c ON c.id = d.course_id
            WHERE d.decision = 'pending'
            GROUP BY c.id, c.name
            ORDER BY c.name
            """
        ).fetchall()
    return [dict(r) for r in rows]


def fetch_articles(
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
               a.published_at, a.provider, a.language,
               m.relevance_score, m.matched_terms, m.score_breakdown,
               m.recency_bucket,
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


def fmt_date_local(iso: str) -> str:
    try:
        dt = datetime.fromisoformat((iso or "").replace("Z", "+00:00"))
        return dt.strftime("%d/%m/%Y %H:%M UTC")
    except Exception:
        return iso or ""


def esc(value) -> str:
    """Escapa dado de terceiro antes de entrar no HTML (OE).

    Titulo, descricao, fonte e idioma vem das APIs de noticia, ou seja, de sites
    arbitrarios. Como este painel renderiza com unsafe_allow_html, tudo que nao
    for nosso precisa passar por aqui.
    """
    return html.escape("" if value is None else str(value), quote=True)


def safe_href(url: str | None) -> str | None:
    """Devolve a URL so se for http/https; caso contrario nao vira link."""
    return url if url and is_http_url(url) else None


REASONS = ["—", "good", "off_topic", "low_quality", "duplicate", "paywall", "outdated"]
REASON_LABELS = {
    "—": "—",
    "good": "boa matéria",
    "off_topic": "fora do tema",
    "low_quality": "qualidade baixa",
    "duplicate": "duplicada",
    "paywall": "paywall",
    "outdated": "antiga / sem atualidade",
}


# ============================================================================
# SIDEBAR — filtros
# ============================================================================
with st.sidebar:
    st.markdown("### The Prism")
    st.caption("Painel de curadoria")
    st.markdown("---")

    st.markdown("**Filtros**")
    courses = fetch_courses()
    course_options = ["Todos os cursos"] + [c["name"] for c in courses]
    course_pick = st.selectbox("Curso", course_options, index=0)
    course_id = None
    if course_pick != "Todos os cursos":
        course_id = next(c["id"] for c in courses if c["name"] == course_pick)

    provider_pick = st.selectbox(
        "Fonte (API)",
        ["Todas", "NewsData.io", "The News API"],
        index=0,
        help="De qual API a notícia veio.",
    )
    provider = (
        None
        if provider_pick == "Todas"
        else ("newsdata" if provider_pick == "NewsData.io" else "thenewsapi")
    )

    decision_pick = st.selectbox(
        "Estado da decisão",
        ["pending", "approved", "rejected", "all"],
        index=0,
        format_func=lambda x: {
            "pending": "Pendentes",
            "approved": "Aprovadas",
            "rejected": "Rejeitadas",
            "all": "Todas",
        }[x],
    )

    only_primary = st.checkbox(
        "Apenas curso principal",
        value=True,
        help="Quando uma notícia casa com vários cursos, mostra só aquela em que o score é mais alto.",
    )
    limit = st.slider("Quantas notícias listar", 10, 200, 50, step=10)

    st.markdown("---")
    st.caption(
        "Use os filtros acima para isolar o que revisar. "
        "Aprovar publica a notícia no jornal. "
        "Rejeitar remove daquele curso (mantém em outros, se houver)."
    )


# ============================================================================
# TOPO — visão geral
# ============================================================================
st.title("Curadoria de notícias")
st.caption(
    "Revise as notícias coletadas automaticamente e decida quais entram no jornal. "
    "As decisões ficam guardadas no banco e alimentam o ajuste do sistema."
)

articles_total, pending_total, approved_total, rejected_total = fetch_totals()

m1, m2, m3, m4 = st.columns(4)
m1.metric("Coletadas no total", articles_total)
m2.metric("Aguardando você", pending_total)
m3.metric("Aprovadas", approved_total)
m4.metric("Rejeitadas", rejected_total)

# Distribuição rápida por curso (só pendentes)
per_course = fetch_per_course_pending()
if per_course:
    with st.expander("Pendentes por curso", expanded=False):
        cols = st.columns(min(len(per_course), 4))
        for i, p in enumerate(per_course):
            col = cols[i % len(cols)]
            col.metric(p["nome"], p["pendentes"])

st.markdown("<div class='prisma-divider'></div>", unsafe_allow_html=True)

# ============================================================================
# LISTA — notícias para curadoria
# ============================================================================
items = fetch_articles(course_id, provider, decision_pick, only_primary, limit=limit)

# Cabeçalho da lista
header_text = {
    "pending": f"{len(items)} notícia(s) aguardando revisão",
    "approved": f"{len(items)} notícia(s) aprovada(s)",
    "rejected": f"{len(items)} notícia(s) rejeitada(s)",
    "all": f"{len(items)} notícia(s) no filtro",
}[decision_pick]
st.subheader(header_text)

if not items:
    st.info(
        "Sem notícias para os filtros atuais. "
        "Se ainda não coletou, abra o terminal e rode: "
        "`python -m esup_news.cli ingest --all --window=24h`"
    )

# Cada item
for it in items:
    terms = json.loads(it["matched_terms"] or "[]")

    with st.container():
        st.markdown(
            "<div style='margin-bottom: 1.2rem; padding-bottom: 1.2rem; "
            "border-bottom: 1px solid rgba(120,120,120,0.18);'>",
            unsafe_allow_html=True,
        )

        # Linha de tags: curso · score · fonte · tempo · estado
        decision_tag_class = {
            "pending": "tag-pending",
            "approved": "tag-approved",
            "rejected": "tag-rejected",
        }.get(it["decision"], "tag-pending")
        decision_label = {
            "pending": "PENDENTE",
            "approved": "APROVADA",
            "rejected": "REJEITADA",
        }.get(it["decision"], "PENDENTE")

        tags_html = (
            f"<span class='prisma-tag tag-curso'>{esc(it['course_name'])}</span>"
            f"<span class='prisma-tag tag-score'>SCORE {esc(it['relevance_score'])}</span>"
            f"<span class='prisma-tag tag-fonte'>{esc(it['source_name'] or it['source_domain'] or '—')}</span>"
            f"<span class='prisma-tag tag-tempo'>{esc(it['recency_bucket'] or '—')}</span>"
            f"<span class='prisma-tag {decision_tag_class}'>{decision_label}</span>"
        )
        st.markdown(tags_html, unsafe_allow_html=True)

        # Título
        st.markdown(
            f"<div class='prisma-title'>{esc(it['title'])}</div>",
            unsafe_allow_html=True,
        )

        # Descrição
        if it["description"]:
            st.markdown(
                f"<div class='prisma-subtitle'>{esc(it['description'])}</div>",
                unsafe_allow_html=True,
            )

        # Linha de metadados detalhados
        st.markdown(
            f"<div class='prisma-meta'>"
            f"Publicada em {esc(fmt_date_local(it['published_at']))} · "
            f"Idioma: {esc(it['language'] or 'desconhecido')} · "
            f"API: {esc(it['provider'])}"
            f"</div>",
            unsafe_allow_html=True,
        )

        # Termos casados (o que fez essa notícia bater nesse curso)
        if terms:
            terms_str = " · ".join(terms[:8])
            st.markdown(
                f"<div class='prisma-terms'><b>Casou com:</b> {esc(terms_str)}</div>",
                unsafe_allow_html=True,
            )

        # Link para a fonte original
        href = safe_href(it["url"])
        if href:
            st.markdown(
                f"<div class='prisma-meta' style='margin-top:0.4rem;'>"
                f'<a href="{esc(href)}" target="_blank" rel="noreferrer noopener">'
                f"Abrir notícia na fonte original ↗</a></div>",
                unsafe_allow_html=True,
            )
        else:
            st.caption("Link da fonte ausente ou fora de http/https — nao exibido.")

        # Ações
        key = f"{it['article_id']}_{it['course_id']}"
        action_cols = st.columns([1, 1, 2, 4])

        with action_cols[0]:
            if st.button("Aprovar", key=f"a_{key}", type="primary", use_container_width=True):
                set_decision(it["article_id"], it["course_id"], "approved", None)
                st.rerun()
        with action_cols[1]:
            if st.button("Rejeitar", key=f"r_{key}", use_container_width=True):
                raw_reason = st.session_state.get(f"reason_{key}", "—")
                reason = None if raw_reason == "—" else raw_reason
                set_decision(it["article_id"], it["course_id"], "rejected", reason)
                st.rerun()
        with action_cols[2]:
            st.selectbox(
                "Motivo (opcional)",
                REASONS,
                key=f"reason_{key}",
                format_func=lambda x: REASON_LABELS[x],
                label_visibility="collapsed",
            )

        # Breakdown do score (escondido por padrão para não poluir)
        with st.expander("Por que essa nota?", expanded=False):
            breakdown = json.loads(it["score_breakdown"] or "[]")
            if breakdown:
                lines = []
                for b in breakdown:
                    pts = b.get("points", 0)
                    comp = b.get("component", "?")
                    extra = b.get("term") or b.get("language") or ""
                    sinal = "+" if pts >= 0 else ""
                    line = f"`{sinal}{pts:>3}`  **{comp}**"
                    if extra:
                        line += f"  · `{extra}`"
                    lines.append(line)
                st.markdown("\n\n".join(lines))
            else:
                st.caption("Sem detalhes de score.")

        st.markdown("</div>", unsafe_allow_html=True)
