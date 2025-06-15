from sqlalchemy import Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session
from typing import List, Optional
from db.base import Base

class Defendant(Base):
    __tablename__ = 'defendant'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    fullname = Column(Text, nullable=False)
    
    # Relationships
    evidences = relationship("Evidence", back_populates="defendant")
    
    def __repr__(self):
        return f"<Defendant(id={self.id}, fullname='{self.fullname}')>"
    
    @classmethod
    def create(cls, db: Session, fullname: str) -> 'Defendant':
        """สร้าง defendant ใหม่"""
        try:
            defendant = cls(fullname=fullname.strip())
            db.add(defendant)
            db.commit()
            db.refresh(defendant)
            return defendant
        except Exception as e:
            db.rollback()
            raise e
    
    @classmethod
    def get_by_id(cls, db: Session, defendant_id: int) -> Optional['Defendant']:
        """ดึงข้อมูล defendant ตาม ID"""
        return db.query(cls).filter(cls.id == defendant_id).first()
    
    @classmethod
    def get_by_name(cls, db: Session, fullname: str) -> Optional['Defendant']:
        """ดึงข้อมูล defendant ตามชื่อ"""
        return db.query(cls).filter(cls.fullname == fullname.strip()).first()
    
    @classmethod
    def find_or_create(cls, db: Session, fullname: str) -> Optional['Defendant']:
        """หาหรือสร้าง defendant ใหม่"""
        if not fullname or not fullname.strip():
            return None
            
        fullname = fullname.strip()
        defendant = cls.get_by_name(db, fullname)
        
        if not defendant:
            defendant = cls.create(db, fullname)
            
        return defendant
    
    @classmethod
    def get_all(cls, db: Session, skip: int = 0, limit: int = 100) -> List['Defendant']:
        """ดึงรายการ defendants ทั้งหมด"""
        return db.query(cls).order_by(cls.fullname).offset(skip).limit(limit).all()
    
    @classmethod
    def search(cls, db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List['Defendant']:
        """ค้นหา defendants"""
        return db.query(cls).filter(
            cls.fullname.ilike(f'%{search_term}%')
        ).order_by(cls.fullname).offset(skip).limit(limit).all()
    
    def update(self, db: Session, fullname: str) -> 'Defendant':
        """อัปเดต defendant"""
        try:
            self.fullname = fullname.strip()
            db.commit()
            db.refresh(self)
            return self
        except Exception as e:
            db.rollback()
            raise e
    
    def delete(self, db: Session) -> bool:
        """ลบ defendant (ถ้าไม่มี evidence ที่เชื่อมโยง)"""
        try:
            if self.evidences:
                raise ValueError("Cannot delete defendant with existing evidence")
            
            db.delete(self)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    def to_dict(self) -> dict:
        """แปลง defendant เป็น dictionary"""
        return {
            'id': self.id,
            'fullname': self.fullname,
            'evidence_count': len(self.evidences) if self.evidences else 0
        }
    
    def to_dict_with_evidences(self) -> dict:
        """แปลง defendant เป็น dictionary พร้อม evidences"""
        data = self.to_dict()
        data['evidences'] = [evidence.to_dict() for evidence in self.evidences]
        return data