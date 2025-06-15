from typing import Optional, Dict, Any, Union, Tuple
from pydantic import BaseModel, ConfigDict, field_validator, Field
from datetime import date, time, datetime
from decimal import Decimal
from shapely import wkt
from shapely.geometry import Point

# Helper function to convert a (lat, lon) tuple to WKT point string
def point_to_wkt(lat: float, lon: float) -> str:
    """Convert latitude and longitude to WKT point string for PostGIS"""
    return f'POINT({lon} {lat})'

# Base Schema for History with common attributes
class HistoryBase(BaseModel):
    exhibit_id: Optional[int] = None
    subdistrict_id: int
    discovery_date: Optional[date] = None
    discovery_time: Optional[time] = None
    discovered_by: str = "system"  # Set default value
    photo_url: Optional[str] = None
    quantity: Optional[Union[Decimal, float]] = None
    # Use latitude and longitude in API but convert to WKT point for storage
    latitude: float
    longitude: float
    # เพิ่มฟิลด์ ai_confidence
    ai_confidence: Optional[float] = None
    
    @field_validator('discovery_date', mode='before')
    @classmethod
    def format_date(cls, value):
        # Convert string to date object
        if isinstance(value, str):
            try:
                return datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("Invalid date format, expected YYYY-MM-DD")
        return value
        
    @field_validator('discovery_time', mode='before')
    @classmethod
    def format_time(cls, value):
        # Convert string to time object and handle various time formats
        if isinstance(value, str):
            try:
                # Try HH:MM format first
                return datetime.strptime(value, "%H:%M").time()
            except ValueError:
                try:
                    # Try HH:MM:SS format if HH:MM fails
                    time_obj = datetime.strptime(value, "%H:%M:%S").time()
                    # Return only hours and minutes
                    return time(time_obj.hour, time_obj.minute)
                except ValueError:
                    raise ValueError("Invalid time format, expected HH:MM or HH:MM:SS")
        return value
    
    @field_validator('ai_confidence', mode='before')
    @classmethod
    def validate_confidence(cls, value):
        # ตรวจสอบว่าค่าอยู่ในช่วง 0-100
        if value is not None:
            if value < 0 or value > 100:
                raise ValueError("AI confidence must be between 0 and 100")
        return value

# Schema for creating a new History record
class HistoryCreate(HistoryBase):
    pass

# Schema for updating an existing History record
class HistoryUpdate(BaseModel):
    exhibit_id: Optional[int] = None
    subdistrict_id: Optional[int] = None
    discovery_date: Optional[date] = None
    discovery_time: Optional[time] = None
    photo_url: Optional[str] = None
    modified_by: Optional[str] = None
    quantity: Optional[Union[Decimal, float]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ai_confidence: Optional[float] = None
    
    @field_validator('ai_confidence', mode='before')
    @classmethod
    def validate_confidence(cls, value):
        # ตรวจสอบว่าค่าอยู่ในช่วง 0-100
        if value is not None:
            if value < 0 or value > 100:
                raise ValueError("AI confidence must be between 0 and 100")
        return value

# Schema for point coordinates
class PointLocation(BaseModel):
    latitude: float
    longitude: float

# Schema for returned History data
class History(HistoryBase):
    id: int
    created_at: datetime
    modified_at: datetime
    modified_by: Optional[str] = None
    
    # Using the new from_attributes config
    model_config = ConfigDict(from_attributes=True)
        
# Schema for History with exhibit details
class HistoryWithExhibit(History):
    exhibit: Optional[Dict[str, Any]] = None
    subdistrict_name: Optional[str] = None
    district_name: Optional[str] = None
    province_name: Optional[str] = None
    discoverer_name: Optional[str] = None
    modifier_name: Optional[str] = None