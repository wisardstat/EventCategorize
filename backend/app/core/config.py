from functools import lru_cache
import json

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_role_key: str = ""
    # Supabase Postgres connection (from .env)
    supabase_db_user: str = "postgres"
    supabase_db_password: str = ""
    supabase_db_name: str = "postgres"
    supabase_db_port: int = 5432
    
    # Database Configuration (Supabase uses PostgreSQL)
    database_url: str = ""
    
    # Legacy PostgreSQL settings (for backward compatibility)
    postgres_host: str = "localhost"
    postgres_db: str = "eventfeedback"
    postgres_user: str = "postgres"
    postgres_password: str = ""
    postgres_port: int = 5432
    
    # OpenAI Configuration
    openai_api_key: str = ""
    
    # Application Configuration
    debug: bool = True
    environment: str = "development"

    # CORS: comma-separated list or JSON array in .env (env key: ALLOW_ORIGINS)
    allow_origins: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # tolerate unknown/malformed env keys
    )

    @property
    def sqlalchemy_database_uri(self) -> str:
        # Priority: DATABASE_URL > Supabase URL construction > Legacy PostgreSQL
        if self.database_url:
            return self.database_url
        
        # If Supabase is configured, construct URL from Supabase settings
        if self.supabase_url and self.supabase_key:
            # Extract project reference from Supabase URL
            # URL format: https://[project-ref].supabase.co
            if "supabase.co" in self.supabase_url:
                project_ref = self.supabase_url.replace("https://", "").replace(".supabase.co", "")
                user = self.supabase_db_user or "postgres"
                password = self.supabase_db_password or ""
                dbname = self.supabase_db_name or "postgres"
                port = self.supabase_db_port or 5432
                return (
                    f"postgresql+psycopg://{user}:{password}"
                    f"@db.{project_ref}.supabase.co:{port}/{dbname}"
                )
        
        # Fallback to legacy PostgreSQL configuration
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}@"
            f"{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    def get_cors_allow_origins(self) -> list[str]:
        """Parse ALLOW_ORIGINS from .env.
        Supports either a JSON array or a comma-separated string.
        """
        if not self.allow_origins:
            return []
        val = self.allow_origins.strip()
        if val.startswith("["):
            try:
                arr = json.loads(val)
                if isinstance(arr, list):
                    return [str(x).strip() for x in arr if str(x).strip()]
            except Exception:
                pass
        return [o.strip() for o in val.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()