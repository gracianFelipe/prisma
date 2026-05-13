# AGENTS.md — guia para agentes de IA trabalhando neste repositório

> Este arquivo é o ponto de entrada para qualquer IA que vá editar este projeto.
> Leia antes de começar. Atualize ao final de mudanças relevantes (ver §10).

O repositório contém **duas frentes**: o **protótipo de validação** em Python
(coleta, classificação, curadoria — descrito a seguir) e o **portal público
editorial** em Next.js, em `web/` (descrito na §12).

---

## 1. O que é este projeto

**ESUP News — protótipo de validação (v0.2).** Sistema local em Python que
coleta notícias de duas APIs (NewsData.io e The News API), normaliza,
deduplica, classifica por curso da ESUP, e expõe um painel Streamlit para
curadoria humana. O objetivo do protótipo é responder 4 perguntas com dados
reais antes de construir o sistema completo:

1. Qual API entrega mais volume útil por curso em PT-BR?
2. Quais keywords têm alta precisão e quais geram ruído?
3. Qual a taxa real de duplicidade bloqueada e quantas escapam?
4. O score automático prevê bem a decisão humana?

Não é produção. Não há frontend público nesta fase.

---

## 2. Stack oficial (não trocar sem autorização)

- Python **3.11+**
- **SQLite** (arquivo em `data/esup_news.db`)
- **Streamlit** para curadoria
- **Typer + Rich** para CLI
- **httpx** para HTTP
- **APScheduler** para rodadas agendadas
- **pandas + openpyxl** para relatórios

Dependências em `pyproject.toml`. Instalar com `pip install -e ".[dev]"` dentro
de um venv.

---

## 3. Estrutura do projeto

```
esup_news/
  config.py            # carrega .env, expõe settings
  db.py                # schema SQLite + trigger + helpers de conexão
  cli.py               # CLI Typer (init-db, seed, ingest, stats, report, ...)
  scheduler.py         # APScheduler: 2x/dia incremental + 1x/semana
  seeds/
    courses.py         # 7 cursos com primary/secondary provider
    keywords.py        # keywords iniciais por curso (PRD)
  providers/
    base.py            # interface NewsProvider + FetchResult
    newsdata.py        # cliente NewsData.io (country=br quando só PT)
    thenewsapi.py      # cliente The News API
    registry.py        # get_provider(name)
  ingestion/
    normalizer.py      # canonical_url, title_hash, NormalizedArticle
    dedupe.py          # insert_article + tratamento de UNIQUE
    queries.py         # constrói queries OR a partir de keywords
    orchestrator.py    # roda curso por curso, aplica fallback
  classification/
    scorer.py          # score v0.2 com breakdown completo
    matcher.py         # classifica artigo em N cursos
  analysis/
    soft_duplicate.py  # detector cross-fonte (não bloqueante)
    reports.py         # cobertura, keywords, faixas de score, fallback
admin.py               # Streamlit (raiz, executado por `streamlit run`)
tests/                 # pytest (test_normalizer, test_scorer, test_dedupe)
```

---

## 4. Princípios não-negociáveis

Estes são compromissos arquiteturais do PRD v0.2. Não revogar sem aprovação:

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
- **NewsData.io é primária para cursos PT-BR**, The News API para SI.
  Híbrida para Administração e Processos Gerenciais. Está em
  `esup_news/seeds/courses.py`.
- **Console rich em UTF-8**: nada de caracteres acima de ASCII em mensagens
  de CLI sem antes garantir `sys.stdout.reconfigure(encoding="utf-8")`
  (Windows cp1252 quebra).

---

## 5. Como rodar localmente

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
python -m esup_news.cli ingest --course=direito --window=24h

# análise
python -m esup_news.cli stats --by=course
python -m esup_news.cli stats --by=keyword --min-volume=5
python -m esup_news.cli stats --by=score-bucket
python -m esup_news.cli detect-soft-duplicates --since=24h
python -m esup_news.cli report --out=relatorio.xlsx

# curadoria
streamlit run admin.py

# scheduler (opcional, mantém processo vivo)
python -m esup_news.scheduler
```

Testes: `pytest -v` (18 testes, deve passar tudo em < 1s).

---

## 6. Estilo visual do Streamlit

A direção visual é **minimalista e editorial, inspirada no MAD**:

- Paleta neutra (fundo creme `#fafaf7`, texto quase-preto `#111`).
- Tipografia serifada (Times) em títulos, sans (Inter/Helvetica) em corpo.
- Sem cards coloridos, sem sombras pesadas, sem ícones decorativos.
- Separadores por linha fina, não por caixas.
- Botões retangulares (border-radius 0), borda preta sólida.

Mudanças visuais não devem virar dashboard corporativo genérico.

---

## 7. Convenções de código

