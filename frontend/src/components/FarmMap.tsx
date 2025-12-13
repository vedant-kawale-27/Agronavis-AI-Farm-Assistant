import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { farmApi } from '../utils/farmApi';
import styles from '../styles/Map.module.css';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Farm {
  id: string;
  name: string;
  location: {
    latitude?: number;
    longitude?: number;
    state?: string;
    district?: string;
    village?: string;
  };
  total_area: number;
  soil_type?: string;
  irrigation_type?: string;
}

interface FarmMapProps {
  farmId?: string;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  showAllFarms?: boolean;
  height?: string;
}

const FarmMap: React.FC<FarmMapProps> = ({ 
  farmId, 
  centerLat = 20.5937, 
  centerLng = 78.9629, // Default to center of India
  zoom = 5,
  showAllFarms = false,
  height = '400px'
}) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([centerLat, centerLng]);
  const [mapZoom, setMapZoom] = useState(zoom);

  useEffect(() => {
    const loadFarmData = async () => {
      try {
        setLoading(true);
        
        if (farmId) {
          // Load single farm
          const farm = await farmApi.getFarm(farmId);
          if (farm && farm.location?.latitude && farm.location?.longitude) {
            setFarms([farm]);
            setMapCenter([farm.location.latitude, farm.location.longitude]);
            setMapZoom(15); // Zoom in for single farm view
          } else {
            setFarms([]);
            setError('Farm location coordinates not available');
          }
        } else if (showAllFarms) {
          // Load all farms
          const allFarms = await farmApi.getFarms();
          const farmsWithCoordinates = allFarms.filter(
            (farm: Farm) => farm.location?.latitude && farm.location?.longitude
          );
          
          setFarms(farmsWithCoordinates);
          
          // Set map center to first farm with coordinates if available
          if (farmsWithCoordinates.length > 0) {
            const firstFarm = farmsWithCoordinates[0];
            setMapCenter([
              firstFarm.location.latitude as number,
              firstFarm.location.longitude as number
            ]);
          }
        }
      } catch (err: any) {
        console.error('Error loading farm data:', err);
        setError(err.message || 'Failed to load farm data');
      } finally {
        setLoading(false);
      }
    };

    loadFarmData();
  }, [farmId, showAllFarms]);

  if (loading) {
    return <div className={`${styles.loadingContainer} ${styles.mapHeight}`}>Loading map...</div>;
  }

  if (error) {
    return <div className={`${styles.errorContainer} ${styles.mapHeight}`}>Error: {error}</div>;
  }

  if (farms.length === 0) {
    return (
      <div className={`${styles.noDataContainer} ${styles.mapHeight}`}>
        <p className="text-gray-500">No farms with location data available</p>
      </div>
    );
  }

  const heightClass = 
    height === '100%' ? styles.mapHeightFull : 
    height === '250px' ? styles.mapHeightSmall : 
    styles.mapHeight;

  return (
    <div className={`${styles.mapContainer} ${heightClass}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className={`${styles.mapContainer} ${styles.mapHeightFull}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farms.map(farm => (
          farm.location?.latitude && farm.location?.longitude ? (
            <Marker
              key={farm.id}
              position={[farm.location.latitude, farm.location.longitude]}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{farm.name}</h3>
                  <p>Area: {farm.total_area} acres</p>
                  {farm.soil_type && <p>Soil: {farm.soil_type}</p>}
                  {farm.irrigation_type && <p>Irrigation: {farm.irrigation_type}</p>}
                  <p>
                    Location: {[
                      farm.location.village, 
                      farm.location.district, 
                      farm.location.state
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default FarmMap;