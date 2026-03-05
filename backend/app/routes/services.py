from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CheckResult, Service
from app.schemas import (
    CheckResultSchema,
    EnvironmentGroupSchema,
    ServiceStatusSchema,
)

router = APIRouter(prefix="/api/services", tags=["services"])


def _get_latest_check(service: Service, db: Session) -> Optional[CheckResult]:
    return (
        db.query(CheckResult)
        .filter(CheckResult.service_id == service.id)
        .order_by(desc(CheckResult.checked_at))
        .first()
    )


def _build_service_status(service: Service, db: Session) -> ServiceStatusSchema:
    latest = _get_latest_check(service, db)

    return ServiceStatusSchema(
        id=service.id,
        name=service.name,
        url=service.url,
        environment=service.environment,
        expected_version=service.expected_version,
        latest_check=CheckResultSchema.model_validate(latest) if latest else None,
    )


@router.get("/", response_model=list[ServiceStatusSchema])
def get_all_services(db: Session = Depends(get_db)):
    """Current status of every service with latest check."""
    
    services = db.query(Service).order_by(Service.name).all()
    return [_build_service_status(svc, db) for svc in services]


# Environment grouping
@router.get("/by-environment", response_model=list[EnvironmentGroupSchema])
def get_by_environment(db: Session = Depends(get_db)):
    """Services grouped by environment tag."""
    
    services = db.query(Service).order_by(Service.environment, Service.name).all()
    groups: dict[str, list[ServiceStatusSchema]] = {}

    for svc in services:
        env = svc.environment

        if env not in groups:
            groups[env] = []
    
        groups[env].append(_build_service_status(svc, db))

    return [
        EnvironmentGroupSchema(environment=env, services=svcs)
        for env, svcs in groups.items()
    ]
