"""Seed das keywords por tema (lista inicial do PRD)."""
from __future__ import annotations

import sqlite3

KEYWORDS: dict[str, list[str]] = {
    "justica": [
        "STF", "STJ", "CNJ", "TST", "direito digital", "LGPD", "reforma tributária",
        "direito do trabalho", "direito civil", "direito penal", "direito constitucional",
        "marco civil da internet", "jurisprudência", "tribunal", "ministério público",
        "OAB", "advocacia", "compliance jurídico", "regulação",
        "inteligência artificial regulação",
    ],
    "negocios": [
        "gestão", "liderança", "estratégia", "governança corporativa", "inovação",
        "empreendedorismo", "RH", "people analytics", "cultura organizacional",
        "produtividade", "ESG", "planejamento estratégico", "gestão de projetos",
        "mercado", "modelos de negócio", "transformação digital nas empresas",
    ],
    "tecnologia": [
        "inteligência artificial", "IA generativa", "segurança da informação",
        "cibersegurança", "cloud computing", "computação em nuvem",
        "desenvolvimento de software", "engenharia de software", "banco de dados",
        "big data", "analytics", "machine learning", "API", "open source", "devops",
        "arquitetura de sistemas", "UX", "transformação digital", "LGPD tecnologia",
    ],
    "gestao": [
        "processos", "melhoria contínua", "BPM", "indicadores", "KPI",
        "gestão por processos", "logística", "cadeia de suprimentos", "supply chain",
        "qualidade", "lean", "six sigma", "operações", "planejamento operacional",
        "automação de processos", "gestão ágil",
    ],
    "educacao": [
        "educação básica", "alfabetização", "formação docente", "BNCC", "ensino híbrido",
        "metodologias ativas", "educação inclusiva", "políticas educacionais",
        "avaliação educacional", "sala de aula", "aprendizagem", "docência",
        "tecnologia educacional", "ensino infantil", "educação socioemocional",
    ],
    "financas": [
        "contabilidade", "reforma tributária", "tributos", "imposto de renda", "CFC",
        "IFRS", "auditoria", "balanço", "demonstrações financeiras",
        "compliance tributário", "controladoria", "eSocial", "nota fiscal", "fiscal",
        "planejamento tributário", "contabilidade digital",
    ],
    "comportamento": [
        "saúde mental", "ansiedade", "depressão", "psicologia clínica",
        "terapia cognitivo-comportamental", "TCC psicologia", "neuropsicologia",
        "comportamento humano", "desenvolvimento humano", "psicologia escolar",
        "psicologia organizacional", "bem-estar", "burnout", "adolescência",
        "saúde emocional",
    ],
    "saude": [
        "saúde", "medicina", "saúde pública", "SUS", "Anvisa", "ministério da saúde",
        "vacina", "medicamento", "câncer", "doença", "tratamento médico", "cirurgia",
        "diabetes", "obesidade", "nutrição", "saúde da mulher",
        "dermatologia", "estética", "harmonização facial", "cirurgia plástica",
        "procedimento estético", "skincare", "rejuvenescimento",
    ],
}

EXCLUDES: dict[str, list[str]] = {
    "justica": ["celebridades", "fofoca", "futebol", "novela"],
    "negocios": [],
    "tecnologia": [],
    "gestao": [],
    "educacao": ["concurso público fraude"],
    "financas": [],
    "comportamento": ["horóscopo", "signo", "astrologia"],
    "saude": ["fofoca", "horóscopo", "dieta milagrosa"],
}


def seed_keywords(conn: sqlite3.Connection) -> int:
    inserted = 0
    course_ids = {
        row["slug"]: row["id"]
        for row in conn.execute("SELECT id, slug FROM courses").fetchall()
    }

    for slug, terms in KEYWORDS.items():
        course_id = course_ids.get(slug)
        if not course_id:
            continue
        for term in terms:
            cur = conn.execute(
                """
                INSERT INTO keywords (course_id, term, type, weight, language, active)
                VALUES (?, ?, 'include', 1, 'pt', 1)
                ON CONFLICT(course_id, term, language) DO UPDATE SET active = 1
                """,
                (course_id, term),
            )
            inserted += cur.rowcount

    for slug, terms in EXCLUDES.items():
        course_id = course_ids.get(slug)
        if not course_id:
            continue
        for term in terms:
            cur = conn.execute(
                """
                INSERT INTO keywords (course_id, term, type, weight, language, active)
                VALUES (?, ?, 'exclude', 1, 'pt', 1)
                ON CONFLICT(course_id, term, language) DO UPDATE SET type = 'exclude', active = 1
                """,
                (course_id, term),
            )
            inserted += cur.rowcount

    return inserted
