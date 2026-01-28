from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from typing import List
from datetime import datetime
import uuid

import sys
import os
sys.path.append(os.path.join(os.getcwd(), "../../../packages"))

from shared.db.models import Session, Measurement, Citizen
from shared.schemas.session import SessionCreate, SessionDTO, SessionUpdate
from shared.schemas.measurement import MeasurementCreate, MeasurementDTO
from shared.schemas.citizen import CitizenDTO
from database import get_db
from core.printer import printer_service

router = APIRouter()

@router.get("/status")
def get_kiosk_status():
    return {"state": "IDLE", "active_session": None} 

@router.post("/auth")
def authenticate_citizen(rfid_uid: str, db: DBSession = Depends(get_db)):
    citizen = db.query(Citizen).filter(Citizen.rfid_uid == rfid_uid).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return CitizenDTO.from_orm(citizen)

@router.post("/start", response_model=SessionDTO)
def start_session(session_in: SessionCreate, db: DBSession = Depends(get_db)):
    new_session = Session(
        id=str(uuid.uuid4()),
        citizen_id=session_in.citizen_id,
        started_at=datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/end/{session_id}")
def end_session(session_id: str, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.ended_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Session ended"}

@router.post("/{session_id}/measurement", response_model=MeasurementDTO)
def add_measurement(session_id: str, measurement: MeasurementCreate, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    new_measurement = Measurement(
        id=str(uuid.uuid4()),
        session_id=session_id,
        device_id=measurement.device_id,
        type=measurement.type,
        value=measurement.value,
        unit=measurement.unit,
        raw_json=measurement.raw_json,
        timestamp=datetime.utcnow()
    )
    db.add(new_measurement)
    db.commit()
    db.refresh(new_measurement)
    return new_measurement

@router.post("/{session_id}/print")
def print_session_ticket(session_id: str, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    citizen = session.citizen
    session_data = {
        "date": session.started_at.strftime("%Y-%m-%d %H:%M"),
        "citizen_name": citizen.full_name,
        "measurements": [{"type": m.type, "value": m.value, "unit": m.unit} for m in session.measurements]
    }
    
    printer_service.print_ticket(session_data)
    return {"message": "Ticket printed"}
