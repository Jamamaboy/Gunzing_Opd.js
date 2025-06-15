from sqlalchemy import Column, Integer, String, Text, ForeignKey, Numeric, Table, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from db.base import Base
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import ARRAY

class ChemicalCompound(Base):
    __tablename__ = "chemical_compounds"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

class DrugForm(Base):
    __tablename__ = "drug_forms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    narcotic = relationship("Narcotic", back_populates="drug_form")

class Narcotic(Base):
    __tablename__ = "narcotics"

    id = Column(Integer, primary_key=True, index=True)
    exhibit_id = Column(Integer, ForeignKey("exhibits.id"))
    form_id = Column(Integer, ForeignKey("drug_forms.id"))
    characteristics = Column(String(100))
    drug_type = Column(String(100))
    drug_category = Column(String(100))
    consumption_method = Column(String(100))
    effect = Column(Text)
    weight_grams = Column(Numeric(10, 2))

    # Relationships with CASCADE DELETE
    exhibit = relationship("Exhibit", back_populates="narcotic")
    drug_form = relationship("DrugForm", back_populates="narcotic")
    example_images = relationship("NarcoticExampleImage", back_populates="narcotic", cascade="all, delete-orphan")
    chemical_compounds = relationship("NarcoticChemicalCompound", back_populates="narcotic", cascade="all, delete-orphan")
    image_vectors = relationship("NarcoticImageVector", back_populates="narcotic", cascade="all, delete-orphan")
    pill_info = relationship("NarcoticPill", uselist=False, back_populates="narcotic", cascade="all, delete-orphan")

class NarcoticExampleImage(Base):
    __tablename__ = "narcotic_example_images"

    id = Column(Integer, primary_key=True, index=True)
    narcotic_id = Column(Integer, ForeignKey("narcotics.id", ondelete="CASCADE"))
    image_url = Column(Text)
    description = Column(Text)
    priority = Column(Integer)
    image_type = Column(String(50))

    # Relationships
    narcotic = relationship("Narcotic", back_populates="example_images")
    image_vectors = relationship("NarcoticImageVector", back_populates="image")

class NarcoticChemicalCompound(Base):
    __tablename__ = "narcotics_chemical_compounds"

    narcotic_id = Column(Integer, ForeignKey("narcotics.id", ondelete="CASCADE"), primary_key=True)
    chemical_compound_id = Column(Integer, ForeignKey("chemical_compounds.id"), primary_key=True)
    percentage = Column(Numeric(5, 2))

    # Relationships
    narcotic = relationship("Narcotic", back_populates="chemical_compounds")
    chemical_compound = relationship("ChemicalCompound")

    __table_args__ = (
        PrimaryKeyConstraint("narcotic_id", "chemical_compound_id"),
    )

class NarcoticImageVector(Base):
    __tablename__ = "narcotics_image_vectors"
    
    id = Column(Integer, primary_key=True, index=True)
    narcotic_id = Column(Integer, ForeignKey("narcotics.id", ondelete="CASCADE"))
    image_id = Column(Integer, ForeignKey("narcotic_example_images.id", ondelete="CASCADE"))
    image_vector = Column(Vector(16000))
    
    # Relationships
    narcotic = relationship("Narcotic", back_populates="image_vectors")
    image = relationship("NarcoticExampleImage", back_populates="image_vectors")

class NarcoticPill(Base):
    __tablename__ = "narcotics_pills"
    
    # เพิ่ม ondelete="CASCADE" ใน ForeignKey
    narcotic_id = Column(Integer, ForeignKey("narcotics.id", ondelete="CASCADE"), primary_key=True)
    color = Column(String(50))
    diameter_mm = Column(Numeric(5, 2))
    thickness_mm = Column(Numeric(5, 2))
    edge_shape = Column(String(50))
    
    # Relationship
    narcotic = relationship("Narcotic", back_populates="pill_info")
    
    __table_args__ = (
        PrimaryKeyConstraint("narcotic_id", name="pk_narcotics_pills"),
        {"comment": "Pills information linked to narcotics"}
    )