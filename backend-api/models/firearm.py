from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from db.base import Base

firearm_ammunitions = Table(
    "firearm_ammunitions",
    Base.metadata,
    Column("firearm_id", Integer, ForeignKey("firearms.id", ondelete="CASCADE"), primary_key=True),
    Column("ammunition_id", Integer, ForeignKey("ammunitions.id"), primary_key=True)
)

class Ammunition(Base):
    __tablename__ = "ammunitions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    caliber = Column(String(50), nullable=False)
    type = Column(String(100))
    description = Column(Text)
    

    firearms = relationship("Firearm", secondary=firearm_ammunitions, back_populates="ammunitions")

class Firearm(Base):
    __tablename__ = "firearms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    exhibit_id = Column(Integer, ForeignKey("exhibits.id", ondelete="CASCADE"))  # ✅ เพิ่ม cascade
    mechanism = Column(String(100))
    brand = Column(String(100))
    series = Column(String(100), nullable=True)
    model = Column(String(100))
    normalized_name = Column(Text, nullable=True)

    # Relationships
    exhibit = relationship("Exhibit", back_populates="firearm")
    # ✅ เพิ่ม cascade delete สำหรับ images และ ammunition relationships
    example_images = relationship(
        "FirearmExampleImage", 
        back_populates="firearm", 
        cascade="all, delete-orphan"  # ลบ images ตามไปด้วย
    )
    ammunitions = relationship(
        "Ammunition", 
        secondary=firearm_ammunitions, 
        back_populates="firearms",
        cascade="all, delete"  # ลบ relationship แต่ไม่ลบ ammunition record
    )

class FirearmExampleImage(Base):
    __tablename__ = "firearms_example_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    firearm_id = Column(Integer, ForeignKey("firearms.id", ondelete="CASCADE"))  # ✅ เพิ่ม cascade
    image_url = Column(Text)
    description = Column(Text, nullable=True)
    priority = Column(Integer, nullable=True)

    # Relationships
    firearm = relationship("Firearm", back_populates="example_images")