import Link from "next/link";
import { Reveal } from "./Reveal";
import { Parallax } from "./Parallax";

export function Closing() {
  return (
    <section className="border-t border-paper/10">
      <div className="mx-auto max-w-editorial px-6 py-24 md:px-10 md:py-36">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            <Reveal variant="fade">
              <div className="eyebrow">colofão</div>
            </Reveal>
            <Parallax distance={-24}>
              <Reveal variant="rise" stagger={1}>
                <h2 className="mt-6 font-serif text-5xl leading-[0.95] tracking-tightest md:text-[7rem] letterspread">
                  Leia o que <span className="text-accent">importa</span> no
                  <br />
                  seu curso.
                </h2>
              </Reveal>
            </Parallax>
            <Reveal variant="fade" stagger={2}>
              <p className="mt-10 max-w-2xl font-serif text-2xl leading-[1.25] text-paper/75 md:text-[1.55rem]">
                O ESUP News reúne, em um só lugar, as notícias mais atuais das
                áreas que você estuda. Sem dispersão, com curadoria, no ritmo de
                um jornal feito para ser lido com calma.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal variant="fade" stagger={3}>
          <div className="mt-16 flex flex-wrap items-center gap-8">
            <Link
              href="/curso/direito"
              className="group inline-flex items-center gap-3 border-b border-paper/40 pb-2 text-[14px] tracking-[0.04em] text-paper hover:border-accent hover:text-accent"
            >
              começar por Direito
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="#cursos"
              className="editorial-link text-[14px] tracking-[0.04em] text-paper/60 hover:text-paper"
            >
              ou escolher outro curso
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
