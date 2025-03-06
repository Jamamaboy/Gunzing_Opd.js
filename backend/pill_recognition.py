import os
import json
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from keras.api.applications import EfficientNetB4
from keras.api import layers, Model
from keras.src.utils.image_utils import img_to_array
from sklearn.preprocessing import normalize

class ImprovedPillRecognitionSystem:
    def __init__(self, model_path=None, prototype_path=None):
        self.image_size = (224, 224)
        self.prototypes = {}
        
        # เพิ่ม data augmentation layer
        self.augmentation = tf.keras.Sequential([
            layers.RandomRotation(0.2),
            layers.RandomFlip("horizontal"),
            layers.RandomContrast(0.2),
            layers.RandomBrightness(0.2),
        ])
        
        self.full_model, self.shape_model, self.stamp_model = self.create_model()
        
        if model_path and os.path.exists(model_path):
            self.full_model.load_weights(model_path)
            self.load_prototypes(prototype_path)
            
    def create_model(self):
        """สร้างโมเดลที่ซับซ้อนขึ้นด้วย attention mechanism และ feature pyramid"""
        base_model = tf.keras.applications.EfficientNetB4(
            input_shape=(*self.image_size, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze บางส่วนของ base model
        for layer in base_model.layers[:100]:
            layer.trainable = False
            
        # Input layers
        shape_input = tf.keras.Input(shape=(*self.image_size, 3))
        stamp_input = tf.keras.Input(shape=(*self.image_size, 3))
        
        # Shape branch with attention
        def attention_block(x, filters):
            x = layers.Conv2D(filters, 1)(x)
            attention = layers.Conv2D(filters, 1)(x)
            attention = layers.Activation('sigmoid')(attention)
            return layers.Multiply()([x, attention])
        
        # Shape processing branch
        shape_x = base_model(shape_input)
        shape_attention = attention_block(shape_x, 256)
        shape_features = layers.GlobalAveragePooling2D()(shape_attention)
        shape_features = layers.Dense(512, activation='relu')(shape_features)
        shape_features = layers.Dropout(0.3)(shape_features)
        shape_features = layers.Dense(256, activation='relu')(shape_features)
        
        # Stamp processing branch with Feature Pyramid
        stamp_x = base_model(stamp_input)
        
        # Feature Pyramid Network
        p5 = layers.Conv2D(256, 1)(stamp_x)
        p4 = layers.Conv2D(256, 1)(base_model.get_layer('block6a_expand_activation').output)
        p3 = layers.Conv2D(256, 1)(base_model.get_layer('block4a_expand_activation').output)
        
        # Top-down pathway
        p4 = layers.Add()([p4, layers.UpSampling2D()(p5)])
        p3 = layers.Add()([p3, layers.UpSampling2D()(p4)])
        
        # Final stamp features
        stamp_features = layers.GlobalAveragePooling2D()(p3)
        stamp_features = layers.Dense(256, activation='relu')(stamp_features)
        stamp_features = layers.Dropout(0.3)(stamp_features)
        stamp_features = layers.Dense(128, activation='relu')(stamp_features)
        
        # Combine features with attention
        combined_features = layers.Concatenate()([shape_features, stamp_features])
        attention_weights = layers.Dense(384, activation='sigmoid')(combined_features)
        weighted_features = layers.Multiply()([combined_features, attention_weights])
        
        # Output layer
        outputs = layers.Dense(len(self.prototypes) or 1, activation='softmax')(weighted_features)
        
        # Create models
        shape_embedding_model = Model(inputs=shape_input, outputs=shape_features)
        stamp_embedding_model = Model(inputs=stamp_input, outputs=stamp_features)
        full_model = Model(inputs=[shape_input, stamp_input], outputs=outputs)
        
        # Compile with appropriate loss and optimizer
        full_model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return full_model, shape_embedding_model, stamp_embedding_model

    def extract_stamp_features(self, image_path):
        """ปรับปรุงการสกัด stamp features ด้วยเทคนิคที่ซับซ้อนขึ้น"""
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # ใช้ CLAHE เพื่อปรับปรุง contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray = clahe.apply(gray)
        
        # Multi-scale processing
        stamp_features = []
        scales = [1.0, 0.75, 0.5]
        
        for scale in scales:
            # Resize image
            width = int(gray.shape[1] * scale)
            height = int(gray.shape[0] * scale)
            scaled_gray = cv2.resize(gray, (width, height))
            
            # Apply different thresholds
            thresholds = []
            thresholds.append(cv2.threshold(scaled_gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1])
            thresholds.append(cv2.adaptiveThreshold(scaled_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2))
            
            for binary in thresholds:
                # Noise reduction
                kernel = np.ones((3,3), np.uint8)
                binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
                
                # Find contours
                contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                # Process valid contours
                for cnt in contours:
                    if cv2.contourArea(cnt) > 100 * scale:
                        x, y, w, h = cv2.boundingRect(cnt)
                        roi = scaled_gray[y:y+h, x:x+w]
                        
                        # Extract multiple features
                        if roi.size > 0:
                            # Resize ROI
                            roi_resized = cv2.resize(roi, (64, 64))
                            
                            # Calculate histogram
                            hist = cv2.calcHist([roi_resized], [0], None, [256], [0, 256]).flatten()
                            hist = hist / np.sum(hist)
                            
                            # Combine features
                            combined_features = np.concatenate([hist])
                            stamp_features.append(combined_features)
        
        if not stamp_features:
            # Fallback to global image features
            resized = cv2.resize(gray, (64, 64))
            hist = cv2.calcHist([resized], [0], None, [256], [0, 256]).flatten()
            hist = hist / np.sum(hist)
            stamp_features.append(hist)
        
        # Normalize features
        stamp_features = [normalize(feat.reshape(1, -1))[0] for feat in stamp_features]
        
        return stamp_features

    def predict(self, image_path, threshold=0.80):
        """ปรับปรุงการทำนายด้วยการถ่วงน้ำหนักที่เหมาะสมและการรวมผลแบบ ensemble"""
        # สกัด embeddings จากรูปทรง
        img_array = self.preprocess_image(image_path)
        augmented_images = self.augment_image(img_array)
        
        shape_embeddings = []
        for aug_img in augmented_images:
            embedding = self.shape_model.predict(np.expand_dims(aug_img, axis=0), verbose=0)
            shape_embeddings.append(embedding)
        
        # ใช้ค่าเฉลี่ยของ embeddings จากภาพที่ผ่านการ augment
        shape_embedding = np.mean(shape_embeddings, axis=0)
        
        # สกัดคุณลักษณะตราปั้ม
        stamp_features = self.extract_stamp_features(image_path)
        
        # น้ำหนักสำหรับแต่ละคุณลักษณะ
        shape_weight = 0.6
        stamp_weight = 0.4
        
        predictions = []
        for pill_name, data in self.prototypes.items():
            # คำนวณความคล้ายของรูปทรง
            shape_similarity = np.dot(shape_embedding[0], data['shape_prototype']) / (
                np.linalg.norm(shape_embedding[0]) * np.linalg.norm(data['shape_prototype'])
            )
            
            # คำนวณความคล้ายของตราปั้ม
            stamp_similarities = [
                np.dot(stamp_feat, data['stamp_prototype']) / (
                    np.linalg.norm(stamp_feat) * np.linalg.norm(data['stamp_prototype'])
                )
                for stamp_feat in stamp_features
            ]
            
            # ใช้ค่าสูงสุดของความคล้ายตราปั้ม
            max_stamp_similarity = max(stamp_similarities) if stamp_similarities else 0
            
            # รวมคะแนนโดยใช้น้ำหนัก
            total_similarity = (shape_similarity * shape_weight + 
                              max_stamp_similarity * stamp_weight)
            
            predictions.append({
                'pill_name': pill_name,
                'confidence': max(0, min(1, total_similarity)),
                'shape_similarity': shape_similarity,
                'stamp_similarity': max_stamp_similarity
            })
        
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            'prediction': predictions[0]['pill_name'] if predictions and predictions[0]['confidence'] >= threshold else 'Unknown',
            'confidence': predictions[0]['confidence'] if predictions else 0,
            'details': predictions
        }

    def preprocess_image(self, image_path):
        """เพิ่มการ preprocess ที่ซับซ้อนขึ้น"""
        image = Image.open(image_path).convert('RGB')
        image = image.resize(self.image_size, Image.Resampling.LANCZOS)
        
        # แปลงเป็น array
        image_array = img_to_array(image)
        
        # Normalize
        image_array = image_array / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array

    def augment_image(self, image_array):
        """เพิ่ม data augmentation ที่หลากหลาย"""
        return self.augmentation(image_array)

    def load_prototypes(self, file_path='pill_prototypes.json'):
        """โหลดข้อมูล prototypes"""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                self.prototypes = json.load(f)