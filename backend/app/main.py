from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi

from app.api.routes import router as api_router
from app.db.database import Base, engine
from app.db import models  # ensure models are imported for table creation
from app.core.config import get_settings


app = FastAPI(title="EventCategorize API")

# Add HTTPBearer security scheme
security_scheme = {
    "type": "http",
    "scheme": "bearer",
    "bearerFormat": "JWT",
}

settings = get_settings()
allowed_origins = settings.get_cors_allow_origins() or [
    # Fallback to previous defaults if ALLOW_ORIGINS is not set
    "http://localhost:3000",
    "http://45.77.245.143:3000",
    "http://45.77.245.143",
    "http://127.0.0.1:3000",
    "http://172.30.176.1:3000",
    "http://172.29.32.1:3000", 
    "http://baacinnolab.duckdns.org:3000",
    "http://baacinnolab.duckdns.org",
    "http://baacinno.online",
    "http://baacinno.online:3000",
]


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="EventCategorize API",
        version="1.0.0",
        description="API for Event Categorization with Bearer Token Authentication",
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter JWT token with 'Bearer ' prefix"
        }
    }
    
    # Add global security requirement to enforce Bearer token authentication for all endpoints
    openapi_schema["security"] = [{"bearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
app.include_router(api_router)

# Allow origins from .env (ALLOW_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
