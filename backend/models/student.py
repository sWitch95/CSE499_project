"""
শিক্ষার্থী মডেল
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base import BaseModel

class Student(BaseModel):
    """শিক্ষার্থী টেবিল"""
    __tablename__ = "students"
    
    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    device_name = Column(String(255), nullable=False)
    ip_address = Column(String(50), nullable=True)
    session_id = Column(String(50), ForeignKey("sessions.id"), nullable=True, index=True)
    status = Column(String(20), default="offline")  # online, offline, idle, away
    is_active = Column(Boolean, default=True)
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    # সম্পর্ক
    session = relationship("Session", back_populates="students")
    activities = relationship("Activity", back_populates="student", cascade="all, delete-orphan")
    
    def __init__(self, id: str, email: str, name: str, password_hash: str, device_name: str):
        self.id = id
        self.email = email
        self.name = name
        self.password_hash = password_hash
        self.device_name = device_name
    
    def to_dict(self):
        """মডেল থেকে ডিকশনারি তৈরি করুন"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "device_name": self.device_name,
            "ip_address": self.ip_address,
            "session_id": self.session_id,
            "status": self.status,
            "is_active": self.is_active,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
