import axios from 'axios';
import { Request, Response } from 'express';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

export interface MLAnalysisRequest {
  image_base64: string;
  confidence_threshold?: number;
}

export interface MLDetection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: number[]; // [x1, y1, x2, y2]
  detection_type: 'disease' | 'pest';
  center: number[];
  area: number;
}

export interface MLAnalysisResponse {
  success: boolean;
  disease_detections: MLDetection[];
  pest_detections: MLDetection[];
  summary: {
    total_detections: number;
    disease_count: number;
    pest_count: number;
    confidence_avg: number;
  };
  treatment_recommendations?: {
    disease_treatments: any[];
    pest_treatments: any[];
    general_advice: string[];
    severity_assessment: 'low' | 'medium' | 'high';
  };
  error?: string;
}

class MLService {
  private static instance: MLService;
  
  private constructor() {}
  
  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }
  
  /**
   * Check if ML service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/health`, {
        timeout: 5000
      });
      return response.data.status === 'healthy' && response.data.models_loaded;
    } catch (error) {
      console.error('ML service health check failed:', error);
      return false;
    }
  }
  
  /**
   * Analyze image using ML models
   */
  async analyzeImage(imageBase64: string, confidenceThreshold: number = 0.5): Promise<MLAnalysisResponse> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/analyze-image`, {
        image_base64: imageBase64,
        confidence_threshold: confidenceThreshold
      }, {
        timeout: 30000, // 30 seconds timeout for ML processing
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('ML analysis failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('ML service is not available. Please ensure the Python ML service is running.');
        }
        if (error.response?.status === 503) {
          throw new Error('ML models are not loaded. Please check the ML service configuration.');
        }
      }
      
      throw new Error(`ML analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/models/info`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get model info:', error);
      throw new Error('Failed to retrieve model information');
    }
  }
}

// Express route handlers
export const mlAnalysisHandler = async (req: Request, res: Response) => {
  try {
    const { image_base64, confidence_threshold } = req.body;
    
    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'image_base64 is required'
      });
    }
    
    // Check ML service health
    const mlService = MLService.getInstance();
    const isHealthy = await mlService.healthCheck();
    
    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        error: 'ML service is not available or models are not loaded'
      });
    }
    
    // Analyze image
    const result = await mlService.analyzeImage(image_base64, confidence_threshold);
    
    // Store analysis result in database (optional)
    // await storeAnalysisResult(result);
    
    res.json(result);
  } catch (error) {
    console.error('ML analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'ML analysis failed'
    });
  }
};

export const mlHealthHandler = async (_req: Request, res: Response) => {
  try {
    const mlService = MLService.getInstance();
    const isHealthy = await mlService.healthCheck();
    
    res.json({
      ml_service_healthy: isHealthy,
      ml_service_url: ML_SERVICE_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ml_service_healthy: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
};

export const mlModelInfoHandler = async (_req: Request, res: Response) => {
  try {
    const mlService = MLService.getInstance();
    const modelInfo = await mlService.getModelInfo();
    
    res.json(modelInfo);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get model info'
    });
  }
};

export default MLService;