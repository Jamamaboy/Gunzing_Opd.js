from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from config.database import get_db
from schemas.user import NotificationCreate, NotificationResponse, NotificationUpdate
from services.notification_service import (
    create_notification, get_user_notifications, mark_notification_as_read,
    mark_all_notifications_as_read, delete_notification, get_unread_notification_count
)
from core.auth import get_current_user

router = APIRouter(tags=["notifications"])

@router.get("/notifications", response_model=List[Dict[str, Any]])
async def list_user_notifications(
    skip: int = 0,
    limit: int = 20,
    only_unread: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get notifications for the currently logged in user
    """
    return await get_user_notifications(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit, 
        only_unread=only_unread
    )


@router.get("/notifications/count")
async def get_notifications_count(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get count of unread notifications for the currently logged in user
    """
    count = await get_unread_notification_count(db=db, user_id=current_user.id)
    return {"count": count}


@router.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def add_notification(
    notification: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new notification
    """
    return await create_notification(db=db, notification=notification)


@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a notification as read
    """
    return await mark_notification_as_read(db=db, notification_id=notification_id)


@router.put("/notifications/read-all")
async def read_all_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mark all notifications for the current user as read
    """
    return await mark_all_notifications_as_read(db=db, user_id=current_user.id)


@router.delete("/notifications/{notification_id}")
async def remove_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a notification
    """
    return await delete_notification(db=db, notification_id=notification_id)