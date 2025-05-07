from sqlalchemy import Column, Integer, String, Text, Double, ARRAY
from app.database import Base

class Gun(Base):
    __tablename__ = "guns"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, index=True)
    categories = Column(String)
    caliber = Column(ARRAY(String))
    manufacturer = Column(String, nullable=True)
    series = Column(String, nullable=True)
    magazine_capacity = Column(String, nullable=True)
    serial_position = Column(String, nullable=True)
    image = Column(ARRAY(String))
    serial_image = Column(String, nullable=True)

class Narcotic(Base):
    __tablename__ = "narcotics"

    id = Column(Integer, primary_key=True, index=True)
    exhibit_id = Column(Integer, index=True)
    form_id = Column(Integer, index=True)
    stamp = Column(String)
    drug_type = Column(String, index=True)
    drug_category = Column(String, index=True)
    consumption_method = Column(String)
    effect = Column(Text)
    weight_grams = Column(Double, nullable=True)
    image = Column(ARRAY(String), default=[])
