import Link from "next/link";
import type { Theme } from "@/lib/types";
import { getArticlesByTheme, getFeaturedByTheme } from "@/lib/data/articles";
import { NewsCard } from "./NewsCard";
import { AbstractCover } from "./AbstractCover";
import { formatRelative } from "@/lib/format";
import { Reveal } from "./Reveal";
import { Parallax } from "./Parallax";

type Variant = "image-left" | "image-right" | "stacked" | "split-grid";

type Props = {
  theme: Theme;
  index: number;
};

export function ThemeBlock({ theme, index }: Props) {
  const featured = getFeaturedByTheme(theme.slug);
  const articles = getArticlesByTheme(theme.slug);
  const secondary = articles.filter((a) => a.id !== featured?.id).slice(0, 4);

  const variants: Variant[] = ["image-left", "image-right", "stacked", "split-grid"];
  const variant = variants[index % variants.length];

  if (!featured) return null;

  return (
    <section
      id={theme.slug}
      className="relative overflow-hidden border-t border-paper/10 py-14 md:py-28"
      aria-labelledby={`title-${theme.slug}`}
    >
      {/* Número decorativo gigante atrás do bloco, com parallax sutil */}
      <Parallax distance={-60}>
        <div
          aria-hidden
          className="pointer-events-none absolute right-4 top-10 select-none font-serif text-[7rem] leading-none tracking-tightest text-paper/[0.025] md:right-10 md:text-[24rem]"
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      </Parallax>

      <div className="relative mx-auto max-w-editorial px-6 md:px-10">
        <ThemeHeader theme={theme} index={index} />

        {variant === "image-left" && (
          <ImageLeft theme={theme} featured={featured} secondary={secondary} />
        )}
        {variant === "image-right" && (
          <ImageRight theme={theme} featured={featured} secondary={secondary} />
        )}
        {variant === "stacked" && (
          <Stacked theme={theme} featured={featured} secondary={secondary} />
        )}
        {variant === "split-grid" && (
          <SplitGrid theme={theme} featured={featured} secondary={secondary} />
        )}

        <Reveal variant="fade">
          <div className="mt-14 flex justify-end">
            <Link
              href={`/tema/${theme.slug}`}
              className="editorial-link font-mono text-[12px] uppercase tracking-eyebrow text-accent hover:text-paper"
            >
              ver tudo sobre {theme.shortName.toLowerCase()} →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ThemeHeader({ theme, index }: { theme: Theme; index: number }) {
  const idx = String(index + 1).padStart(2, "0");
  return (
    <div className="mb-12 grid grid-cols-12 gap-6 md:mb-16">
      <Reveal variant="rise" className="col-span-12 md:col-span-4">
        <div className="eyebrow">{idx} · tema</div>
        <h2
          id={`title-${theme.slug}`}
          className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight md:text-7xl md:leading-[0.95] md:tracking-tightest letterspread"
        >
          {theme.name}
        </h2>
      </Reveal>
      <Reveal
        variant="fade"
        stagger={1}
        className="col-span-12 md:col-span-7 md:col-start-6"
      >
        <p className="font-serif text-2xl leading-[1.25] tracking-tight text-paper/85 md:text-[1.65rem]">
          {theme.tagline}
        </p>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-paper/60">
          {theme.description}
        </p>
      </Reveal>
    </div>
  );
}

type VariantProps = {
  theme: Theme;
  featured: NonNullable<ReturnType<typeof getFeaturedByTheme>>;
  secondary: ReturnType<typeof getArticlesByTheme>;
};

function ImageLeft({ featured, secondary }: VariantProps) {
  return (
    <div className="grid grid-cols-12 gap-x-6 md:gap-x-10 gap-y-12">
      <Reveal variant="rise" className="col-span-12 md:col-span-7">
        <Parallax distance={-18}>
          <NewsCard article={featured} size="feature" />
        </Parallax>
      </Reveal>
      <div className="col-span-12 space-y-7 md:col-span-5">
        {secondary.slice(0, 3).map((a, i) => {
          const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
          return (
            <Reveal key={a.id} variant="from-left" stagger={stagger}>
              <Link
                href={`/noticia/${a.slug}`}
                className="group block border-b border-paper/10 pb-7 last:border-b-0"
              >
                <span className="eyebrow">{formatRelative(a.publishedAt)}</span>
                <h4 className="mt-2 font-serif text-xl leading-[1.2] tracking-tight text-paper transition-colors group-hover:text-accent md:text-2xl">
                  {a.title}
                </h4>
                <p className="mt-2 text-[13px] leading-relaxed text-paper/60 line-clamp-2">
                  {a.subtitle}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function ImageRight({ featured, secondary }: VariantProps) {
  return (
    <div className="grid grid-cols-12 gap-x-6 md:gap-x-10 gap-y-12">
      <div className="col-span-12 space-y-7 md:col-span-5">
        {secondary.slice(0, 3).map((a, i) => {
          const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
          return (
            <Reveal key={a.id} variant="from-left" stagger={stagger}>
              <Link
                href={`/noticia/${a.slug}`}
                className="group block border-b border-paper/10 pb-7 last:border-b-0"
              >
                <span className="eyebrow">{formatRelative(a.publishedAt)}</span>
                <h4 className="mt-2 font-serif text-xl leading-[1.2] tracking-tight text-paper transition-colors group-hover:text-accent md:text-2xl">
                  {a.title}
                </h4>
                <p className="mt-2 text-[13px] leading-relaxed text-paper/60 line-clamp-2">
                  {a.subtitle}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
      <Reveal variant="rise" className="col-span-12 md:col-span-7">
        <Parallax distance={-18}>
          <NewsCard article={featured} size="feature" />
        </Parallax>
      </Reveal>
    </div>
  );
}

function Stacked({ featured, secondary }: VariantProps) {
  return (
    <div className="space-y-14">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <Reveal variant="rise" className="col-span-12 md:col-span-8 md:col-start-3">
          <Parallax distance={-24}>
            <NewsCard article={featured} size="hero" />
          </Parallax>
        </Reveal>
      </div>
      <div className="grid grid-cols-12 gap-x-6 md:gap-x-10 gap-y-10">
        {secondary.slice(0, 3).map((a, i) => {
          const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
          return (
            <Reveal
              key={a.id}
              variant="fade"
              stagger={stagger}
              className="col-span-12 md:col-span-4"
            >
              <NewsCard article={a} size="compact" />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function SplitGrid({ theme, featured, secondary }: VariantProps) {
  return (
    <div className="grid grid-cols-12 gap-x-6 md:gap-x-10 gap-y-12">
      <Reveal variant="rise" className="col-span-12 md:col-span-5">
        <Parallax distance={-30}>
          <div className="relative">
            <AbstractCover seed={`${theme.slug}-mark`} ratio="tall" intensity="soft" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
              <div className="eyebrow text-paper/70">vitrine</div>
              <div className="mt-2 font-serif text-2xl leading-[1.15] tracking-tight text-paper md:text-4xl md:leading-[1.05] md:tracking-tightest">
                {theme.name}
              </div>
            </div>
          </div>
        </Parallax>
      </Reveal>
      <div className="col-span-12 md:col-span-7">
        <Reveal variant="fade">
          <NewsCard article={featured} size="feature" />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {secondary.slice(0, 2).map((a, i) => {
            const stagger = ((i + 1) as 1 | 2);
            return (
              <Reveal key={a.id} variant="fade" stagger={stagger}>
                <NewsCard article={a} size="compact" />
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
