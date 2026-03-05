from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CheckResultSchema(BaseModel):
    id: int
    service_id: int
    checked_at: datetime
    http_status: Optional[int]
    latency_ms: Optional[float]
    actual_version: Optional[str]
    indicator: Optional[str]
    is_drifted: bool
    is_up: bool

    model_config = {"from_attributes": True}


class ServiceStatusSchema(BaseModel):
    id: int
    name: str
    url: str
    environment: str
    expected_version: Optional[str]
    latest_check: Optional[CheckResultSchema]

    model_config = {"from_attributes": True}


class ServiceHistorySchema(BaseModel):
    service: ServiceStatusSchema
    history: list[CheckResultSchema]


class EnvironmentGroupSchema(BaseModel):
    environment: str
    services: list[ServiceStatusSchema]