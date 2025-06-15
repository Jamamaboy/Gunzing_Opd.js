import torchvision.transforms as transforms
import torch
import torch.nn.functional as F
from PIL import Image
from ultralytics import YOLO
import os
model_path = "./model/Model V2/Narcotics/best.pt"
model = YOLO(model_path)

def image_to_vector(image_path):
    transform = transforms.Compose([
        transforms.Resize((640, 640)),
        transforms.ToTensor(),
    ])
    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        # ตัดส่วนหัว classifier ออก (อิงจากโครงสร้าง YOLO)
        backbone = model.model.model[:-1]  # หรือใช้ model.model.backbone ถ้ามี
        features = backbone(tensor)
        vector = features.view(features.size(0), -1)
    return vector[0]

def find_top_similar_from_data(input_vector, data_dict, top_k=10):
    results = []

    for key, val in data_dict.items():
        vec_tensor = torch.tensor(val["vector"])
        sim = F.cosine_similarity(input_vector.unsqueeze(0), vec_tensor.unsqueeze(0)).item()
        results.append({
            "id": key,
            "similarity": round(sim, 4),
            "path": val["path"]
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]

def show_top_similar_images(results):
    import matplotlib.pyplot as plt
    from PIL import Image

    plt.figure(figsize=(15, 5))
    for i, item in enumerate(results):
        img = Image.open(item["path"]).convert("RGB")
        plt.subplot(1, len(results), i+1)
        plt.imshow(img)
        plt.axis("off")
        plt.title(f'{item["id"]}\nSim: {item["similarity"]:.2f}')
    plt.tight_layout()
    plt.show()
    return results

data_dict = {
    "1-1O": {
        "vector": image_to_vector("./โดเรม่อน.png").tolist(),
        "path": "./โดเรม่อน.png"
    },
}

print(image_to_vector("./โดเรม่อน.png"))