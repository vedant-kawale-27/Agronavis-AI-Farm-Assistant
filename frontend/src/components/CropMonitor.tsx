import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Image from 'next/image';

interface CropHealthData {
    id: string;
    crop_type: string;
    variety: string | null;
    current_growth_stage: string;
    health_status: string;
    water_level: number;
    nutrient_level: number;
    soil_health: number;
    last_update: string;
    area_allocated: number;
}

interface CropMonitorProps {
    farmId?: string;
    limit?: number;
}

const CropMonitor: React.FC<CropMonitorProps> = ({ farmId, limit = 3 }) => {
    const [cropsData, setCropsData] = useState<CropHealthData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCropData = async () => {
            try {
                if (!farmId) {
                    // Demo data for development
                    setTimeout(() => {
                        setCropsData([
                            {
                                id: '1',
                                crop_type: 'Maize',
                                variety: 'H614',
                                current_growth_stage: 'Flowering',
                                health_status: 'Good',
                                water_level: 70,
                                nutrient_level: 85,
                                soil_health: 75,
                                last_update: '2023-06-15',
                                area_allocated: 2.5
                            },
                            {
                                id: '2',
                                crop_type: 'Tomatoes',
                                variety: 'Roma',
                                current_growth_stage: 'Fruiting',
                                health_status: 'Warning',
                                water_level: 45,
                                nutrient_level: 60,
                                soil_health: 70,
                                last_update: '2023-06-14',
                                area_allocated: 0.8
                            },
                            {
                                id: '3',
                                crop_type: 'Beans',
                                variety: 'KK8',
                                current_growth_stage: 'Seedling',
                                health_status: 'Excellent',
                                water_level: 85,
                                nutrient_level: 90,
                                soil_health: 95,
                                last_update: '2023-06-15',
                                area_allocated: 1.2
                            }
                        ]);
                        setLoading(false);
                    }, 800);
                    return;
                }
                
                // Real data fetch if farmId exists
                const { data, error: fetchError } = await supabase
                    .from('crops')
                    .select('*')
                    .eq('farm_id', farmId)
                    .order('created_at', { ascending: false })
                    .limit(limit);
                    
                if (fetchError) throw fetchError;
                
                setCropsData(data || []);
            } catch (err) {
                console.error('Error fetching crop data:', err);
                setError('Failed to fetch crop health data');
            } finally {
                setLoading(false);
            }
        };

        fetchCropData();
    }, [farmId, limit]);

    const getHealthStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'excellent':
                return 'bg-green-500';
            case 'good':
                return 'bg-green-400';
            case 'warning':
                return 'bg-yellow-400';
            case 'poor':
                return 'bg-red-400';
            case 'critical':
                return 'bg-red-600';
            default:
                return 'bg-gray-400';
        }
    };

    const getProgressBarColor = (level: number) => {
        if (level >= 75) return 'bg-green-500';
        if (level >= 50) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden h-full">
            <div className="p-5 bg-green-50 border-b border-green-100">
                <h2 className="text-xl font-bold text-gray-800">Crop Health Monitor</h2>
            </div>
            {loading ? (
                <div className="p-5 flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : error ? (
                <div className="p-5 text-red-500">{error}</div>
            ) : cropsData.length > 0 ? (
                <div className="p-5">
                    <div className="space-y-4">
                        {cropsData.map(crop => (
                            <div key={crop.id} className="border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h3 className="font-medium">{crop.crop_type}</h3>
                                        <p className="text-sm text-gray-500">
                                            {crop.variety || 'No variety'} • {crop.area_allocated} acres
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs text-white ${getHealthStatusColor(crop.health_status || 'good')}`}>
                                        {crop.health_status || 'Good'}
                                    </div>
                                </div>
                                <div className="mt-2 space-y-2">
                                    <div>
                                        <div className="flex justify-between mb-1 text-xs">
                                            <span>Water Level</span>
                                            <span>{crop.water_level || 70}%</span>
                                        </div>
                                        
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-xs">
                                            <span>Nutrient Level</span>
                                            <span>{crop.nutrient_level || 85}%</span>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-5 text-center text-gray-500">
                    <p>No crop data available.</p>
                </div>
            )}
        </div>
    );
};

export default CropMonitor;