from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session as DBSession
from typing import List
import sys
import os

sys.path.append(os.path.join(os.getcwd(), "../../../packages"))

from shared.db.models import Session, Measurement, Citizen
from shared.schemas.session import SessionDTO
from database import get_db

router = APIRouter()

@router.post("/sync")
def sync_data(sessions: List[SessionDTO], db: DBSession = Depends(get_db)):
    synced_ids = []
    
    for session_data in sessions:
        # Check if citizen exists (simplified: create if not, or assume pre-synced)
        # For this prototype: Updert Citizen if needed, then Session
        # In real world: specialized Logic for existing records.
        
        # 1. Upsert Session
        existing_session = db.query(Session).filter(Session.id == session_data.id).first()
        if not existing_session:
            new_session = Session(
                id=session_data.id,
                citizen_id=session_data.citizen_id,
                started_at=session_data.started_at,
                ended_at=session_data.ended_at,
                is_synced=True
            )
            db.add(new_session)
        
        # 2. Upsert Measurements
        for m in session_data.measurements:
             existing_m = db.query(Measurement).filter(Measurement.id == m.id).first()
             if not existing_m:
                 new_m = Measurement(
                     id=m.id,
                     session_id=session_data.id,
                     device_id=m.device_id,
                     type=m.type,
                     value=m.value,
                     unit=m.unit,
                     timestamp=m.timestamp,
                     raw_json=m.raw_json
                 )
                 db.add(new_m)
        
        synced_ids.append(session_data.id)
    
    db.commit()
    return {"status": "success", "synced_count": len(synced_ids), "synced_ids": synced_ids}
