from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.db.database import Base, engine
from app.db import models  # ensure models are imported for table creation


app = FastAPI(title="EventCategorize API")


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


app.include_router(api_router)

# Allow local frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://139.180.144.194:3000",
        "http://139.180.144.194",
        "http://127.0.0.1:3000",
        "http://172.30.176.1:3000",
        "http://baacinnolab.duckdns.org:3000",
        "http://baacinnolab.duckdns.org",
        "http://baacinno.online",
        "http://baacinno.online:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


