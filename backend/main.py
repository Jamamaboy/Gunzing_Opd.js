import os
import io
import base64
import tempfile
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
from ultralytics import YOLO
import cv2

# Import the pill recognition system
from pill_recognition import ImprovedPillRecognitionSystem

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model
pill_model = ImprovedPillRecognitionSystem(
    model_path='model/pill_model.h5',
    prototype_path='model/pill_prototypes.json'
)

weapon_model = YOLO('./model/best.pt')

def detect_weapon(image_path):
    """Process image with YOLO model and return detection results"""
    # Run detection
    results = weapon_model(image_path)
    
    # Process results
    detections = []
    highest_conf = 0
    highest_class = None
    
    for result in results:
        boxes = result.boxes
        
        for box in boxes:
            # Get coordinates
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            # Get class and confidence
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            
            # Get class name
            class_name = result.names[cls] if hasattr(result, 'names') else f"Class {cls}"
            
            # Track highest confidence detection
            if conf > highest_conf:
                highest_conf = conf
                highest_class = class_name
            
            # Add to detections list
            detections.append({
                "class": class_name,
                "confidence": conf,
                "box": [int(x1), int(y1), int(x2), int(y2)]
            })
    
    # Save annotated image for reference
    annotated_image = results[0].plot()
    annotated_image_path = f"{image_path}_annotated.jpg"
    cv2.imwrite(annotated_image_path, annotated_image)
    
    # Return formatted results
    return {
        "detected": len(detections) > 0,
        "confidence": highest_conf,
        "weaponType": highest_class,
        "detections": detections,
        "annotatedImagePath": annotated_image_path
    }

@app.post("/api/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    mode: str = Form(...)
):
    # Add logging to help debugging
    print(f"Received request with mode: {mode}")
    
    # Save the uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        temp_path = temp.name
        contents = await image.read()
        temp.write(contents)
    
    try:
        if mode == "ยาเสพติด":
            # Use the pill recognition system
            result = pill_model.predict(temp_path)
            return result
        elif mode == "อาวุปืน":
            # Use the YOLO weapon detection model
            result = detect_weapon(temp_path)
            return result
        else:
            return {"error": "Invalid mode specified"}
    except Exception as e:
        # Add better error handling
        print(f"Error processing image: {str(e)}")
        return {"error": str(e)}
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)