# Changelog

- **2026-09-15** - SEC-CHECK aplicado no backend: escape de saida (OE) nos seis
  pontos de render do `admin.py` e link da fonte restrito a http/https;
  allowlist de esquema de URL (IV) via `normalizer.is_http_url`, com descarte
  na ingestao dos dois providers; redacao da chave de API em mensagens de erro
  (`providers/base.redact`). Cinco testes novos (23 no total).

- **2026-06-13** — rebrand **Prisma → The Prism** (apenas o nome do produto;
  temas/slugs/vocabulário inalterados); chave do `localStorage`
  `prisma-theme` → `theprism-theme`; pacote npm `prisma-web` → `theprism-web`;
  nome/script do `pyproject` `prisma` → `theprism`; classes CSS `.prisma-` do
  `admin.py` mantidas.
- **2026-06-13** — rebrand **ESUP News → Prisma**. Produto deixou de ser
  amarrado à escola ESUP e virou um jornal de curadoria geral organizado por
  temas. Os 7 cursos viraram 7 temas: `direito`→`justica` (Justiça),
  `administracao`→`negocios` (Negócios),
  `sistemas-da-informacao`→`tecnologia` (Tecnologia),
  `processos-gerenciais`→`gestao` (Gestão), `pedagogia`→`educacao` (Educação),
  `ciencias-contabeis`→`financas` (Finanças),
  `psicologia`→`comportamento` (Comportamento). No portal (`web/`) o
  vocabulário "curso → tema" foi aplicado por completo: `Course`→`Theme`,
  `CourseSlug`→`ThemeSlug`, `COURSES`→`THEMES`, componentes
  `CourseBlock`→`ThemeBlock`, `CourseTracker`→`ThemeTracker`,
  `CoursesIndex`→`ThemesIndex`, mock `lib/mock/courses.ts`→`lib/mock/themes.ts`,
  rota `/curso/[slug]`→`/tema/[slug]`, chave de tema do `localStorage`
  `esup-theme`→`prisma-theme`. **Backend mantido de propósito**: pacote
  `esup_news`, tabela `courses`, flag `--course`, colunas `course_id` e nomes
  de env var **não** mudaram — só os 7 slugs/nomes dos seeds, as strings de
  marca e o texto institucional da ESUP foram ajustados.
- **2026-05-13** — v0.2 inicial: estrutura do protótipo, 7 cursos, 125
  keywords, dois provedores, scorer com breakdown, fallback com 4 gatilhos,
  Streamlit minimalista, 18 testes verdes.
- **2026-05-13** — portal público `web/` adicionado: Next.js 15 + TypeScript +
  Tailwind, App Router, home + páginas de curso + páginas de notícia, paleta
  escura (#0a0a0a / #f5f0e8 / #c8a96a), placeholders abstratos em SVG (sem
  fotos), build com 34 rotas estáticas. Ver §12.
- **2026-05-13** — sistema de temas (claro/escuro) e camada de microinterações
  de scroll adicionados ao `web/`. Tokens passaram a viver em CSS vars
  (`--ink`, `--paper`, `--accent`), Tailwind consome via `rgb(var(--...))`
  com alpha. Reveal por IntersectionObserver, Parallax via rAF + CSS custom
  property, ScrollProgress, CursorHalo, ThemeTracker sticky. Ver §12.8 e §12.9.

---

---

Registrar aqui mudança em princípio não-negociável, troca de stack, nova fase
do produto e decisão que alguém vai questionar depois. Contrato vigente mora no
`AGENTS.md` correspondente, não aqui.
