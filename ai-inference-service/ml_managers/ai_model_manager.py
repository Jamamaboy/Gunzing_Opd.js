import os
import asyncio
import threading
from pathlib import Path
from ultralytics import YOLO
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import logging

class ModelManager:
    """
    Singleton ที่จัดการโมเดล AI ทั้งหมด
    โหลดโมเดลเพียงครั้งเดียวและให้บริการเข้าถึงทั่วทั้งแอป
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ModelManager, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if hasattr(self, '_initialized') and self._initialized:
            return
            
        print("Initializing Model Manager...")
        
        # Initialize paths
        self.base_model_path = Path(__file__).parent.parent / "model" / "Model V2"
        self._setup_paths()
        
        # Model loading status
        self.models_loaded = {
            'segment': False,
            'brand': False,
            'narcotic': False,
            'brand_specific': False
        }
        
        # Initialize models as None
        self.model_segment = None
        self.model_brand = None
        self.model_narcotic = None
        self.model_map = {}
        
        self.segment_classes = {0: "gun", 1: "pistol", 2: "rifle", 3: "weapon"}
        
        # Start background loading
        self.loading_complete = threading.Event()
        self.loading_thread = threading.Thread(target=self._load_models_background)
        self.loading_thread.daemon = True
        self.loading_thread.start()
        
        self._initialized = True
        print("Model Manager initialized - models loading in background")

    def _setup_paths(self):
        """Setup model paths"""
        self.path_model_5MSegment = self.base_model_path / "5M_Segment" / "best_v8.pt"
        self.path_model_CLS_Brand = self.base_model_path / "Model-CLS-Brand V1" / "best.pt"
        self.path_model_narcotic = self.base_model_path / "Narcotics" / "best.pt"
        
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

    def _load_models_background(self):
        """Load models in background with prioritization"""
        try:
            print("🚀 Starting background model loading...")
            
            # Priority 1: Load critical models first
            self._load_critical_models()
            
            # Priority 2: Load brand-specific models
            self._load_brand_models()
            
            self.loading_complete.set()
            print("✅ All models loaded successfully in background")
            
        except Exception as e:
            print(f"❌ Error in background model loading: {e}")
            self.loading_complete.set()  # Set anyway to prevent hanging

    def _load_critical_models(self):
        """Load critical models (segment, brand, narcotic)"""
        # Load segmentation model first (most important)
        if self.path_model_5MSegment.exists():
            try:
                print(f"Loading segmentation model: {self.path_model_5MSegment}")
                self.model_segment = YOLO(str(self.path_model_5MSegment))
                if hasattr(self.model_segment, 'names'):
                    self.segment_classes = self.model_segment.names
                self.models_loaded['segment'] = True
                print("✅ Segmentation model loaded")
            except Exception as e:
                print(f"❌ Failed to load segmentation model: {e}")

        # Load brand model
        if self.path_model_CLS_Brand.exists():
            try:
                print(f"Loading brand model: {self.path_model_CLS_Brand}")
                self.model_brand = YOLO(str(self.path_model_CLS_Brand))
                self.models_loaded['brand'] = True
                print("✅ Brand model loaded")
            except Exception as e:
                print(f"❌ Failed to load brand model: {e}")

        # Load narcotic model
        if self.path_model_narcotic.exists():
            try:
                print(f"Loading narcotic model: {self.path_model_narcotic}")
                self.model_narcotic = YOLO(str(self.path_model_narcotic))
                self.models_loaded['narcotic'] = True
                print("✅ Narcotic model loaded")
            except Exception as e:
                print(f"❌ Failed to load narcotic model: {e}")

    def _load_brand_models(self):
        """Load brand-specific models"""
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = []
            for record in self.model_records:
                future = executor.submit(self._load_single_brand_model, record)
                futures.append(future)
            
            # Wait for all brand models to load
            for future in futures:
                future.result()
        
        self.models_loaded['brand_specific'] = True
        print("✅ All brand-specific models loaded")

    def _load_single_brand_model(self, record):
        """Load a single brand model"""
        brand = record['brand']
        path = Path(record['path'])
        if path.exists():
            try:
                self.model_map[brand] = YOLO(str(path))
                print(f"✅ Loaded {brand} model")
            except Exception as e:
                print(f"❌ Failed to load {brand} model: {e}")

    def wait_for_models(self, timeout=300):
        """Wait for models to finish loading"""
        return self.loading_complete.wait(timeout)

    def is_ready(self):
        """Check if critical models are ready"""
        return (self.models_loaded.get('segment', False) and 
                self.models_loaded.get('brand', False) and 
                self.models_loaded.get('narcotic', False))

    async def warmup_models(self):
        """Warm up all loaded models with dummy data"""
        logger = logging.getLogger(__name__)
        logger.info("🔥 Starting model warmup...")
        
        try:
            # Create dummy image (640x640 RGB)
            dummy_image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
            
            warmup_results = {
                "segmentation": False,
                "brand": False,
                "narcotic": False,
                "brand_specific": 0
            }
            
            # Warm up segmentation model
            if self.model_segment is not None:
                logger.info("Warming up segmentation model...")
                try:
                    _ = self.model_segment(dummy_image)
                    warmup_results["segmentation"] = True
                    logger.info("✅ Segmentation model warmed up")
                except Exception as e:
                    logger.error(f"❌ Segmentation model warmup failed: {e}")
            
            # Warm up brand model
            if self.model_brand is not None:
                logger.info("Warming up brand model...")
                try:
                    _ = self.model_brand(dummy_image)
                    warmup_results["brand"] = True
                    logger.info("✅ Brand model warmed up")
                except Exception as e:
                    logger.error(f"❌ Brand model warmup failed: {e}")
            
            # Warm up narcotic model
            if self.model_narcotic is not None:
                logger.info("Warming up narcotic model...")
                try:
                    _ = self.model_narcotic(dummy_image)
                    warmup_results["narcotic"] = True
                    logger.info("✅ Narcotic model warmed up")
                except Exception as e:
                    logger.error(f"❌ Narcotic model warmup failed: {e}")
            
            # Warm up brand-specific models (sample a few)
            brand_models_warmed = 0
            sample_brands = list(self.model_map.keys())[:3]  # Warm up first 3 brand models
            
            for brand in sample_brands:
                if self.model_map.get(brand) is not None:
                    try:
                        logger.info(f"Warming up {brand} model...")
                        _ = self.model_map[brand](dummy_image)
                        brand_models_warmed += 1
                        logger.info(f"✅ {brand} model warmed up")
                    except Exception as e:
                        logger.error(f"❌ {brand} model warmup failed: {e}")
            
            warmup_results["brand_specific"] = brand_models_warmed
            
            logger.info(f"🔥 Model warmup completed: {warmup_results}")
            return warmup_results
            
        except Exception as e:
            logger.error(f"❌ Error during model warmup: {e}")
            return {"error": str(e)}

    def get_warmup_status(self):
        """Get current warmup/loading status"""
        return {
            "models_loaded": self.models_loaded.copy(),
            "loading_complete": self.loading_complete.is_set(),
            "is_ready": self.is_ready(),
            "available_models": {
                "segmentation": self.model_segment is not None,
                "brand": self.model_brand is not None,
                "narcotic": self.model_narcotic is not None,
                "brand_specific_count": len(self.model_map)
            }
        }

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

def get_model_manager():
    return ModelManager()
