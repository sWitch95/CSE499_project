"""
বেস মডেল - সব মডেল এটা extend করবে
"""

from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class BaseModel(Base):
    """
    সব মডেলের বেস ক্লাস
    স্বয়ংক্রিয়ভাবে created_at এবং updated_at যোগ করে
    """
    __abstract__ = True
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def dict(self):
        """মডেল থেকে ডিকশনারি তৈরি করুন"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def __repr__(self):
        """মডেলের string representation"""
        return f"<{self.__class__.__name__}(id={self.id})>"
