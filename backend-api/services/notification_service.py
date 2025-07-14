from sqlalchemy import select, func
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime
from typing import List, Optional

from models.notification import Notification
from models.user import User
from schemas.user import NotificationCreate, NotificationUpdate


async def get_notification_by_id(db: AsyncSession, notification_id: int):
    """Get a notification by ID"""
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification


async def get_user_notifications(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100, only_unread: bool = False):
    """Get notifications for a specific user"""
    query = select(Notification).where(Notification.receiver_id == user_id)
    
    if only_unread:
        query = query.where(Notification.is_read == False)
    
    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    # Fetch sender information for each notification
    notification_list = []
    for notification in notifications:
        sender_result = await db.execute(
            select(User.firstname, User.lastname)
            .where(User.id == notification.user_id)
        )
        sender = sender_result.first()
        sender_name = f"{sender.firstname} {sender.lastname}" if sender else "Unknown"
        
        notification_dict = {
            "id": notification.id,
            "user_id": notification.user_id,
            "receiver_id": notification.receiver_id,
            "type": notification.type,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
            "sender_name": sender_name
        }
        notification_list.append(notification_dict)
    
    return notification_list


async def get_unread_notification_count(db: AsyncSession, user_id: int):
    """Get count of unread notifications for a user"""
    result = await db.execute(
        select(func.count())
        .where((Notification.receiver_id == user_id) & (Notification.is_read == False))
    )
    count = result.scalar()
    return count


async def create_notification(db: AsyncSession, notification: NotificationCreate):
    """Create a new notification"""
    db_notification = Notification(
        user_id=notification.user_id,
        receiver_id=notification.receiver_id,
        type=notification.type,
        message=notification.message
    )
    
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    
    return db_notification


async def mark_notification_as_read(db: AsyncSession, notification_id: int):
    """Mark a notification as read"""
    db_notification = await get_notification_by_id(db, notification_id)
    
    if db_notification.is_read:
        return db_notification  # Already read
    
    db_notification.is_read = True
    db_notification.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(db_notification)
    
    return db_notification


async def mark_all_notifications_as_read(db: AsyncSession, user_id: int):
    """Mark all notifications for a user as read"""
    await db.execute(
        """
        UPDATE notifications 
        SET is_read = true, updated_at = :updated_at
        WHERE receiver_id = :user_id AND is_read = false
        """,
        {"user_id": user_id, "updated_at": datetime.utcnow()}
    )
    
    await db.commit()
    
    return {"message": "All notifications marked as read"}


async def delete_notification(db: AsyncSession, notification_id: int):
    """Delete a notification"""
    db_notification = await get_notification_by_id(db, notification_id)
    
    await db.delete(db_notification)
    await db.commit()
    
    return {"message": "Notification deleted successfully"}