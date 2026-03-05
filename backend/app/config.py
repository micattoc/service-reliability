from pathlib import Path
from typing import Optional
import yaml
from pydantic import BaseModel


class ServiceConfig(BaseModel):
    name: str
    url: str
    environment: str
    expected_version: Optional[str] = None


def load_services() -> list[ServiceConfig]:
    config_path = Path(__file__).parent.parent / "services.yaml"

    with open(config_path, "r") as f:
        data = yaml.safe_load(f)

    return [ServiceConfig(**item) for item in data]
