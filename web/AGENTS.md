# `web/` — portal público The Prism

## Purpose

Portal editorial público em **Next.js 15 (App Router) + TypeScript + Tailwind**,
gerado 100% estático (SSG). Publica a curadoria já aprovada: não tem backend
próprio, não fala com o SQLite em tempo de execução e não expõe API.

No portal o conceito editorial chama-se **tema** (`Theme` / `themeSlug`). É o
mesmo que o backend Python chama de "curso" (`course_id`); a tradução acontece
só na fronteira de dados. Ver `esup_news/AGENTS.md`.

## Ownership

Este doc governa tudo sob `web/`. O que **não** é daqui:

- Geração do snapshot de dados (`lib/data/articles.json`) — é do comando
  `export-web` do backend, governado por `esup_news/AGENTS.md`.
- Deploy na Vercel — Root Directory do projeto é `web`, e domínio público se
  adiciona com `vercel domains add`, não `vercel alias set` (URL crua de
  deployment fica 401 por Deployment Protection).

## Local Contracts

### Stack (não trocar sem aprovação)

- **Next.js 15.5.19** (App Router) + **React 19.2.7**. A faixa anterior a
  15.5.x tem CVE bloqueante no build da Vercel — não voltar atrás.
- **TypeScript 5.6** em modo `strict`.
- **Tailwind CSS 3.4** com tokens próprios. Sem `shadcn`, sem Material, sem
  biblioteca de UI.
- **Fontes do sistema** (Times/Georgia serif, Inter/Helvetica sans). Não
  carregar Google Fonts via CDN.
- **Imagens**: SVG procedural determinístico (`components/AbstractCover.tsx`).
  Sem foto de banco neste estágio.
- Não acrescentar biblioteca de animação ou de UI sem discutir. O custo de
  bundle e de contexto é alto e o visual atual não precisa.

### Fonte de dados

O portal lê **um snapshot JSON commitado**, não o banco:

- `lib/data/articles.json` — gerado por `python -m esup_news.cli export-web`.
- `lib/data/articles.ts` — tipa o snapshot e expõe `getArticlesByTheme`,
  `getArticleBySlug`, `getFeaturedByTheme`, `getRelated`, `getLatest`.
- `lib/mock/themes.ts` — **canônico**, não é mock: é a definição dos 8 temas
  que todo componente importa. O nome da pasta ficou por histórico.

Ao trocar a origem dos dados, **manter as assinaturas** de `lib/data/articles.ts`
para que as páginas não precisem mudar.

`Article` (`lib/types.ts`) espelha o que o backend produz: `id`, `slug`,
`themeSlug`, `title`, `subtitle`, `body`, `source`, `publishedAt` (ISO 8601),
`externalUrl`, `featured`, `imageSeed`.

> `externalUrl` vem de API de terceiro. O backend já barra esquema fora de
> http/https na ingestão; não reintroduzir esse link sem validação.

### Paleta oficial (não trocar sem aprovação)
Paleta oficial (não trocar sem aprovação)

- Fundo principal: `#0a0a0a` (`bg-ink`)
- Texto principal: `#f5f0e8` (`text-paper`)
- Acento: `#c8a96a` (`text-accent`)
- Variações de texto: `text-paper/85`, `text-paper/70`, `text-paper/60`,
  `text-paper/40` — não usar cinzas arbitrários.

### Princípios visuais (não-negociáveis)
Princípios visuais (não-negociáveis)

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
- **Ritmo na home**: a função `ThemeBlock` alterna 4 variantes
  (`image-left`, `image-right`, `stacked`, `split-grid`) por índice. Não
  remover essa variação — é o que cria o "storytelling de scroll".

### Sistema de temas (claro/escuro)
Sistema de temas (claro/escuro)

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
- A preferência é persistida em `localStorage` com a chave `theprism-theme`.
  Se não houver preferência salva, segue `prefers-color-scheme`.
- O botão de troca está em `components/ThemeToggle.tsx`, presente no Header.
- A troca usa transição `0.6s` em `background-color` e `color` no body. Não
  troca abruptamente.

**Não retornar para classes `bg-[#hex]` literais.** Toda cor é via token,
para que o tema responda sem retoque.

### Camada de microinterações de scroll
Camada de microinterações de scroll

