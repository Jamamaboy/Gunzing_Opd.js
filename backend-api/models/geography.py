import logging
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from db.base import Base
import json

# ✅ ปิด SQLAlchemy logs เฉพาะ geography queries
logging.getLogger('sqlalchemy.engine').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.ERROR)

class Province(Base):
    __tablename__ = "provinces"
    
    id = Column(Integer, primary_key=True, index=True)
    province_name = Column(String, nullable=False, index=True)
    reg_nesdb = Column(String)
    reg_royin = Column(String)
    perimeter = Column(Float)
    area_sqkm = Column(Float)
    geom = Column(Geometry('MULTIPOLYGON'))
    
    # Relationships
    districts = relationship("District", back_populates="province")
    
    def to_dict(self):
        return {
            "id": self.id,
            "province_name": self.province_name,
            "reg_nesdb": self.reg_nesdb,
            "reg_royin": self.reg_royin,
            "perimeter": float(self.perimeter) if self.perimeter else None,
            "area_sqkm": float(self.area_sqkm) if self.area_sqkm else None,
            "geometry": None
        }

class District(Base):
    __tablename__ = "districts"
    
    id = Column(Integer, primary_key=True, index=True)
    district_name = Column(String, nullable=False, index=True)
    province_id = Column(Integer, ForeignKey("provinces.id"), nullable=False)
    perimeter = Column(Float)
    area_sqkm = Column(Float)
    geom = Column(Geometry('MULTIPOLYGON'))
    
    # Relationships
    province = relationship("Province", back_populates="districts")
    subdistricts = relationship("Subdistrict", back_populates="district")
    
    def to_dict(self):
        return {
            "id": self.id,
            "district_name": self.district_name,
            "province_id": self.province_id,
            "province_name": self.province.province_name if self.province else None,
            "perimeter": float(self.perimeter) if self.perimeter else None,
            "area_sqkm": float(self.area_sqkm) if self.area_sqkm else None,
            "geometry": None
        }

class Subdistrict(Base):
    __tablename__ = "subdistricts"
    
    id = Column(Integer, primary_key=True, index=True)
    subdistrict_name = Column(String, nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    perimeter = Column(Float)
    area_sqkm = Column(Float)
    geom = Column(Geometry('MULTIPOLYGON'))
    
    # Relationships
    district = relationship("District", back_populates="subdistricts")
    histories = relationship("History", back_populates="subdistrict")
    cases = relationship("Case", back_populates="subdistrict_ref")
    
    def to_dict(self):
        return {
            "id": self.id,
            "subdistrict_name": self.subdistrict_name,
            "district_id": self.district_id,
            "district_name": self.district.district_name if self.district else None,
            "province_id": self.district.province_id if self.district else None,
            "province_name": self.district.province.province_name if self.district and self.district.province else None,
            "perimeter": float(self.perimeter) if self.perimeter else None,
            "area_sqkm": float(self.area_sqkm) if self.area_sqkm else None,
            "geometry": None
        }