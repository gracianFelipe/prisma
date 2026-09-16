# `esup_news/` — pipeline Python

## Purpose

Coleta notícias de duas APIs (NewsData.io e The News API), normaliza,
deduplica, classifica por tema e grava em SQLite. É a origem de tudo que o
painel de curadoria e o portal mostram.

Protótipo de validação (v0.2), não produção. Existe para responder 4 perguntas
com dados reais antes de construir o sistema completo:

1. Qual API entrega mais volume útil por tema em PT-BR?
2. Quais keywords têm alta precisão e quais geram ruído?
3. Qual a taxa real de duplicidade bloqueada e quantas escapam?
4. O score automático prevê bem a decisão humana?

## Ownership

Este doc governa `esup_news/` inteiro, incluindo `providers/`, `ingestion/`,
`classification/`, `analysis/` e `seeds/`.

Fora daqui: `admin.py` e `tests/` vivem na raiz e são governados pelo
`AGENTS.md` raiz; o portal tem o seu próprio (`web/AGENTS.md`).

## Local Contracts

### Vocabulário: "curso" é o termo técnico daqui

O produto se chama **The Prism** e fala em **tema**, mas este pacote preserva o
vocabulário original de propósito, para não quebrar schema nem scripts:

| Produto / portal | Backend |
|---|---|
| tema | curso |
| `themeSlug` | `course_id` |
| — | pacote `esup_news`, tabela `courses`, flag `--course` |

Renomear isso é refactor de schema, não ajuste de texto. Não fazer de passagem.

### Estrutura

```
esup_news/
  config.py            # carrega .env, expõe settings
  db.py                # schema SQLite + trigger + helpers de conexão
  cli.py               # CLI Typer (init-db, seed, ingest, stats, report, export-web, info)
  scheduler.py         # APScheduler: 2x/dia incremental + 1x/semana
  seeds/
    courses.py         # 8 cursos com primary/secondary provider
    keywords.py        # 140 keywords por curso
  providers/
    base.py            # interface NewsProvider, FetchResult, redact()
    newsdata.py        # cliente NewsData.io (country=br quando só PT)
    thenewsapi.py      # cliente The News API
    registry.py        # get_provider(name)
  ingestion/
    normalizer.py      # canonical_url, title_hash, is_http_url, NormalizedArticle
    dedupe.py          # insert_article + tratamento de UNIQUE
    queries.py         # constrói queries OR a partir de keywords
    orchestrator.py    # roda curso por curso, aplica fallback
  classification/
    scorer.py          # score v0.2 com breakdown completo
    matcher.py         # classifica artigo em N cursos
  analysis/
    soft_duplicate.py  # detector cross-fonte (não bloqueante)
    reports.py         # cobertura, keywords, faixas de score, fallback
    web_export.py      # gera o snapshot JSON que o portal consome
```

### Princípios não-negociáveis

Compromissos arquiteturais do PRD v0.2. Não revogar sem aprovação:

- **Curadoria por par `(article_id, course_id)`**, nunca por artigo global. O
  mesmo texto pode ser aprovado para um curso e rejeitado para outro.
- **Trigger `trg_create_pending_decision`**: toda inserção em
  `article_course_matches` cria automaticamente uma linha `pending` em
  `editorial_decisions`. Não desabilitar.
- **Deduplicação bloqueante na ingestão** via `UNIQUE(url_hash)` e
  `UNIQUE(title_hash, source_domain)`. Soft duplicate é só análise offline,
  nunca bloqueia.
- **`score_breakdown` deve somar exatamente `relevance_score`**. Qualquer
  ajuste no scorer precisa preservar essa invariante (validada em
  `tests/test_scorer.py::test_score_breakdown_sums_to_score`).
- **4 gatilhos de fallback discretos**: `http_error`, `zero_results`,
  `low_unique`, `low_quality`. Cada um logado em `job_logs.fallback_reason`.
- **NewsData.io é primária para temas PT-BR**, The News API para Tecnologia.
  Híbrida para Negócios e Gestão. Está em
  `esup_news/seeds/courses.py` (nome do arquivo mantido por compatibilidade).
