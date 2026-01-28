import os
import sys

# Ensure packages are in path
sys.path.append(os.path.join(os.getcwd(), "../../../packages"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Default to the service name 'db' from docker-compose if running in container, else localhost
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/ginhawa")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
