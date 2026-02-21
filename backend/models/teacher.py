"""
শিক্ষক মডেল
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base import BaseModel

class Teacher(BaseModel):
    """শিক্ষক টেবিল"""
    __tablename__ = "teachers"
    
    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    
    # সম্পর্ক
    sessions = relationship("Session", back_populates="teacher", cascade="all, delete-orphan")
    
    def __init__(self, id: str, email: str, name: str, password_hash: str):
        self.id = id
        self.email = email
        self.name = name
        self.password_hash = password_hash
    
    def to_dict(self):
        """মডেল থেকে ডিকশনারি তৈরি করুন"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "is_active": self.is_active,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
