"""
অ্যাক্টিভিটি লগ মডেল
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base import BaseModel

class Activity(BaseModel):
    """অ্যাক্টিভিটি লগ টেবিল"""
    __tablename__ = "activities"
    
    id = Column(String(50), primary_key=True, index=True)
    session_id = Column(String(50), ForeignKey("sessions.id"), nullable=False, index=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False, index=True)
    activity_type = Column(String(50), nullable=False)  # login, logout, app_open, app_close, etc.
    data = Column(JSON, nullable=True)  # অতিরিক্ত তথ্য
    
    # সম্পর্ক
    session = relationship("Session", back_populates="activities")
    student = relationship("Student", back_populates="activities")
    
    def __init__(self, id: str, session_id: str, student_id: str, activity_type: str, data: dict = None):
        self.id = id
        self.session_id = session_id
        self.student_id = student_id
        self.activity_type = activity_type
        self.data = data or {}
    
    def to_dict(self):
        """মডেল থেকে ডিকশনারি তৈরি করুন"""
        return {
            "id": self.id,
            "session_id": self.session_id,
            "student_id": self.student_id,
            "activity_type": self.activity_type,
            "data": self.data,
            "created_at": self.created_at.isoformat(),
        }
