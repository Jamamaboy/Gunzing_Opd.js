from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class UserPermissionBase(BaseModel):
    """Base schema for user permission"""
    permission_type: str
    granted: bool = True
    
    class Config:
        from_attributes = True


class UserPermissionCreate(UserPermissionBase):
    """Schema for creating a user permission"""
    user_id: int


class UserPermissionUpdate(BaseModel):
    """Schema for updating a user permission"""
    granted: Optional[bool] = None


class UserPermissionResponse(UserPermissionBase):
    """Response schema for user permission"""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True