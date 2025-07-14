from sqlalchemy import select
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from models.role import Role
from schemas.role import RoleCreate, RoleUpdate


async def get_role_by_id(db: AsyncSession, role_id: int):
    """Get a role by ID"""
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalars().first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role


async def get_role_by_name(db: AsyncSession, name: str):
    """Get a role by name"""
    result = await db.execute(select(Role).where(Role.role_name == name))
    return result.scalars().first()


async def get_all_roles(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Get all roles"""
    result = await db.execute(select(Role).offset(skip).limit(limit))
    return result.scalars().all()


async def create_role(db: AsyncSession, role: RoleCreate):
    """Create a new role"""
    # Check if role with same name exists
    existing_role = await get_role_by_name(db, role.role_name)
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role with name '{role.role_name}' already exists"
        )
    
    # Create new role
    db_role = Role(
        role_name=role.role_name,
        description=role.description
    )
    
    db.add(db_role)
    await db.commit()
    await db.refresh(db_role)
    
    return db_role


async def update_role(db: AsyncSession, role_id: int, role_update: RoleUpdate):
    """Update an existing role"""
    db_role = await get_role_by_id(db, role_id)
    
    # Check if name is changing and if it conflicts
    if role_update.role_name and role_update.role_name != db_role.role_name:
        existing_role = await get_role_by_name(db, role_update.role_name)
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role with name '{role_update.role_name}' already exists"
            )
    
    # Update fields
    update_data = role_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_role, key, value)
    
    await db.commit()
    await db.refresh(db_role)
    
    return db_role


async def delete_role(db: AsyncSession, role_id: int):
    """Delete a role"""
    db_role = await get_role_by_id(db, role_id)
    
    await db.delete(db_role)
    await db.commit()
    
    return {"message": "Role deleted successfully"}