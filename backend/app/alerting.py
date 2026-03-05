import os
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.models import CheckResult, Service

ALERT_THRESHOLD = int(os.getenv("ALERT_CONSECUTIVE_FAILURES", "3"))
WEBHOOK_URL: Optional[str] = os.getenv("WEBHOOK_URL") or None


async def check_and_alert(db: Session, service: Service) -> None:
    """
    Queries the last N check results for the service.
    If all N are failures, prints a console alert and optionally POSTs to a webhook.
    """
    recent = (
        db.query(CheckResult)
        .filter(CheckResult.service_id == service.id)
        .order_by(CheckResult.checked_at.desc())
        .limit(ALERT_THRESHOLD)
        .all()
    )

    if len(recent) < ALERT_THRESHOLD:
        return

    all_failed = all(not r.is_up for r in recent)
    if not all_failed:
        return

    message = (
        f"[ALERT] '{service.name}' has failed {ALERT_THRESHOLD} "
        f"consecutive checks. URL: {service.url}"
    )
    print(message)

    # Functionality for when webhook URL is provided
    if WEBHOOK_URL:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(WEBHOOK_URL, json={"text": message})

        except Exception as exc:
            print(f"[ALERT] Webhook delivery failed: {exc}")