- Pacote organizado por **responsabilidade**, não por tipo de arquivo.
- `from __future__ import annotations` no topo de cada módulo.
- Sem docstrings longos. Linha-única explicando o **porquê** quando o "o quê"
  não está óbvio no nome.
- Sem comentários redundantes.
- Tipos em assinaturas públicas. Internas: opcional.
- IDs externos das APIs em `articles.external_id`; o JSON cru fica em
  `articles.raw_payload` (sempre serializado).

---

## 8. Testes

- `tests/test_normalizer.py` — canonicalização de URL, title hash, stopwords.
- `tests/test_scorer.py` — invariante da soma do breakdown, recência, exclude.
- `tests/test_dedupe.py` — UNIQUE constraints, trigger automática de pending.

Toda mudança em normalizer, scorer ou schema **precisa** vir com teste
correspondente. Rodar `pytest` antes de pedir review.

---

## 9. Erros conhecidos e armadilhas

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

## 10. Como atualizar este arquivo

**Após qualquer mudança grande no projeto, atualize o AGENTS.md.**

Mudança grande = qualquer uma destas:

- Novo módulo ou pacote dentro de `esup_news/`.
- Nova tabela, coluna ou trigger no schema SQLite.
- Novo provedor de notícias.
- Mudança nos princípios da §4 (ex.: trocar dedupe, mudar política de
  fallback, mexer no score breakdown).
- Nova dependência em `pyproject.toml` ou troca de stack.
- Novo comando na CLI.
- Mudança na estratégia primária/secundária por curso.
- Nova fase do produto (sair do protótipo, virar produto).

Como atualizar:

1. Edite a seção pertinente (estrutura, princípios, comandos, armadilhas).
2. Mantenha o tom direto e objetivo. Sem "este documento descreve...".
3. Se algo da §4 mudou, registre na §11 (changelog) com a data.

---

## 11. Changelog

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
  property, ScrollProgress, CursorHalo, CourseTracker sticky. Ver §12.8 e §12.9.

---

## 12. Portal público (`web/`)

Aplicação **Next.js 15 (App Router) + TypeScript + Tailwind CSS** em
`c:\scripts\esup-news\web\`. Independente do backend Python — hoje usa mocks,
no futuro consumirá os dados via API leve a partir do SQLite.

### 12.1 Stack e dependências

- **Next.js 15.0.3** com App Router e React 19 (RC compatível).
- **TypeScript 5.6** em modo `strict`.
- **Tailwind CSS 3.4** com tokens próprios (sem `shadcn`, sem Material, sem
  bibliotecas de UI).
- **Fontes do sistema** (Times/Georgia para serif editorial, Inter/Helvetica
  para sans). Não carregar Google Fonts via CDN.
- **Imagens**: placeholders SVG procedurais determinísticos
  (`components/AbstractCover.tsx`). Sem fotos de banco neste estágio.

### 12.2 Paleta oficial (não trocar sem aprovação)

- Fundo principal: `#0a0a0a` (`bg-ink`)
- Texto principal: `#f5f0e8` (`text-paper`)
- Acento: `#c8a96a` (`text-accent`)
- Variações de texto: `text-paper/85`, `text-paper/70`, `text-paper/60`,
  `text-paper/40` — não usar cinzas arbitrários.

### 12.3 Estrutura de pastas

