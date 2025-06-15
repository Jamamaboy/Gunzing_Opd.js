import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from dotenv import load_dotenv
import asyncio

# Initialize cloudinary with environment variables
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

async def upload_image_to_cloudinary(file: UploadFile, folder: str = "firearm_examples"):
    """
    Uploads an image file to Cloudinary
    
    Args:
        file: UploadFile - The file to upload
        folder: str - The folder name to store the image in (default: "firearm_examples")
        
    Returns:
        dict: Cloudinary upload response including the URL
    """
    # Read file content
    content = await file.read()
    
    # Use asyncio to run the Cloudinary upload in a thread pool
    return await asyncio.to_thread(
        cloudinary.uploader.upload,
        content,
        folder=folder  # Use the specified folder
    )