"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Estilo de entrada. Mapeia para classe `.reveal*` em globals.css. */
  variant?: "fade" | "rise" | "from-left";
  /** Atraso em "passos" de 90ms (0..5). */
  stagger?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Quanto do elemento precisa entrar no viewport para disparar. */
  amount?: number;
  /** Classe extra (mantém composição). */
  className?: string;
  as?: "div" | "section" | "article" | "header" | "ol" | "ul" | "li";
};

export function Reveal({
  children,
  variant = "fade",
  stagger = 0,
  amount = 0.18,
  className = "",
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  const variantClass =
    variant === "rise" ? "reveal-rise" : variant === "from-left" ? "reveal-from-left" : "reveal";

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      data-revealed={revealed ? "true" : "false"}
      data-stagger={stagger}
      className={`${variantClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
