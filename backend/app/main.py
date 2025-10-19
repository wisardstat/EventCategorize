from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.db.database import Base, engine
from app.db import models  # ensure models are imported for table creation
from app.core.config import get_settings


app = FastAPI(title="EventCategorize API")

settings = get_settings()
allowed_origins = settings.get_cors_allow_origins() or [
    # Fallback to previous defaults if ALLOW_ORIGINS is not set
    "http://localhost:3000",
    "http://139.180.144.194:3000",
    "http://139.180.144.194",
    "http://127.0.0.1:3000",
    "http://172.30.176.1:3000",
    "http://baacinnolab.duckdns.org:3000",
    "http://baacinnolab.duckdns.org",
    "http://baacinno.online",
    "http://baacinno.online:3000",
]


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


app.include_router(api_router)

# Allow origins from .env (ALLOW_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)