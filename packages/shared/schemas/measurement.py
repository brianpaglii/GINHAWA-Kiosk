from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MeasurementBase(BaseModel):
    device_id: str
    type: str # systolic, diastolic, spO2, weight
    value: str
    unit: str
    raw_json: Optional[str] = None

class MeasurementCreate(MeasurementBase):
    session_id: str

class MeasurementDTO(MeasurementBase):
    id: str
    timestamp: datetime
    session_id: str

    class Config:
        from_attributes = True
