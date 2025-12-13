import express, { Request, Response } from 'express';
import multer from 'multer';
import { mlAnalysisHandler, mlHealthHandler, mlModelInfoHandler } from '../services/mlService';

const router = express.Router();

// Extend Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * @route POST /api/ml/analyze
 * @desc Analyze plant image for diseases and pests
 * @body { image_base64: string, confidence_threshold?: number }
 */
router.post('/analyze', mlAnalysisHandler);

/**
 * @route POST /api/ml/analyze-upload
 * @desc Analyze uploaded plant image for diseases and pests
 * @multipart image file
 */
router.post('/analyze-upload', upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

    // Use the existing analysis handler by modifying req.body
    req.body = {
      image_base64: dataUrl,
      confidence_threshold: req.body.confidence_threshold || 0.5
    };

    // Call the analysis handler
    await mlAnalysisHandler(req, res);
  } catch (error) {
    console.error('File upload analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload analysis failed'
    });
  }
});

/**
 * @route GET /api/ml/health
 * @desc Check ML service health status
 */
router.get('/health', mlHealthHandler);

/**
 * @route GET /api/ml/models/info
 * @desc Get information about loaded ML models
 */
router.get('/models/info', mlModelInfoHandler);

/**
 * @route GET /api/ml/models/classes
 * @desc Get class names for both models
 */
router.get('/models/classes', async (req: Request, res: Response) => {
  try {
    const mlService = await import('../services/mlService');
    const modelInfo = await mlService.default.getInstance().getModelInfo();
    
    res.json({
      disease_classes: modelInfo.disease_model.class_names,
      pest_classes: modelInfo.pest_model.class_names,
      total_disease_classes: modelInfo.disease_model.classes,
      total_pest_classes: modelInfo.pest_model.classes
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get class information'
    });
  }
});

export default router;