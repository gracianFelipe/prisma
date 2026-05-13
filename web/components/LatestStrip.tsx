import Link from "next/link";
import { getLatest } from "@/lib/mock/articles";
import { getCourse } from "@/lib/mock/courses";
import { formatRelative } from "@/lib/format";
import { Reveal } from "./Reveal";

export function LatestStrip() {
  const items = getLatest(6);
  return (
    <section
      id="ultimas"
      className="mx-auto max-w-editorial px-6 py-16 md:px-10 md:py-24"
    >
      <Reveal variant="fade">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="eyebrow">desta semana</div>
            <h2 className="mt-3 font-serif text-3xl tracking-tightest md:text-5xl">
              Últimas notícias
            </h2>
          </div>
          <Link
            href="#cursos"
            className="editorial-link font-mono text-[12px] uppercase tracking-eyebrow text-paper/60 hover:text-paper"
          >
            navegar por curso
          </Link>
        </div>
      </Reveal>

      <ul>
        {items.map((a, i) => {
          const c = getCourse(a.courseSlug);
          const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
          return (
            <Reveal as="li" key={a.id} variant="from-left" stagger={stagger}>
              <Link
                href={`/noticia/${a.slug}`}
                className="group grid grid-cols-12 items-baseline gap-6 border-t border-paper/10 py-6 last:border-b last:border-paper/10"
              >
                <span className="col-span-12 md:col-span-2 eyebrow text-paper/55">
                  {formatRelative(a.publishedAt)}
                </span>
                <span className="col-span-12 md:col-span-2 eyebrow text-accent">
                  {c?.shortName}
                </span>
                <h3 className="col-span-12 font-serif text-2xl leading-[1.15] tracking-tight text-paper transition-colors group-hover:text-accent md:col-span-7 md:text-[1.6rem]">
                  {a.title}
                </h3>
                <span className="col-span-12 hidden text-right text-paper/40 transition-colors group-hover:text-accent md:col-span-1 md:block">
                  →
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
