import asyncio
import os

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.alerting import check_and_alert
from app.checker import check_service
from app.config import load_services
from app.database import SessionLocal
from app.models import CheckResult as CheckResultModel
from app.models import Service

POLL_INTERVAL = int(os.getenv("POLL_INTERVAL_SECONDS", "30"))

scheduler = AsyncIOScheduler()


async def poll_all_services() -> None:
    services_config = load_services()

    db: Session = SessionLocal()

    try:
        for config in services_config:
            # Upsert: create the service row if it doesn't exist yet
            service = db.query(Service).filter(Service.name == config.name).first()

            if not service:
                service = Service(
                    name=config.name,
                    url=config.url,
                    environment=config.environment,
                    expected_version=config.expected_version,
                )

                db.add(service)
                db.commit()
                db.refresh(service)
            else:
                # Sync config changes (URL or environment may have been updated in configuration file)
                service.url = config.url
                service.environment = config.environment
                service.expected_version = config.expected_version
                db.commit()

            result = await check_service(config.url)

            # Version drift detection
            is_drifted = False
            if service.expected_version and result.actual_version:
                is_drifted = service.expected_version != result.actual_version

            check_record = CheckResultModel(
                service_id=service.id,
                checked_at=result.checked_at,
                http_status=result.http_status,
                latency_ms=result.latency_ms,
                actual_version=result.actual_version,
                indicator=result.indicator,
                is_drifted=is_drifted,
                is_up=result.is_up,
                is_legacy=result.is_legacy,
            )

            db.add(check_record)
            db.commit()

            await check_and_alert(db, service)

    except Exception as exc:
        print(f"[POLLER] Unexpected error during poll cycle: {exc}")
        db.rollback()

    finally:
        db.close()


async def start_scheduler() -> None:
    scheduler.add_job(
        poll_all_services,
        "interval",
        seconds=POLL_INTERVAL,
        id="poll_services",
        replace_existing=True,
    )
    scheduler.start()
    
    # Run one poll immediately on startup so the dashboard has data before first interval
    asyncio.create_task(poll_all_services())


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)

