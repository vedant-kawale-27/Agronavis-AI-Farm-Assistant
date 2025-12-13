import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/CropDiagnosis.module.css';

const CropDiagnosis: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('aif-scheme');

  // Go back to the previous page
  const goBack = () => {
    router.back();
  };

  // Navigate to the camera page
  const navigateToCamera = () => {
    router.push('/crop-diagnosis/camera');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topHeader}>
          <div className={styles.weatherInfo}>
            <div className={styles.profileIcon}>👨‍🌾</div>
            <div className={styles.title}>E-Crop Diagnosis</div>
          </div>
          <div className={styles.temperature}>26 °C</div>
        </div>

        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'aif-scheme' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('aif-scheme')}
          >
            AIF-Scheme
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'ahidf' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ahidf')}
          >
            AHIDF
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'pmfme' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pmfme')}
          >
            PMFME Scheme
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.testCropTitle}>Test Your Crop</div>

        <div className={styles.diagnosisSteps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="64" height="64">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#000" strokeWidth="2" />
                <rect x="30" y="30" width="40" height="30" rx="2" fill="#333" />
                <circle cx="50" cy="45" r="10" fill="#555" />
                <rect x="45" y="65" width="10" height="5" fill="#333" />
              </svg>
            </div>
            <div className={styles.stepText}>Take a Picture</div>
          </div>
          
          <div className={styles.stepArrow}>→</div>
          
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="64" height="64">
                <rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="#000" strokeWidth="2" />
                <line x1="20" y1="40" x2="80" y2="40" stroke="#000" strokeWidth="2" />
                <line x1="40" y1="50" x2="70" y2="50" stroke="#000" strokeWidth="2" />
                <line x1="40" y1="60" x2="70" y2="60" stroke="#000" strokeWidth="2" />
                <line x1="40" y1="70" x2="70" y2="70" stroke="#000" strokeWidth="2" />
              </svg>
            </div>
            <div className={styles.stepText}>See a Diagnosis & Treatment</div>
          </div>
          
          <div className={styles.stepArrow}>→</div>
          
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="64" height="64">
                <rect x="35" y="20" width="30" height="50" rx="5" fill="none" stroke="#000" strokeWidth="2" />
                <rect x="35" y="20" width="30" height="15" rx="2" fill="#333" />
                <line x1="45" y1="45" x2="55" y2="45" stroke="#000" strokeWidth="2" />
                <line x1="45" y1="55" x2="55" y2="55" stroke="#000" strokeWidth="2" />
                <path d="M40 75 C40 85, 60 85, 60 75" stroke="#000" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div className={styles.stepText}>Get Medicine</div>
          </div>
        </div>

        <button className={styles.takePictureButton} onClick={navigateToCamera}>
          Take a Picture
        </button>
      </div>

      <div className={styles.featuresSection}>
        <div className={styles.featuresTitle}>All Features</div>
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🇮🇳</div>
            <div className={styles.featureText}>Government Scheme</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📝</div>
            <div className={styles.featureText}>Reports and Treatment</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🧮</div>
            <div className={styles.featureText}>Fertilizer Calculator</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📚</div>
            <div className={styles.featureText}>Disease Library</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🚜</div>
            <div className={styles.featureText}>Automatic System for Water</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🌱</div>
            <div className={styles.featureText}>Seeds</div>
          </div>
        </div>
      </div>

      <div className={styles.bottomNav}>
        <div className={styles.navButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        
        <div className={styles.navButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        
        <div className={styles.navButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CropDiagnosis;