import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../../auth/context/AuthContext';
import { farmApi } from '../../utils/farmApi';
import { useFormState } from '../../hooks/useFormState';
import { useLocation } from '../../hooks/useLocation';

export default function FarmSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const { loading, error, success, setLoading, setError, setSuccess } = useFormState();
  const { locationStatus, getCurrentLocation } = useLocation();
  
  const [formData, setFormData] = useState({
    farmName: '',
    totalArea: '',
    address: '',
    soilType: '',
    irrigationType: '',
    ownershipType: '',
    state: '',
    district: '',
    village: '',
    latitude: '',
    longitude: '',
    useCurrentLocation: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: val
    }));
    
    // If "use current location" is checked, get the user's location
    if (name === 'useCurrentLocation' && val === true) {
      getCurrentLocation(handleLocationSuccess);
    }
  };
  
  // Handle location success callback
  const handleLocationSuccess = (location: { latitude: string; longitude: string }) => {
    setFormData(prevData => ({
      ...prevData,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    

    
    if (!formData.farmName || !formData.totalArea) {
      setError('Farm name and total area are required');
      setLoading(false);
      return;
    }
    
    try {
      if (!user) {
        throw new Error('You must be logged in to create a farm');
      }

      // Format farm data for API
      const farmPayload = {
        // farmer_id is automatically added by the backend from the auth token
        name: formData.farmName,
        total_area: parseFloat(formData.totalArea),
        address: formData.address || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        location: {
          state: formData.state || null,
          district: formData.district || null,
          village: formData.village || null,
          coordinates_source: formData.useCurrentLocation ? 'gps' : 'manual'
        },
        soil_type: formData.soilType || null,
        irrigation_type: formData.irrigationType || null,
        ownership_type: formData.ownershipType || null
      };



      // Save farm to database using our API
      try {
        const newFarm = await farmApi.createFarm(farmPayload);

        
        setSuccess('Farm created successfully!');
        
        // Redirect to the crops setup page after a short delay
        setTimeout(() => {
          router.push(`/onboarding/crops?farmId=${newFarm.id}`);
        }, 1000);
      } catch (apiError: any) {
        console.error('API error details:', apiError.response?.data || apiError);
        throw apiError;
      }
      
    } catch (err: any) {
      console.error('Error saving farm:', err);
      setError(err.message || 'Failed to save farm information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-green-600 text-white flex items-center justify-between">
          <h1 className="text-xl font-bold">Farm Setup</h1>
          <div className="w-10 h-10 relative">
            <Image
              src="/images/farm.png"
              alt="Farm"
              fill
              sizes="40px"
              style={{ objectFit: 'cover' }}
              className="rounded-full"
            />
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Great! Now let's set up your primary farm.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-500 p-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-1">
                Farm Name *
              </label>
              <input
                type="text"
                id="farmName"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 mb-1">
                Total Area (in acres) *
              </label>
              <input
                type="number"
                id="totalArea"
                name="totalArea"
                value={formData.totalArea}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-1">
                  Village
                </label>
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-blue-700">Farm Location (for Satellite Mapping)</span>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center mb-3">
                  <input
                    id="useCurrentLocation"
                    name="useCurrentLocation"
                    type="checkbox"
                    checked={formData.useCurrentLocation}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useCurrentLocation" className="ml-2 block text-sm text-gray-700">
                    Use my current location
                  </label>
                </div>
                
                {locationStatus.fetching && (
                  <div className="text-sm text-blue-600 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting your location...
                  </div>
                )}
                
                {locationStatus.error && (
                  <div className="text-sm text-red-500 mt-1">{locationStatus.error}</div>
                )}
                
                {locationStatus.success && (
                  <div className="text-sm text-green-500 mt-1">Location successfully retrieved!</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 0.123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 0.123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These coordinates will be used for satellite mapping and precise farm monitoring.
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                id="soilType"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select soil type</option>
                <option value="sandy">Sandy</option>
                <option value="clay">Clay</option>
                <option value="loamy">Loamy</option>
                <option value="silt">Silt</option>
                <option value="peaty">Peaty</option>
                <option value="chalky">Chalky</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="irrigationType" className="block text-sm font-medium text-gray-700 mb-1">
                Irrigation Type
              </label>
              <select
                id="irrigationType"
                name="irrigationType"
                value={formData.irrigationType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select irrigation type</option>
                <option value="drip">Drip</option>
                <option value="sprinkler">Sprinkler</option>
                <option value="flood">Flood</option>
                <option value="rainfed">Rainfed</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="ownershipType" className="block text-sm font-medium text-gray-700 mb-1">
                Ownership Type
              </label>
              <select
                id="ownershipType"
                name="ownershipType"
                value={formData.ownershipType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select ownership type</option>
                <option value="owned">Owned</option>
                <option value="leased">Leased</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/onboarding/profile')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                ← Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Next: Crop Setup →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}