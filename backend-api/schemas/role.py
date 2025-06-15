from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class RoleBase(BaseModel):
    """Base schema for role with common attributes"""
    role_name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    """Schema for creating a role"""
    pass


class RoleUpdate(BaseModel):
    """Schema for updating a role"""
    role_name: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(RoleBase):
    """Schema for role response"""
    id: int
    
    class Config:
        from_attributes = True