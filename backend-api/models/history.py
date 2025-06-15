from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Text, DateTime, func, DECIMAL
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from db.base import Base

class History(Base):
    __tablename__ = "history"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    exhibit_id = Column(Integer, ForeignKey("exhibits.id"))
    subdistrict_id = Column(Integer, ForeignKey("subdistricts.id"))
    discovery_date = Column(Date)
    discovery_time = Column(Time)
    discovered_by = Column(String(20), ForeignKey("users.user_id"))
    photo_url = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    modified_at = Column(DateTime, default=func.now(), onupdate=func.now())
    modified_by = Column(String(20), ForeignKey("users.user_id"), nullable=True)
    quantity = Column(DECIMAL(10, 2), nullable=True)
    location = Column(Geometry('POINT', srid=4326), nullable=False)
    ai_confidence = Column(DECIMAL(5, 2), nullable=True)
    
    # Relationships
    exhibit = relationship("Exhibit", back_populates="histories")
    subdistrict = relationship("Subdistrict", back_populates="histories")
    discoverer = relationship("User", foreign_keys=[discovered_by], backref="discovered_histories")
    modifier = relationship("User", foreign_keys=[modified_by], backref="modified_histories")