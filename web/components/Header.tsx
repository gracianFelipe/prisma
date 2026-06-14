import Link from "next/link";
import { THEMES } from "@/lib/mock/themes";
import { ThemeToggle } from "./ThemeToggle";
import { PrismMark } from "./PrismMark";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-paper/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <PrismMark size={26} className="prism-spin shrink-0" />
          <span className="font-serif text-[1.55rem] font-medium leading-none tracking-tightest">
            The Prism
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {THEMES.slice(0, 5).map((t) => (
            <Link
              key={t.slug}
              href={`/tema/${t.slug}`}
              className="editorial-link text-[13px] tracking-[0.04em] text-paper/80 hover:text-paper"
            >
              {t.shortName}
            </Link>
          ))}
          <Link
            href="/#temas"
            className="editorial-link text-[13px] tracking-[0.04em] text-paper/60 hover:text-paper"
          >
            todos os temas
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/#temas"
            className="hidden text-[12px] uppercase tracking-eyebrow text-paper/70 hover:text-paper md:inline"
          >
            menu
          </Link>
        </div>
      </div>
    </header>
  );
}
