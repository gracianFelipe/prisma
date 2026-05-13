import Link from "next/link";
import type { Article } from "@/lib/types";
import { AbstractCover } from "./AbstractCover";
import { formatRelative } from "@/lib/format";
import { getCourse } from "@/lib/mock/courses";

type Size = "hero" | "feature" | "regular" | "compact" | "list";

type Props = {
  article: Article;
  size?: Size;
  showCourse?: boolean;
};

export function NewsCard({ article, size = "regular", showCourse = false }: Props) {
  const course = getCourse(article.courseSlug);
  const href = `/noticia/${article.slug}`;

  if (size === "list") {
    return (
      <Link href={href} className="group block border-t border-paper/10 py-7">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            {showCourse && course && (
              <div className="eyebrow mb-3">{course.label}</div>
            )}
            <h3 className="font-serif text-2xl leading-[1.15] tracking-tightest text-paper transition-colors group-hover:text-accent md:text-3xl">
              {article.title}
            </h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-paper/70">
              {article.subtitle}
            </p>
          </div>
          <div className="col-span-12 flex items-start justify-between gap-4 text-paper/55 md:col-span-3 md:flex-col md:items-end md:gap-2">
            <span className="eyebrow">{article.source}</span>
            <span className="eyebrow">{formatRelative(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  const ratio =
    size === "hero" ? "wide" : size === "feature" ? "wide" : size === "compact" ? "square" : "wide";

  const titleClasses =
    size === "hero"
      ? "font-serif text-4xl leading-[1.05] tracking-tightest md:text-6xl"
      : size === "feature"
        ? "font-serif text-3xl leading-[1.08] tracking-tightest md:text-4xl"
        : size === "compact"
          ? "font-serif text-xl leading-[1.15] tracking-tightest md:text-2xl"
          : "font-serif text-2xl leading-[1.1] tracking-tightest md:text-[1.7rem]";

  const subtitleClasses =
    size === "compact"
      ? "mt-2 text-[13px] leading-relaxed text-paper/65 line-clamp-2"
      : "mt-3 text-[15px] leading-relaxed text-paper/70 line-clamp-3";

  return (
    <Link href={href} className="group block">
      <div className="overflow-hidden">
        <div className="hover-zoom">
          <AbstractCover seed={article.imageSeed} ratio={ratio} />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showCourse && course && <span className="eyebrow">{course.label}</span>}
        </div>
        <span className="eyebrow">{formatRelative(article.publishedAt)}</span>
      </div>
      <h3 className={`mt-2 ${titleClasses} text-paper transition-colors group-hover:text-accent`}>
        {article.title}
      </h3>
      <p className={subtitleClasses}>{article.subtitle}</p>
      <div className="mt-4 flex items-center gap-3 text-paper/55">
        <span className="eyebrow">{article.source}</span>
      </div>
    </Link>
  );
}
