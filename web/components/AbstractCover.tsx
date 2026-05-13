import type { CSSProperties } from "react";

/** Hash determinístico simples (string -> int positivo). */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let s = hash(seed);
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

type Variant = "arch" | "lines" | "discs" | "grid" | "split" | "wave";

const VARIANTS: Variant[] = ["arch", "lines", "discs", "grid", "split", "wave"];

type Props = {
  seed: string;
  ratio?: "wide" | "tall" | "square";
  intensity?: "soft" | "bold";
  className?: string;
};

export function AbstractCover({
  seed,
  ratio = "wide",
  intensity = "bold",
  className = "",
}: Props) {
  const r = rng(seed);
  const v: Variant = VARIANTS[Math.floor(r() * VARIANTS.length)];

  const aspect =
    ratio === "tall" ? "aspect-[3/4]" : ratio === "square" ? "aspect-square" : "aspect-[16/10]";

  const accentAlpha = intensity === "bold" ? 0.85 : 0.45;
  const paperAlpha = intensity === "bold" ? 0.08 : 0.05;

  const style: CSSProperties = {
    background: `radial-gradient(120% 90% at ${20 + r() * 60}% ${20 + r() * 60}%, rgba(200,169,106,${paperAlpha * 0.8}) 0%, transparent 60%), #0d0d0c`,
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${aspect} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={`g-${seed}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#c8a96a" stopOpacity={accentAlpha} />
            <stop offset="100%" stopColor="#7a6940" stopOpacity={accentAlpha * 0.4} />
          </linearGradient>
        </defs>

        {v === "arch" && <Arch r={r} grad={`url(#g-${seed})`} />}
        {v === "lines" && <Lines r={r} accentAlpha={accentAlpha} />}
        {v === "discs" && <Discs r={r} grad={`url(#g-${seed})`} />}
        {v === "grid" && <Grid r={r} accentAlpha={accentAlpha} />}
        {v === "split" && <Split r={r} grad={`url(#g-${seed})`} />}
        {v === "wave" && <Wave r={r} grad={`url(#g-${seed})`} />}

        {/* grão sutil */}
        <rect width="160" height="100" fill="url(#noise)" opacity="0.04" />
      </svg>

      {/* vinheta */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(0,0,0,0.55)_0%,transparent_60%)]" />
    </div>
  );
}

type SubProps = { r: () => number; grad?: string; accentAlpha?: number };

function Arch({ r, grad }: SubProps) {
  const cx = 30 + r() * 100;
  const cy = 80 + r() * 30;
  const rad = 60 + r() * 40;
  return (
    <>
      <circle cx={cx} cy={cy} r={rad} fill={grad} />
      <line
        x1={0}
        x2={160}
        y1={cy - 0.3}
        y2={cy - 0.3}
        stroke="#f5f0e8"
        strokeOpacity="0.18"
        strokeWidth="0.4"
      />
    </>
  );
}

function Lines({ r, accentAlpha = 0.6 }: SubProps) {
  const count = 18 + Math.floor(r() * 8);
  const gap = 100 / count;
  const slope = (r() - 0.5) * 0.6;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const y = i * gap;
        const o = 0.06 + (i / count) * accentAlpha * 0.6;
        return (
          <line
            key={i}
            x1={0}
            x2={160}
            y1={y}
            y2={y + slope * 60}
            stroke="#c8a96a"
            strokeOpacity={o}
            strokeWidth="0.3"
          />
        );
      })}
    </>
  );
}

function Discs({ r, grad }: SubProps) {
  const n = 3 + Math.floor(r() * 3);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const cx = 20 + r() * 120;
        const cy = 20 + r() * 60;
        const rad = 8 + r() * 28;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={rad}
            fill={i === 0 ? grad : "none"}
            stroke="#c8a96a"
            strokeOpacity={i === 0 ? 0 : 0.5}
            strokeWidth="0.25"
          />
        );
      })}
    </>
  );
}

function Grid({ r, accentAlpha = 0.6 }: SubProps) {
  const cols = 8 + Math.floor(r() * 6);
  const rows = 5 + Math.floor(r() * 3);
  const dotR = 0.4 + r() * 0.4;
  const cells: JSX.Element[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = ((i + 0.5) / cols) * 160;
      const cy = ((j + 0.5) / rows) * 100;
      const o = 0.1 + ((i + j) % 5) * 0.12 * accentAlpha;
      cells.push(
        <circle key={`${i}-${j}`} cx={cx} cy={cy} r={dotR} fill="#c8a96a" fillOpacity={o} />,
      );
    }
  }
  return <>{cells}</>;
}

function Split({ r, grad }: SubProps) {
  const x = 50 + r() * 60;
  return (
    <>
      <rect x="0" y="0" width={x} height="100" fill={grad} opacity="0.85" />
      <line
        x1={x}
        x2={x}
        y1={0}
        y2={100}
        stroke="#f5f0e8"
        strokeOpacity="0.2"
        strokeWidth="0.3"
      />
      <circle cx={x + 18 + r() * 30} cy={50} r={6 + r() * 18} fill="none" stroke="#c8a96a" strokeOpacity="0.55" strokeWidth="0.3" />
    </>
  );
}

function Wave({ r, grad }: SubProps) {
  const amp = 8 + r() * 14;
  const phase = r() * Math.PI * 2;
  const points: string[] = [];
  for (let x = 0; x <= 160; x += 2) {
    const y = 50 + Math.sin((x / 160) * Math.PI * 2 + phase) * amp;
    points.push(`${x},${y.toFixed(2)}`);
  }
  return (
    <>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={grad}
        strokeOpacity="0.85"
        strokeWidth="0.6"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#c8a96a"
        strokeOpacity="0.25"
        strokeWidth="0.2"
        transform="translate(0,14)"
      />
    </>
  );
}
