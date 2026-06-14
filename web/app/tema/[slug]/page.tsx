import Link from "next/link";
import { notFound } from "next/navigation";
import { THEMES, getTheme } from "@/lib/mock/themes";
import { getArticlesByTheme, getFeaturedByTheme } from "@/lib/data/articles";
import { NewsCard } from "@/components/NewsCard";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";
import { formatRelative } from "@/lib/format";
import type { Metadata } from "next";

export function generateStaticParams() {
  return THEMES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) return { title: "Tema — The Prism" };
  return {
    title: `${theme.name} — The Prism`,
    description: theme.description,
  };
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) notFound();

  const featured = getFeaturedByTheme(theme.slug);
  const all = getArticlesByTheme(theme.slug);
  const rest = all.filter((a) => a.id !== featured?.id);
  const index = THEMES.findIndex((t) => t.slug === theme.slug);

  return (
    <>
      {/* Cabeçalho editorial */}
      <section className="relative overflow-hidden border-b border-paper/10">
        <Parallax distance={-50}>
          <div
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none font-serif text-[9rem] leading-none tracking-tightest text-paper/[0.03] md:text-[28rem]"
          >
            {String(index + 1).padStart(2, "0")}
          </div>
        </Parallax>
        <div className="relative mx-auto max-w-editorial px-6 pt-20 pb-16 md:px-10 md:pt-28 md:pb-24">
          <Link
            href="/"
            className="editorial-link font-mono text-[12px] uppercase tracking-eyebrow text-paper/60 hover:text-paper"
          >
            ← the prism
          </Link>

          <div className="mt-10 grid grid-cols-12 gap-6">
            <Reveal variant="rise" className="col-span-12 md:col-span-7">
              <div className="eyebrow">
                {String(index + 1).padStart(2, "0")} · tema
              </div>
              <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight md:text-[9rem] md:leading-[0.88] md:tracking-tightest letterspread">
                {theme.name}
              </h1>
            </Reveal>
            <Reveal variant="fade" stagger={1} className="col-span-12 md:col-span-5 md:pt-6">
              <p className="font-serif text-2xl leading-[1.25] tracking-tight text-paper/85 md:text-[1.55rem]">
                {theme.tagline}
              </p>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/60">
                {theme.description}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Destaque principal */}
      {featured && (
        <section className="mx-auto max-w-editorial px-6 py-16 md:px-10 md:py-24">
          <Reveal variant="fade">
            <div className="mb-10 flex items-end justify-between">
              <div className="eyebrow">em destaque</div>
              <span className="eyebrow text-paper/55">
                {formatRelative(featured.publishedAt)}
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <Reveal variant="rise" className="col-span-12 md:col-span-8">
              <Parallax distance={-20}>
                <NewsCard article={featured} size="hero" />
              </Parallax>
            </Reveal>
            <Reveal variant="fade" stagger={1} className="col-span-12 md:col-span-4 md:pt-4">
              <p className="font-serif text-xl leading-relaxed text-paper/80 md:text-2xl">
                {featured.subtitle}
              </p>
              <Link
                href={`/noticia/${featured.slug}`}
                className="mt-8 inline-flex items-center gap-2 border-b border-paper/40 pb-1 text-[14px] text-paper hover:border-accent hover:text-accent"
              >
                ler matéria completa →
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Demais notícias */}
      <section className="mx-auto max-w-editorial px-6 py-10 md:px-10 md:py-16">
        <Reveal variant="fade">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-3xl tracking-tightest md:text-5xl">
              Todas as matérias
            </h2>
            <span className="eyebrow text-paper/55">{all.length} matérias</span>
          </div>
        </Reveal>
        <ul>
          {rest.map((a, i) => {
            const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
            return (
              <Reveal as="li" key={a.id} variant="from-left" stagger={stagger}>
                <NewsCard article={a} size="list" />
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* navegação para outros temas */}
      <section className="border-t border-paper/10">
        <div className="mx-auto max-w-editorial px-6 py-16 md:px-10 md:py-24">
          <Reveal variant="fade">
            <div className="eyebrow mb-8">explorar outros temas</div>
          </Reveal>
          <div className="grid grid-cols-12 gap-x-6 md:gap-x-10 gap-y-2">
            {THEMES.filter((t) => t.slug !== theme.slug).map((t, i) => {
              const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
              return (
                <Reveal
                  key={t.slug}
                  variant="from-left"
                  stagger={stagger}
                  className="col-span-12 md:col-span-6"
                >
                  <Link
                    href={`/tema/${t.slug}`}
                    className="group grid grid-cols-12 items-baseline border-t border-paper/10 py-4"
                  >
                    <span className="col-span-9 font-serif text-xl tracking-tight text-paper transition-colors group-hover:text-accent md:text-2xl">
                      {t.name}
                    </span>
                    <span className="col-span-3 text-right text-paper/30 transition-colors group-hover:text-accent">
                      →
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
