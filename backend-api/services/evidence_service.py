from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from models.evidence import Evidence, EvidenceChemicalCompounds, EvidenceImages, EvidenceFileMapping
from models.case import Case
from models.defendant import Defendant
from config.database import get_db_session

class EvidenceService:
    
    @staticmethod
    def create_evidence(evidence_data: Dict[str, Any], 
                       chemical_compounds: List[Dict[str, Any]] = None,
                       images: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """สร้าง evidence ใหม่"""
        db: Session = get_db_session()
        
        try:
            # ตรวจสอบว่า Case มีอยู่หรือไม่
            case = Case.get_by_id(db, evidence_data['case_id'])
            if not case:
                return {
                    'success': False,
                    'message': 'Case not found'
                }
            
            # ตรวจสอบ defendant (ถ้ามี)
            if evidence_data.get('defendant_id'):
                defendant = Defendant.get_by_id(db, evidence_data['defendant_id'])
                if not defendant:
                    return {
                        'success': False,
                        'message': 'Defendant not found'
                    }
            
            # สร้าง evidence
            evidence = Evidence.create(db, evidence_data)
            
            # เพิ่ม chemical compounds
            if chemical_compounds:
                for compound_data in chemical_compounds:
                    if compound_data.get('chemical_compound_id') and compound_data.get('percentage'):
                        compound = EvidenceChemicalCompounds(
                            evidence_id=evidence.id,
                            chemical_compound_id=compound_data['chemical_compound_id'],
                            percentage=compound_data['percentage']
                        )
                        db.add(compound)
            
            # เพิ่ม images
            if images:
                for image_data in images:
                    image = EvidenceImages(
                        evidence_id=evidence.id,
                        image_url=image_data['image_url'],
                        description=image_data.get('description'),
                        priority=image_data.get('priority', 1),
                        image_type=image_data.get('image_type', 'photo')
                    )
                    db.add(image)
            
            db.commit()
            db.refresh(evidence)
            
            return {
                'success': True,
                'data': evidence.to_dict_with_details(),
                'message': 'Evidence created successfully'
            }
            
        except Exception as e:
            db.rollback()
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create evidence'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_evidence_by_id(evidence_id: int, include_details: bool = True) -> Dict[str, Any]:
        """ดึงข้อมูล evidence ตาม ID"""
        db: Session = get_db_session()
        
        try:
            evidence = Evidence.get_by_id(db, evidence_id)
            
            if not evidence:
                return {
                    'success': False,
                    'message': 'Evidence not found'
                }
            
            if include_details:
                data = evidence.to_dict_with_details()
            else:
                data = evidence.to_dict()
            
            return {
                'success': True,
                'data': data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch evidence'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_all_evidences(skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """ดึงรายการ evidences ทั้งหมด"""
        db: Session = get_db_session()
        
        try:
            evidences = Evidence.get_all(db, skip, limit)
            
            return {
                'success': True,
                'data': [evidence.to_dict() for evidence in evidences],
                'total': len(evidences)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch evidences'
            }
        finally:
            db.close()
    
    @staticmethod
    def search_evidences(search_term: str, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """ค้นหา evidences"""
        db: Session = get_db_session()
        
        try:
            evidences = Evidence.search(db, search_term, skip, limit)
            
            return {
                'success': True,
                'data': [evidence.to_dict() for evidence in evidences],
                'total': len(evidences)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to search evidences'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_evidences_by_case_id(case_id: int) -> Dict[str, Any]:
        """ดึงข้อมูล evidences ตาม case_id"""
        db: Session = get_db_session()
        
        try:
            evidences = Evidence.get_by_case_id(db, case_id)
            
            return {
                'success': True,
                'data': [evidence.to_dict() for evidence in evidences],
                'total': len(evidences)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch evidences'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_evidences_by_defendant_id(defendant_id: int) -> Dict[str, Any]:
        """ดึงข้อมูล evidences ตาม defendant_id"""
        db: Session = get_db_session()
        
        try:
            evidences = Evidence.get_by_defendant_id(db, defendant_id)
            
            return {
                'success': True,
                'data': [evidence.to_dict() for evidence in evidences],
                'total': len(evidences)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch evidences'
            }
        finally:
            db.close()
    
    @staticmethod
    def update_evidence(evidence_id: int, evidence_data: Dict[str, Any]) -> Dict[str, Any]:
        """อัปเดต evidence"""
        db: Session = get_db_session()
        
        try:
            evidence = Evidence.get_by_id(db, evidence_id)
            
            if not evidence:
                return {
                    'success': False,
                    'message': 'Evidence not found'
                }
            
            # ตรวจสอบ case_id ใหม่ (ถ้ามีการเปลี่ยน)
            if 'case_id' in evidence_data:
                case = Case.get_by_id(db, evidence_data['case_id'])
                if not case:
                    return {
                        'success': False,
                        'message': 'Case not found'
                    }
            
            # ตรวจสอบ defendant_id ใหม่ (ถ้ามีการเปลี่ยน)
            if 'defendant_id' in evidence_data and evidence_data['defendant_id']:
                defendant = Defendant.get_by_id(db, evidence_data['defendant_id'])
                if not defendant:
                    return {
                        'success': False,
                        'message': 'Defendant not found'
                    }
            
            updated_evidence = evidence.update(db, evidence_data)
            
            return {
                'success': True,
                'data': updated_evidence.to_dict(),
                'message': 'Evidence updated successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update evidence'
            }
        finally:
            db.close()
    
    @staticmethod
    def delete_evidence(evidence_id: int) -> Dict[str, Any]:
        """ลบ evidence"""
        db: Session = get_db_session()
        
        try:
            evidence = Evidence.get_by_id(db, evidence_id)
            
            if not evidence:
                return {
                    'success': False,
                    'message': 'Evidence not found'
                }
            
            evidence.delete(db)
            
            return {
                'success': True,
                'message': 'Evidence deleted successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to delete evidence'
            }
        finally:
            db.close()
    
    # Methods สำหรับ Chemical Compounds และ Images จะเพิ่มต่อ...
    
    @staticmethod
    def get_evidence_statistics() -> Dict[str, Any]:
        """ดึงสถิติของ evidences"""
        db: Session = get_db_session()
        
        try:
            from sqlalchemy import func
            
            total_evidences = db.query(Evidence).count()
            
            # สถิติตามประเภทยา
            drug_type_stats = db.query(
                Evidence.drug_type,
                func.count(Evidence.id).label('count')
            ).filter(
                Evidence.drug_type.isnot(None)
            ).group_by(Evidence.drug_type).all()
            
            return {
                'success': True,
                'data': {
                    'total_evidences': total_evidences,
                    'drug_type_statistics': [
                        {
                            'drug_type': stat.drug_type,
                            'count': stat.count
                        } for stat in drug_type_stats
                    ]
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch statistics'
            }
        finally:
            db.close()