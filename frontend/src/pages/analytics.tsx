import React from 'react';
import { useTranslation } from 'react-i18next';
import useFarmData from '../hooks/useFarmData';

const Analytics: React.FC = () => {
    const { t } = useTranslation();
    const { farmData, loading, error } = useFarmData();

    if (loading) {
        return <div>{t('analytics.loading')}</div>;
    }

    if (error) {
        return <div>{t('analytics.error', { error })}</div>;
    }

    if (!farmData) {
        return <div>{t('analytics.noData')}</div>;
    }

    return (
        <div>
            <h1>{t('analytics.title')}</h1>
            <h2>{t('analytics.cropPerformance')}</h2>
            <ul>
                {farmData.crops && farmData.crops.map(crop => (
                    <li key={crop.id}>
                        {crop.name}: {crop.healthStatus}
                    </li>
                ))}
            </ul>
            <h2>{t('analytics.weatherInsights')}</h2>
            {farmData.weather && (
                <>
                    <p>{t('analytics.temperature')}: {farmData.weather.temperature} °C</p>
                    <p>{t('analytics.humidity')}: {farmData.weather.humidity}%</p>
                </>
            )}
        </div>
    );
};

export default Analytics;