```
web/
├── app/
│   ├── layout.tsx                 # shell + Header + Footer
│   ├── page.tsx                   # home
│   ├── globals.css                # tokens base, eyebrow, editorial-link
│   ├── curso/[slug]/page.tsx      # página de curso (SSG)
│   └── noticia/[slug]/page.tsx    # página de notícia (SSG)
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── LatestStrip.tsx            # tira "desta semana"
│   ├── CoursesIndex.tsx           # índice "sete cursos, sete capítulos"
│   ├── CourseBlock.tsx            # bloco de curso na home (4 variantes)
│   ├── NewsCard.tsx               # card de notícia (5 tamanhos)
│   └── AbstractCover.tsx          # SVG procedural por seed
├── lib/
│   ├── types.ts                   # Course, Article, CourseSlug
│   ├── format.ts                  # formatDate, formatRelative
│   └── mock/
│       ├── courses.ts             # 7 cursos
│       └── articles.ts            # 23 notícias mockadas
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

### 12.4 Princípios visuais (não-negociáveis)

- **Editorial, não dashboard.** Sem cards coloridos, sem sombras pesadas, sem
  ícones decorativos, sem badges genéricos.
- **Tipografia faz o peso visual**: serif grande para títulos
  (`font-serif tracking-tightest`), sans para corpo. Tamanhos hero podem
  chegar a `text-[10rem]` em desktop.
- **Espaço negativo generoso**: `py-20` é o mínimo de uma seção; `py-28`
  e `py-36` são comuns em fechamentos.
- **Microinterações sutis**: `editorial-link` (sublinhado animado),
  `hover-zoom` (SVG cresce 2%), `animate-rise`/`animate-fade` no hero.
  Nada de Framer Motion neste estágio.
- **Ritmo na home**: a função `CourseBlock` alterna 4 variantes
  (`image-left`, `image-right`, `stacked`, `split-grid`) por índice. Não
  remover essa variação — é o que cria o "storytelling de scroll".

### 12.5 Comandos

```bash
cd web
npm install              # primeira vez
npm run dev              # http://localhost:3000
npm run build            # gera estáticos (34 rotas hoje)
npm start                # serve build de produção
```

### 12.6 Modelo de dados (mock → futuro backend)

`Article` em `lib/types.ts` espelha o que o backend Python produz:
`id`, `slug`, `courseSlug`, `title`, `subtitle`, `body`, `source`,
`publishedAt` (ISO 8601), `externalUrl`, `featured`, `imageSeed`.

Quando o backend for conectado, criar `lib/data/` com funções de mesmo nome
que `lib/mock/` (`getArticlesByCourse`, `getArticleBySlug`, `getFeaturedByCourse`,
`getRelated`, `getLatest`), implementadas em cima de uma API leve do Python
(provavelmente FastAPI lendo o SQLite). Manter a assinatura idêntica para que
as páginas não precisem mudar.

### 12.8 Sistema de temas (claro/escuro)

Tokens semânticos vivem em **CSS custom properties** em `app/globals.css`:

```css
:root, [data-theme="dark"]  { --ink: 10 10 10;   --paper: 245 240 232; --accent: 200 169 106; ... }
[data-theme="light"]        { --ink: 244 240 232;--paper: 17 16 14;    --accent: 138 95 30;   ... }
```

Tailwind os consome via `rgb(var(--...) / <alpha-value>)`. As classes seguem
iguais (`bg-ink`, `text-paper`, `text-accent`) — só a paleta resolvida muda.

- O atributo `data-theme="dark|light"` é fixado em `<html>` por
  `components/ThemeScript.tsx`, um `<script>` síncrono inline no `<head>`.
  Roda antes do React hidratar — **sem flash**.
- A preferência é persistida em `localStorage` com a chave `esup-theme`.
  Se não houver preferência salva, segue `prefers-color-scheme`.
- O botão de troca está em `components/ThemeToggle.tsx`, presente no Header.
- A troca usa transição `0.6s` em `background-color` e `color` no body. Não
  troca abruptamente.

**Não retornar para classes `bg-[#hex]` literais.** Toda cor é via token,
para que o tema responda sem retoque.

### 12.9 Camada de microinterações de scroll

Tudo é **CSS + JS pequeno**. Sem Framer Motion, sem GSAP. Cada peça respeita
`prefers-reduced-motion` e cai para estado final imediato quando o usuário
optou por menos movimento.

| Componente | Função |
|---|---|
| `Reveal` | Aparece quando entra no viewport. Variantes: `fade`, `rise`, `from-left`. Stagger via prop. Usa `IntersectionObserver`. |
| `Parallax` | Desloca um filho proporcionalmente ao scroll, via `requestAnimationFrame` + CSS custom property `--p` (0..1). |
| `ScrollProgress` | Linha fina dourada no topo (transform: scaleX) + ticker `nn / 100` no canto inferior direito. |
| `CursorHalo` | Halo dourado suave que segue o cursor com easing. Aparece só em `(pointer: fine)`. |
| `CourseTracker` | Pílula fixa no canto inferior esquerdo que mostra o curso atual enquanto rola pelos blocos da home. |

Convenções:

- **Sempre passar pelo `Reveal`** para introduzir um bloco editorial novo.
  Nunca duplicar IntersectionObserver inline.
- **`Parallax` só em capa, título hero ou numerais decorativos.** Não usar
  em corpo de texto — cansa.
- **`letterspread`** é uma utility que afina o tracking durante a entrada
  do título. Aplicar só em títulos grandes (H1/H2 hero), nunca em corpo.
- Animações de scroll consomem o estado via `data-revealed="true|false"`,
  então qualquer estilização adicional deve usar esse seletor — não inventar
  novas variáveis de estado.

### 12.10 Convenções específicas do `web/`

- Componentes em **PascalCase**, em `components/`.
- Páginas seguem App Router; `params` agora é `Promise` (Next 15).
- Slugs de notícia são **kebab-case do título** sem stopwords; gerados no
  backend Python (ver `esup_news/ingestion/normalizer.py`).
- Nunca usar `<img>` cru — usar `AbstractCover` para mocks; quando entrar foto
  real, trocar para `next/image`.
- Não acrescentar bibliotecas de animação ou UI sem discutir. O custo de
  contexto e bundle é alto e o visual atual não precisa.
