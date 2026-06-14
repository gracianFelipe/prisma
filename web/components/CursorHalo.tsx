"use client";

import { useEffect, useRef } from "react";

/**
 * Halo dourado bem suave que segue o cursor com leve atraso. Aparece somente
 * em pointer fino (desktop) e respeita reduced-motion. Sem libs, sem impacto
 * em layout — vive em z-0 atrás do conteúdo, com `mix-blend` para integrar.
 */
export function CursorHalo() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqPointer = window.matchMedia("(pointer: fine)");
    if (mqMotion.matches || !mqPointer.matches) {
      el.style.display = "none";
      return;
    }

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const loop = () => {
      raf = 0;
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) {
        raf = requestAnimationFrame(loop);
      }
    };

    const onEnter = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("a, button, [role='button']")) {
        el.dataset.hot = "true";
      } else {
        el.dataset.hot = "false";
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onEnter, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onEnter);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[420px] w-[420px] rounded-full opacity-60 mix-blend-screen transition-[opacity,filter] duration-500 md:block"
      style={{
        background:
          "radial-gradient(closest-side, rgb(var(--accent) / 0.18), rgb(var(--accent) / 0.06) 40%, transparent 70%)",
        filter: "blur(20px)",
        transform: "translate3d(50vw, 50vh, 0) translate(-50%, -50%)",
      }}
      data-hot="false"
    />
  );
}
