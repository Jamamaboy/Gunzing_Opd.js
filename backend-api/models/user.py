from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base
from models.role import Role

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(20), unique=True, nullable=False)
    title = Column(String(20), nullable=True)
    firstname = Column(String(100), nullable=False)
    lastname = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(Text, nullable=False)
    department = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    profile_image_url = Column(String(255), nullable=True)
    
    # Foreign key relationship
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = relationship(Role, back_populates="users")
    
    # Relationship to permissions
    permissions = relationship("UserPermission", back_populates="user", cascade="all, delete-orphan")
    
    # Relationships for notifications
    sent_notifications = relationship("Notification", foreign_keys="Notification.user_id", back_populates="sender")
    received_notifications = relationship("Notification", foreign_keys="Notification.receiver_id", back_populates="receiver")