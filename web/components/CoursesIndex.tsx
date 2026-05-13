import Link from "next/link";
import { COURSES } from "@/lib/mock/courses";
import { Reveal } from "./Reveal";

export function CoursesIndex() {
  return (
    <section
      id="cursos"
      className="border-t border-paper/10"
    >
      <div className="mx-auto max-w-editorial px-6 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-12 gap-6">
          <Reveal variant="rise" className="col-span-12 md:col-span-5">
            <div className="eyebrow">índice</div>
            <h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-tightest md:text-7xl letterspread">
              Sete cursos.
              <br />
              Sete capítulos.
            </h2>
          </Reveal>
          <Reveal
            variant="fade"
            stagger={1}
            className="col-span-12 md:col-span-6 md:col-start-7"
          >
            <p className="max-w-xl font-serif text-2xl leading-[1.25] text-paper/80 md:text-[1.55rem]">
              Cada curso vira uma seção editorial neste jornal. Role para
              encontrar destaques, leituras de fundo e o que está em pauta agora.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid grid-cols-12 gap-x-10 gap-y-1">
          {COURSES.map((c, i) => {
            const stagger = (Math.min(i, 5) as 0 | 1 | 2 | 3 | 4 | 5);
            return (
              <Reveal
                as="li"
                key={c.slug}
                variant="from-left"
                stagger={stagger}
                className="col-span-12 md:col-span-6"
              >
                <Link
                  href={`#${c.slug}`}
                  className="group grid grid-cols-12 items-baseline gap-4 border-t border-paper/10 py-5 last:border-b last:border-paper/10"
                >
                  <span className="col-span-2 font-mono text-[12px] text-paper/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-8 font-serif text-2xl tracking-tight text-paper transition-colors group-hover:text-accent md:text-3xl">
                    {c.name}
                  </span>
                  <span className="col-span-2 text-right text-paper/30 transition-colors group-hover:text-accent">
                    →
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
