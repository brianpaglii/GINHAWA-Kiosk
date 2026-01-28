from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


class Citizen(Base):
    __tablename__ = "citizens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rfid_uid = Column(String, unique=True, index=True) # Physical Card UID
    full_name = Column(String, nullable=False)
    dob = Column(DateTime, nullable=False)
    sex = Column(String, nullable=False)
    barangay = Column(String, nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("Session", back_populates="citizen")


class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String, ForeignKey("citizens.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    is_synced = Column(Boolean, default=False) # Sync Status Track
    
    citizen = relationship("Citizen", back_populates="sessions")
    measurements = relationship("Measurement", back_populates="session")

class Measurement(Base):
    __tablename__ = "measurements"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"))
    device_id = Column(String) # E.g., "ESP32-A", "ESP32-B"
    type = Column(String)      # E.g., "systolic", "diastolic", "spO2", "weight"

    value = Column(String)     # Stored as string to preserve precision/format
    unit = Column(String)      # E.g., "mmHg", "%", "kg"

    raw_json = Column(Text)    # Full debug payload from sensor
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("Session", back_populates="measurements")
