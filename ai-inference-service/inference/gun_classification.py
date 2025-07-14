from ultralytics import YOLO
import cv2
import numpy as np

model = YOLO('./model/best.pt')

# ตัวอย่างการใช้งานกับรูปภาพ
def detect_image(image_path):
    # ทำนาย
    results = model(image_path)
    
    # แสดงผลลัพธ์
    for result in results:
        boxes = result.boxes  # Boxes object สำหรับเก็บผลลัพธ์การตรวจจับ
        
        # แสดงจำนวนวัตถุที่ตรวจพบ
        print(f"พบวัตถุทั้งหมด {len(boxes)} ชิ้น")
        
        # ดูรายละเอียดของแต่ละวัตถุ
        for box in boxes:
            # พิกัดของกล่อง (x1, y1, x2, y2)
            x1, y1, x2, y2 = box.xyxy[0]
            
            # คลาสและความเชื่อมั่น
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            
            # ชื่อคลาส (ถ้ามี)
            class_name = result.names[cls] if hasattr(result, 'names') else f"Class {cls}"
            
            print(f"- {class_name}: {conf:.2f} ที่พิกัด [{int(x1)}, {int(y1)}, {int(x2)}, {int(y2)}]")
    
    # บันทึกรูปภาพที่มีการวาดกล่องและป้ายกำกับ
    # result_image = results[0].plot()
    # cv2.imwrite('result.jpg', result_image)
    
    return results

# ตัวอย่างการใช้งานกับวิดีโอ
def detect_video(video_path):
    # ทำนายบนวิดีโอ
    results = model(video_path, stream=True)  # stream=True เพื่อประมวลผลทีละเฟรม
    
    # เพื่อบันทึกวิดีโอผลลัพธ์
    cap = cv2.VideoCapture(video_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    
    out = cv2.VideoWriter('result_video.mp4', cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    
    # วนลูปผ่านผลลัพธ์ของแต่ละเฟรม
    for result in results:
        # วาดกล่องและป้ายกำกับบนเฟรม
        annotated_frame = result.plot()
        
        # บันทึกเฟรมลงในวิดีโอผลลัพธ์
        out.write(annotated_frame)
    
    out.release()
    print("บันทึกวิดีโอผลลัพธ์เรียบร้อยแล้ว")

# ตัวอย่างการใช้งานแบบ real-time กับ webcam
def detect_webcam():
    # เปิดกล้อง
    cap = cv2.VideoCapture(0)  # 0 สำหรับกล้องหลัก
    
    while cap.isOpened():
        success, frame = cap.read()
        
        if success:
            # ทำนายบนเฟรมปัจจุบัน
            results = model(frame)
            
            # วาดกล่องและป้ายกำกับ
            annotated_frame = results[0].plot()
            
            # แสดงผล
            cv2.imshow("YOLOv8 Detection", annotated_frame)
            
            # กด 'q' เพื่อออกจากโปรแกรม
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        else:
            break
    
    cap.release()
    cv2.destroyAllWindows()

# ตัวอย่างการใช้งานแบบกำหนดพารามิเตอร์เพิ่มเติม
def detect_with_params(image_path):
    # กำหนด confidence threshold และค่าอื่นๆ
    results = model(
        image_path,
        conf=0.25,       # ความเชื่อมั่นขั้นต่ำ (0-1)
        iou=0.45,        # IoU threshold สำหรับ NMS
        max_det=300,     # จำนวนการตรวจจับสูงสุด
        classes=None,    # กรองเฉพาะคลาสที่ต้องการ เช่น [0, 1, 2] สำหรับคลาส 0, 1 และ 2
        agnostic=False,  # NMS แบบ class-agnostic
        verbose=True     # แสดงรายละเอียดการทำงาน
    )
    
    result_image = results[0].plot()
    cv2.imwrite('result_with_params.jpg', result_image)
    
    return results