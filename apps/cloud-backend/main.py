from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add packages to path
sys.path.append(os.path.join(os.getcwd(), "../../../packages"))

from shared.db.models import Base
from database import engine
from api import sync

# Create Tables (if not exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GINHAWA Cloud Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sync.router, prefix="/api", tags=["Sync"])

@app.get("/")
def read_root():
    return {"status": "online", "service": "GINHAWA Cloud Backend"}
