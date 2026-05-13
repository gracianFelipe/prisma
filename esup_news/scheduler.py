"""Scheduler in-process. Executar com: python -m esup_news.scheduler"""
from __future__ import annotations

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from .config import settings
from .db import connect, init_db
from .ingestion.orchestrator import run_ingestion


def _job_incremental() -> None:
    init_db()
    with connect() as conn:
        run_ingestion(
            conn,
            window_hours=settings.incremental_window_hours,
            job_name="incremental",
        )


def _job_weekly() -> None:
    init_db()
    with connect() as conn:
        run_ingestion(
            conn,
            window_hours=settings.weekly_window_hours,
            job_name="weekly",
        )


def main() -> None:
    sched = BlockingScheduler(timezone=settings.local_tz)
    # 2 rodadas diárias
    sched.add_job(_job_incremental, CronTrigger(hour=8, minute=0), id="incremental-am")
    sched.add_job(_job_incremental, CronTrigger(hour=20, minute=0), id="incremental-pm")
    # 1 rodada semanal: sábado 7h
    sched.add_job(_job_weekly, CronTrigger(day_of_week="sat", hour=7, minute=0), id="weekly")
    print(f"Scheduler ativo (tz={settings.local_tz}). Ctrl+C para sair.")
    sched.start()


if __name__ == "__main__":
    main()
