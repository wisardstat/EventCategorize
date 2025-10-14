from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_role_key: str = ""
    
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
                return f"postgresql+psycopg://postgres:[YOUR-PASSWORD]@db.{project_ref}.supabase.co:5432/postgres"
        
        # Fallback to legacy PostgreSQL configuration
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}@"
            f"{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


