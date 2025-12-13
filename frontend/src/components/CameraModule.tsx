import React, { useState, useRef } from 'react';
import styles from '../styles/Camera.module.css';

const CameraModule: React.FC = () => {
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        console.log('Starting camera...');
        setLoading(true);
        setError('');
        setCapturedImage(null);
        
        // Wait a bit to ensure the component is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!videoRef.current) {
            console.error('Video ref is still null after waiting');
            setError('Camera component not ready. Please try again.');
            setLoading(false);
            return;
        }
        
        try {
            console.log('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: 'user', // Start with front camera which is more reliable
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });
            
            console.log('Camera stream obtained:', stream);
            console.log('Video element exists:', !!videoRef.current);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                console.log('Video stream assigned to video element');
                console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                console.log('Stream active:', stream.active);
                console.log('Stream tracks:', stream.getTracks().length);
                
                // Set video properties
                videoRef.current.muted = true;
                videoRef.current.playsInline = true;
                videoRef.current.controls = false;
                
                // Add event listeners for debugging
                videoRef.current.onloadstart = () => console.log('Video load start');
                videoRef.current.onloadeddata = () => console.log('Video data loaded');
                videoRef.current.oncanplay = () => console.log('Video can play');
                videoRef.current.onplay = () => console.log('Video playing');
                videoRef.current.onerror = (e) => console.error('Video error:', e);
                
                // Try to play immediately
                try {
                    await videoRef.current.play();
                    console.log('Video is now playing');
                    setCameraActive(true);
                    setLoading(false);
                } catch (playErr) {
                    console.error('Error playing video:', playErr);
                    // Sometimes autoplay fails, try again after a short delay
                    setTimeout(async () => {
                        try {
                            if (videoRef.current) {
                                await videoRef.current.play();
                                console.log('Video is now playing (retry)');
                                setCameraActive(true);
                                setLoading(false);
                            }
                        } catch (retryErr) {
                            console.error('Retry failed:', retryErr);
                            setError('Failed to start video playback');
                            setLoading(false);
                        }
                    }, 500);
                }
            } else {
                console.error('Video ref became null during setup');
                setError('Video element was removed unexpectedly');
                setLoading(false);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Failed to access camera. Please check permissions.');
            setLoading(false);
        }
    };
    
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        
        setCameraActive(false);
    };
    
    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw video frame to canvas
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas to image data URL
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageDataUrl);
                
                // Stop camera stream
                stopCamera();
            }
        }
    };

    const resetCamera = () => {
        setCapturedImage(null);
        startCamera();
    };

    return (
        <div className={styles.cameraContainer}>
            {/* Always render video element but only show when camera is active */}
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted
                className={cameraActive ? styles.video : styles.hiddenVideo}
                onCanPlay={() => {
                    console.log('Video can play');
                    if (loading) {
                        setCameraActive(true);
                        setLoading(false);
                    }
                }}
            />
            
            {!cameraActive && !capturedImage && !loading && (
                <div className={styles.cameraStart}>
                    <h3>Take a Picture</h3>
                    {error && <p className={styles.errorText}>{error}</p>}
                    <button onClick={startCamera} className={styles.startButton}>
                        Open Camera
                    </button>
                </div>
            )}

            {loading && (
                <div className={styles.cameraStart}>
                    <h3>Starting Camera...</h3>
                    <p>Please wait while we access your camera</p>
                    <button onClick={() => {setLoading(false); setError('');}} className={styles.startButton}>
                        Cancel
                    </button>
                </div>
            )}

            {cameraActive && (
                <>
                    {/* Simplified video display for debugging */}
                    <div className={styles.videoContainer}>
                        {/* Video stream - simplified */}
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            muted
                            className={styles.videoElement}
                            onCanPlay={() => {
                                console.log('Video can play');
                                if (loading) {
                                    setCameraActive(true);
                                    setLoading(false);
                                }
                            }}
                        />
                        
                        {/* Simple overlay */}
                        <div className={styles.cameraOverlay}></div>
                        
                        {/* Simple controls */}
                        <div className={styles.cameraControls}>
                            <button 
                                onClick={takePicture}
                                className={styles.captureButton}
                                title="Take photo"
                                aria-label="Take photo"
                            >
                            </button>
                        </div>
                        
                        {/* Back button */}
                        <button 
                            onClick={stopCamera}
                            className={styles.backButton}
                            title="Go back"
                            aria-label="Go back"
                        >
                            ← Back
                        </button>
                    </div>
                </>
            )}

            {capturedImage && (
                <div className={styles.capturedImageView}>
                    <img src={capturedImage} alt="Captured" className={styles.capturedImage} />
                    <div className={styles.imageControls}>
                        <button 
                            onClick={resetCamera} 
                            className={styles.retakeButton}
                            title="Retake photo"
                            aria-label="Retake photo"
                        >
                            Retake
                        </button>
                        <button 
                            onClick={() => alert('Photo saved!')} 
                            className={styles.saveButton}
                            title="Save photo"
                            aria-label="Save photo"
                        >
                            ✓
                        </button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className={styles.hiddenCanvas} />
        </div>
    );
};

export default CameraModule;