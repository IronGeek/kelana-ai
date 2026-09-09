from pydantic import (
    EmailStr,
    PostgresDsn,
    field_validator,
)
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


def _resolve_postgres_url(value: PostgresDsn) -> str:
    url = str(value)
    for scheme in ("postgres://", "postgresql://"):
        if url.startswith(scheme):
            url = url.replace(scheme, "postgresql+psycopg://", 1)
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    FASTAPI_ENV: str = "production"

    APP_NAME: str = "KelanaAI"
    APP_DATABASE_URL: PostgresDsn
    APP_FRONTEND_URL: str
    APP_FIRST_SUPERUSER_NAME: str = "Administrator"
    APP_FIRST_SUPERUSER_EMAIL: EmailStr
    APP_FIRST_SUPERUSER_PASSWORD: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    AWS_BEARER_TOKEN_BEDROCK: str
    AWS_REGION: str
    AWS_BEDROCK_MODEL_ID: str
    AWS_BEDROCK_TEMPERATURE: float
    AWS_BEDROCK_TOKENS_PER_DAY: int
    AWS_BEDROCK_MIN_TOKENS: int
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_KNOWLEDGE_BASE_ID: str
    AWS_KNOWLEDGE_BASE_MODEL_ARN: str

    TEST_DATABASE_URL: PostgresDsn

    @property
    def is_development(self) -> bool:
        return self.FASTAPI_ENV == "development"

    @field_validator("APP_DATABASE_URL", mode="before")
    @classmethod
    def _use_psycopg_driver(cls, value: str | PostgresDsn) -> str:
        return _resolve_postgres_url(value)

    @field_validator("TEST_DATABASE_URL", mode="before")
    @classmethod
    def _test_use_psycopg_driver(cls, value: str | PostgresDsn) -> str:
        return _resolve_postgres_url(value)


settings = Settings()
