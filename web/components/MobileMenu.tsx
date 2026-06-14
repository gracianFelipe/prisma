"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { THEMES } from "@/lib/mock/themes";

// Navegação mobile: o <nav> do Header fica oculto abaixo de md, então aqui
// damos um hambúrguer que abre a lista de temas. Só aparece no mobile (md:hidden).
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 flex h-11 w-11 items-center justify-center text-paper/80 hover:text-paper"
      >
        <span className="relative block h-[14px] w-5" aria-hidden="true">
          <span
            className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300 ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-paper/10 bg-ink shadow-2xl shadow-black/40">
          <nav className="mx-auto max-w-editorial px-6 pb-4">
            <ul className="flex flex-col">
              {THEMES.map((t, i) => (
                <li key={t.slug}>
                  <Link
                    href={`/tema/${t.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-t border-paper/10 py-3.5 font-serif text-xl text-paper transition-colors hover:text-accent"
                  >
                    <span>{t.name}</span>
                    <span className="font-mono text-[11px] text-paper/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#temas"
                  onClick={() => setOpen(false)}
                  className="block border-t border-paper/10 py-3.5 font-mono text-[12px] uppercase tracking-eyebrow text-paper/60 hover:text-paper"
                >
                  todos os temas
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
