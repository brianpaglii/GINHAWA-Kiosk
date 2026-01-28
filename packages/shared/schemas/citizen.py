from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CitizenBase(BaseModel):
    rfid_uid: str
    full_name: str
    dob: datetime
    sex: str
    barangay: str

class CitizenCreate(CitizenBase):
    pass

class CitizenDTO(CitizenBase):
    id: str
    registered_at: datetime
    
    class Config:
        from_attributes = True
