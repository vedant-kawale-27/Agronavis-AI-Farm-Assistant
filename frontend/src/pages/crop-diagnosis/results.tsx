import React from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/DiagnosisResults.module.css';

const DiagnosisResults: React.FC = () => {
  const router = useRouter();

  // Go back to the previous page
  const goBack = () => {
    router.back();
  };

  // Sample diagnosis data
  const diagnosisData = {
    disease: 'Anthracnose of Apple',
    type: 'Fungus',
    image: '/images/anthracnose-apple.jpg', // Replace with actual image
    symptoms: [
      'Small, circular, reddish to purple spots on bark.',
      'Development of cankers with upward curled margins.',
      'creamy white fungal growth in their center.',
      'brown spot and patches on fruits and leaves.',
    ],
    description: 'Symptoms first appear as brown, depressed, circular spots that are flat to slightly sunken with a light brown center; spots may occur singly or be numerous. As the spots extend, fungus fruiting bodies (acervuli) develop in the center, often in concentric rings giving the appearance of a bull\'s eye.',
    recommendations: 'Organic Control. The application of a Bordeaux mixture or copper sulphate after harvest can reduce the incidence of',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={goBack} aria-label="Go back" title="Go back">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.title}>Reports</h1>
        <div className={styles.actionButtons}>
          <button className={styles.downloadButton} aria-label="Download" title="Download">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button className={styles.shareButton} aria-label="Share" title="Share">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.diseaseName}>{diagnosisData.disease}</h2>
        <p className={styles.diseaseType}>{diagnosisData.type}</p>

        <div className={styles.imageContainer}>
          <img 
            src="/images/farmertea.png" // Placeholder image
            alt={diagnosisData.disease}
            className={styles.diseaseImage}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>1</div>
            <h3 className={styles.sectionTitle}>Confirm the diagnosis</h3>
          </div>

          <ul className={styles.symptomsList}>
            {diagnosisData.symptoms.map((symptom, index) => (
              <li key={index} className={styles.symptomItem}>{symptom}</li>
            ))}
          </ul>

          <p className={styles.descriptionText}>{diagnosisData.description}</p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionNumber}>2</div>
            <h3 className={styles.sectionTitle}>Recommendations</h3>
          </div>

          <p className={styles.recommendationText}>{diagnosisData.recommendations}</p>
        </div>
      </div>

      <div className={styles.bottomNav}>
        <div className={styles.navButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <div className={styles.navButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div className={styles.navButton}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <rect width="18" height="18" x="3" y="3" rx="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResults;