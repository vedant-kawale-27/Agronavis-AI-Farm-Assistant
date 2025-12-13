import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Dashboard.module.css';
import WeatherBlock from './WeatherBlock';

interface Scheme {
  name: string;
  provider: string;
}

interface Farm {
  id: string;
  name: string;
  total_area: number;
  soil_type?: string;
  irrigation_type?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  crops?: any[];
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('crop');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  
  // Sample schemes for the UI
  const schemes: Scheme[] = [
    { name: 'AIF-Scheme', provider: 'Government' },
    { name: 'AHIDF', provider: 'Government' },
    { name: 'PMFME Scheme', provider: 'Government' },
  ];

  // Navigate to weather forecast page
  const navigateToWeatherForecast = () => {
    router.push('/weather-forecast');
  };
  
  // Navigate to camera page
  const openCamera = () => {
    console.log('Opening camera page...');
    router.push('/camera');
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('dashboard.welcome')}</h1>
        <div className={styles.dateTime}>
          
        </div>
      </div>

      {/* Weather Card */}
      <div className={styles.weatherCard} onClick={navigateToWeatherForecast}>
        <WeatherBlock compact={true} />
      </div>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {/* E-Crop Diagnosis Card */}
        <div className={styles.card} onClick={openCamera}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>{t('dashboard.cropDiagnosis.title')}</div>
          </div>
          <div className={styles.diagnosisContent}>
            <h3>{t('dashboard.cropDiagnosis.testYourCrop')}</h3>
            
            <div className={styles.diagnosisSteps}>
              <div className={styles.diagnosisStep}>
                <div className={styles.stepIcon}>📷</div>
                <div className={styles.stepText}>{t('dashboard.cropDiagnosis.steps.takePicture')}</div>
              </div>
              
              <div className={styles.stepArrow}>→</div>
              
              <div className={styles.diagnosisStep}>
                <div className={styles.stepIcon}>📊</div>
                <div className={styles.stepText}>{t('dashboard.cropDiagnosis.steps.seeDiagnosis')}</div>
              </div>
              
              <div className={styles.stepArrow}>→</div>
              
              <div className={styles.diagnosisStep}>
                <div className={styles.stepIcon}>🌿</div>
                <div className={styles.stepText}>{t('dashboard.cropDiagnosis.steps.getMedicine')}</div>
              </div>
            </div>
            
            <button className={styles.diagnosisButton} onClick={openCamera}>
              {t('dashboard.cropDiagnosis.steps.takePicture')}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresCard}>
          <h3>{t('dashboard.features.title')}</h3>
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🇮🇳</div>
              <div className={styles.featureText}>{t('dashboard.features.governmentScheme')}</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📝</div>
              <div className={styles.featureText}>{t('dashboard.features.reportsAndTreatment')}</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🧮</div>
              <div className={styles.featureText}>{t('dashboard.features.fertilizerCalculator')}</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📚</div>
              <div className={styles.featureText}>{t('dashboard.features.diseaseLibrary')}</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🚜</div>
              <div className={styles.featureText}>{t('dashboard.features.automaticWater')}</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🌱</div>
              <div className={styles.featureText}>{t('dashboard.features.seeds')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={styles.bottomNav}>
        <div 
          className={`${styles.navItem} ${activeTab === 'crop' ? styles.active : ''}`}
          onClick={() => setActiveTab('crop')}
        >
          <div className={styles.navIcon}>🌾</div>
          <div className={styles.navText}>{t('dashboard.navigation.crop')}</div>
        </div>
        <div 
          className={`${styles.navItem} ${activeTab === 'community' ? styles.active : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <div className={styles.navIcon}>👥</div>
          <div className={styles.navText}>{t('dashboard.navigation.community')}</div>
        </div>
        <div 
          className={`${styles.navItem} ${activeTab === 'shop' ? styles.active : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          <div className={styles.navIcon}>🛒</div>
          <div className={styles.navText}>{t('dashboard.navigation.shop')}</div>
        </div>
        <div 
          className={`${styles.navItem} ${activeTab === 'you' ? styles.active : ''}`}
          onClick={() => setActiveTab('you')}
        >
          <div className={styles.navIcon}>👤</div>
          <div className={styles.navText}>{t('dashboard.navigation.you')}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;