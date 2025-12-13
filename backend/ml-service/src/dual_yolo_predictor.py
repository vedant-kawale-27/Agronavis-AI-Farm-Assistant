"""
AgroNavis ML Service - Dual YOLO Predictor
Simplified version for backend integration
"""

import cv2
import os
import json
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from ultralytics import YOLO
from pathlib import Path
import base64
from PIL import Image
import io

class DualYOLOPredictor:
    """
    Dual YOLO model predictor for plant disease and pest detection
    Optimized for backend API integration
    """
    
    def __init__(self, 
                 disease_model_path: str = "models/plantDoc.pt",
                 pest_model_path: str = "models/pest2.pt",
                 model_info_path: str = "models/model_info.json",
                 confidence_threshold: float = 0.5):
        """
        Initialize the dual YOLO predictor
        """
        self.disease_model_path = disease_model_path
        self.pest_model_path = pest_model_path
        self.confidence_threshold = confidence_threshold
        
        # Load model information
        self.model_info = self._load_model_info(model_info_path)
        
        # Initialize models
        self.disease_model = None
        self.pest_model = None
        self.models_loaded = False
        
        # Load models
        self._load_models()
        
    def _load_model_info(self, model_info_path: str) -> Dict:
        """Load model metadata and treatment information"""
        try:
            with open(model_info_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load model info from {model_info_path}: {e}")
            return {
                "models": {
                    "disease_model": {"class_names": []},
                    "pest_model": {"class_names": []}
                },
                "treatment_database": {"disease_treatments": {}, "pest_treatments": {}}
            }
    
    def _load_models(self):
        """Load both YOLO models"""
        print("Loading ML models...")
        
        # Load Disease Model
        if os.path.exists(self.disease_model_path):
            try:
                self.disease_model = YOLO(self.disease_model_path)
                print("✅ Disease model loaded successfully!")
            except Exception as e:
                print(f"❌ Failed to load disease model: {e}")
                self.disease_model = None
        else:
            print("❌ Disease model file not found!")
            
        # Load Pest Model  
        if os.path.exists(self.pest_model_path):
            try:
                self.pest_model = YOLO(self.pest_model_path)
                print("✅ Pest model loaded successfully!")
            except Exception as e:
                print(f"❌ Failed to load pest model: {e}")
                self.pest_model = None
        else:
            print("❌ Pest model file not found!")
            
        self.models_loaded = (self.disease_model is not None) or (self.pest_model is not None)
        
    def predict_from_base64(self, image_base64: str) -> Dict[str, Any]:
        """
        Predict from base64 encoded image
        """
        try:
            # Decode base64 image
            image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to numpy array
            image_np = np.array(image)
            if len(image_np.shape) == 3 and image_np.shape[2] == 3:
                image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            
            return self.predict(image_np)
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing image: {str(e)}",
                "disease_detections": [],
                "pest_detections": [],
                "summary": {"total_detections": 0, "confidence_avg": 0.0}
            }
    
    def predict(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Run dual YOLO inference on image
        """
        if not self.models_loaded:
            return {
                "success": False,
                "error": "Models not loaded",
                "disease_detections": [],
                "pest_detections": [],
                "summary": {"total_detections": 0, "confidence_avg": 0.0}
            }
        
        disease_detections = []
        pest_detections = []
        
        try:
            # Disease detection
            if self.disease_model is not None:
                disease_results = self.disease_model(image, conf=self.confidence_threshold)
                disease_detections = self._parse_yolo_results(
                    disease_results, 
                    "disease",
                    self.model_info.get("models", {}).get("disease_model", {}).get("class_names", [])
                )
            
            # Pest detection
            if self.pest_model is not None:
                pest_results = self.pest_model(image, conf=self.confidence_threshold)
                pest_detections = self._parse_yolo_results(
                    pest_results, 
                    "pest",
                    self.model_info.get("models", {}).get("pest_model", {}).get("class_names", [])
                )
            
            # Calculate summary
            all_detections = disease_detections + pest_detections
            total_detections = len(all_detections)
            confidence_avg = np.mean([d["confidence"] for d in all_detections]) if all_detections else 0.0
            
            return {
                "success": True,
                "disease_detections": disease_detections,
                "pest_detections": pest_detections,
                "summary": {
                    "total_detections": total_detections,
                    "disease_count": len(disease_detections),
                    "pest_count": len(pest_detections),
                    "confidence_avg": float(confidence_avg)
                },
                "image_shape": image.shape,
                "processing_time": 0.0  # Add timing if needed
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Prediction error: {str(e)}",
                "disease_detections": [],
                "pest_detections": [],
                "summary": {"total_detections": 0, "confidence_avg": 0.0}
            }
    
    def _parse_yolo_results(self, results, detection_type: str, class_names: List[str]) -> List[Dict]:
        """Parse YOLO results into standardized format"""
        detections = []
        
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes.xyxy.cpu().numpy()
                confidences = result.boxes.conf.cpu().numpy()
                class_ids = result.boxes.cls.cpu().numpy().astype(int)
                
                for box, conf, cls_id in zip(boxes, confidences, class_ids):
                    class_name = class_names[cls_id] if cls_id < len(class_names) else f"class_{cls_id}"
                    
                    detection = {
                        "class_id": int(cls_id),
                        "class_name": class_name,
                        "confidence": float(conf),
                        "bbox": [float(x) for x in box],  # [x1, y1, x2, y2]
                        "detection_type": detection_type,
                        "center": [float((box[0] + box[2]) / 2), float((box[1] + box[3]) / 2)],
                        "area": float((box[2] - box[0]) * (box[3] - box[1]))
                    }
                    
                    detections.append(detection)
        
        return detections
    
    def get_treatment_recommendation(self, detections: List[Dict]) -> Dict[str, Any]:
        """Get treatment recommendations based on detections"""
        recommendations = {
            "disease_treatments": [],
            "pest_treatments": [],
            "general_advice": [],
            "severity_assessment": "low"
        }
        
        try:
            treatment_db = self.model_info.get("treatment_database", {})
            disease_treatments = treatment_db.get("disease_treatments", {})
            pest_treatments = treatment_db.get("pest_treatments", {})
            
            # Process disease detections
            for detection in detections:
                if detection["detection_type"] == "disease":
                    class_name = detection["class_name"]
                    if class_name in disease_treatments:
                        recommendations["disease_treatments"].append({
                            "disease": class_name,
                            "confidence": detection["confidence"],
                            "treatment": disease_treatments[class_name]
                        })
                
                elif detection["detection_type"] == "pest":
                    class_name = detection["class_name"]
                    if class_name in pest_treatments:
                        recommendations["pest_treatments"].append({
                            "pest": class_name,
                            "confidence": detection["confidence"],
                            "treatment": pest_treatments[class_name]
                        })
            
            # Assess severity
            total_detections = len(detections)
            avg_confidence = np.mean([d["confidence"] for d in detections]) if detections else 0
            
            if total_detections >= 5 or avg_confidence > 0.8:
                recommendations["severity_assessment"] = "high"
            elif total_detections >= 2 or avg_confidence > 0.6:
                recommendations["severity_assessment"] = "medium"
            else:
                recommendations["severity_assessment"] = "low"
                
        except Exception as e:
            print(f"Error generating recommendations: {e}")
        
        return recommendations