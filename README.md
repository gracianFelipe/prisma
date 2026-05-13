<div align="center">

# ESUP News

**Um jornal online para os alunos da ESUP.**
Notícias dos sete cursos da instituição, em uma experiência editorial digital com curadoria semanal.

```
Direito · Administração · Sistemas da Informação · Processos Gerenciais
Pedagogia · Ciências Contábeis · Psicologia
```

[Visão geral](#visão-geral) ·
[Arquitetura](#arquitetura) ·
[Como rodar](#como-rodar) ·
[Estrutura](#estrutura-do-repositório) ·
[Roadmap](#roadmap)

</div>

---

## Visão geral

O ESUP News é um agregador editorial de notícias por curso. O sistema é dividido em **duas frentes que vivem no mesmo repositório**:

| Frente | Stack | Onde |
|---|---|---|
| **Backend / protótipo** de ingestão, classificação e curadoria | Python 3.11 · SQLite · Streamlit · APScheduler | `esup_news/`, `admin.py` |
| **Portal público** com experiência editorial | Next.js 15 · TypeScript · Tailwind CSS | `web/` |

A ideia central é simples: em vez de mandar o aluno caçar notícias por aí, o ESUP News coleta automaticamente, classifica por curso, pontua relevância e expõe um jornal digital com visual autoral.

> Esta primeira fase é um **protótipo de validação**. O foco é responder, com dados reais, se a estratégia de coleta funciona para cada curso — antes de construir o produto completo.

---

## Arquitetura

```
                            ┌──────────────────────────┐
                            │  NewsData.io · The News  │
                            │       API (HTTPS)         │
                            └────────────┬─────────────┘
                                         │ coleta agendada
                                         ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │ esup_news/  ─  Python                                            │
   │                                                                  │
   │   providers/   ─►  normalizer  ─►  dedupe  ─►  matcher  ─►  DB   │
   │   (NewsData,        (canonical    (UNIQUE       (score +         │
   │    The News)         URL, hash    constraints)   breakdown)      │
   │                       de título)                                 │
   │                                                                  │
   │   scheduler ──►  orchestrator (4 gatilhos de fallback)           │
   └──────────────────────┬─────────────────────────┬─────────────────┘
                          │                         │
                  SQLite (data/esup_news.db)        │
                          │                         │
                          ▼                         ▼
              ┌────────────────────────┐   ┌────────────────────────┐
              │  admin.py — Streamlit  │   │  web/ — Next.js portal │
              │   curadoria humana     │   │  experiência editorial │
              └────────────────────────┘   └────────────────────────┘
```

### Coleta

Cada curso tem uma fonte **primária** e uma **secundária**:

| Curso | Primária | Secundária | Idioma |
|---|---|---|---|
| Direito, Pedagogia, Contábeis, Psicologia | NewsData.io | The News API | pt |
| Administração, Processos Gerenciais | NewsData.io | The News API | pt + en |
| Sistemas da Informação | The News API | NewsData.io | en + pt |

A secundária só é acionada quando algum destes **quatro gatilhos** ocorre:
`http_error` · `zero_results` · `low_unique` (< 3 artigos novos) · `low_quality` (< 2 acima do corte de relevância).

### Classificação

Cada artigo casa com `N` cursos. Para cada par `(artigo, curso)`, um **score** é calculado e o **breakdown** é guardado linha a linha — para que decisões editoriais possam recalibrar o sistema com evidência real.

| Componente | Pontos |
|---|--:|
| termo no título | +5 |
| termo na descrição | +3 |
| termo nas keywords da API | +4 |
| categoria compatível | +2 |
| publicado nas últimas 24h | +3 |
| idioma preferencial do curso | +2 |
| veio da fonte primária | +1 |
| termo de exclusão encontrado | −8 |

Corte mínimo: **6**. Configurável por `.env`.

### Curadoria

A curadoria é feita **por par `(artigo, curso)`** — não por artigo. O mesmo texto pode ser aprovado para Sistemas da Informação e rejeitado para Administração. A decisão fica registrada com motivo (`good`, `off_topic`, `low_quality`, `duplicate`, `paywall`, `outdated`).

Um *trigger* SQL garante que toda nova ligação artigo↔curso já nasça com decisão `pending`.

---

## Portal público (`web/`)

Aplicação **Next.js 15** com App Router. Visual editorial inspirado em jornais contemporâneos, sem aparência de dashboard.

**Paleta oficial:**

| Token | Escuro (padrão) | Claro |
|---|---|---|
| `--ink` (fundo) | `#0a0a0a` | `#f4f0e8` |
| `--paper` (texto) | `#f5f0e8` | `#11100e` |
| `--accent` | `#c8a96a` | `#8a5f1e` |

**O que tem dentro:**

- **Home com storytelling vertical** — hero tipográfico, tira de últimas, índice "Sete cursos, sete capítulos", 7 blocos de curso com 4 variações de layout que alternam para criar ritmo, fechamento editorial.
- **Página por curso** (`/curso/[slug]`) — destaque principal, lista completa de matérias, navegação para os outros cursos.
- **Página de notícia** (`/noticia/[slug]`) — título serifado generoso, capa em SVG procedural, corpo com largura de prosa, relacionadas do mesmo curso.
- **Sistema de tema claro/escuro** com persistência em `localStorage` e script anti-flash no `<head>`.
- **Microinterações de scroll**: reveal por `IntersectionObserver`, parallax via `requestAnimationFrame`, barra de progresso no topo, halo do cursor (só em pointer fino), tracker do curso atual fixo no canto.

> Tudo respeita `prefers-reduced-motion`. Nenhuma biblioteca de animação foi instalada — só CSS e pequenos `useEffect`. Bundle compartilhado: ~110 kB.

---

## Como rodar

### Backend (protótipo Python)

```bash
# venv
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # Linux/macOS

pip install -e ".[dev]"

# config
cp .env.example .env              # preencha NEWSDATA_API_KEY e THENEWSAPI_API_KEY

# banco
python -m esup_news.cli init-db
python -m esup_news.cli seed      # 7 cursos + 125 keywords

# coleta manual
python -m esup_news.cli ingest --course=direito --window=24h
python -m esup_news.cli ingest --all --window=12h

# análise
python -m esup_news.cli stats --by=course
python -m esup_news.cli stats --by=keyword --min-volume=5
python -m esup_news.cli stats --by=score-bucket
python -m esup_news.cli detect-soft-duplicates --since=24h
python -m esup_news.cli report --out=relatorio.xlsx

# curadoria
streamlit run admin.py

# scheduler (2 rodadas/dia + 1 semanal)
python -m esup_news.scheduler
```

Chaves gratuitas em [newsdata.io](https://newsdata.io/register) e [thenewsapi.com](https://www.thenewsapi.com/register).

### Portal público (Next.js)

```bash
cd web
npm install
npm run dev                       # http://localhost:3000
```

Comandos extras:

```bash
npm run build                     # build de produção (34 rotas estáticas)
npm start                         # serve build
```

### Testes

```bash
pytest                            # 18 testes (normalizer, scorer, dedupe)
```

---

## Estrutura do repositório

```
esup-news/
├── esup_news/                    # backend Python
│   ├── cli.py                    # Typer: init-db, seed, ingest, stats, report
│   ├── db.py                     # schema SQLite + trigger
│   ├── config.py
│   ├── scheduler.py              # APScheduler
│   ├── seeds/                    # 7 cursos + keywords
│   ├── providers/                # NewsData.io · The News API
│   ├── ingestion/                # normalizer · dedupe · orchestrator
│   ├── classification/           # scorer com breakdown · matcher
│   └── analysis/                 # soft_duplicate · reports
├── admin.py                      # painel Streamlit de curadoria
├── tests/                        # pytest
│
├── web/                          # portal público
│   ├── app/                      # App Router
│   │   ├── page.tsx              # home
│   │   ├── curso/[slug]/page.tsx
│   │   └── noticia/[slug]/page.tsx
│   ├── components/               # Header, Hero, CourseBlock, NewsCard, ...
│   └── lib/
│       ├── types.ts
│       └── mock/                 # dados mockados em PT-BR
│
├── AGENTS.md                     # guia para agentes de IA
├── pyproject.toml
└── README.md
```

---

## Critérios de validação do protótipo

O protótipo é considerado **bem-sucedido** se, em 7 a 14 dias de coleta + curadoria, conseguir responder com números:

1. **Cobertura por API** — qual fonte entrega mais volume útil em PT-BR por curso?
2. **Qualidade das keywords** — quais geram ruído (< 30% de aprovação) e quais geram precisão (> 70%)?
3. **Duplicidade** — qual a taxa real bloqueada pelos hashes e quantas escapam?
4. **Score** — correlação de Spearman > 0.4 entre score e decisão humana; corte editorial com precisão ≥ 70%.

Cobertura mínima alvo por curso: **20 artigos coletados** e **8 aprovados ou 30% de aprovação**.

---

## Roadmap

- [x] Protótipo de ingestão + classificação + curadoria
- [x] Painel Streamlit minimalista para curadoria
- [x] Portal público com home, curso e notícia
- [x] Tema claro/escuro com persistência
- [x] Microinterações de scroll respeitando `reduced-motion`
- [ ] **Operação real de 7 a 14 dias** com as APIs preenchidas
- [ ] API leve (FastAPI) expondo o SQLite para o portal
- [ ] Conectar portal ao backend (sair dos mocks)
- [ ] Edição semanal publicada
- [ ] Dashboard de calibragem de score

---

## Notas técnicas

- **Trigger SQL** (`trg_create_pending_decision`) garante que toda nova ligação artigo↔curso já nasça com decisão `pending`. Não desabilitar.
- **Deduplicação bloqueante** via `UNIQUE(url_hash)` e `UNIQUE(title_hash, source_domain)`. Soft duplicate é apenas análise offline.
- **`score_breakdown` deve somar exatamente ao `relevance_score`** — invariante coberta por teste.
- **Console Windows em cp1252** quebra com caracteres acima de ASCII; o CLI força UTF-8 em `sys.stdout`.
- O guia completo para agentes de IA que vão editar este repositório está em [`AGENTS.md`](./AGENTS.md).

---

<div align="center">

Feito com curadoria · ESUP News · 2026

</div>
