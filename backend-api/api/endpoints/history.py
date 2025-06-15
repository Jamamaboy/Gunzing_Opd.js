from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Body
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date, time, datetime
from pydantic import BaseModel

from config.database import get_db
from schemas import history as schemas
from services import history_service
from core.auth import get_current_active_user
from schemas.user import UserBase

router = APIRouter(tags=["history"])

@router.get("/history", response_model=List[schemas.HistoryWithExhibit])
async def get_all_histories(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get all history records with exhibit data and location names
    If user_id is provided, filter history records by the user who discovered them
    """
    histories = await history_service.get_all_histories(db, user_id)
    return histories

@router.get("/history/firearms", response_model=List[schemas.HistoryWithExhibit])
async def get_firearm_histories(db: Session = Depends(get_db)):
    """
    Get all history records that have firearms category (อาวุธปืน)
    """
    try:
        firearms_histories = await history_service.get_firearm_histories(db)
        return firearms_histories
    except Exception as e:
        print(f"Error fetching firearm histories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch firearm histories: {str(e)}")

@router.get("/history/firearms/unknown", response_model=List[schemas.HistoryWithExhibit])
async def get_unknown_firearms(db: Session = Depends(get_db)):
    """
    Get all firearms with unknown subcategory
    """
    try:
        firearms = await history_service.get_unknown_firearms(db)
        return firearms
    except Exception as e:
        print(f"Error fetching unknown firearms: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch unknown firearms: {str(e)}")

@router.get("/history/firearms/classes", response_model=List[str])
async def get_firearm_classes(db: Session = Depends(get_db)):
    """
    Get all available firearm classes
    """
    try:
        classes = await history_service.get_firearm_classes(db)
        return classes
    except Exception as e:
        print(f"Error fetching firearm classes: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch firearm classes: {str(e)}")

# เพิ่ม narcotic routes ก่อน generic routes
@router.get("/history/narcotics", response_model=List[schemas.HistoryWithExhibit])
async def get_narcotic_histories(db: Session = Depends(get_db)):
    """
    Get all history records for narcotic exhibits only
    """
    histories = await history_service.get_narcotic_histories(db)
    return histories

@router.get("/history/narcotics/{history_id}", response_model=schemas.HistoryWithExhibit)
async def get_narcotic_history_by_id(history_id: int, db: Session = Depends(get_db)):
    """
    Get a specific narcotic history record by ID
    """
    history = await history_service.get_narcotic_history_by_id(db, history_id)
    if history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Narcotic history not found"
        )
    return history

# Generic routes ต้องมาหลัง specific routes
@router.get("/history/{history_id}", response_model=schemas.HistoryWithExhibit)
async def get_history_by_id(history_id: int, db: Session = Depends(get_db)):
    """
    Get a specific history record by ID with exhibit data and location names
    """
    history = await history_service.get_history_by_id(db, history_id)
    if not history:
        raise HTTPException(status_code=404, detail="History record not found")
    return history

@router.post("/history", response_model=schemas.HistoryWithExhibit)
async def create_history_endpoint(
    exhibit_id: Optional[int] = Form(None),
    subdistrict_id: int = Form(...),
    discovery_date: Optional[str] = Form(None),
    discovery_time: Optional[str] = Form(None),
    quantity: Optional[float] = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    # เพิ่มบรรทัดนี้เพื่อรับค่า ai_confidence จาก Form
    ai_confidence: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_active_user)
):
    """
    Create a new history record with optional image upload
    """
    try:
        # Enhanced debug logging
        print(f"======== CREATE HISTORY DEBUG ========")
        print(f"Current user: {current_user}")
        print(f"User ID: {current_user.user_id if hasattr(current_user, 'user_id') else 'Not available'}")
        print(f"Form data:")
        print(f" - exhibit_id: {exhibit_id}")
        print(f" - subdistrict_id: {subdistrict_id}")
        print(f" - discovery_date: {discovery_date}")
        print(f" - discovery_time: {discovery_time}")
        print(f" - quantity: {quantity}")
        print(f" - latitude: {latitude}")
        print(f" - longitude: {longitude}")
        print(f" - ai_confidence: {ai_confidence}")  # เพิ่ม log เพื่อตรวจสอบค่า
        print(f" - image: {image and image.filename}")
        
        # Create a dictionary with all fields
        history_dict = {
            "exhibit_id": exhibit_id,
            "subdistrict_id": subdistrict_id,
            "latitude": latitude,
            "longitude": longitude,
            "quantity": quantity,
            "ai_confidence": ai_confidence  # เพิ่มบรรทัดนี้เพื่อรับค่า ai_confidence
        }
        
        # Add user details - Check if user_id exists
        if hasattr(current_user, 'user_id') and current_user.user_id:
            history_dict["discovered_by"] = current_user.user_id
            history_dict["modified_by"] = current_user.user_id
            print(f"Added user_id: {current_user.user_id}")
        else:
            print("WARNING: No user_id found in current_user!")
            # Use a default user ID as fallback (create a default user in your database)
            history_dict["discovered_by"] = "system"
            history_dict["modified_by"] = "system"
        
        # Only add date and time if they are valid strings
        if discovery_date:
            try:
                date_obj = datetime.strptime(discovery_date, "%Y-%m-%d").date()
                history_dict["discovery_date"] = discovery_date
            except ValueError as e:
                print(f"Invalid date format: {discovery_date}, error: {e}")
                # Use current date as fallback
                history_dict["discovery_date"] = datetime.now().date().isoformat()
        else:
            # Use current date if none provided
            history_dict["discovery_date"] = datetime.now().date().isoformat()
            
        if discovery_time:
            try:
                time_obj = datetime.strptime(discovery_time, "%H:%M").time()
                history_dict["discovery_time"] = discovery_time
            except ValueError as e:
                print(f"Invalid time format: {discovery_time}, error: {e}")
                # Use current time as fallback
                history_dict["discovery_time"] = datetime.now().time().strftime("%H:%M")
        else:
            # Use current time if none provided
            history_dict["discovery_time"] = datetime.now().time().strftime("%H:%M")
        
        print(f"Final history dictionary: {history_dict}")
        
        # Create history data object 
        history_data = schemas.HistoryCreate(**history_dict)
        
        # Create the history record
        history = await history_service.create_history(db, history_data, image)
        print(f"History created successfully with ID: {history.get('id') if history else 'unknown'}")
        
        return history
        
    except Exception as e:
        error_detail = f"Error creating history record: {str(e)}\n{traceback.format_exc()}"
        print(f"========= ERROR DETAILS =========")
        print(error_detail)
        print(f"=================================")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/history/{history_id}", response_model=schemas.HistoryWithExhibit)
async def update_history_endpoint(
    history_id: int,
    exhibit_id: Optional[int] = Form(None),
    subdistrict_id: Optional[int] = Form(None),
    discovery_date: Optional[str] = Form(None),
    discovery_time: Optional[str] = Form(None),
    quantity: Optional[float] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_active_user)
):
    """
    Update a history record with optional image upload
    """
    try:
        # Check if history exists
        existing_history = await history_service.get_history_by_id(db, history_id)
        if not existing_history:
            raise HTTPException(status_code=404, detail="History record not found")
        
        # Create update data from form fields, only including provided fields
        update_data = {}
        if exhibit_id is not None:
            update_data["exhibit_id"] = exhibit_id
        if subdistrict_id is not None:
            update_data["subdistrict_id"] = subdistrict_id
        if latitude is not None:
            update_data["latitude"] = latitude
        if longitude is not None:
            update_data["longitude"] = longitude
        if quantity is not None:
            update_data["quantity"] = quantity
            
        # Handle date and time specially
        if discovery_date is not None:
            update_data["discovery_date"] = discovery_date
            
        if discovery_time is not None:
            update_data["discovery_time"] = discovery_time
        
        # เพิ่มข้อมูลผู้ใช้ที่แก้ไข
        update_data["modified_by"] = current_user.user_id  # Use user_id field instead of id
        
        # Create HistoryUpdate object
        history_update = schemas.HistoryUpdate(**update_data)
        
        # Update the history record
        updated_history = await history_service.update_history(db, history_id, history_update, image)
        
        if not updated_history:
            raise HTTPException(status_code=404, detail="History record not found")
        
        return updated_history
        
    except Exception as e:
        error_detail = f"Error updating history record: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{history_id}", status_code=status.HTTP_200_OK)
async def delete_history_endpoint(history_id: int, db: Session = Depends(get_db)):
    """
    Delete a history record
    """
    deleted = await history_service.delete_history(db, history_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="History record not found")
    
    return {"message": "History record deleted successfully"}

@router.get("/history/exhibit/{exhibit_id}", response_model=List[schemas.HistoryWithExhibit])
async def get_histories_by_exhibit(exhibit_id: int, db: Session = Depends(get_db)):
    """
    Get history records by exhibit ID with location names
    """
    histories = await history_service.get_histories_by_exhibit_id(db, exhibit_id)
    if not histories:
        raise HTTPException(status_code=404, detail="No history records found for this exhibit")
    
    return histories

# ตรวจสอบว่า endpoint มีการใช้ get_current_active_user หรือไม่
@router.get("/history/exhibit/{exhibit_id}/user/{user_id}", response_model=List[schemas.HistoryWithExhibit])
async def get_histories_by_exhibit_and_user(
    exhibit_id: int, 
    user_id: str,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_active_user)  # ← สำคัญ! ต้องมีบรรทัดนี้
):
    """
    Get history records by exhibit ID and user ID with location names.
    This endpoint filters history records to show only those created by the specified user.
    """
    # ตรวจสอบค่า user_id ว่าเป็น undefined หรือไม่
    if user_id == "undefined":
        raise HTTPException(
            status_code=400, 
            detail="Invalid user ID: undefined"
        )
    
    # ตรวจสอบสิทธิ์เพื่อความปลอดภัย (ผู้ใช้ควรเห็นได้เฉพาะข้อมูลของตนเอง หรือเป็นแอดมิน)
    if current_user.role.id > 2 and current_user.user_id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="You don't have permission to view this user's history records"
        )
    
    try:
        histories = await history_service.get_histories_by_exhibit_and_user(db, exhibit_id, user_id)
        
        if not histories:
            # ส่งค่าลิสต์ว่างเมื่อไม่มีข้อมูล แทนที่จะแจ้ง error 404
            return []
        
        return histories
    except Exception as e:
        print(f"Error fetching histories for exhibit {exhibit_id} and user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history records: {str(e)}"
        )

class FirearmClassUpdate(BaseModel):
    history_id: int
    class_name: str

class FirearmClassAdd(BaseModel):
    class_name: str

@router.post("/history/firearms/classify", status_code=status.HTTP_200_OK)
async def update_firearm_class(
    firearm_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_active_user)
):
    """
    Update firearm classification by linking history to appropriate exhibit
    """
    try:
        firearm_id = firearm_data.get("firearmId")
        class_name = firearm_data.get("class")
        
        if not firearm_id or not class_name:
            raise HTTPException(status_code=400, detail="Must provide firearmId and class")
        
        success = await history_service.update_firearm_class(db, firearm_id, class_name)
        
        if not success:
            raise HTTPException(status_code=404, detail="Firearm not found or update failed")
        
        # หลังจาก update สำเร็จ ให้ดึงข้อมูล history ที่อัปเดตแล้วเพื่อส่งกลับไปให้ client
        updated_history = await history_service.get_history_by_id(db, firearm_id)
        
        return {
            "message": "Firearm classification updated successfully", 
            "history": updated_history
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error classifying firearm: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to classify firearm: {str(e)}")

@router.post("/history/firearms/classes", status_code=status.HTTP_201_CREATED)
async def add_firearm_class(
    class_data: FirearmClassAdd,
    db: Session = Depends(get_db),
    current_user: UserBase = Depends(get_current_active_user)
):
    """
    Add a new firearm class
    """
    try:
        if not class_data.class_name or len(class_data.class_name.strip()) == 0:
            raise HTTPException(status_code=400, detail="Class name cannot be empty")
        
        success = await history_service.add_firearm_class(db, class_data.class_name)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add firearm class")
        
        return {"message": "Firearm class added successfully", "name": class_data.class_name}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding firearm class: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add firearm class: {str(e)}")

@router.get("/history/firearms/{history_id}", response_model=schemas.HistoryWithExhibit)
async def get_firearm_history_by_id(history_id: int, db: Session = Depends(get_db)):
    """
    Get a specific firearm history record by ID with exhibit data and location names
    """
    try:
        history = await history_service.get_firearm_history_by_id(db, history_id)
        if not history:
            raise HTTPException(status_code=404, detail="Firearm history record not found")
        return history
    except Exception as e:
        print(f"Error fetching firearm history by ID {history_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch firearm history: {str(e)}")