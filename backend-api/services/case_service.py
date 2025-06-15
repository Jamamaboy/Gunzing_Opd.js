from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from models.case import Case
from models.evidence import Evidence
from models.defendant import Defendant
from models.geography import Subdistrict, District, Province
from sqlalchemy import and_, or_, func
from datetime import datetime
from config.database import get_db_session
from services.evidence_service import EvidenceService
from services.defendant_service import DefendantService
import traceback

class CaseService:
    
    @staticmethod
    def create_case(case_data: Dict[str, Any]) -> Dict[str, Any]:
        """สร้าง Case ใหม่"""
        db: Session = get_db_session()
        
        try:
            # ตรวจสอบว่า case_id ไม่ซ้ำ
            existing_case = Case.get_by_case_id(db, case_data['case_id'])
            if existing_case:
                return {
                    'success': False,
                    'message': 'Case ID already exists'
                }
            
            # ✅ ตรวจสอบ subdistrict_id (ถ้ามี)
            if case_data.get('subdistrict_id'):
                subdistrict = db.query(Subdistrict).filter(
                    Subdistrict.id == case_data['subdistrict_id']
                ).first()
                if not subdistrict:
                    return {
                        'success': False,
                        'message': f"Subdistrict ID {case_data['subdistrict_id']} not found"
                    }
            
            case = Case.create(db, case_data)
            
            return {
                'success': True,
                'data': case.to_dict(),
                'message': 'Case created successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create case'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_case_by_id(case_id: int) -> Dict[str, Any]:
        """ดึงข้อมูล Case ตาม ID พร้อม evidences และ geography"""
        db: Session = get_db_session()
        
        try:
            # ✅ ใช้ joinedload เพื่อ eager load geography relationships
            case = db.query(Case).options(
                joinedload(Case.subdistrict_ref).joinedload(Subdistrict.district).joinedload(District.province),
                joinedload(Case.evidences)
            ).filter(Case.id == case_id).first()
            
            if not case:
                return {
                    'success': False,
                    'message': 'Case not found'
                }
            
            case_dict = case.to_dict()
            # เพิ่มข้อมูล evidences
            case_dict['evidences'] = [evidence.to_dict() for evidence in case.evidences]
            
            return {
                'success': True,
                'data': case_dict
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch case'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_case_by_case_id(case_id: str) -> Dict[str, Any]:
        """ดึงข้อมูล Case ตาม case_id"""
        db: Session = get_db_session()
        
        try:
            # ✅ ใช้ joinedload เพื่อ eager load geography relationships
            case = db.query(Case).options(
                joinedload(Case.subdistrict_ref).joinedload(Subdistrict.district).joinedload(District.province),
                joinedload(Case.evidences)
            ).filter(Case.case_id == case_id).first()
            
            if not case:
                return {
                    'success': False,
                    'message': 'Case not found'
                }
            
            case_dict = case.to_dict()
            case_dict['evidences'] = [evidence.to_dict() for evidence in case.evidences]
            
            return {
                'success': True,
                'data': case_dict
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch case'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_all_cases(skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """ดึงรายการ Case ทั้งหมด"""
        db: Session = get_db_session()
        
        try:
            # ✅ ใช้ joinedload เพื่อ eager load geography relationships
            cases = db.query(Case).options(
                joinedload(Case.subdistrict_ref).joinedload(Subdistrict.district).joinedload(District.province)
            ).offset(skip).limit(limit).all()
            
            return {
                'success': True,
                'data': [case.to_dict() for case in cases],
                'total': len(cases)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch cases'
            }
        finally:
            db.close()
    
    @staticmethod
    def search_cases(search_term: str, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """ค้นหา Case"""
        db: Session = get_db_session()
        
        try:
            # ✅ ใช้ search method ที่อัปเดตแล้วใน Model
            cases = Case.search(db, search_term, skip, limit)
            
            return {
                'success': True,
                'data': [case.to_dict() for case in cases],
                'total': len(cases)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to search cases'
            }
        finally:
            db.close()
    
    @staticmethod
    def update_case(case_id: int, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """อัปเดต Case"""
        db: Session = get_db_session()
        
        try:
            case = Case.get_by_id(db, case_id)
            
            if not case:
                return {
                    'success': False,
                    'message': 'Case not found'
                }
            
            # ตรวจสอบ case_id ซ้ำ (ถ้ามีการเปลี่ยน)
            if 'case_id' in case_data and case_data['case_id'] != case.case_id:
                existing_case = Case.get_by_case_id(db, case_data['case_id'])
                if existing_case:
                    return {
                        'success': False,
                        'message': 'Case ID already exists'
                    }
            
            # ✅ ตรวจสอบ subdistrict_id ใหม่ (ถ้ามีการเปลี่ยน)
            if 'subdistrict_id' in case_data and case_data['subdistrict_id']:
                subdistrict = db.query(Subdistrict).filter(
                    Subdistrict.id == case_data['subdistrict_id']
                ).first()
                if not subdistrict:
                    return {
                        'success': False,
                        'message': f"Subdistrict ID {case_data['subdistrict_id']} not found"
                    }
            
            updated_case = case.update(db, case_data)
            
            return {
                'success': True,
                'data': updated_case.to_dict(),
                'message': 'Case updated successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update case'
            }
        finally:
            db.close()
    
    @staticmethod
    def delete_case(case_id: int) -> Dict[str, Any]:
        """ลบ Case"""
        db: Session = get_db_session()
        
        try:
            case = Case.get_by_id(db, case_id)
            
            if not case:
                return {
                    'success': False,
                    'message': 'Case not found'
                }
            
            case.delete(db)
            
            return {
                'success': True,
                'message': 'Case deleted successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to delete case'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_case_statistics() -> Dict[str, Any]:
        """ดึงสถิติของ Case"""
        db: Session = get_db_session()
        
        try:
            total_cases = db.query(Case).count()
            total_evidences = db.query(Evidence).count()
            
            # ✅ เพิ่มสถิติตาม Geography
            geography_stats = db.query(
                Province.province_name,
                func.count(Case.id).label('case_count')
            ).join(
                Subdistrict, Case.subdistrict == Subdistrict.id
            ).join(
                District, Subdistrict.district_id == District.id
            ).join(
                Province, District.province_id == Province.id
            ).group_by(Province.province_name).all()
            
            # สถิติตามเดือน (ล่าสุด 12 เดือน)
            from sqlalchemy import extract, func
            monthly_stats = db.query(
                extract('year', Case.created_at).label('year'),
                extract('month', Case.created_at).label('month'),
                func.count(Case.id).label('case_count')
            ).group_by(
                extract('year', Case.created_at),
                extract('month', Case.created_at)
            ).order_by(
                extract('year', Case.created_at).desc(),
                extract('month', Case.created_at).desc()
            ).limit(12).all()
            
            return {
                'success': True,
                'data': {
                    'total_cases': total_cases,
                    'total_evidences': total_evidences,
                    'geography_stats': [
                        {
                            'province_name': stat.province_name,
                            'case_count': stat.case_count
                        } for stat in geography_stats
                    ],
                    'monthly_stats': [
                        {
                            'year': int(stat.year),
                            'month': int(stat.month),
                            'case_count': stat.case_count
                        } for stat in monthly_stats
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
    
    @staticmethod
    def find_or_create_case(case_id: str, case_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """หาหรือสร้าง Case (สำหรับ CSV Upload)"""
        db: Session = get_db_session()
        
        try:
            case = Case.get_by_case_id(db, case_id)
            
            if case:
                return {
                    'success': True,
                    'data': case.to_dict(),
                    'message': 'Case found',
                    'created': False
                }
            
            # สร้างใหม่
            if not case_data:
                case_data = {'case_id': case_id}
            else:
                case_data['case_id'] = case_id
            
            case = Case.create(db, case_data)
            
            return {
                'success': True,
                'data': case.to_dict(),
                'message': 'Case created successfully',
                'created': True
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to find or create case'
            }
        finally:
            db.close()
    
    @staticmethod
    def get_cases_with_relationships(filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """ดึงรายการ Case พร้อมความสัมพันธ์ทั้งหมด โดยใช้ existing services"""
        try:
            print(f"🔍 Service received filters: {filters}")
            
            # ✅ เรียกใช้ existing service methods
            print("🔍 Step 1: Getting cases...")
            cases_result = CaseService.get_all_cases(0, 10000)
            if not cases_result['success']:
                print(f"❌ Failed to get cases: {cases_result['message']}")
                return cases_result
            
            cases = cases_result['data']
            print(f"🔍 Found {len(cases)} cases")
            
            print("🔍 Step 2: Getting evidences...")
            evidences_result = EvidenceService.get_all_evidences(0, 50000)
            if not evidences_result['success']:
                print(f"❌ Failed to get evidences: {evidences_result['message']}")
                evidences = []
            else:
                evidences = evidences_result['data']
                print(f"🔍 Found {len(evidences)} evidences")
            
            print("🔍 Step 3: Getting defendants...")
            defendants_result = DefendantService.get_all_defendants(0, 50000)
            if not defendants_result['success']:
                print(f"❌ Failed to get defendants: {defendants_result['message']}")
                defendants = []
            else:
                defendants = defendants_result['data']
                print(f"🔍 Found {len(defendants)} defendants")
            
            # ✅ สร้าง mapping สำหรับ performance
            print("🔍 Step 4: Creating mappings...")
            evidences_by_case = {}
            for evidence in evidences:
                case_id = evidence.get('case_id')
                if case_id:
                    if case_id not in evidences_by_case:
                        evidences_by_case[case_id] = []
                    evidences_by_case[case_id].append(evidence)
            
            defendants_by_id = {d.get('id'): d for d in defendants if d.get('id')}
            
            print(f"🔍 Evidences mapping: {len(evidences_by_case)} cases have evidences")
            print(f"🔍 Defendants mapping: {len(defendants_by_id)} defendants available")
            
            # ✅ รวมข้อมูลเข้าด้วยกัน
            print("🔍 Step 5: Combining data...")
            enhanced_cases = []
            
            for case in cases:
                try:
                    case_id = case.get('id')
                    case_evidences = evidences_by_case.get(case_id, [])
                    
                    # ✅ หา defendants ที่เกี่ยวข้องกับ case นี้
                    case_defendants = []
                    seen_defendant_ids = set()
                    
                    for evidence in case_evidences:
                        defendant_id = evidence.get('defendant_id')
                        if defendant_id and defendant_id not in seen_defendant_ids:
                            defendant = defendants_by_id.get(defendant_id)
                            if defendant:
                                case_defendants.append(defendant)
                                seen_defendant_ids.add(defendant_id)
                    
                    # ✅ **สำคัญ** - เพิ่มข้อมูล evidences และ defendants เข้าใน case
                    case_copy = case.copy()  # สร้าง copy เพื่อไม่แก้ไข original
                    case_copy['evidences'] = case_evidences
                    case_copy['defendants'] = case_defendants
                    
                    # ✅ สร้าง summary
                    case_copy['summary'] = {
                        'evidence_count': len(case_evidences),
                        'defendant_count': len(case_defendants),
                        'drug_types': list(set([e.get('drug_type') for e in case_evidences if e.get('drug_type')])),
                        'total_weight': sum([float(e.get('weight', 0) or 0) for e in case_evidences]),
                        'status': 'open'
                    }
                    
                    print(f"✅ Case {case.get('case_id')}: {len(case_evidences)} evidences, {len(case_defendants)} defendants")
                    enhanced_cases.append(case_copy)
                    
                except Exception as case_error:
                    print(f"❌ Error processing case {case.get('id', 'unknown')}: {case_error}")
                    # เพิ่ม case ต้นฉบับถ้า error
                    enhanced_cases.append(case)
                    continue
            
            print(f"🔍 Step 6: Enhanced {len(enhanced_cases)} cases")
            
            # ✅ Apply filters
            if filters:
                print("🔍 Step 7: Applying filters...")
                filtered_cases = []
                for case in enhanced_cases:
                    should_include = True
                    
                    # Search filter
                    if filters.get('search'):
                        search_term = filters['search'].lower()
                        searchable_text = f"{case.get('case_id', '')} {case.get('seized_from', '')} {case.get('occurrence_place', '')}".lower()
                        
                        # เพิ่ม defendant names ใน search
                        for defendant in case.get('defendants', []):
                            searchable_text += f" {defendant.get('fullname', '')}".lower()
                        
                        if search_term not in searchable_text:
                            should_include = False
                    
                    # Drug type filter
                    if should_include and filters.get('drug_type'):
                        drug_type = filters['drug_type'].lower()
                        case_drug_types = [e.get('drug_type', '').lower() for e in case.get('evidences', [])]
                        if not any(drug_type in dt for dt in case_drug_types if dt):
                            should_include = False
                    
                    # Date filters
                    if should_include and filters.get('start_date'):
                        try:
                            start_date = datetime.strptime(filters['start_date'], '%Y-%m-%d').date()
                            case_date_str = case.get('occurrence_date')
                            if case_date_str:
                                case_date = datetime.strptime(case_date_str, '%Y-%m-%d').date()
                                if case_date < start_date:
                                    should_include = False
                        except (ValueError, TypeError):
                            pass
                    
                    if should_include and filters.get('end_date'):
                        try:
                            end_date = datetime.strptime(filters['end_date'], '%Y-%m-%d').date()
                            case_date_str = case.get('occurrence_date')
                            if case_date_str:
                                case_date = datetime.strptime(case_date_str, '%Y-%m-%d').date()
                                if case_date > end_date:
                                    should_include = False
                        except (ValueError, TypeError):
                            pass
                    
                    # Province/District filters
                    if should_include and filters.get('province'):
                        province_name = case.get('province_name', '').lower()
                        if filters['province'].lower() not in province_name:
                            should_include = False
                    
                    if should_include and filters.get('district'):
                        district_name = case.get('district_name', '').lower()
                        if filters['district'].lower() not in district_name:
                            should_include = False
                    
                    if should_include:
                        filtered_cases.append(case)
                
                enhanced_cases = filtered_cases
                print(f"🔍 After filtering: {len(enhanced_cases)} cases")
            
            print(f"✅ Returning {len(enhanced_cases)} cases with relationships")
            
            # ✅ Debug: แสดง sample structure
            if enhanced_cases:
                sample = enhanced_cases[0]
                print(f"📋 Sample structure keys: {list(sample.keys())}")
                print(f"📋 Has evidences: {'evidences' in sample}")
                print(f"📋 Has defendants: {'defendants' in sample}")
                if 'evidences' in sample:
                    print(f"📋 Evidences count: {len(sample['evidences'])}")
                if 'defendants' in sample:
                    print(f"📋 Defendants count: {len(sample['defendants'])}")
            
            return {
                'success': True,
                'data': enhanced_cases,
                'total': len(enhanced_cases)
            }
            
        except Exception as e:
            print(f"❌ Error in get_cases_with_relationships: {str(e)}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch cases with relationships'
            }