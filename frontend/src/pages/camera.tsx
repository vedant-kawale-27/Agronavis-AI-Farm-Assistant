import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import styles from '../styles/CameraPage.module.css';

const CameraPage: React.FC = () => {
    console.log('Camera page loaded!');
    const router = useRouter();
    const { t } = useTranslation();
    const [mode, setMode] = useState<'select' | 'camera' | 'upload' | 'preview'>('select');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Start camera
    const startCamera = async () => {
        setLoading(true);
        setError('');
        setMode('camera'); // Change to camera mode
        setCameraActive(true); // Set this immediately so video element renders
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: 'environment', // Back camera for plant photos
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                
                // Add event listener for when metadata is loaded
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play()
                            .then(() => {
                                console.log('Camera video playing successfully');
                                setLoading(false);
                            })
                            .catch(err => {
                                console.error('Video play failed:', err);
                                setError(t('camera.errors.videoPlayback'));
                                setLoading(false);
                                setCameraActive(false);
                                setMode('select');
                            });
                    }
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError(t('camera.errors.cameraPermission'));
            setLoading(false);
            setCameraActive(false);
            setMode('select');
        }
    };    // Stop camera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
        setMode('select');
    };

    // Capture photo from camera
    const capturePhoto = () => {
        console.log('Capture photo clicked');
        console.log('VideoRef current:', videoRef.current);
        console.log('CanvasRef current:', canvasRef.current);
        
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            console.log('Video dimensions:', video.videoWidth, video.videoHeight);
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                console.log('Image captured, data URL length:', imageDataUrl.length);
                setCapturedImage(imageDataUrl);
                stopCamera();
                setMode('preview');
                console.log('Mode set to preview');
            } else {
                console.error('Could not get canvas context');
            }
        } else {
            console.error('Missing video or canvas ref');
        }
    };

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCapturedImage(e.target?.result as string);
                setMode('preview');
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit for analysis
    const submitForAnalysis = async () => {
        if (!capturedImage) return;
        
        setLoading(true);
        setError('');
        
        try {
            // Convert data URL to base64
            const base64Image = capturedImage.split(',')[1];
            
            // Call ML analysis API
            const response = await fetch('/api/ml/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    format: 'base64'
                }),
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`);
            }

            const analysisResult = await response.json();
            
            // Store results in sessionStorage for the report page
            sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
            sessionStorage.setItem('analyzedImage', capturedImage);
            
            // Navigate to analysis report page
            router.push('/analysis-report');
            
        } catch (err) {
            console.error('Analysis error:', err);
            setError(t('camera.errors.analysisError'));
        } finally {
            setLoading(false);
        }
    };

    // Reset to start
    const resetToStart = () => {
        setCapturedImage(null);
        setCameraActive(false);
        setMode('select');
        setError('');
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    {t('common.back')}
                </button>
                <h1 className={styles.title}>{t('camera.title')}</h1>
            </div>

            {/* Debug info */}
            <div className={styles.debugInfo}>
                Mode: {mode} | Camera Active: {cameraActive.toString()} | Has Image: {!!capturedImage}
            </div>

            {/* Selection Mode */}
            {mode === 'select' && (
                <div className={styles.selectionContainer}>
                    <h2 className={styles.subtitle}>{t('camera.subtitle')}</h2>
                    
                    <div className={styles.optionButtons}>
                        <button onClick={startCamera} className={styles.optionButton}>
                            <div className={styles.optionIcon}>📷</div>
                            <div className={styles.optionText}>{t('camera.takePhoto')}</div>
                            <div className={styles.optionDesc}>{t('camera.takePhotoDesc')}</div>
                        </button>
                        
                        <button onClick={() => fileInputRef.current?.click()} className={styles.optionButton}>
                            <div className={styles.optionIcon}>📁</div>
                            <div className={styles.optionText}>{t('camera.uploadImage')}</div>
                            <div className={styles.optionDesc}>{t('camera.uploadImageDesc')}</div>
                        </button>
                    </div>
                    
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            )}

            {/* Camera Mode */}
            {mode === 'camera' && (
                <div className={styles.cameraContainer}>
                    {loading && (
                        <div className={styles.loadingOverlay}>
                            <p>{t('camera.startingCamera')}</p>
                        </div>
                    )}
                    
                    {cameraActive && (
                        <>
                            <video 
                                ref={videoRef}
                                className={styles.video}
                                autoPlay
                                playsInline
                                muted
                            />
                            
                            {/* Camera overlay with rectangle */}
                            <div className={styles.cameraOverlay}>
                                <div className={styles.focusRectangle}>
                                    <div className={styles.cornerTL}></div>
                                    <div className={styles.cornerTR}></div>
                                    <div className={styles.cornerBL}></div>
                                    <div className={styles.cornerBR}></div>
                                </div>
                                <p className={styles.instructionText}>{t('camera.instructionText')}</p>
                            </div>
                            
                            {/* Camera controls */}
                            <div className={styles.cameraControls}>
                                <button onClick={stopCamera} className={styles.cancelButton}>
                                    {t('common.cancel')}
                                </button>
                                <button 
                                    onClick={capturePhoto} 
                                    className={styles.captureButton}
                                    title={t('camera.capture')}
                                    aria-label={t('camera.capture')}
                                >
                                    <div className={styles.captureInner}></div>
                                </button>
                                <div className={styles.placeholder}></div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Preview Mode */}
            {mode === 'preview' && capturedImage && (
                <div className={styles.previewContainer}>
                    <div className={styles.imagePreview}>
                        <img src={capturedImage} alt="Captured plant" className={styles.previewImage} />
                        
                        {/* Overlay rectangle on preview */}
                        <div className={styles.previewOverlay}>
                            <div className={styles.previewRectangle}>
                                <div className={styles.cornerTL}></div>
                                <div className={styles.cornerTR}></div>
                                <div className={styles.cornerBL}></div>
                                <div className={styles.cornerBR}></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.previewControls}>
                        <button 
                            onClick={resetToStart} 
                            className={styles.retakeButton}
                            disabled={loading}
                        >
                            {t('camera.retake')}
                        </button>
                        <button 
                            onClick={submitForAnalysis} 
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? t('camera.analyzing') : t('camera.analyzePlant')}
                        </button>
                    </div>
                    
                    {loading && (
                        <div className={styles.analysisLoader}>
                            <p>{t('camera.analysisProgress')}</p>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill}></div>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className={styles.hiddenInput}
                title="Select image file"
                aria-label="Select image file from device"
            />
            
            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className={styles.hiddenCanvas} />
        </div>
    );
};

export default CameraPage;