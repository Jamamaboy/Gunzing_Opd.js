import tempfile
import os
import base64
from io import BytesIO
from typing import List, Dict, Any, Optional, Union
from fastapi import UploadFile
import cloudinary
import cloudinary.uploader
from config.cloudinary_config import upload_image_to_cloudinary as cloudinary_upload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.firearm import FirearmExampleImage

async def delete_image_from_cloudinary(image_url: str) -> bool:
    """
    Delete an image from Cloudinary using its URL
    
    Args:
        image_url: The secure URL of the image to delete
        
    Returns:
        bool: True if deletion was successful, False otherwise
    """
    try:
        # Extract public_id from Cloudinary URL
        # URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        # We need to extract the public_id part
        if 'cloudinary.com' in image_url:
            # Split by '/' and get the parts after 'upload'
            parts = image_url.split('/')
            upload_index = -1
            
            for i, part in enumerate(parts):
                if part == 'upload':
                    upload_index = i
                    break
            
            if upload_index != -1 and upload_index + 1 < len(parts):
                # Get everything after 'upload' and before file extension
                public_id_parts = parts[upload_index + 1:]
                # Remove version if exists (starts with 'v' followed by numbers)
                if public_id_parts and public_id_parts[0].startswith('v') and public_id_parts[0][1:].isdigit():
                    public_id_parts = public_id_parts[1:]
                
                # Join the remaining parts and remove file extension
                if public_id_parts:
                    public_id = '/'.join(public_id_parts)
                    # Remove file extension
                    public_id = public_id.rsplit('.', 1)[0]
                    
                    # Delete from Cloudinary
                    result = cloudinary.uploader.destroy(public_id)
                    
                    # Check if deletion was successful
                    return result.get('result') == 'ok'
        
        return False
        
    except Exception as e:
        print(f"Error deleting image from Cloudinary: {e}")
        return False

async def upload_image_to_cloudinary(file_content: Union[UploadFile, BytesIO, bytes, str], folder: str = "evidence_history"):
    """
    Upload an image to Cloudinary - handles multiple input types including base64 data
    
    Args:
        file_content: The image file content to upload (can be UploadFile, bytes, BytesIO or base64 string)
        folder: The folder in Cloudinary to store the image
    
    Returns:
        dict: The Cloudinary upload result containing secure_url and other metadata
    """
    try:
        # Handle base64 encoded image strings from frontend
        if isinstance(file_content, str) and file_content.startswith('data:image'):
            # Extract the base64 part after the comma
            format, imgstr = file_content.split(';base64,')
            ext = format.split('/')[-1]
            
            # Convert base64 to bytes
            img_bytes = base64.b64decode(imgstr)
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(suffix=f'.{ext}', delete=False) as temp:
                temp.write(img_bytes)
                temp_path = temp.name
            
            # Upload the temporary file
            try:
                result = cloudinary.uploader.upload(
                    temp_path, 
                    folder=folder
                )
                # Clean up temporary file
                os.unlink(temp_path)
                return result  # Return the full result dictionary
            except Exception as e:
                # Clean up temporary file in case of error
                os.unlink(temp_path)
                raise e
        
        # Handle UploadFile objects
        elif isinstance(file_content, UploadFile):
            # Save uploaded file to a temporary file
            with tempfile.NamedTemporaryFile(delete=False) as temp:
                # Read all content from the file
                content = await file_content.read()
                temp.write(content)
                temp_path = temp.name
            
            # Upload the temporary file
            try:
                result = cloudinary.uploader.upload(
                    temp_path, 
                    folder=folder
                )
                # Clean up temporary file
                os.unlink(temp_path)
                return result  # Return the full result dictionary
            except Exception as e:
                # Clean up temporary file in case of error
                os.unlink(temp_path)
                raise e

        # Use the existing cloudinary upload function for other cases
        result = await cloudinary_upload(file_content)
        return result  # Return the full result
    
    except Exception as e:
        # Log the error
        print(f"Cloudinary upload error: {e}")
        
        # Re-raise the exception
        raise

async def get_images_by_exhibit_id(db: AsyncSession, exhibit_id: int) -> List[FirearmExampleImage]:
    """
    Get all images associated with a specific exhibit
    
    Args:
        db: Database session
        exhibit_id: ID of the exhibit
        
    Returns:
        List of FirearmExampleImage objects
    """
    stmt = select(FirearmExampleImage).where(FirearmExampleImage.exhibit_id == exhibit_id).order_by(FirearmExampleImage.priority.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_image(db: AsyncSession, image_data: Dict[str, Any]) -> FirearmExampleImage:
    """
    Create a new firearm example image record
    
    Args:
        db: Database session
        image_data: Image data including exhibit_id, image_url, description, and priority
        
    Returns:
        New FirearmExampleImage object
    """
    new_image = FirearmExampleImage(**image_data)
    db.add(new_image)
    await db.commit()
    await db.refresh(new_image)
    return new_image

async def get_image_by_id(db: AsyncSession, image_id: int) -> Optional[FirearmExampleImage]:
    """
    Get an image by its ID
    
    Args:
        db: Database session
        image_id: ID of the image to get
        
    Returns:
        FirearmExampleImage object or None if not found
    """
    stmt = select(FirearmExampleImage).where(FirearmExampleImage.id == image_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def update_image(db: AsyncSession, image_id: int, update_data: Dict[str, Any]) -> Optional[FirearmExampleImage]:
    """
    Update an existing firearm example image
    
    Args:
        db: Database session
        image_id: ID of the image to update
        update_data: Dictionary containing fields to update
        
    Returns:
        Updated FirearmExampleImage object or None if not found
    """
    # Get the image
    image = await get_image_by_id(db, image_id)
    if not image:
        return None
    
    # Update fields
    for key, value in update_data.items():
        if hasattr(image, key):
            setattr(image, key, value)
    
    await db.commit()
    await db.refresh(image)
    return image

async def delete_image(db: AsyncSession, image_id: int) -> bool:
    """
    Delete a firearm example image from both database and Cloudinary
    
    Args:
        db: Database session
        image_id: ID of the image to delete
        
    Returns:
        True if deleted, False otherwise
    """
    # Get the image
    image = await get_image_by_id(db, image_id)
    if not image:
        return False
    
    # Delete from Cloudinary first
    cloudinary_deleted = await delete_image_from_cloudinary(image.image_url)
    if not cloudinary_deleted:
        print(f"Warning: Failed to delete image from Cloudinary: {image.image_url}")
        # Continue with database deletion even if Cloudinary deletion fails
    
    # Delete from database
    await db.delete(image)
    await db.commit()
    return True