import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ARTICLES,
  getArticleBySlug,
  getRelated,
} from "@/lib/mock/articles";
import { getCourse } from "@/lib/mock/courses";
import { AbstractCover } from "@/components/AbstractCover";
import { NewsCard } from "@/components/NewsCard";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";
import { formatDate, formatRelative } from "@/lib/format";
import type { Metadata } from "next";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return { title: "Matéria — ESUP News" };
  return { title: `${a.title} — ESUP News`, description: a.subtitle };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const course = getCourse(article.courseSlug);
  const related = getRelated(article, 3);

  return (
    <article>
      <div className="mx-auto max-w-editorial px-6 pt-12 md:px-10 md:pt-20">
        <Link
          href={course ? `/curso/${course.slug}` : "/"}
          className="editorial-link font-mono text-[12px] uppercase tracking-eyebrow text-paper/60 hover:text-paper"
        >
          ← {course?.label ?? "ESUP News"}
        </Link>
      </div>

      {/* Título e meta */}
      <header className="mx-auto max-w-editorial px-6 pt-12 pb-10 md:px-10 md:pt-16 md:pb-14">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            <Reveal variant="fade">
              <div className="eyebrow text-accent">{course?.label}</div>
            </Reveal>
            <Reveal variant="rise" stagger={1}>
              <h1 className="mt-6 font-serif text-4xl leading-[1.02] tracking-tightest md:text-[5.5rem] md:leading-[0.98] letterspread">
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
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-paper/15 pt-6 text-paper/65">
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
      <div className="mx-auto max-w-prose px-6 py-16 md:py-24">
        <Reveal variant="fade">
          <p className="font-serif text-2xl leading-[1.45] text-paper md:text-[1.5rem]">
            {article.body}
          </p>
        </Reveal>

        <Reveal variant="fade" stagger={1}>
          <p className="mt-10 text-[16px] leading-relaxed text-paper/80">
            As informações apresentadas neste protótipo são ilustrativas e fazem
            parte do material editorial do ESUP News em desenvolvimento. Para a
            versão final, cada matéria estará vinculada a uma fonte verificável.
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
          <div className="mx-auto max-w-editorial px-6 py-20 md:px-10 md:py-28">
            <Reveal variant="fade">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <div className="eyebrow">continue lendo</div>
                  <h2 className="mt-3 font-serif text-3xl tracking-tightest md:text-5xl">
                    Mais em {course?.shortName}
                  </h2>
                </div>
                {course && (
                  <Link
                    href={`/curso/${course.slug}`}
                    className="editorial-link font-mono text-[12px] uppercase tracking-eyebrow text-paper/60 hover:text-paper"
                  >
                    todas as matérias →
                  </Link>
                )}
              </div>
            </Reveal>
            <div className="grid grid-cols-12 gap-x-10 gap-y-14">
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
