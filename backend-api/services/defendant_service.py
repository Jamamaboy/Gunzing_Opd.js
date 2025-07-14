from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from models.defendant import Defendant
from config.database import get_db_session

class DefendantService:
    
    @staticmethod
    def create_defendant(fullname: str) -> Dict[str, Any]:
        """สร้าง defendant ใหม่"""
        db: Session = get_db_session()
        
        try:
            if not fullname or not fullname.strip():
                return {
                    'success': False,
                    'message': 'Fullname is required'
                }
            
            # ตรวจสอบว่าไม่มีชื่อซ้ำ
            existing_defendant = Defendant.get_by_name(db, fullname)
            if existing_defendant:
                return {
                    'success': False,
                    'message': 'Defendant with this name already exists',
                    'data': existing_defendant.to_dict()
                }
            
            defendant = Defendant.create(db, fullname)
            
            return {
                'success': True,
                'data': defendant.to_dict(),
                'message': 'Defendant created successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create defendant'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_defendant_by_id(defendant_id: int, include_evidences: bool = False) -> Dict[str, Any]:
        """ดึงข้อมูล defendant ตาม ID"""
        db: Session = get_db_session()
        
        try:
            defendant = Defendant.get_by_id(db, defendant_id)
            
            if not defendant:
                return {
                    'success': False,
                    'message': 'Defendant not found'
                }
            
            if include_evidences:
                data = defendant.to_dict_with_evidences()
            else:
                data = defendant.to_dict()
            
            return {
                'success': True,
                'data': data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch defendant'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_all_defendants(skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """ดึงรายการ defendants ทั้งหมด"""
        db: Session = get_db_session()
        
        try:
            defendants = Defendant.get_all(db, skip, limit)
            
            return {
                'success': True,
                'data': [defendant.to_dict() for defendant in defendants],
                'total': len(defendants)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch defendants'
            }
        finally:
            db.close()
    
    @staticmethod
    def search_defendants(search_term: str, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """ค้นหา defendants"""
        db: Session = get_db_session()
        
        try:
            defendants = Defendant.search(db, search_term, skip, limit)
            
            return {
                'success': True,
                'data': [defendant.to_dict() for defendant in defendants],
                'total': len(defendants)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to search defendants'
            }
        finally:
            db.close()
    
    @staticmethod
    def update_defendant(defendant_id: int, fullname: str) -> Dict[str, Any]:
        """อัปเดต defendant"""
        db: Session = get_db_session()
        
        try:
            defendant = Defendant.get_by_id(db, defendant_id)
            
            if not defendant:
                return {
                    'success': False,
                    'message': 'Defendant not found'
                }
            
            if not fullname or not fullname.strip():
                return {
                    'success': False,
                    'message': 'Fullname is required'
                }
            
            # ตรวจสอบชื่อซ้ำ
            if fullname.strip() != defendant.fullname:
                existing_defendant = Defendant.get_by_name(db, fullname)
                if existing_defendant:
                    return {
                        'success': False,
                        'message': 'Defendant with this name already exists'
                    }
            
            updated_defendant = defendant.update(db, fullname)
            
            return {
                'success': True,
                'data': updated_defendant.to_dict(),
                'message': 'Defendant updated successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update defendant'
            }
        finally:
            db.close()
    
    @staticmethod
    def delete_defendant(defendant_id: int) -> Dict[str, Any]:
        """ลบ defendant"""
        db: Session = get_db_session()
        
        try:
            defendant = Defendant.get_by_id(db, defendant_id)
            
            if not defendant:
                return {
                    'success': False,
                    'message': 'Defendant not found'
                }
            
            defendant.delete(db)
            
            return {
                'success': True,
                'message': 'Defendant deleted successfully'
            }
            
        except ValueError as e:
            return {
                'success': False,
                'message': str(e)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to delete defendant'
            }
        finally:
            db.close()
    
    @staticmethod
    def find_or_create_defendant(fullname: str) -> Dict[str, Any]:
        """หาหรือสร้าง defendant"""
        db: Session = get_db_session()
        
        try:
            if not fullname or not fullname.strip():
                return {
                    'success': False,
                    'message': 'Fullname is required'
                }
            
            defendant = Defendant.find_or_create(db, fullname)
            
            return {
                'success': True,
                'data': defendant.to_dict(),
                'message': 'Defendant found or created successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to find or create defendant'
            }
        finally:
            db.close()