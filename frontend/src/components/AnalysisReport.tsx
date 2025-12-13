import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/AnalysisReport.module.css';

interface DetectionResult {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: number[]; // [x1, y1, x2, y2]
  detection_type: 'disease' | 'pest';
  center: number[];
  area: number;
}

interface AnalysisSummary {
  total_detections: number;
  confidence_avg: number;
  disease_count: number;
  pest_count: number;
}

interface TreatmentRecommendation {
  name: string;
  description: string;
  dosage: string;
  application_method: string;
  frequency: string;
}

interface MLAnalysisResult {
  success: boolean;
  disease_detections: DetectionResult[];
  pest_detections: DetectionResult[];
  summary: AnalysisSummary;
  treatment_recommendations: TreatmentRecommendation[];
}

interface AnalysisReportProps {
  results: MLAnalysisResult;
  imageUrl?: string;
  onRetakePhoto: () => void;
  onSaveReport: () => void;
  onNewAnalysis?: () => void;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({
  results,
  imageUrl,
  onRetakePhoto,
  onSaveReport,
  onNewAnalysis
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t } = useTranslation();

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const calculateSeverity = (): 'low' | 'medium' | 'high' => {
    const totalDetections = results.summary.total_detections;
    const avgConfidence = results.summary.confidence_avg;
    
    if (totalDetections === 0) return 'low';
    if (totalDetections >= 5 || avgConfidence >= 0.8) return 'high';
    if (totalDetections >= 2 || avgConfidence >= 0.6) return 'medium';
    return 'low';
  };

  const diseaseDetections = results.disease_detections || [];
  const pestDetections = results.pest_detections || [];
  const allDetections = [...diseaseDetections, ...pestDetections];
  const calculatedSeverity = calculateSeverity();

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes
      allDetections.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.bbox;
        
        // Set colors based on detection type
        const isDisease = detection.detection_type === 'disease';
        ctx.strokeStyle = isDisease ? '#ff4444' : '#44ff44';
        ctx.fillStyle = isDisease ? 'rgba(255, 68, 68, 0.2)' : 'rgba(68, 255, 68, 0.2)';
        ctx.lineWidth = 3;
        
        // Draw bounding box
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        
        // Draw label background and text
        const label = `${detection.class_name} (${formatConfidence(detection.confidence)})`;
        ctx.font = '12px Arial';
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 16;
        
        // Calculate label position - ensure it stays within image bounds
        let labelX = Math.max(0, Math.min(x1, canvas.width - textWidth - 8));
        let labelY = y1 - textHeight - 4;
        
        // If label would go above image, place it inside the bounding box
        if (labelY < 0) {
          labelY = y1 + textHeight + 4;
        }
        
        // If label would go below image, place it at the top of bbox
        if (labelY + textHeight > canvas.height) {
          labelY = y1 - 4;
        }
        
        ctx.fillStyle = isDisease ? '#ff4444' : '#44ff44';
        ctx.fillRect(labelX, labelY - textHeight, textWidth + 8, textHeight + 4);
        
        // Draw label text
        ctx.fillStyle = 'white';
        ctx.fillText(label, labelX + 4, labelY - 4);
      });
    };
    
    img.src = imageUrl;
  }, [imageUrl, allDetections, imageLoaded]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => window.history.back()} className={styles.backButton}>
          ← {t('common.back')}
        </button>
        <h1 className={styles.title}>{t('report.title')}</h1>
      </div>

      {/* Image with Bounding Boxes */}
      <div className={styles.imageSection}>
        {imageUrl && (
          <>
            <img 
              src={imageUrl} 
              alt="Original" 
              className={styles.hiddenImage}
              onLoad={() => setImageLoaded(true)}
            />
            <canvas 
              ref={canvasRef}
              className={styles.analysisImage}
            />
          </>
        )}
      </div>

      {/* Summary */}
      <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <h3>{t('report.summary.totalDetections')}</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.summary.total_detections}</span>
              <span className={styles.statLabel}>{t('report.summary.totalDetections')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.summary.disease_count}</span>
              <span className={styles.statLabel}>{t('report.detections.diseases')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.summary.pest_count}</span>
              <span className={styles.statLabel}>{t('report.detections.pests')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles[calculatedSeverity]}`}>
                {t(`report.severity.${calculatedSeverity}`)}
              </span>
              <span className={styles.statLabel}>{t('report.severity.low').replace(' Severity', '')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detection List */}
      {allDetections.length > 0 && (
        <div className={styles.detectionsList}>
          <h3>{t('report.summary.issuesIdentified')}</h3>
          {allDetections.map((detection, index) => (
            <div key={index} className={`${styles.detectionItem} ${styles[detection.detection_type]}`}>
              <div className={styles.detectionInfo}>
                <span className={styles.detectionName}>{detection.class_name}</span>
                <span className={styles.detectionType}>
                  {detection.detection_type === 'disease' ? '🦠' : '🐛'} {t(`report.detections.${detection.detection_type}`)}
                </span>
              </div>
              <span className={styles.confidence}>{formatConfidence(detection.confidence)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Simple Recommendations */}
      {results.treatment_recommendations && results.treatment_recommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <h3>{t('report.recommendations')}</h3>
          {results.treatment_recommendations.slice(0, 3).map((treatment, index) => (
            <div key={index} className={styles.recommendationItem}>
              <h4>{treatment.name}</h4>
              <p>{treatment.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button onClick={onRetakePhoto} className={styles.secondaryButton}>
          📷 {t('report.actions.retakePhoto')}
        </button>
        <button onClick={onSaveReport} className={styles.primaryButton}>
          💾 {t('report.actions.saveReport')}
        </button>
      </div>
    </div>
  );
};

export default AnalysisReport;