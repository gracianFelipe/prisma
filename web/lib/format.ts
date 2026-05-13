export function formatDate(iso: string): string {
  const d = new Date(iso);
  const meses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatRelative(iso: string, nowMs?: number): string {
  const now = nowMs ?? Date.UTC(2026, 4, 13, 12, 0, 0);
  const diffH = (now - new Date(iso).getTime()) / (1000 * 60 * 60);
  if (diffH < 1) return "agora";
  if (diffH < 24) return `há ${Math.round(diffH)}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `há ${diffD}d`;
  return formatDate(iso);
}
