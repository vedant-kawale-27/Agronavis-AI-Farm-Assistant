import React, { useState } from 'react';
import styles from '../styles/WeatherWidget.module.css';
import WeatherBlock from './WeatherBlock';
import TasksAlerts from './TasksAlerts';
import CropSelector from './CropSelector';

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
interface WeatherWidgetProps {
    farmLocation?: { 
        latitude: number; 
        longitude: number 
    };
    compact?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
    farmLocation,
    compact = false
}) => {
    const [selectedCrop, setSelectedCrop] = useState<string>('Rice');

    // Sample crop data
    const crops: CropData[] = [
        { name: 'Rice', emoji: '🌾', status: 'good', daysOld: 15, growthStage: 'Vegetative', progressPercent: 62, nextStage: 'Tillering', daysToNextStage: 5 },
        { name: 'Wheat', emoji: '🌾', status: 'warning', daysOld: 45, growthStage: 'Flowering', progressPercent: 85, nextStage: 'Grain filling', daysToNextStage: 7 },
        { name: 'Corn', emoji: '🌽', status: 'good', daysOld: 30, growthStage: 'Vegetative', progressPercent: 55, nextStage: 'Tasseling', daysToNextStage: 10 },
        { name: 'Tomato', emoji: '🍅', status: 'danger', daysOld: 60, growthStage: 'Fruiting', progressPercent: 75, nextStage: 'Ripening', daysToNextStage: 8 },
        { name: 'Potato', emoji: '🥔', status: 'good', daysOld: 40, growthStage: 'Tuber formation', progressPercent: 70, nextStage: 'Maturation', daysToNextStage: 14 },
    ];

    return (
        <div className={styles.weatherContainer}>
            <CropSelector 
                crops={crops} 
                selectedCrop={selectedCrop} 
                onSelectCrop={setSelectedCrop} 
            />

            {/* Weather Block Component */}
            <WeatherBlock farmLocation={farmLocation} />
            
            {/* Tasks and Alerts Component */}
            <TasksAlerts />
        </div>
    );
};

export default WeatherWidget;