# ลบ import models เพื่อป้องกัน circular import
from db.base import Base

# นำเข้าโมเดลพื้นฐานที่ไม่มีความสัมพันธ์กับโมเดลอื่นก่อน
from .role import Role
from .geography import Province, District, Subdistrict
from .exhibit import Exhibit

# นำเข้าโมเดล ChemicalCompound ก่อน Narcotic
from .narcotic import (
    ChemicalCompound,
    DrugForm,
    Narcotic, 
    NarcoticExampleImage,
    NarcoticChemicalCompound, 
    NarcoticImageVector, 
    NarcoticPill
)

# นำเข้าโมเดล Firearm และที่เกี่ยวข้อง
from .firearm import (
    Ammunition,
    Firearm,
    FirearmExampleImage,
    firearm_ammunitions  # นำเข้า association table ด้วย
)

# นำเข้าโมเดล User และโมเดลที่เกี่ยวข้องกับผู้ใช้
from .user import User
from .user_permission import UserPermission
from .notification import Notification

# นำเข้าโมเดล History ไว้ท้ายสุดเนื่องจากมีการอ้างอิงหลายโมเดล
from .history import History

# รายการโมเดลทั้งหมดที่สามารถนำเข้าได้จาก models package
__all__ = [
    'Base',
    'Role',
    'Province', 'District', 'Subdistrict',
    'Exhibit',
    'ChemicalCompound', 'DrugForm', 'Narcotic', 
    'NarcoticExampleImage', 'NarcoticChemicalCompound',
    'NarcoticImageVector', 'NarcoticPill',
    'Ammunition', 'Firearm', 'FirearmExampleImage', 'firearm_ammunitions',
    'User', 'UserPermission', 'Notification',
    'History'
]