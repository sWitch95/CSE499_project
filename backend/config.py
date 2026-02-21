"""
Backend Configuration - সব সেটিংস এক জায়গায়
"""

import os
from datetime import timedelta
from functools import lru_cache
from typing import Optional

class Settings:
    """অ্যাপ্লিকেশন সেটিংস"""
    
    # ======================== সাধারণ সেটিংস ========================
    APP_NAME = "Lab Vision Grid API"
    APP_VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # ======================== সার্ভার সেটিংস ========================
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", "8000"))
    RELOAD = os.getenv("API_RELOAD", "true").lower() == "true"
    
    # ======================== ডাটাবেস সেটিংস ========================
    DATABASE_ENGINE = os.getenv("DATABASE_ENGINE", "sqlite")
    
    # SQLite Configuration
    SQLITE_DB = os.getenv("SQLITE_DB", "backend/lab_vision_grid.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{SQLITE_DB}" if DATABASE_ENGINE == "sqlite" else ""
    
    # PostgreSQL Configuration (Production)
    if DATABASE_ENGINE == "postgresql":
        DB_USER = os.getenv("DB_USER", "postgres")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_PORT = os.getenv("DB_PORT", "5432")
        DB_NAME = os.getenv("DB_NAME", "lab_vision_grid")
        SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))
    DB_POOL_PRE_PING = True
    
    # ======================== Redis সেটিংস ========================
    REDIS_ENABLED = os.getenv("REDIS_ENABLED", "false").lower() == "true"
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
    REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}" if REDIS_PASSWORD else f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
    
    # ======================== JWT সেটিংস ========================
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production!!!")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION = timedelta(hours=int(os.getenv("JWT_EXPIRATION_HOURS", "24")))
    JWT_REFRESH_EXPIRATION = timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7")))
    
    # ======================== CORS সেটিংস ========================
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    CORS_CREDENTIALS = True
    CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_HEADERS = ["*"]
    
    # ======================== ক্যাশিং সেটিংস ========================
    CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"
    CACHE_TTL = int(os.getenv("CACHE_TTL", "300"))  # ৫ মিনিট
    CACHE_STUDENT_TTL = int(os.getenv("CACHE_STUDENT_TTL", "60"))  # ১ মিনিট
    
    # ======================== লগিং সেটিংস ========================
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "json" if os.getenv("LOG_FORMAT") == "json" else "text"
    LOG_FILE = os.getenv("LOG_FILE", "logs/api.log")
    
    # ======================== সিকিউরিটি সেটিংস ========================
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
    MAX_LOGIN_ATTEMPTS = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
    LOGIN_ATTEMPT_TIMEOUT = int(os.getenv("LOGIN_ATTEMPT_TIMEOUT", "300"))  # ৫ মিনিট
    
    # ======================== পেজিনেশন সেটিংস ========================
    DEFAULT_PAGE = 1
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # ======================== API সেটিংস ========================
    API_PREFIX = "/api/v1"
    DOCS_URL = "/api/docs"
    OPENAPI_URL = "/api/openapi.json"
    
    # ======================== ওয়েবসকেট সেটিংস ========================
    WEBSOCKET_HEARTBEAT_INTERVAL = int(os.getenv("WEBSOCKET_HEARTBEAT_INTERVAL", "30"))
    WEBSOCKET_TIMEOUT = int(os.getenv("WEBSOCKET_TIMEOUT", "10"))

class DevelopmentSettings(Settings):
    """ডেভেলপমেন্ট সেটিংস"""
    DEBUG = True
    ENVIRONMENT = "development"
    DATABASE_ENGINE = "sqlite"
    SQLALCHEMY_ECHO = True
    REDIS_ENABLED = False
    CACHE_ENABLED = True

class ProductionSettings(Settings):
    """প্রোডাকশন সেটিংস"""
    DEBUG = False
    ENVIRONMENT = "production"
    DATABASE_ENGINE = "postgresql"
    REDIS_ENABLED = True
    CACHE_ENABLED = True
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # অবশ্যই সেট থাকতে হবে

class TestingSettings(Settings):
    """টেস্টিং সেটিংস"""
    DEBUG = True
    ENVIRONMENT = "testing"
    DATABASE_ENGINE = "sqlite"
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    REDIS_ENABLED = False
    CACHE_ENABLED = False

@lru_cache()
def get_settings() -> Settings:
    """পরিবেশ অনুযায়ী সেটিংস পান"""
    env = os.getenv("ENVIRONMENT", "development")
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()

# গ্লোবাল সেটিংস
settings = get_settings()
