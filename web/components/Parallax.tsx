"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Deslocamento máximo em px (positivo = desce; negativo = sobe). */
  distance?: number;
  className?: string;
};

/**
 * Aplica um deslocamento vertical proporcional à posição do elemento no
 * viewport, via CSS custom property --p (0..1) na div hospedeira. A classe
 * `.parallax` consome --p para deslocar o filho.
 */
export function Parallax({ children, distance = -28, className = "" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 quando o elemento está logo abaixo do viewport;
      // 1 quando passou completamente para cima.
      const raw = 1 - (rect.top + rect.height / 2) / vh;
      const clamped = Math.max(-0.4, Math.min(1.2, raw));
      el.style.setProperty("--p", clamped.toFixed(4));
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

  return (
    <div
      ref={ref}
      className={className}
      style={{ ["--parallax-y" as string]: `${distance}px` } as React.CSSProperties}
    >
      <div className="parallax">{children}</div>
    </div>
  );
}
