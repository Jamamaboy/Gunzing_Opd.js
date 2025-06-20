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
        if not hasattr(self, 'initialized'):
            print("Initializing Model Manager...")

            # Update paths to match your actual structure
            self.base_model_path = Path(__file__).parent.parent / "model" / "Model V2"

            # Fixed paths based on your structure
            self.path_model_5MSegment = self.base_model_path / "5M_Segment" / "best_v8.pt"
            self.path_model_CLS_Brand = self.base_model_path / "Model-CLS-Brand V1" / "best.pt"
            self.path_model_narcotic = self.base_model_path / "Narcotics" / "best.pt"

            # Add the missing segment_classes attribute
            self.segment_classes = [
                "gun", "pistol", "rifle", "weapon"  # Add your actual class names
            ]

            # Brand-specific models
            self.model_records = [
                {"brand": "BERETTA", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "BERETTA_model" / "best.pt")},
                {"brand": "Browning", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "Browning_model" / "best.pt")},
                {"brand": "CZ", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "CZ_model" / "best.pt")},
                {"brand": "Colt", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "Colt_model" / "best.pt")},
                {"brand": "GLOCK", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "GLOCK_model" / "best.pt")},
                {"brand": "Kimber", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "Kimber_model" / "best.pt")},
                {"brand": "Norinco", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "Norinco_model" / "best.pt")},
                {"brand": "SIG", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "SIG_model" / "best.pt")},
                {"brand": "Smith & wesson", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "Smith & wesson_model" / "best.pt")},
                {"brand": "Walther", "path": str(self.base_model_path / "Model-CLS-MGun-V1" / "Walther_model" / "best.pt")},
            ]

            # Initialize models
            self.model_segment = None
            self.model_brand = None
            self.model_narcotic = None
            self.model_map = {}

            # Load all models
            self._load_all_models()

            print("Model Manager initialized successfully")
            self.initialized = True

    def _load_all_models(self):
        """โหลดโมเดล AI ทั้งหมด"""
        try:
            print("Loading ML models...")
            print(f"Base model path: {self.base_model_path}")

            # โหลดโมเดล segment
            if self.path_model_5MSegment.exists():
                try:
                    print(f"Loading segmentation model: {self.path_model_5MSegment}")
                    self.model_segment = YOLO(str(self.path_model_5MSegment))

                    # Get class names from the model as dictionary
                    if hasattr(self.model_segment, 'names'):
                        self.segment_classes = self.model_segment.names  # This is already a dict
                    else:
                        # Fallback dictionary
                        self.segment_classes = {0: "gun", 1: "pistol", 2: "rifle", 3: "weapon"}

                    print(f"✅ Loaded segmentation model with classes: {self.segment_classes}")
                except Exception as e:
                    print(f"❌ Failed to load segmentation model: {e}")
                    self.segment_classes = {0: "gun", 1: "pistol", 2: "rifle", 3: "weapon"}  # Fallback
            else:
                print(f"❌ Segmentation model file not found: {self.path_model_5MSegment}")
                self.segment_classes = {0: "gun", 1: "pistol", 2: "rifle", 3: "weapon"}  # Fallback

            # โหลดโมเดล brand
            if self.path_model_CLS_Brand.exists():
                try:
                    print(f"Loading brand model: {self.path_model_CLS_Brand}")
                    self.model_brand = YOLO(str(self.path_model_CLS_Brand))
                    print(f"✅ Loaded brand model")
                except Exception as e:
                    print(f"❌ Failed to load brand model: {e}")
            else:
                print(f"❌ Brand model file not found: {self.path_model_CLS_Brand}")

            # โหลดโมเดล narcotic
            if self.path_model_narcotic.exists():
                try:
                    print(f"Loading narcotic model: {self.path_model_narcotic}")
                    self.model_narcotic = YOLO(str(self.path_model_narcotic))
                    print(f"✅ Loaded narcotic model")
                except Exception as e:
                    print(f"❌ Failed to load narcotic model: {e}")
            else:
                print(f"❌ Narcotic model file not found: {self.path_model_narcotic}")

            # โหลดโมเดลของแต่ละแบรนด์
            for record in self.model_records:
                brand = record['brand']
                path = Path(record['path'])
                if path.exists():
                    try:
                        print(f"Loading {brand} model: {path}")
                        self.model_map[brand] = YOLO(str(path))
                        print(f"✅ Loaded {brand} model")
                    except Exception as e:
                        print(f"❌ Failed to load {brand} model: {e}")
                else:
                    print(f"❌ {brand} model file not found: {path}")

            loaded_count = len([m for m in [self.model_segment, self.model_brand, self.model_narcotic] if m is not None]) + len(self.model_map)
            print(f"Successfully loaded {loaded_count} models")

        except Exception as e:
            print(f"Error loading models: {e}")
            raise e

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
        """Return the segmentation class names as dictionary"""
        if hasattr(self, 'segment_classes') and self.segment_classes:
            return self.segment_classes
        else:
            # Return default classes as dictionary
            return {0: "gun", 1: "pistol", 2: "rifle", 3: "weapon"}

    def get_brand_map(self):
        return self.brand_map

def get_model_manager():
    return ModelManager()
