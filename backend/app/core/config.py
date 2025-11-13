from functools import lru_cache
import json

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MSSQL Configuration
    mssql_user: str = ""
    mssql_password: str = ""
    mssql_host: str = ""
    mssql_dbname: str = ""
    mssql_port: int = 1433
    mssql_driver: str = "ODBC Driver 17 for SQL Server"
    
    # OpenAI Configuration
    openai_api_key: str = ""
    
    # Application Configuration
    debug: bool = True
    environment: str = "development"

    # CORS: comma-separated list or JSON array in .env (env key: ALLOW_ORIGINS)
    allow_origins: str = ""

    model_config = SettingsConfigDict(
        env_file="d:/MyProject/EventCategorize/backend/.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # tolerate unknown/malformed env keys
    )

    @property
    def sqlalchemy_database_uri(self) -> str:
        # Create ODBC connection string for MSSQL
        connection_string = (
            f"DRIVER={{{self.mssql_driver}}};"
            f"SERVER={self.mssql_host},{self.mssql_port};"
            f"DATABASE={self.mssql_dbname};"
            f"UID={self.mssql_user};"
            f"PWD={self.mssql_password};"
            f"TrustServerCertificate=yes;"
            f"Encrypt=yes;"
        )
        # URL encode the connection string for SQLAlchemy
        from urllib.parse import quote_plus
        encoded_connection_string = quote_plus(connection_string)
        return f"mssql+pyodbc:///?odbc_connect={encoded_connection_string}"

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