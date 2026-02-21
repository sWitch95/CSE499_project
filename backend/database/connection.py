"""
ডাটাবেস সংযোগ সেটআপ
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from typing import Generator

from backend.config import settings

# ডাটাবেস ইঞ্জিন তৈরি করুন
if settings.DATABASE_ENGINE == "sqlite":
    # SQLite (ডেভেলপমেন্টের জন্য)
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URL,
        echo=settings.SQLALCHEMY_ECHO,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # SQLite এর জন্য প্রয়োজনীয়
    )
else:
    # PostgreSQL (প্রোডাকশনের জন্য)
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URL,
        echo=settings.SQLALCHEMY_ECHO,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=20,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_pre_ping=settings.DB_POOL_PRE_PING,
    )

# SQLite foreign key সাপোর্ট সক্ষম করুন (ডেভেলপমেন্টে)
if settings.DATABASE_ENGINE == "sqlite":
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# সেশন ফ্যাক্টরি তৈরি করুন
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# বেস ক্লাস অল মডেলের জন্য
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    ডাটাবেস সেশন পান (dependency injection এর জন্য)
    
    ব্যবহার:
        @app.get("/items/")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    """
    Context manager দিয়ে ডাটাবেস সেশন পান
    
    ব্যবহার:
        with get_db_context() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    ডাটাবেস টেবিল তৈরি করুন
    সব মডেল আগে ইম্পোর্ট করতে হবে
    """
    # সব মডেল ইম্পোর্ট করুন
    from backend.models import (
        base,
        student,
        teacher, 
        session,
        activity
    )
    
    Base.metadata.create_all(bind=engine)
    print("✓ ডাটাবেস টেবিল তৈরি সম্পূর্ণ")

def drop_db():
    """সতর্কতা: সব ডাটা মুছবেন (শুধু টেস্টিংয়ের জন্য)"""
    Base.metadata.drop_all(bind=engine)
    print("✓ সব ডাটাবেস টেবিল মুছে ফেলা হয়েছে")
