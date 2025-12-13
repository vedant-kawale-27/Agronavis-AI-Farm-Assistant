import React from 'react';
import styles from '../styles/WeatherWidget.module.css';

interface CropData {
    name: string;
    emoji: string;
    status: 'good' | 'warning' | 'danger';
    daysOld: number;
    growthStage: string;
    progressPercent: number;
    nextStage: string;
    daysToNextStage: number;
}

interface CropSelectorProps {
    crops: CropData[];
    selectedCrop: string;
    onSelectCrop: (cropName: string) => void;
}

const CropSelector: React.FC<CropSelectorProps> = ({ crops, selectedCrop, onSelectCrop }) => {
    return (
        <>
            <div className={styles.topContainer}>
                <h2 className="text-xl font-bold text-green-500">My Crops</h2>
            </div>

            <div className={styles.cropIconsContainer}>
                {crops.map((crop) => (
                    <div key={crop.name} className={styles.cropIcon} onClick={() => onSelectCrop(crop.name)}>
                        <div className={`${styles.cropIconCircle} ${selectedCrop === crop.name ? styles.active : ''}`}>
                            <div className={styles.cropIconImage}>{crop.emoji}</div>
                            <div className={`${styles.statusIndicator} ${
                                crop.status === 'good' ? styles.statusGood : 
                                crop.status === 'warning' ? styles.statusWarning : 
                                styles.statusDanger
                            }`} />
                        </div>
                        <div className={styles.cropName}>{crop.name}</div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default CropSelector;