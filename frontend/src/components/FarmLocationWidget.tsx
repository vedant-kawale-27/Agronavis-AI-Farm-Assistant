import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { farmApi } from '../utils/farmApi';

// Dynamically import the FarmMap component with no SSR
// This prevents hydration issues with Leaflet which requires browser APIs
const FarmMap = dynamic(() => import('./FarmMap').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading map...</div>
});

interface FarmLocation {
  id: string;
  name: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
}

const FarmLocationWidget: React.FC = () => {
  const [farms, setFarms] = useState<FarmLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoading(true);
        const farmsData = await farmApi.getFarms();
        setFarms(farmsData);
        
        // Set the first farm with location as selected
        const farmWithLocation = farmsData.find((farm: FarmLocation) => 
          farm.location?.latitude && farm.location?.longitude
        );
        
        if (farmWithLocation) {
          setSelectedFarmId(farmWithLocation.id);
        }
      } catch (err: any) {
        console.error('Error loading farms:', err);
        setError(err.message || 'Failed to load farms');
      } finally {
        setLoading(false);
      }
    };

    loadFarms();
  }, []);

  const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFarmId(e.target.value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64">
        <h2 className="text-lg font-semibold mb-4">Farm Location</h2>
        <div className="flex justify-center items-center h-48">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64">
        <h2 className="text-lg font-semibold mb-4">Farm Location</h2>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  const farmsWithLocation = farms.filter(farm => 
    farm.location?.latitude && farm.location?.longitude
  );

  if (farmsWithLocation.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64">
        <h2 className="text-lg font-semibold mb-4">Farm Location</h2>
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-gray-500 mb-2">No farms with location data available.</p>
          <p className="text-sm text-gray-400">Add location data to your farms to see them on a map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Farm Location</h2>
        
        <label className="sr-only" htmlFor="farm-select">Select Farm</label>
        <select 
          id="farm-select"
          aria-label="Select Farm"
          value={selectedFarmId || ''}
          onChange={handleFarmChange}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {farmsWithLocation.map(farm => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="h-64">
        {selectedFarmId ? (
          <FarmMap farmId={selectedFarmId} height="100%" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a farm to view
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmLocationWidget;