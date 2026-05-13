import Link from "next/link";
import { COURSES } from "@/lib/mock/courses";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-paper/10">
      <div className="mx-auto max-w-editorial px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-serif text-3xl tracking-tightest md:text-4xl">
              Esup <span className="text-accent">News</span>
            </div>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/70">
              Um jornal online dos cursos da ESUP. Curadoria semanal, leitura sem ruído.
            </p>
          </div>

          <div className="md:col-span-4">
            <div className="eyebrow mb-4">cursos</div>
            <ul className="space-y-2 text-[14px]">
              {COURSES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/curso/${c.slug}`}
                    className="editorial-link text-paper/85 hover:text-paper"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow mb-4">edição</div>
            <p className="text-[13px] leading-relaxed text-paper/60">
              Os textos exibidos neste protótipo são fictícios e servem para
              ilustrar a experiência editorial em desenvolvimento.
            </p>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-paper/10 pt-6">
          <span className="eyebrow">© esup news — 2026</span>
          <span className="eyebrow">prototype · v0.1</span>
        </div>
      </div>
    </footer>
  );
}
