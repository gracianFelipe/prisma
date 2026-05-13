"use client";

import { useEffect, useState } from "react";

/**
 * Linha fina no topo (escala horizontalmente conforme a leitura avança) +
 * um pequeno ticker no canto inferior direito com a porcentagem da página.
 * Sem JS lib externa, sem layout shift.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const p = doc.scrollTop / scrollable;
      setProgress(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left"
        style={{
          transform: `scaleX(${progress})`,
          background:
            "linear-gradient(90deg, rgb(var(--accent) / 0.0), rgb(var(--accent)) 40%, rgb(var(--accent)))",
          transition: "transform 0.12s linear",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-5 right-5 z-50 hidden font-mono text-[10px] uppercase tracking-eyebrow text-paper/55 md:block"
      >
        {String(pct).padStart(2, "0")} / 100
      </div>
    </>
  );
}
