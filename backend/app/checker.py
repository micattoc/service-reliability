import time
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

import httpx


@dataclass
class ProbeResult:
    http_status: Optional[int]
    latency_ms: Optional[float]
    actual_version: Optional[str]
    indicator: Optional[str]
    is_up: bool
    checked_at: datetime


async def check_service(url: str) -> ProbeResult:
    checked_at = datetime.utcnow()
    try:
        start = time.monotonic()

        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url)
        
        latency_ms = round((time.monotonic() - start) * 1000, 2)

        http_status = response.status_code
        is_up = response.status_code < 400

        actual_version: Optional[str] = None
        indicator: Optional[str] = None

        if is_up:
            try:
                body = response.json()
                # Extract page.id as the version fingerprint
                actual_version = body.get("page", {}).get("id")

                # Extract status.indicator for display (none/minor/major/critical)
                indicator = body.get("status", {}).get("indicator")

            except Exception:
                # Response is not JSON, soversion stays null 888
                pass

        return ProbeResult(
            http_status=http_status,
            latency_ms=latency_ms,
            actual_version=actual_version,
            indicator=indicator,
            is_up=is_up,
            checked_at=checked_at,
        )

    except httpx.RequestError as exc:
        # Network-level failure (timeout, DNS, refused connection)
        print(f"[CHECKER] Request failed for {url}: {exc}")
        
        return ProbeResult(
            http_status=None,
            latency_ms=None,
            actual_version=None,
            indicator=None,
            is_up=False,
            checked_at=checked_at,
        )
