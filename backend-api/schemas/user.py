from typing import Optional, List, Union, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class RoleBase(BaseModel):
    """Base Role schema with common attributes"""
    id: int
    role_name: str
    
    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Base User schema with common attributes"""
    title: Optional[str] = None
    firstname: str
    lastname: str
    email: EmailStr
    department: Optional[str] = None
    profile_image_url: Optional[str] = None


class UserPermissionBase(BaseModel):
    """Base schema for user permission"""
    permission_type: str
    granted: bool = True
    
    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    """Base schema for notification"""
    type: str
    message: str
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema for user login requests"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for access token response"""
    access_token: str
    token_type: str
    user_id: int
    user_system_id: str
    email: str
    firstname: str
    lastname: str
    role: Optional[RoleBase] = None
    department: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str
    role_id: int
    permissions: Optional[List[str]] = None


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    title: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    department: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    profile_image_url: Optional[str] = None


class UserPermissionCreate(UserPermissionBase):
    """Schema for creating a user permission"""
    user_id: int


class UserPermissionUpdate(BaseModel):
    """Schema for updating a user permission"""
    granted: Optional[bool] = None


class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    user_id: int
    receiver_id: int


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    """Response schema for notification"""
    id: int
    user_id: int
    receiver_id: int
    is_read: bool
    created_at: datetime
    sender_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserPermissionResponse(UserPermissionBase):
    """Response schema for user permission"""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """Schema for user response data"""
    id: int
    user_id: str  # Changed from user_code to user_id
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    role: Optional[RoleBase] = None
    permissions: Optional[List[UserPermissionResponse]] = None

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    """Brief user data for responses"""
    id: int
    user_id: str  # Changed from user_code to user_id
    email: EmailStr

    class Config:
        from_attributes = True