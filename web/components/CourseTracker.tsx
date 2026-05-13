"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COURSES } from "@/lib/mock/courses";

/**
 * Pequeno marcador no canto inferior esquerdo: enquanto o usuário rola pelos
 * blocos da home, mostra o nome do curso atual. Aparece só quando há um
 * bloco visível. Discreto, vertical, com numeração editorial.
 */
export function CourseTracker() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const sections = COURSES.map((c, i) => {
      const el = document.getElementById(c.slug);
      return el ? { el, index: i } : null;
    }).filter((x): x is { el: HTMLElement; index: number } => x !== null);

    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Toma o que tem maior interseção
        let best: { idx: number; ratio: number } | null = null;
        for (const e of entries) {
          const target = e.target as HTMLElement;
          const found = sections.find((s) => s.el === target);
          if (!found) continue;
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx: found.index, ratio: e.intersectionRatio };
          }
        }
        if (best) setActiveIndex(best.idx);
      },
      { threshold: [0.15, 0.35, 0.6] },
    );

    for (const s of sections) io.observe(s.el);

    // Quando saímos completamente dos blocos, esconde
    const offObserver = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting);
        if (!anyVisible) setActiveIndex(null);
      },
      { threshold: 0 },
    );
    for (const s of sections) offObserver.observe(s.el);

    return () => {
      io.disconnect();
      offObserver.disconnect();
    };
  }, []);

  if (activeIndex === null) return null;
  const course = COURSES[activeIndex];

  return (
    <Link
      href={`/curso/${course.slug}`}
      aria-label={`Ir para o curso ${course.name}`}
      className="group fixed bottom-5 left-5 z-40 hidden items-center gap-3 border border-paper/15 bg-ink/70 px-3 py-2 backdrop-blur-md transition-colors hover:border-accent md:flex"
    >
      <span className="font-mono text-[10px] uppercase tracking-eyebrow text-paper/55">
        {String(activeIndex + 1).padStart(2, "0")} / {String(COURSES.length).padStart(2, "0")}
      </span>
      <span className="h-3 w-px bg-paper/20" aria-hidden />
      <span className="font-mono text-[11px] uppercase tracking-eyebrow text-paper transition-colors group-hover:text-accent">
        {course.shortName}
      </span>
    </Link>
  );
}
