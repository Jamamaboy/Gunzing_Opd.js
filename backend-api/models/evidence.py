from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session
from datetime import datetime
from typing import List, Optional
from db.base import Base
from models.case import Case

class Evidence(Base):
    __tablename__ = 'evidence'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(Integer, ForeignKey('cases.id', ondelete='CASCADE'), nullable=False)
    sequence_number = Column(Integer)
    quantity = Column(Integer)
    unit = Column(String(50))
    color = Column(String(50))
    diameter_mm = Column(Numeric(5, 2))
    thickness_mm = Column(Numeric(5, 2))
    edge_shape = Column(String(50))
    weight = Column(Numeric(10, 2))
    characteristics = Column(Text)
    drug_type = Column(String(100))
    defendant_id = Column(Integer, ForeignKey('defendant.id'))
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    case = relationship("Case", back_populates="evidences")
    defendant = relationship("Defendant", back_populates="evidences")
    chemical_compounds = relationship("EvidenceChemicalCompounds", back_populates="evidence", cascade="all, delete-orphan")
    images = relationship("EvidenceImages", back_populates="evidence", cascade="all, delete-orphan")
    file_mappings = relationship("EvidenceFileMapping", back_populates="evidence")
    
    def __repr__(self):
        return f"<Evidence(id={self.id}, case_id={self.case_id}, sequence_number={self.sequence_number})>"
    
    @classmethod
    def create(cls, db: Session, evidence_data: dict) -> 'Evidence':
        """สร้าง evidence ใหม่"""
        try:
            evidence = cls(
                case_id=evidence_data['case_id'],
                sequence_number=evidence_data.get('sequence_number'),
                quantity=evidence_data.get('quantity'),
                unit=evidence_data.get('unit'),
                color=evidence_data.get('color'),
                diameter_mm=evidence_data.get('diameter_mm'),
                thickness_mm=evidence_data.get('thickness_mm'),
                edge_shape=evidence_data.get('edge_shape'),
                weight=evidence_data.get('weight'),
                characteristics=evidence_data.get('characteristics'),
                drug_type=evidence_data.get('drug_type'),
                defendant_id=evidence_data.get('defendant_id')
            )
            
            db.add(evidence)
            db.commit()
            db.refresh(evidence)
            return evidence
            
        except Exception as e:
            db.rollback()
            raise e
    
    @classmethod
    def get_by_id(cls, db: Session, evidence_id: int) -> Optional['Evidence']:
        """ดึงข้อมูล evidence ตาม ID"""
        return db.query(cls).filter(cls.id == evidence_id).first()
    
    @classmethod
    def get_by_case_id(cls, db: Session, case_id: int) -> List['Evidence']:
        """ดึงข้อมูล evidences ตาม case_id"""
        return db.query(cls).filter(cls.case_id == case_id).order_by(cls.sequence_number).all()
    
    @classmethod
    def get_by_defendant_id(cls, db: Session, defendant_id: int) -> List['Evidence']:
        """ดึงข้อมูล evidences ตาม defendant_id"""
        return db.query(cls).filter(cls.defendant_id == defendant_id).all()
    
    @classmethod
    def get_all(cls, db: Session, skip: int = 0, limit: int = 100) -> List['Evidence']:
        """ดึงรายการ evidences ทั้งหมด"""
        return db.query(cls).offset(skip).limit(limit).all()
    
    @classmethod
    def search(cls, db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List['Evidence']:
        """ค้นหา evidences"""
        return db.query(cls).join(Case, cls.case_id == Case.id).filter(
            cls.drug_type.ilike(f'%{search_term}%') |
            cls.characteristics.ilike(f'%{search_term}%') |
            cls.color.ilike(f'%{search_term}%') |
            Case.case_id.ilike(f'%{search_term}%')
        ).offset(skip).limit(limit).all()
    
    def update(self, db: Session, evidence_data: dict) -> 'Evidence':
        """อัปเดต evidence"""
        try:
            for key, value in evidence_data.items():
                if hasattr(self, key):
                    setattr(self, key, value)
            
            self.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(self)
            return self
            
        except Exception as e:
            db.rollback()
            raise e
    
    def delete(self, db: Session) -> bool:
        """ลบ evidence"""
        try:
            db.delete(self)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    def to_dict(self) -> dict:
        """แปลง Evidence เป็น dictionary"""
        return {
            'id': self.id,
            'case_id': self.case_id,
            'case_number': self.case.case_id if self.case else None,
            'sequence_number': self.sequence_number,
            'quantity': self.quantity,
            'unit': self.unit,
            'color': self.color,
            'diameter_mm': float(self.diameter_mm) if self.diameter_mm else None,
            'thickness_mm': float(self.thickness_mm) if self.thickness_mm else None,
            'edge_shape': self.edge_shape,
            'weight': float(self.weight) if self.weight else None,
            'characteristics': self.characteristics,
            'drug_type': self.drug_type,
            'defendant_id': self.defendant_id,
            'defendant_name': self.defendant.fullname if self.defendant else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_dict_with_details(self) -> dict:
        """แปลง Evidence เป็น dictionary พร้อมรายละเอียดทั้งหมด"""
        data = self.to_dict()
        data['chemical_compounds'] = [compound.to_dict() for compound in self.chemical_compounds]
        data['images'] = [image.to_dict() for image in self.images]
        data['file_mappings'] = [mapping.to_dict() for mapping in self.file_mappings]
        return data


class EvidenceChemicalCompounds(Base):
    __tablename__ = 'evidence_chemical_compounds'
    
    evidence_id = Column(Integer, ForeignKey('evidence.id', ondelete='CASCADE'), primary_key=True)
    chemical_compound_id = Column(Integer, primary_key=True)
    percentage = Column(Numeric(5, 2))
    
    # Relationships
    evidence = relationship("Evidence", back_populates="chemical_compounds")
    
    def to_dict(self) -> dict:
        return {
            'evidence_id': self.evidence_id,
            'chemical_compound_id': self.chemical_compound_id,
            'percentage': float(self.percentage) if self.percentage else None
        }


class EvidenceImages(Base):
    __tablename__ = 'evidence_images'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False)
    image_url = Column(Text, nullable=False)
    description = Column(Text)
    priority = Column(Integer, default=1)
    image_type = Column(String(50), default='photo')
    
    # Relationships
    evidence = relationship("Evidence", back_populates="images")
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'evidence_id': self.evidence_id,
            'image_url': self.image_url,
            'description': self.description,
            'priority': self.priority,
            'image_type': self.image_type
        }


class EvidenceFileMapping(Base):
    __tablename__ = 'evidence_file_mapping'
    
    file_id = Column(Integer, ForeignKey('file_uploads.id'), primary_key=True)
    evidence_id = Column(Integer, ForeignKey('evidence.id'), primary_key=True)
    
    # Relationships
    evidence = relationship("Evidence", back_populates="file_mappings")
    
    def to_dict(self) -> dict:
        return {
            'file_id': self.file_id,
            'evidence_id': self.evidence_id
        }