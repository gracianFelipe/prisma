import Link from "next/link";
import { Reveal } from "./Reveal";
import { Parallax } from "./Parallax";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-editorial px-6 pt-20 pb-28 md:px-10 md:pt-28 md:pb-40">
        <Reveal variant="fade">
          <div className="eyebrow">edição corrente — maio 2026</div>
        </Reveal>

        <h1 className="mt-8 font-serif text-[12vw] leading-[1.02] tracking-tight md:text-[8rem] md:leading-[0.86] md:tracking-tightest lg:text-[10rem]">
          <Reveal variant="rise" stagger={0} className="block letterspread">
            As notícias
          </Reveal>
          <Reveal variant="rise" stagger={1} className="block letterspread">
            que importam,
          </Reveal>
          <Parallax distance={-32}>
            <Reveal variant="rise" stagger={2} className="block letterspread text-accent">
              por tema.
            </Reveal>
          </Parallax>
        </h1>

        <div className="mt-14 grid grid-cols-12 gap-6 md:mt-20">
          <Reveal variant="fade" stagger={1} className="col-span-12 md:col-span-7">
            <p className="max-w-2xl font-serif text-2xl leading-[1.25] tracking-tight text-paper/85 md:text-[1.7rem]">
              Um jornal de curadoria pensado para quem quer ler já conectado
              ao presente. Seleção semanal de Justiça, Negócios, Tecnologia,
              Gestão, Educação, Finanças, Comportamento e Saúde.
            </p>
          </Reveal>

          <Reveal
            variant="fade"
            stagger={2}
            className="col-span-12 flex items-end justify-start md:col-span-4 md:col-start-9 md:justify-end"
          >
            <div className="flex flex-col items-start gap-4 md:items-end">
              <Link
                href="#temas"
                className="group inline-flex items-center gap-3 border-b border-paper/40 py-2 text-[14px] tracking-[0.04em] text-paper hover:border-accent hover:text-accent"
              >
                explorar por tema
                <span className="transition-transform group-hover:translate-x-1">↓</span>
              </Link>
              <Link
                href="#ultimas"
                className="group inline-flex items-center gap-3 py-2 text-[14px] tracking-[0.04em] text-paper/60 hover:text-paper"
              >
                ver últimas notícias
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Marcação editorial */}
      <div className="mx-auto max-w-editorial px-6 md:px-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between border-t border-paper/15 py-5">
          <span className="eyebrow">vol. 01</span>
          <span className="eyebrow">8 temas · curadoria editorial</span>
          <span className="eyebrow">the prism</span>
        </div>
      </div>
    </section>
  );
}
