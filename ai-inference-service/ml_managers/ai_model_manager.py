import os

from pathlib import Path
from ultralytics import YOLO

class ModelManager:
    """
    Singleton ที่จัดการโมเดล AI ทั้งหมด
    โหลดโมเดลเพียงครั้งเดียวและให้บริการเข้าถึงทั่วทั้งแอป
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        print("Initializing Model Manager...")
        
        # กำหนด path หลัก
        self.backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # พาธโมเดลต่างๆ
        self.path_model_5MSegment = os.path.join(self.backend_dir, "model", "Model V2", "5M_Segment", "best_v8.pt")
        self.path_model_CLS_Brand = os.path.join(self.backend_dir, "model", "Model V2", "Model-CLS-Brand V1", "best.pt")
        self.path_model_CLS_MGUN = os.path.join(self.backend_dir, "model", "Model V2", "Model-CLS-MGun-V1")
        self.path_model_CLS_MGUN = Path(self.path_model_CLS_MGUN)
        self.path_model_narcotic = os.path.join(self.backend_dir, "model", "Model V2", "Narcotics", "best.pt")
        
        # Class mappings
        self.segment_classes = {0: 'BigGun', 1: 'Bullet', 2: 'Drug', 3: 'Magazine', 4: 'PackageDrug', 5: 'Pistol', 6: 'Revolver'}
        self.brand_map = {
            0: 'BERETTA', 1: 'CZ', 2: 'Colt', 3: 'GLOCK', 4: 'Kimber', 5: 'LES BAER',
            6: 'Mauser', 7: 'Norinco', 8: 'SIG', 9: 'Smith & wesson', 10: 'Sphinx', 11: 'Walther'
        }
        
        # โมเดล
        self.model_segment = None
        self.model_brand = None
        self.model_narcotic = None
        self.model_weapon = None
        self.model_map = {} 
        
        # ค้นหาโมเดลของแต่ละแบรนด์
        self.model_records = []
        for idx, brand in self.brand_map.items():
            path = self._find_model_path_for_brand(brand)
            if path:
                self.model_records.append({"index": idx, "brand": brand, "path": path})
        
        # โหลดโมเดลทั้งหมด
        self._load_all_models()
        
        self._initialized = True
        print("Model Manager initialized successfully")
    
    def _find_model_path_for_brand(self, brand_name):
        """ค้นหาพาธของโมเดลสำหรับแต่ละแบรนด์"""
        for folder in self.path_model_CLS_MGUN.iterdir():
            if folder.is_dir() and brand_name.lower() in folder.name.lower():
                model_path = folder / "best.pt"
                if model_path.exists():
                    return str(model_path)
        return None
    
    def _load_all_models(self):
        """โหลดโมเดล AI ทั้งหมด"""
        try:
            # โหลดโมเดลหลัก
            print("Loading ML models...")
            
            # โหลดโมเดล segment
            if os.path.exists(self.path_model_5MSegment):
                self.model_segment = YOLO(self.path_model_5MSegment)
                print(f"Loaded segmentation model from {self.path_model_5MSegment}")
            
            # โหลดโมเดล brand
            if os.path.exists(self.path_model_CLS_Brand):
                self.model_brand = YOLO(self.path_model_CLS_Brand)
                print(f"Loaded brand model from {self.path_model_CLS_Brand}")
            
            # โหลดโมเดล narcotic
            if os.path.exists(self.path_model_narcotic):
                self.model_narcotic = YOLO(self.path_model_narcotic)
                print(f"Loaded narcotic model from {self.path_model_narcotic}")
            
            # โหลดโมเดลของแต่ละแบรนด์
            for record in self.model_records:
                brand = record['brand']
                path = record['path']
                self.model_map[brand] = YOLO(path)
                
            print(f"Successfully loaded {len(self.model_map) + 4} models")
            
        except Exception as e:
            print(f"Error loading models: {e}")
    
    # Getters
    def get_segmentation_model(self):
        return self.model_segment
    
    def get_brand_model(self):
        return self.model_brand
    
    def get_narcotic_model(self):
        return self.model_narcotic
    
    def get_brand_specific_model(self, brand_name):
        return self.model_map.get(brand_name)
    
    def get_segment_classes(self):
        return self.segment_classes
    
    def get_brand_map(self):
        return self.brand_map

def get_model_manager():
    return ModelManager()