Tudo é **CSS + JS pequeno**. Sem Framer Motion, sem GSAP. Cada peça respeita
`prefers-reduced-motion` e cai para estado final imediato quando o usuário
optou por menos movimento.

| Componente | Função |
|---|---|
| `Reveal` | Aparece quando entra no viewport. Variantes: `fade`, `rise`, `from-left`. Stagger via prop. Usa `IntersectionObserver`. |
| `Parallax` | Desloca um filho proporcionalmente ao scroll, via `requestAnimationFrame` + CSS custom property `--p` (0..1). |
| `ScrollProgress` | Linha fina dourada no topo (transform: scaleX) + ticker `nn / 100` no canto inferior direito. |
| `CursorHalo` | Halo dourado suave que segue o cursor com easing. Aparece só em `(pointer: fine)`. |
| `ThemeTracker` | Pílula fixa no canto inferior esquerdo que mostra o tema atual enquanto rola pelos blocos da home. |

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

## Work Guidance

### Estrutura

```
web/
├── app/
│   ├── layout.tsx                 # shell + Header + Footer
│   ├── page.tsx                   # home
│   ├── globals.css                # tokens base, eyebrow, editorial-link
│   ├── icon.png / apple-icon.png  # favicon e ícone iOS
│   ├── tema/[slug]/page.tsx       # página de tema (SSG)
│   └── noticia/[slug]/page.tsx    # página de notícia (SSG)
├── components/
│   ├── Header.tsx / MobileMenu.tsx / Footer.tsx
│   ├── Hero.tsx / LatestStrip.tsx / ThemesIndex.tsx / Closing.tsx
│   ├── ThemeBlock.tsx             # bloco de tema na home (4 variantes)
│   ├── NewsCard.tsx               # card de notícia (5 tamanhos)
│   ├── AbstractCover.tsx          # SVG procedural por seed
│   ├── PrismMark.tsx              # marca do header, com spin periódico
│   ├── ThemeScript.tsx / ThemeToggle.tsx / ThemeTracker.tsx
│   └── Reveal.tsx / Parallax.tsx / ScrollProgress.tsx / CursorHalo.tsx
├── lib/
│   ├── types.ts / format.ts
│   ├── data/                      # snapshot real (articles.json + .ts)
│   └── mock/themes.ts             # definição dos 8 temas
└── tailwind.config.ts / tsconfig.json / next.config.mjs
```

### Convenções específicas do `web/`
Convenções específicas do `web/`

- Componentes em **PascalCase**, em `components/`.
- Páginas seguem App Router; `params` agora é `Promise` (Next 15).
- Slugs de notícia são **kebab-case do título** sem stopwords; gerados no
  backend Python (ver `esup_news/ingestion/normalizer.py`).
- Nunca usar `<img>` cru — usar `AbstractCover` para mocks; quando entrar foto
  real, trocar para `next/image`.
- Não acrescentar bibliotecas de animação ou UI sem discutir. O custo de
  contexto e bundle é alto e o visual atual não precisa.

### Mobile

O portal é acessado por celular; toda mudança de layout precisa passar em
**375px de largura**.

- **Grid de 12 colunas com `gap-x` grande estoura o viewport**: 11 gutters ×
  40px (`gap-x-10`) já passam de 375px sozinhos. Usar `gap-x-6 md:gap-x-10`
  e `gap-6 md:gap-10` — gutter pequeno no mobile, generoso a partir de `md`.
- `CursorHalo` é escondido fora de `(pointer: fine)`. Não reativar no touch.
- Navegação no mobile é o `MobileMenu`, com fundo opaco (translúcido sobre
  texto editorial fica ilegível).

## Verification

```bash
cd web
npm install              # primeira vez
npm run dev              # http://localhost:3000
npx tsc --noEmit         # typecheck — precisa passar limpo
npm run build            # SSG: 1 rota por notícia + 8 rotas de tema
npm start                # serve o build de produção
```

Depois de qualquer mudança que renomeie export de `lib/`, rodar `npx tsc
--noEmit` no `web/` inteiro — renomear em um arquivo e esquecer o consumidor
já quebrou o build aqui antes.

## Child DOX Index

Nenhum doc filho. `app/`, `components/` e `lib/` seguem as mesmas regras e não
têm contrato local próprio; criar um filho só se uma dessas pastas ganhar regra
que não caiba aqui sem duplicação.
