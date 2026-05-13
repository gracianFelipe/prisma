"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "esup-theme";

function readInitial(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readInitial());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  // Esconde rótulos até montar para evitar mismatch entre SSR e cliente
  const label = mounted
    ? theme === "dark"
      ? "modo claro"
      : "modo escuro"
    : "tema";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema"
      className="group inline-flex items-center gap-2 border border-paper/25 px-3 py-1.5 text-[11px] uppercase tracking-eyebrow text-paper/85 transition-colors hover:border-accent hover:text-accent"
    >
      <span
        aria-hidden
        className="relative block h-3 w-3 overflow-hidden rounded-full"
      >
        {/* Disco que cresce/encolhe simulando lua/sol */}
        <span
          className="absolute inset-0 rounded-full bg-current transition-transform duration-700 ease-editorial"
          style={{
            transform: mounted && theme === "light" ? "scale(0.55)" : "scale(1)",
          }}
        />
        <span
          className="absolute inset-0 rounded-full border border-current transition-opacity duration-700"
          style={{ opacity: mounted && theme === "light" ? 1 : 0 }}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}
