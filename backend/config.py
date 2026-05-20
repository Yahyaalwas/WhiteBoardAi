from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    google_vision_api_key: Optional[str] = None
    allowed_origins: str = "http://localhost:3000"
    max_file_size_mb: int = 20
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
