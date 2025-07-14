from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.base import Base

class Exhibit(Base):
    __tablename__ = "exhibits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String(100))
    subcategory = Column(String(100))
    
    # Relationships
    firearm = relationship("Firearm", back_populates="exhibit")
    narcotic = relationship("Narcotic", back_populates="exhibit")
    histories = relationship("History", back_populates="exhibit")