from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, Session
from datetime import datetime, date
from typing import List, Optional
from db.base import Base

class Case(Base):
    __tablename__ = 'cases'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(50), nullable=False, unique=True)
    seized_from = Column(Text)
    occurrence_date = Column(Date)
    occurrence_place = Column(Text)
    house_number = Column(String(50))
    moo = Column(String(50))
    soi = Column(String(50))
    street = Column(String(100))
    
    # ✅ อัปเดต: เป็น Foreign Key แทน String
    subdistrict = Column(Integer, ForeignKey("subdistricts.id"), nullable=True)
    
    inspection_number = Column(String(50))
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    # ✅ เพิ่ม relationship กับ Subdistricts
    subdistrict_ref = relationship("Subdistrict", back_populates="cases")
    # ✅ เพิ่ม lazy loading และ back reference สำหรับ evidences
    evidences = relationship("Evidence", back_populates="case", cascade="all, delete-orphan", lazy="select")
    
    def __repr__(self):
        return f"<Case(id={self.id}, case_id='{self.case_id}')>"
    
    @classmethod
    def create(cls, db: Session, case_data: dict) -> 'Case':
        """สร้าง Case ใหม่"""
        try:
            case = cls(
                case_id=case_data['case_id'],
                seized_from=case_data.get('seized_from'),
                occurrence_date=case_data.get('occurrence_date'),
                occurrence_place=case_data.get('occurrence_place'),
                house_number=case_data.get('house_number'),
                moo=case_data.get('moo'),
                soi=case_data.get('soi'),
                street=case_data.get('street'),
                
                # ✅ อัปเดต: รับ subdistrict_id แทน subdistrict string
                subdistrict=case_data.get('subdistrict_id') or case_data.get('subdistrict'),
                
                inspection_number=case_data.get('inspection_number')
            )
            
            db.add(case)
            db.commit()
            db.refresh(case)
            return case
            
        except Exception as e:
            db.rollback()
            raise e
    
    @classmethod
    def get_by_id(cls, db: Session, case_id: int) -> Optional['Case']:
        """ดึงข้อมูล Case ตาม ID"""
        return db.query(cls).filter(cls.id == case_id).first()
    
    @classmethod
    def get_by_case_id(cls, db: Session, case_id: str) -> Optional['Case']:
        """ดึงข้อมูล Case ตาม case_id"""
        return db.query(cls).filter(cls.case_id == case_id).first()
    
    @classmethod
    def get_all(cls, db: Session, skip: int = 0, limit: int = 100) -> List['Case']:
        """ดึงรายการ Case ทั้งหมด"""
        return db.query(cls).offset(skip).limit(limit).all()
    
    @classmethod
    def search(cls, db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List['Case']:
        """ค้นหา Case"""
        # ✅ อัปเดต: ใช้ join กับ Subdistricts สำหรับการค้นหา
        from models.geography import Subdistrict, District, Province
        
        return db.query(cls).outerjoin(
            Subdistrict, cls.subdistrict == Subdistrict.id
        ).outerjoin(
            District, Subdistrict.district_id == District.id
        ).outerjoin(
            Province, District.province_id == Province.id
        ).filter(
            cls.case_id.ilike(f'%{search_term}%') |
            cls.seized_from.ilike(f'%{search_term}%') |
            cls.occurrence_place.ilike(f'%{search_term}%') |
            Subdistrict.subdistrict_name.ilike(f'%{search_term}%') |
            District.district_name.ilike(f'%{search_term}%') |
            Province.province_name.ilike(f'%{search_term}%')
        ).offset(skip).limit(limit).all()
    
    def update(self, db: Session, case_data: dict) -> 'Case':
        """อัปเดต Case"""
        try:
            for key, value in case_data.items():
                # ✅ แปลง subdistrict_id เป็น subdistrict
                if key == 'subdistrict_id':
                    setattr(self, 'subdistrict', value)
                elif hasattr(self, key):
                    setattr(self, key, value)
            
            self.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(self)
            return self
            
        except Exception as e:
            db.rollback()
            raise e
    
    def delete(self, db: Session) -> bool:
        """ลบ Case"""
        try:
            db.delete(self)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    def to_dict(self) -> dict:
        """แปลง Case เป็น dictionary"""
        result = {
            'id': self.id,
            'case_id': self.case_id,
            'seized_from': self.seized_from,
            'occurrence_date': self.occurrence_date.isoformat() if self.occurrence_date else None,
            'occurrence_place': self.occurrence_place,
            'house_number': self.house_number,
            'moo': self.moo,
            'soi': self.soi,
            'street': self.street,
            
            # ✅ อัปเดต: ส่งข้อมูล Geography ครบ พร้อม error handling
            'subdistrict_id': self.subdistrict,
            'subdistrict_name': None,
            'district_id': None,
            'district_name': None,
            'province_id': None,
            'province_name': None,
            
            'inspection_number': self.inspection_number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'evidence_count': len(self.evidences) if self.evidences else 0
        }
        
        # ✅ เพิ่ม safe access สำหรับ geography data
        try:
            if self.subdistrict_ref:
                result['subdistrict_name'] = self.subdistrict_ref.subdistrict_name
                if self.subdistrict_ref.district:
                    result['district_id'] = self.subdistrict_ref.district_id
                    result['district_name'] = self.subdistrict_ref.district.district_name
                    if self.subdistrict_ref.district.province:
                        result['province_id'] = self.subdistrict_ref.district.province_id
                        result['province_name'] = self.subdistrict_ref.district.province.province_name
        except Exception as geo_error:
            print(f"⚠️ Geography data access error for case {self.id}: {geo_error}")
        
        return result