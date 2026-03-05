from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    url = Column(String, nullable=False)
    environment = Column(String, nullable=False)
    expected_version = Column(String, nullable=True)

    check_results = relationship("CheckResult", back_populates="service", cascade="all, delete-orphan")


class CheckResult(Base):
    __tablename__ = "check_results"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    checked_at = Column(DateTime, default=datetime.now(datetime.timezone.utc), nullable=False)
    http_status = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    actual_version = Column(String, nullable=True)
    indicator = Column(String, nullable=True)
    is_drifted = Column(Boolean, default=False, nullable=False)
    is_up = Column(Boolean, default=False, nullable=False)

    service = relationship("Service", back_populates="check_results")