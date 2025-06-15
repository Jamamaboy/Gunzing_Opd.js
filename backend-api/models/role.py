from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from db.base import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationship
    users = relationship("User", back_populates="role")