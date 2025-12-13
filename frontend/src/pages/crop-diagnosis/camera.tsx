import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Camera.module.css';

const Camera: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  // Go back to the previous page
  const goBack = () => {
    stopCamera();
    router.back();
  };

  // Navigate to the diagnosis results page
  const viewResults = () => {
    router.push('/crop-diagnosis/results');
  };

  // Initialize the camera on component mount
  useEffect(() => {
    startCamera();
    
    // Clean up on component unmount
    return () => {
      stopCamera();
    };
  }, []);
  
  // Start the camera
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        alert('Camera access is not supported by your browser');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Failed to access camera. Please check permissions and try again.');
      setCameraActive(false);
    }
  };
  
  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };
  
  // Capture an image from the video stream
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
        stopCamera();
        
        // Show success icon for 2 seconds before navigating
        setShowResults(true);
        setTimeout(() => {
          viewResults();
        }, 2000);
      }
    }
  };

  return (
    <div className={styles.cameraContainer}>
      {cameraActive ? (
        <>
          <div className={styles.cameraHeader}>
            <button className={styles.backButton} onClick={goBack} aria-label="Go back" title="Go back">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className={styles.flashButton}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
          </div>
          
          <div className={styles.cameraViewfinder}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={styles.videoPreview} 
            />
            <canvas ref={canvasRef} className={styles.hiddenCanvas} />
          </div>
          
          <div className={styles.cameraControls}>
            <div className={styles.galleryButton}>
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="white" strokeWidth="2" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className={styles.captureButton} onClick={takePicture}></div>
            <div className={styles.helpButton}>
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="white" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
        </>
      ) : capturedImage && showResults ? (
        <div className={styles.resultContainer}>
          <img 
            src={capturedImage} 
            alt="Captured plant" 
            className={styles.capturedImage}
          />
          <div className={styles.successOverlay}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" width="64" height="64" stroke="white" strokeWidth="2" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <div>Loading camera...</div>
        </div>
      )}
    </div>
  );
};

export default Camera;