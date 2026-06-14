type Props = {
  size?: number;
  className?: string;
};

// Mesma marca do favicon (app/icon.png): prisma dourado de 3 faces em tile
// escuro arredondado. Cores fixas (é a marca, igual em tema claro/escuro).
export function PrismMark({ size = 26, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      role="img"
      aria-label="The Prism"
      className={className}
    >
      <rect x="0" y="0" width="72" height="72" rx="14" fill="#0a0a0a" />
      <polygon points="36,11 11,60 61,60" fill="#c8a96a" />
      <g stroke="#0a0a0a" strokeWidth="3.4" strokeLinecap="round">
        <line x1="36" y1="11" x2="36" y2="43.7" />
        <line x1="11" y1="60" x2="36" y2="43.7" />
        <line x1="61" y1="60" x2="36" y2="43.7" />
      </g>
    </svg>
  );
}
