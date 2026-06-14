import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ARTICLES,
  getArticleBySlug,
  getRelated,
} from "@/lib/data/articles";
import { getTheme } from "@/lib/mock/themes";
import { AbstractCover } from "@/components/AbstractCover";
import { NewsCard } from "@/components/NewsCard";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";
import { formatDate, formatRelative } from "@/lib/format";
import type { Metadata } from "next";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

// Quebra o texto em parágrafos. Se vier sem quebras de linha (comum nas APIs),
// agrupa ~3 frases por parágrafo para dar respiro à leitura.
function toParagraphs(text: string): string[] {
  const byBreak = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byBreak.length > 1) return byBreak;
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (!sentences) return [text.trim()];
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paras.push(sentences.slice(i, i + 3).join(" ").trim());
  }
  return paras.length ? paras : [text.trim()];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return { title: "Matéria — The Prism" };
  return { title: `${a.title} — The Prism`, description: a.subtitle };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const theme = getTheme(article.themeSlug);
  const related = getRelated(article, 3);

  return (
    <article>
      <div className="mx-auto max-w-editorial px-6 pt-12 md:px-10 md:pt-20">
        <Link
          href={theme ? `/tema/${theme.slug}` : "/"}
          className="editorial-link font-mono text-[12px] uppercase tracking-eyebrow text-paper/60 hover:text-paper"
        >
          ← {theme?.label ?? "The Prism"}
        </Link>
      </div>

      {/* Título e meta */}
      <header className="mx-auto max-w-editorial px-6 pt-12 pb-10 md:px-10 md:pt-16 md:pb-14">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            <Reveal variant="fade">
              <div className="eyebrow text-accent">{theme?.label}</div>
            </Reveal>
            <Reveal variant="rise" stagger={1}>
              <h1 className="mt-6 font-serif text-3xl leading-[1.12] tracking-tight md:text-[5.5rem] md:leading-[0.98] md:tracking-tightest letterspread">
                {article.title}
              </h1>
            </Reveal>
            <Reveal variant="fade" stagger={2}>
              <p className="mt-8 max-w-3xl font-serif text-2xl leading-[1.3] text-paper/80 md:text-[1.7rem]">
                {article.subtitle}
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal variant="fade" stagger={3}>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 md:gap-x-10 gap-y-3 border-t border-paper/15 pt-6 text-paper/65">
            <span className="eyebrow">fonte · {article.source}</span>
            <span className="eyebrow">{formatDate(article.publishedAt)}</span>
            <span className="eyebrow">{formatRelative(article.publishedAt)}</span>
          </div>
        </Reveal>
      </header>

      {/* Capa */}
      <Reveal variant="rise">
        <div className="mx-auto max-w-editorial px-6 md:px-10">
          <Parallax distance={-30}>
            <AbstractCover seed={article.imageSeed} ratio="wide" />
          </Parallax>
        </div>
      </Reveal>

      {/* Corpo */}
      <div className="mx-auto max-w-prose px-6 py-12 md:py-24">
        <Reveal variant="fade">
          {article.body.trim() ? (
            <div className="space-y-6 font-serif text-xl leading-[1.6] text-paper/95 md:text-[1.35rem] md:leading-[1.65]">
              {toParagraphs(article.body).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="font-serif text-xl leading-relaxed text-paper/80">
              Esta matéria está disponível na íntegra no veículo de origem.
            </p>
          )}
        </Reveal>

        <Reveal variant="fade" stagger={1}>
          <p className="mt-10 text-[16px] leading-relaxed text-paper/80">
            Este é um resumo curado pelo The Prism a partir da publicação original.
            O texto completo está disponível no veículo de origem, no link abaixo.
          </p>
        </Reveal>

        <Reveal variant="fade" stagger={2}>
          <div className="mt-12 border-t border-paper/15 pt-6">
            <a
              href={article.externalUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="editorial-link text-[14px] tracking-[0.04em] text-accent hover:text-paper"
            >
              ler a matéria original em {article.source} ↗
            </a>
          </div>
        </Reveal>
      </div>

      {/* Relacionadas */}
      {related.length > 0 && (
        <section className="border-t border-paper/10">
          <div className="mx-auto max-w-editorial px-6 py-12 md:px-10 md:py-28">
            <Reveal variant="fade">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="eyebrow">continue lendo</div>
                  <h2 className="mt-3 font-serif text-3xl tracking-tightest md:text-5xl">
                    Mais em {theme?.shortName}
                  </h2>
                </div>
                {theme && (
                  <Link
                    href={`/tema/${theme.slug}`}
                    className="editorial-link font-mono text-[12px] uppercase tracking-eyebrow text-paper/60 hover:text-paper"
                  >
                    todas as matérias →
                  </Link>
                )}
              </div>
            </Reveal>
            <div className="grid grid-cols-12 gap-x-6 md:gap-x-10 gap-y-14">
              {related.map((r, i) => {
                const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
                return (
                  <Reveal
                    key={r.id}
                    variant="rise"
                    stagger={stagger}
                    className="col-span-12 md:col-span-4"
                  >
                    <NewsCard article={r} size="compact" />
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
