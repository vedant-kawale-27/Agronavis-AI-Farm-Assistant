import React from 'react';
import useFarmData from '../hooks/useFarmData';
import { Crop } from '../types';

const Crops: React.FC = () => {
    const { farmData, loading, error } = useFarmData();
    const crops = farmData?.crops || [];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading crops: {error}</div>;

    return (
        <div>
            <h1>Crops Information</h1>
            {crops.length === 0 ? (
                <p>No crops available</p>
            ) : (
                <ul>
                    {crops.map((crop: Crop) => (
                        <li key={crop.id}>
                            <h2>{crop.name}</h2>
                            <p>Growth Stage: {crop.growthStage}</p>
                            <p>Health Status: {crop.healthStatus}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Crops;