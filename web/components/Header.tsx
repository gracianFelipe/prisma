import Link from "next/link";
import { COURSES } from "@/lib/mock/courses";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-paper/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-[1.55rem] font-medium leading-none tracking-tightest">
            Esup
          </span>
          <span className="font-serif text-[1.55rem] font-medium leading-none tracking-tightest text-accent">
            News
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {COURSES.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/curso/${c.slug}`}
              className="editorial-link text-[13px] tracking-[0.04em] text-paper/80 hover:text-paper"
            >
              {c.shortName}
            </Link>
          ))}
          <Link
            href="/#cursos"
            className="editorial-link text-[13px] tracking-[0.04em] text-paper/60 hover:text-paper"
          >
            todos os cursos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/#cursos"
            className="hidden text-[12px] uppercase tracking-eyebrow text-paper/70 hover:text-paper md:inline"
          >
            menu
          </Link>
        </div>
      </div>
    </header>
  );
}
