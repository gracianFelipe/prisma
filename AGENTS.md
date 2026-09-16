# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:
- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

- Responder em **português**.
- Segurança é checklist explícito: ver SEC-CHECK acima. Ao revisar código, não
  inventar problema onde não há nem forçar princípio que não se encaixa no
  contexto do arquivo.

## Child DOX Index

| Doc | Escopo | Governa |
|---|---|---|
| `esup_news/AGENTS.md` | `esup_news/**` | Pipeline Python: providers, ingestão, classificação, análise, seeds, CLI, scheduler |
| `web/AGENTS.md` | `web/**` | Portal Next.js estático: stack, paleta, layout, temas, microinterações, mobile |

Fica nesta raiz, sem doc filho:

- `admin.py` — painel Streamlit de curadoria (ver "Painel de curadoria").
- `tests/` — o contrato de teste está em `esup_news/AGENTS.md`, porque é o que
  as suítes cobrem.
- `docs/checklist-seguranca.md` — padrão SEC-CHECK, obrigatório (ver abaixo).
- `CHANGELOG.md` — histórico datado de decisões.

Criar um doc filho novo quando uma pasta ganhar regra local que não caiba no
doc mais próximo sem duplicação.

## Segurança (SEC-CHECK)
Todo código escrito ou editado neste repo deve seguir as 12 regras de
`docs/checklist-seguranca.md` (secrets, injection, IV/OE, authn/authz,
fail secure, deps, headers, rate limit, IDOR/SSRF, logging).
Se violar alguma, avise antes de entregar.

Para auditoria completa de um arquivo específico, use o prompt da seção 0
desse mesmo arquivo.

---

# The Prism — contrato raiz

## Purpose

**The Prism** é um jornal de curadoria organizado por temas. O repositório tem
duas frentes que se falam por um único arquivo:

1. **Backend Python** (`esup_news/`) — coleta, deduplica, classifica e guarda
   em SQLite; gera o snapshot `web/lib/data/articles.json`.
2. **Portal público** (`web/`) — Next.js estático que lê esse snapshot em build
   time.

Não há API entre os dois. O backend roda local; o portal é publicado na Vercel.

> **Nomenclatura.** O produto e o portal falam em **tema**. O backend Python
> preserva **"curso"** como termo técnico (pacote `esup_news`, tabela
> `courses`, flag `--course`, coluna `course_id`), de propósito. Detalhe em
> `esup_news/AGENTS.md`.

## Ownership

Esta raiz é o rail DOX: contrato de segurança, stack, comandos, `admin.py` e o
índice acima. Detalhe de implementação mora no doc filho mais próximo.

## Local Contracts

### Stack oficial (não trocar sem autorização)

- Python **3.11+** · **SQLite** (`data/esup_news.db`) · **Streamlit** para
  curadoria · **Typer + Rich** para CLI · **httpx** para HTTP ·
  **APScheduler** para rodadas agendadas · **pandas + openpyxl** para relatórios.
- Portal: Next.js + TypeScript + Tailwind (versões em `web/AGENTS.md`).

Dependências Python em `pyproject.toml`; instalar com `pip install -e ".[dev]"`
dentro de um venv.

### Segredos

Chaves vivem **só** no `.env`, que está no `.gitignore` junto de `.vercel`.
`NEWSDATA_API_KEY`, `THENEWSAPI_API_KEY` e `VERCEL_TOKEN` nunca entram em
commit, log, banco ou mensagem de chat. `.env.example` é o arquivo versionado.

### Painel de curadoria (`admin.py`)

`admin.py` renderiza com `unsafe_allow_html=True`, então **todo dado vindo de
API de terceiro é escapado antes de virar HTML** (OE): título, descrição,
fonte, idioma e termos passam obrigatoriamente por `esc()`. Link da fonte só
sai por `safe_href()` — sem URL http/https, não vira link. Nunca interpolar
valor de API direto no markup.

Direção visual **minimalista e editorial, inspirada no MAD**:

- Paleta neutra (fundo creme `#fafaf7`, texto quase-preto `#111`).
- Tipografia serifada (Times) em títulos, sans (Inter/Helvetica) em corpo.
- Sem cards coloridos, sem sombras pesadas, sem ícones decorativos.
- Separadores por linha fina, não por caixas.
- Botões retangulares (border-radius 0), borda preta sólida.

Mudança visual não deve virar dashboard corporativo genérico.

## Work Guidance

```bash
# venv
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -e ".[dev]"

# config
cp .env.example .env            # preencha NEWSDATA_API_KEY e THENEWSAPI_API_KEY

# banco
python -m esup_news.cli init-db
python -m esup_news.cli seed

# coleta manual
python -m esup_news.cli ingest --all --window=12h
python -m esup_news.cli ingest --course=justica --window=24h

# análise
python -m esup_news.cli stats --by=course
python -m esup_news.cli stats --by=keyword --min-volume=5
python -m esup_news.cli stats --by=score-bucket
python -m esup_news.cli detect-soft-duplicates --since=24h
python -m esup_news.cli report --out=relatorio.xlsx
python -m esup_news.cli info

# publica os aprovados no portal
python -m esup_news.cli export-web

# curadoria
streamlit run admin.py

# scheduler (opcional, mantém processo vivo)
python -m esup_news.scheduler
```

Console rich em UTF-8: nada acima de ASCII em mensagem de CLI sem garantir
`sys.stdout.reconfigure(encoding="utf-8")` — cp1252 do Windows quebra.

## Verification

```bash
pytest -v                        # backend: 23 testes
cd web && npx tsc --noEmit       # portal: typecheck
cd web && npm run build          # portal: SSG completo
```

Rodar a verificação da frente que você tocou antes de pedir review.
