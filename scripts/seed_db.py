import sys
import os
import random
import uuid
from datetime import datetime, timedelta

# Add packages to path
sys.path.append(os.path.join(os.getcwd(), "packages"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from shared.db.models import Base, Citizen, Session, Measurement

# Setup DB
DATABASE_URL = "sqlite:///./apps/kiosk-backend/ginhawa_kiosk.db"
# Ensure directory exists
os.makedirs(os.path.dirname("./apps/kiosk-backend/ginhawa_kiosk.db"), exist_ok=True)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if data exists
    if db.query(Citizen).count() > 0:
        print("Data already exists. Skipping.")
        return

    print("Seeding Citizens...")
    citizens = []
    barangays = ["San Isidro", "Poblacion", "San Jose", "Mabini"]
    
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
    
    print("Seeding Sessions and Measurements...")
    for c in citizens:
        # Create 1-3 sessions per citizen
        for _ in range(random.randint(1, 3)):
            s = Session(
                id=str(uuid.uuid4()),
                citizen_id=c.id,
                started_at=datetime.now() - timedelta(days=random.randint(0, 30)),
                is_synced=random.choice([True, False])
            )
            s.ended_at = s.started_at + timedelta(minutes=5)
            db.add(s)
            
            # Add measurements
            # BP
            systolic = random.randint(110, 140)
            diastolic = random.randint(70, 90)
            
            m1 = Measurement(
                id=str(uuid.uuid4()),
                session_id=s.id,
                device_id="BP-01",
                type="systolic",
                value=str(systolic),
                unit="mmHg",
                timestamp=s.started_at + timedelta(seconds=10)
            )
            m2 = Measurement(
                id=str(uuid.uuid4()),
                session_id=s.id,
                device_id="BP-01",
                type="diastolic",
                value=str(diastolic),
                unit="mmHg",
                timestamp=s.started_at + timedelta(seconds=10)
            )
            db.add(m1)
            db.add(m2)
            
    db.commit()
    print("Seeding Complete!")

if __name__ == "__main__":
    seed()
