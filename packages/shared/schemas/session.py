from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .measurement import MeasurementDTO

class SessionBase(BaseModel):
    citizen_id: str

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    ended_at: Optional[datetime] = None
    is_synced: Optional[bool] = None

class SessionDTO(SessionBase):
    id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    is_synced: bool
    measurements: List[MeasurementDTO] = []

    class Config:
        from_attributes = True
