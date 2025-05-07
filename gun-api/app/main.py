from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gun endpoints
@app.get("/guns/", response_model=List[schemas.Gun])
def get_guns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    guns = db.query(models.Gun).offset(skip).limit(limit).all()
    return guns

@app.get("/guns/{gun_id}", response_model=schemas.Gun)
def get_gun(gun_id: int, db: Session = Depends(get_db)):
    gun = db.query(models.Gun).filter(models.Gun.id == gun_id).first()
    if gun is None:
        raise HTTPException(status_code=404, detail="Gun not found")
    return gun

# Insert initial gun data (only needed once)
@app.post("/load-initial-data/")
def load_initial_data(db: Session = Depends(get_db)):
    # Check if data already exists
    if db.query(models.Gun).count() > 0:
        return {"message": "Data already loaded"}

    # Your gunData from the frontend
    gun_data = [
        {
            "id": 1,
            "brand": "CZ",
            "model": "75 Compact",
            "categories": "ปืนพก",
            "caliber": ["9×19mm", "9×21mm", ".40"],
            "manufacturer": "CZ(สาธารณรัฐเช็ค)",
            "series": "COMPACT Series",
            "magazine_capacity": "15 นัด",
            "serial_position": "มักอยู่ที่โครงปืนด้านหน้าเหนือโกร่งไก",
            "image": [
                "https://static.wixstatic.com/media/f286bf_9d13fdc2ef8e438991b58a73ead19e55~mv2.png/v1/fill/w_479,h_348,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f286bf_9d13fdc2ef8e438991b58a73ead19e55~mv2.png"
            ],
            "serial_image": "/images/NumberGun.jpg"
        }
        # Add more gun data entries here as needed
    ]

    # Insert data
    for gun in gun_data:
        db_gun = models.Gun(
            id=gun["id"],
            brand=gun["brand"],
            model=gun["model"],
            categories=gun["categories"],
            caliber=gun["caliber"],
            manufacturer=gun.get("manufacturer"),
            series=gun.get("series"),
            magazine_capacity=gun.get("magazine_capacity"),
            serial_position=gun.get("serial_position"),
            image=gun["image"],
            serial_image=gun.get("serial_image")
        )
        db.add(db_gun)

    db.commit()
    return {"message": "Initial data loaded successfully"}

# Narcotics endpoints
@app.get("/narcotics/", response_model=List[schemas.Narcotic])  # Added proper response model
def get_narcotics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        narcotics = db.query(models.Narcotic).offset(skip).limit(limit).all()
        return narcotics
    except Exception as e:
        print(f"Error fetching narcotics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/narcotics/{narcotic_id}", response_model=schemas.Narcotic)
def get_narcotic(narcotic_id: int, db: Session = Depends(get_db)):
    narcotic = db.query(models.Narcotic).filter(models.Narcotic.id == narcotic_id).first()
    if narcotic is None:
        raise HTTPException(status_code=404, detail="Narcotic not found")
    return narcotic

# Insert sample narcotics data
@app.post("/load-initial-narcotics/")  # This is a POST endpoint
def load_initial_narcotics(db: Session = Depends(get_db)):
    try:
        # Check if data already exists
        if db.query(models.Narcotic).count() > 0:
            return {"message": "Narcotics data already loaded}"}

        # Sample narcotics data matching the new schema
        narcotics_data = [
            {
                "id": 1,
                "exhibit_id": 1,
                "form_id": 1,
                "stamp": "Lexus",
                "drug_type": "เม็ด",
                "drug_category": "สารผสม",
                "consumption_method": "รับประทาน",
                "effect": "กระตุ้นประสาท ทำให้รู้สึกกระปรี้กระเปร่า ลดความอยากอาหาร",
                "weight_grams": 25.5,
                "image": ["/Img/ยาเสพติด/หีบห่อ/Lexus.png"]
            },
            {
                "id": 2,
                "exhibit_id": 2,
                "form_id": 2,
                "stamp": "ตราหัวม้าลาย",
                "drug_type": "ผง",
                "drug_category": "โคเคน",
                "consumption_method": "สูดดม",
                "effect": "กระตุ้นประสาท ทำให้รู้สึกตื่นตัว เคลิบเคลิ้ม",
                "weight_grams": 15.2,
                "image": ["/Img/ยาเสพติด/หีบห่อ/ม้าลาย.png"]
            },
            {
                "id": 3,
                "exhibit_id": 3,
                "form_id": 3,
                "stamp": "Y1",
                "drug_type": "ผง",
                "drug_category": "เฮโรอีน",
                "consumption_method": "ฉีด",
                "effect": "กดประสาท ทำให้รู้สึกผ่อนคลาย ลดความเจ็บปวด",
                "weight_grams": 5.0,
                "image": ["/Img/ยาเสพติด/หีบห่อ/Y1.png"]
            }
        ]

        # Insert data
        for data in narcotics_data:
            db_narcotic = models.Narcotic(
                id=data.get("id"),  # Added id field handling
                exhibit_id=data["exhibit_id"],
                form_id=data["form_id"],
                stamp=data["stamp"],
                drug_type=data["drug_type"],
                drug_category=data["drug_category"],
                consumption_method=data["consumption_method"],
                effect=data["effect"],
                weight_grams=data["weight_grams"],
                image=data["image"]
            )
            db.add(db_narcotic)

        db.commit()
        return {"message": "Initial narcotics data loaded successfully"}
    except Exception as e:
        # Log the full error
        print(f"Error loading narcotic data: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return error details
        raise HTTPException(status_code=500, detail=f"Error loading narcotic data: {str(e)}")
