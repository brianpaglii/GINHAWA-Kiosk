import sys
import os
import random
import uuid
from datetime import datetime, timedelta

# Add packages to path (mapped to /packages in docker)
sys.path.append("/packages")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from shared.db.models import Base, Citizen, Session, Measurement

# Setup DB - match the internal docker path
DATABASE_URL = "sqlite:///./ginhawa_kiosk.db" 

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed():
    print(f"Seeding database at {DATABASE_URL}...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if data exists
    if db.query(Citizen).count() > 0:
        print("Data already exists. Skipping.")
        return

    print("Seeding Citizens...")
    citizens = []
    barangays = ["San Isidro", "Poblacion", "San Jose", "Mabini"]
    
    # Ensure RFID-0001 exists for testing
    c_test = Citizen(
        id=str(uuid.uuid4()),
        rfid_uid="RFID-0001",
        full_name="Test Citizen",
        dob=datetime.now() - timedelta(days=365*20),
        sex="M",
        barangay="San Isidro"
    )
    citizens.append(c_test)
    db.add(c_test)

    for i in range(10):
        c = Citizen(
            id=str(uuid.uuid4()),
            rfid_uid=f"RFID-{i:04d}",
            full_name=f"Citizen {i}",
            dob=datetime.now() - timedelta(days=365*30),
            sex=random.choice(["M", "F"]),
            barangay=random.choice(barangays)
        )
        citizens.append(c)
        db.add(c)
    
    db.commit()
    print("Seeding Complete!")

if __name__ == "__main__":
    seed()