- **Console rich em UTF-8**: nada de caracteres acima de ASCII em mensagens
  de CLI sem antes garantir `sys.stdout.reconfigure(encoding="utf-8")`
  (Windows cp1252 quebra).
- **URL de terceiro so entra se for http/https** (IV). `is_http_url()` em
  `ingestion/normalizer.py` barra `javascript:`, `data:` e `file:`; os dois
  providers descartam o artigo na ingestao. Nao afrouxar: essa URL vira link
  clicavel no painel de curadoria e e exportada para o portal.
- **Chave de API nunca em log nem no banco**. Erro de provider passa por
  `redact()` (`providers/base.py`) antes de virar `job_logs.error_message`.

---

### Fronteira com o portal

`analysis/web_export.py` é o único ponto que fala com `web/`. Ele escreve
`web/lib/data/articles.json`, que o portal lê em build time — não existe API
entre os dois.

Duas limpezas são obrigatórias nesse export e não podem ser removidas:

- `_clean()` corta o marcador `ONLY AVAILABLE IN PAID PLANS`, que a NewsData
  devolve no corpo do artigo no plano grátis.
- `_summary()` gera o resumo curto dos cards. O texto longo fica no `body`; o
  card nunca mostra o artigo inteiro.

## Work Guidance

### Convenções de código

- Pacote organizado por **responsabilidade**, não por tipo de arquivo.
- `from __future__ import annotations` no topo de cada módulo.
- Sem docstrings longos. Linha-única explicando o **porquê** quando o "o quê"
  não está óbvio no nome.
- Sem comentários redundantes.
- Tipos em assinaturas públicas. Internas: opcional.
- IDs externos das APIs em `articles.external_id`; o JSON cru fica em
  `articles.raw_payload` (sempre serializado).

---

### Armadilhas conhecidas

- **Windows cp1252**: caracteres unicode em prints quebram a CLI. Use ASCII
  ou garanta `sys.stdout.reconfigure(encoding="utf-8")`. Já tratado em `cli.py`.
- **The News API plano grátis**: 100 requests/dia, 3 artigos por request.
  Orçamento atual de coleta (~28 req/dia) tem folga, mas qualquer mudança que
  multiplique queries por curso precisa revisar isso.
- **NewsData.io**: o filtro `country=br` é aplicado só quando a query é
  apenas em PT. Se misturar com inglês, o país é omitido para não estreitar
  demais.
- **`canonical_url`**: já lowercaseia host e tira `www.`, `utm_*`, `gclid`,
  `fbclid` e fragmento. Não duplicar essa lógica fora de `normalizer.py`.

---

- **The News API não entende `" OR "`.** As queries são montadas na forma
  canônica com `" OR "` em `ingestion/queries.py`; `thenewsapi.py` traduz para
  `" | "` no próprio provider. Query com `OR` literal volta 0 resultados sem
  erro — falha silenciosa.

### Quando atualizar este doc

- Novo módulo dentro de `esup_news/`.
- Nova tabela, coluna ou trigger no schema SQLite.
- Novo provedor de notícias.
- Mudança em qualquer princípio não-negociável acima.
- Novo comando na CLI.
- Mudança na estratégia primária/secundária por curso.

Mudança em princípio também entra no `CHANGELOG.md` da raiz, com data.

## Verification

```bash
pytest -v          # 23 testes, tudo verde em < 1s
```

Toda mudança em **normalizer, scorer ou schema** precisa vir com teste
correspondente:

- `tests/test_normalizer.py` — canonical_url, title hash, stopwords, allowlist
  de esquema (`is_http_url`) e descarte de URL perigosa na ingestão.
- `tests/test_scorer.py` — invariante da soma do breakdown, recência, exclude.
- `tests/test_dedupe.py` — UNIQUE constraints, trigger automática de pending.

## Child DOX Index

Nenhum doc filho. Os subpacotes compartilham as mesmas regras; criar um filho
só se `providers/` ou `ingestion/` ganhar contrato local que não caiba aqui
sem duplicação.
