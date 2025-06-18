import os
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from db.base import Base
from core.config import settings, DATABASE_URL

# ใช้ DATABASE_URL จาก core config
database_url = DATABASE_URL

# Ensure URL format is correct
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")

print(f"🔌 Connecting to database: {database_url}")

# Async engine และ session factory (สำหรับ FastAPI endpoints)
async_engine = create_async_engine(
    database_url,
    echo=not settings.is_production,  # ปิด echo ใน production
    pool_size=10,
    max_overflow=20,
)

async_session_factory = sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Sync engine และ session factory (สำหรับ services)
sync_database_url = database_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
sync_engine = create_engine(
    sync_database_url,
    echo=not settings.is_production,
    pool_size=10,
    max_overflow=20,
)

sync_session_factory = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)

# Async get_db สำหรับ FastAPI dependency injection
async def get_db():
    """
    Dependency function that yields DB sessions (async)
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Sync get_db_session สำหรับ services
def get_db_session() -> Session:
    """
    สร้าง database session สำหรับ sync usage
    """
    return sync_session_factory()

# ฟังก์ชันสำหรับเริ่มต้น database connection
async def connect_to_database():
    """
    Initialize database connection
    """
    try:
        async with async_engine.begin() as conn:
            print("✅ Connected to PostgreSQL Database")
        return True
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL Database: {e}")
        return False

def get_db_connection():
    """
    Get a direct PostgreSQL connection for raw SQL queries
    
    Returns:
        psycopg2.connection: A connection to the PostgreSQL database
    """
    try:
        # Convert DATABASE_URL to psycopg2 format
        db_url = database_url.replace("postgresql+asyncpg://", "postgresql://")
        conn = psycopg2.connect(db_url)
        print("✅ Direct PostgreSQL connection established")
        return conn
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL Database directly: {e}")
        raise

# ฟังก์ชันสำหรับสร้างตาราง
def create_tables():
    """
    สร้างตารางทั้งหมดในฐานข้อมูล
    """
    try:
        Base.metadata.create_all(bind=sync_engine)
        print("✅ All tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise

# ฟังก์ชันสำหรับลบตาราง
def drop_tables():
    """
    ลบตารางทั้งหมดในฐานข้อมูล
    """
    try:
        Base.metadata.drop_all(bind=sync_engine)
        print("✅ All tables dropped successfully")
    except Exception as e:
        print(f"❌ Error dropping tables: {e}")
        raise