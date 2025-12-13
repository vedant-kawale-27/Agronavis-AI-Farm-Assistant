"""
AgroNavis ML API Service
FastAPI backend for plant disease and pest detection
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import base64
import io
import numpy as np
from PIL import Image
import uvicorn
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.dual_yolo_predictor import DualYOLOPredictor

app = FastAPI(
    title="AgroNavis ML API",
    description="Plant Disease and Pest Detection Service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor instance
predictor: Optional[DualYOLOPredictor] = None

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    confidence_threshold: Optional[float] = 0.5

class ImageAnalysisResponse(BaseModel):
    success: bool
    disease_detections: List[Dict[str, Any]]
    pest_detections: List[Dict[str, Any]]
    summary: Dict[str, Any]
    treatment_recommendations: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    global predictor
    try:
        print("🚀 Starting AgroNavis ML API...")
        predictor = DualYOLOPredictor(
            disease_model_path="models/plantDoc.pt",
            pest_model_path="models/pest2.pt",
            model_info_path="models/model_info.json",
            confidence_threshold=0.5
        )
        print("✅ ML models loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load ML models: {e}")
        predictor = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AgroNavis ML API is running",
        "status": "healthy",
        "models_loaded": predictor is not None if predictor else False
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models_loaded": predictor is not None,
        "disease_model": predictor.disease_model is not None if predictor else False,
        "pest_model": predictor.pest_model is not None if predictor else False
    }

@app.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """
    Analyze plant image for diseases and pests
    """
    if predictor is None:
        raise HTTPException(
            status_code=503, 
            detail="ML models not loaded. Service unavailable."
        )
    
    try:
        # Set confidence threshold if provided
        if request.confidence_threshold:
            predictor.confidence_threshold = request.confidence_threshold
        
        # Run prediction
        results = predictor.predict_from_base64(request.image_base64)
        
        # Get treatment recommendations
        all_detections = results.get("disease_detections", []) + results.get("pest_detections", [])
        treatment_recommendations = predictor.get_treatment_recommendation(all_detections)
        
        # Return response
        return ImageAnalysisResponse(
            success=results["success"],
            disease_detections=results["disease_detections"],
            pest_detections=results["pest_detections"],
            summary=results["summary"],
            treatment_recommendations=treatment_recommendations,
            error=results.get("error")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/analyze-image-upload")
async def analyze_image_upload(file: UploadFile = File(...)):
    """
    Analyze uploaded image file for diseases and pests
    """
    if predictor is None:
        raise HTTPException(
            status_code=503, 
            detail="ML models not loaded. Service unavailable."
        )
    
    try:
        # Read uploaded file
        image_data = await file.read()
        
        # Convert to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Run prediction
        results = predictor.predict_from_base64(image_base64)
        
        # Get treatment recommendations
        all_detections = results.get("disease_detections", []) + results.get("pest_detections", [])
        treatment_recommendations = predictor.get_treatment_recommendation(all_detections)
        
        return {
            "success": results["success"],
            "disease_detections": results["disease_detections"],
            "pest_detections": results["pest_detections"],
            "summary": results["summary"],
            "treatment_recommendations": treatment_recommendations,
            "error": results.get("error"),
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload analysis failed: {str(e)}"
        )

@app.get("/models/info")
async def get_model_info():
    """Get information about loaded models"""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="ML models not loaded"
        )
    
    return {
        "disease_model": {
            "loaded": predictor.disease_model is not None,
            "classes": len(predictor.model_info.get("models", {}).get("disease_model", {}).get("class_names", [])),
            "class_names": predictor.model_info.get("models", {}).get("disease_model", {}).get("class_names", [])
        },
        "pest_model": {
            "loaded": predictor.pest_model is not None,
            "classes": len(predictor.model_info.get("models", {}).get("pest_model", {}).get("class_names", [])),
            "class_names": predictor.model_info.get("models", {}).get("pest_model", {}).get("class_names", [])
        },
        "confidence_threshold": predictor.confidence_threshold
    }

if __name__ == "__main__":
    print("🌾 Starting AgroNavis ML API Server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,  # Different port from main backend
        reload=True,
        log_level="info"
    )