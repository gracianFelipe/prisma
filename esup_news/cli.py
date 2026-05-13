"""CLI do ESUP News (Typer)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

# Console Windows em cp1252 quebra em caracteres acima de ASCII. Forçar UTF-8.
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
        sys.stderr.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

from .analysis.reports import (
    coverage_by_course_and_provider,
    export_xlsx,
    fallback_summary,
    keyword_precision,
    score_bucket_stats,
)
from .analysis.soft_duplicate import detect_soft_duplicates
from .config import settings
from .db import connect, init_db
from .ingestion.orchestrator import run_ingestion
from .seeds.courses import seed_courses
from .seeds.keywords import seed_keywords

app = typer.Typer(add_completion=False, no_args_is_help=True, help="ESUP News — protótipo")
console = Console()


def _parse_window(value: str) -> int:
    """Aceita formatos como '12h', '7d', '48' (horas)."""
    m = re.fullmatch(r"(\d+)([hd]?)", value.strip().lower())
    if not m:
        raise typer.BadParameter(f"window inválida: {value}")
    n = int(m.group(1))
    unit = m.group(2) or "h"
    return n * 24 if unit == "d" else n


@app.command("init-db")
def cmd_init_db() -> None:
    """Cria/atualiza o schema SQLite e instala o trigger."""
    path = init_db()
    console.print(f"[green]OK[/green] Banco inicializado em [bold]{path}[/bold]")


@app.command("seed")
def cmd_seed() -> None:
    """Insere/atualiza os 7 cursos e as keywords iniciais."""
    init_db()
    with connect() as conn:
        c = seed_courses(conn)
        k = seed_keywords(conn)
    console.print(f"[green]OK[/green] Cursos afetados: {c}  |  Keywords afetadas: {k}")


@app.command("ingest")
def cmd_ingest(
    course: str | None = typer.Option(None, "--course", help="slug do curso (omita para usar --all)"),
    all_courses: bool = typer.Option(False, "--all", help="rodar para todos os cursos ativos"),
    window: str = typer.Option("12h", "--window", help="janela de coleta (ex: 12h, 7d)"),
    weekly: bool = typer.Option(False, "--weekly", help="marca como rodada semanal"),
    limit: int | None = typer.Option(None, "--limit", help="máx artigos por query"),
    cutoff: int | None = typer.Option(None, "--cutoff", help="score mínimo (padrão do .env)"),
) -> None:
    """Coleta artigos das APIs, normaliza, dedupe e classifica."""
    if not course and not all_courses:
        raise typer.BadParameter("informe --course=<slug> ou --all")

    window_hours = _parse_window(window)
    course_slugs = [course] if course else None
    job_name = "weekly" if weekly else "incremental"

    init_db()
    with connect() as conn:
        summaries = run_ingestion(
            conn,
            course_slugs=course_slugs,
            window_hours=window_hours,
            job_name=job_name,
            limit=limit,
            cutoff=cutoff,
        )

    table = Table(title="Resumo da coleta", show_lines=False)
    table.add_column("curso")
    table.add_column("queries", justify="right")
    table.add_column("recebidos", justify="right")
    table.add_column("novos", justify="right")
    table.add_column("dup", justify="right")
    table.add_column(">=cutoff", justify="right")
    table.add_column("fallback", justify="right")
    table.add_column("motivos")
    for s in summaries:
        table.add_row(
            s.course_slug,
            str(s.queries_run),
            str(s.articles_received),
            str(s.articles_new),
            str(s.articles_duplicate),
            str(s.articles_above_cutoff),
            str(s.fallback_used),
            ", ".join(s.fallback_reasons) or "-",
        )
    console.print(table)


@app.command("detect-soft-duplicates")
def cmd_detect_soft(
    since: str = typer.Option("24h", "--since", help="janela retroativa (ex: 24h, 7d)"),
) -> None:
    """Encontra pares suspeitos de duplicata cross-fonte."""
    hours = _parse_window(since)
    with connect() as conn:
        n = detect_soft_duplicates(conn, since_hours=hours)
    console.print(f"[cyan]>[/cyan] Pares suspeitos inseridos: {n}")


@app.command("stats")
def cmd_stats(
    by: str = typer.Option("course", "--by", help="course | keyword | score-bucket | fallback"),
    min_volume: int = typer.Option(5, "--min-volume", help="usado só com --by=keyword"),
) -> None:
    """Estatísticas rápidas no terminal."""
    with connect() as conn:
        if by == "course":
            df = coverage_by_course_and_provider(conn)
        elif by == "keyword":
            df = keyword_precision(conn, min_volume=min_volume)
        elif by == "score-bucket":
            df = score_bucket_stats(conn)
        elif by == "fallback":
            df = fallback_summary(conn)
        else:
            raise typer.BadParameter(f"--by inválido: {by}")

    if df.empty:
        console.print("[yellow]sem dados ainda[/yellow]")
        return

    table = Table(show_lines=False)
    for col in df.columns:
        table.add_column(str(col))
    for _, row in df.iterrows():
        table.add_row(*[("" if pd_is_na(v) else str(v)) for v in row.tolist()])
    console.print(table)


def pd_is_na(v) -> bool:
    try:
        import pandas as pd  # noqa: PLC0415
        return bool(pd.isna(v))
    except Exception:
        return v is None


@app.command("report")
def cmd_report(
    out: Path = typer.Option(Path("relatorio.xlsx"), "--out", help="caminho do arquivo Excel"),
) -> None:
    """Gera relatório consolidado em Excel."""
    with connect() as conn:
        path = export_xlsx(conn, out)
    console.print(f"[green]OK[/green] Relatorio gerado em [bold]{path}[/bold]")


@app.command("info")
def cmd_info() -> None:
    """Mostra configuração atual."""
    console.print(f"DATABASE_PATH         = {settings.database_path}")
    console.print(f"SCORE_CUTOFF          = {settings.score_cutoff}")
    console.print(f"INCREMENTAL_WINDOW    = {settings.incremental_window_hours}h")
    console.print(f"WEEKLY_WINDOW         = {settings.weekly_window_hours}h")
    console.print(f"DEFAULT_LIMIT         = {settings.default_limit_per_query}")
    console.print(f"NEWSDATA_API_KEY      = {'set' if settings.newsdata_api_key else 'EMPTY'}")
    console.print(f"THENEWSAPI_API_KEY    = {'set' if settings.thenewsapi_api_key else 'EMPTY'}")


if __name__ == "__main__":
    app()
