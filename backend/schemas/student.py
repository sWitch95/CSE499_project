"""
স্টুডেন্ট Pydantic স্কিমা
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class StudentBase(BaseModel):
    """স্টুডেন্ট বেস স্কিমা"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    device_name: str = Field(..., min_length=1, max_length=255)

class StudentCreate(StudentBase):
    """স্টুডেন্ট তৈরির স্কিমা"""
    password: str = Field(..., min_length=8)

class StudentUpdate(BaseModel):
    """স্টুডেন্ট আপডেটের স্কিমা"""
    name: Optional[str] = None
    device_name: Optional[str] = None
    status: Optional[str] = None

class StudentHeartbeat(BaseModel):
    """হার্টবিট স্কিমা"""
    status: str = Field(..., pattern="^(online|offline|idle|away)$")
    app_info: Optional[str] = None
    screen_active: Optional[bool] = None

class StudentInDB(StudentBase):
    """ডাটাবেসে সংরক্ষিত স্টুডেন্ট"""
    id: str
    status: str
    ip_address: Optional[str]
    session_id: Optional[str]
    is_active: bool
    last_seen: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StudentResponse(StudentInDB):
    """API উত্তর স্কিমা"""
    pass
