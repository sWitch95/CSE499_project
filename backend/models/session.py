"""
সেশন/ক্লাস মডেল
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base import BaseModel

class Session(BaseModel):
    """সেশন টেবিল (ক্লাস রুম সেশন)"""
    __tablename__ = "sessions"
    
    id = Column(String(50), primary_key=True, index=True)
    teacher_id = Column(String(50), ForeignKey("teachers.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active")  # active, paused, ended
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    
    # সম্পর্ক
    teacher = relationship("Teacher", back_populates="sessions")
    students = relationship("Student", back_populates="session")
    activities = relationship("Activity", back_populates="session", cascade="all, delete-orphan")
    
    def __init__(self, id: str, teacher_id: str, name: str, description: str = None):
        self.id = id
        self.teacher_id = teacher_id
        self.name = name
        self.description = description
    
    def to_dict(self):
        """মডেল থেকে ডিকশনারি তৈরি করুন"""
        return {
            "id": self.id,
            "teacher_id": self.teacher_id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "started_at": self.started_at.isoformat(),
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "student_count": len(self.students) if self.students else 0,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
