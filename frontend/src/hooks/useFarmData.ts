import { useEffect, useState } from 'react';
import { fetchFarmData } from '../utils/api';
import { FarmData } from '../types';

const useFarmData = () => {
    const [farmData, setFarmData] = useState<FarmData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getFarmData = async () => {
            try {
                const data = await fetchFarmData();
                setFarmData(data);
            } catch (err) {
                setError('Failed to fetch farm data');
            } finally {
                setLoading(false);
            }
        };

        getFarmData();
    }, []);

    return { farmData, loading, error };
};

export default useFarmData;