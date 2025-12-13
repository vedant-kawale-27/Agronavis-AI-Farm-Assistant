import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import AnalysisReport from '../components/AnalysisReport';
import styles from '../styles/AnalysisReportPage.module.css';

const AnalysisReportPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Get analysis results from sessionStorage
    const storedResult = sessionStorage.getItem('analysisResult');
    const storedImage = sessionStorage.getItem('analyzedImage');

    if (storedResult && storedImage) {
      try {
        const result = JSON.parse(storedResult);
        setAnalysisResult(result);
        setImageUrl(storedImage);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing stored analysis result:', err);
        setError(t('common.error'));
        setLoading(false);
      }
    } else {
      setError(t('report.errors.noData'));
      setLoading(false);
    }
  }, []);

  const handleRetakePhoto = () => {
    // Clear stored data and navigate back to camera
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('analyzedImage');
    router.push('/camera');
  };

  const handleSaveReport = () => {
    if (analysisResult) {
      // Generate JSON download
      const data = JSON.stringify(analysisResult, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crop-analysis-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleNewAnalysis = () => {
    // Clear current data and go back to camera
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('analyzedImage');
    router.push('/camera');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <h2>{t('report.loading')}</h2>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error || !analysisResult) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>🚫 {t('report.errors.title')}</h2>
          <p>{error || t('report.errors.noData')}</p>
          <button 
            onClick={() => router.push('/camera')} 
            className={styles.errorButton}
          >
            {t('camera.takePhoto')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.navigation}>
        <button 
          onClick={() => router.push('/dashboard')} 
          className={styles.homeButton}
        >
          🏠 {t('navigation.dashboard')}
        </button>
        <h1 className={styles.pageTitle}>{t('report.title')}</h1>
      </div>

      <AnalysisReport
        results={analysisResult}
        imageUrl={imageUrl}
        onRetakePhoto={handleRetakePhoto}
        onSaveReport={handleSaveReport}
        onNewAnalysis={handleNewAnalysis}
      />
    </div>
  );
};

export default AnalysisReportPage;