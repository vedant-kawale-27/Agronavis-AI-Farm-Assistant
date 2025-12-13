import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/context/AuthContext';

interface CropVariety {
  id: string;
  crop_type: string;
  variety: string;
  season: string[];
  avg_yield_per_acre: number;
  growth_duration_days: number;
}

export default function CropSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const { farmId } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cropVarieties, setCropVarieties] = useState<CropVariety[]>([]);
  const [varietiesByType, setVarietiesByType] = useState<{[key: string]: string[]}>({});
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    cropType: '',
    variety: '',
    sowingDate: '',
    expectedHarvestDate: '',
    areaAllocated: '',
    season: ''
  });

  // Default crop data in case the DB fetch fails
  const defaultCropTypes = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Tomato', 'Potato'];
  const defaultVarieties: {[key: string]: string[]} = {
    'Rice': ['Basmati', 'IR64', 'Jasmine'],
    'Wheat': ['HD2967', 'PBW343', 'Lok1'],
    'Cotton': ['Bt Cotton', 'DCH-32', 'American Cotton'],
    'Sugarcane': ['Co238', 'CoC671', 'Co86032'],
    'Maize': ['Pioneer', 'Hybrid', 'Sweet Corn'],
    'Soybean': ['JS335', 'PS1042', 'Bragg'],
    'Tomato': ['Roma', 'Cherry', 'Beefsteak'],
    'Potato': ['Kufri Jyoti', 'Kufri Chandramukhi', 'Kufri Badshah']
  };
  
  // Fetch crop varieties when component mounts
  useEffect(() => {
    async function fetchCropVarieties() {
      try {

        const { data, error } = await supabase
          .from('crop_varieties')
          .select('*');
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        if (data && data.length > 0) {

          setCropVarieties(data);
          
          // Extract unique crop types
          const types = Array.from(new Set(data.map(crop => crop.crop_type)));
          setCropTypes(types);
          
          // Group varieties by crop type
          const varietiesByType: {[key: string]: string[]} = {};
          data.forEach(crop => {
            if (!varietiesByType[crop.crop_type]) {
              varietiesByType[crop.crop_type] = [];
            }
            varietiesByType[crop.crop_type].push(crop.variety);
          });
          setVarietiesByType(varietiesByType);
        } else {

          // Use default values if no data is returned
          setCropTypes(defaultCropTypes);
          setVarietiesByType(defaultVarieties);
        }
      } catch (err) {
        console.error('Error fetching crop varieties:', err);
        // Use default values if there's an error

        setCropTypes(defaultCropTypes);
        setVarietiesByType(defaultVarieties);
      }
    }
    
    fetchCropVarieties();
  }, []);
  
  // Update expected harvest date based on crop selection and sowing date
  useEffect(() => {
    if (formData.cropType && formData.variety && formData.sowingDate) {
      const selectedCrop = cropVarieties.find(
        crop => crop.crop_type === formData.cropType && crop.variety === formData.variety
      );
      
      if (selectedCrop) {
        const sowingDate = new Date(formData.sowingDate);
        const harvestDate = new Date(sowingDate);
        harvestDate.setDate(harvestDate.getDate() + selectedCrop.growth_duration_days);
        
        setFormData(prev => ({
          ...prev,
          expectedHarvestDate: harvestDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [formData.cropType, formData.variety, formData.sowingDate, cropVarieties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset variety when crop type changes
    if (name === 'cropType') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        variety: ''
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.cropType || !formData.areaAllocated || !farmId) {
      setError('Crop type, area allocated, and farm ID are required');
      setLoading(false);
      return;
    }
    
    try {
      if (!user) {
        throw new Error('You must be logged in to add crops');
      }



      // Save crop to database
      const { data, error: dbError } = await supabase
        .from('crops')
        .insert({
          farm_id: farmId as string,
          crop_type: formData.cropType,
          variety: formData.variety || null,
          sowing_date: formData.sowingDate || null,
          expected_harvest_date: formData.expectedHarvestDate || null,
          area_allocated: parseFloat(formData.areaAllocated),
          season: formData.season || null,
          current_growth_stage: 'sowing'  // Default for new crops
        })
        .select();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
      


      setSuccess('Crop added successfully!');
      
      // Reset form for adding another crop or redirect
      setFormData({
        cropType: '',
        variety: '',
        sowingDate: '',
        expectedHarvestDate: '',
        areaAllocated: '',
        season: ''
      });
      
      // Ask if user wants to add another crop or go to dashboard
      // For now, we'll show the success message with a button to go to dashboard
      
    } catch (err: any) {
      console.error('Error saving crop:', err);
      setError(err.message || 'Failed to save crop information');
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-green-600 text-white flex items-center justify-between">
          <h1 className="text-xl font-bold">Current Crops</h1>
          <div className="w-10 h-10 relative">
            <Image
              src="/images/FemaleFarmer.png"
              alt="Crops"
              fill
              sizes="40px"
              style={{ objectFit: 'cover' }}
              className="rounded-full"
            />
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Almost done! Let's add crops currently growing on your farm.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-500 p-3 rounded mb-4">
              <p>{success}</p>
              <div className="mt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setSuccess('')}
                  className="text-sm underline"
                >
                  Add another crop
                </button>
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="px-4 py-1 bg-green-600 text-white text-sm rounded"
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Type *
                </label>
                <select
                  id="cropType"
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select crop type</option>
                  {cropTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
                  Variety
                </label>
                <select
                  id="variety"
                  name="variety"
                  value={formData.variety}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!formData.cropType}
                >
                  <option value="">Select variety</option>
                  {formData.cropType && varietiesByType[formData.cropType]?.map((variety) => (
                    <option key={variety} value={variety}>
                      {variety}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="areaAllocated" className="block text-sm font-medium text-gray-700 mb-1">
                  Area Allocated (acres) *
                </label>
                <input
                  type="number"
                  id="areaAllocated"
                  name="areaAllocated"
                  value={formData.areaAllocated}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
                  Season
                </label>
                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select season</option>
                  <option value="kharif">Kharif (Monsoon)</option>
                  <option value="rabi">Rabi (Winter)</option>
                  <option value="zaid">Zaid (Summer)</option>
                  <option value="perennial">Perennial</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="sowingDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Sowing Date
                </label>
                <input
                  type="date"
                  id="sowingDate"
                  name="sowingDate"
                  value={formData.sowingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="expectedHarvestDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  id="expectedHarvestDate"
                  name="expectedHarvestDate"
                  value={formData.expectedHarvestDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  readOnly={formData.cropType && formData.variety && formData.sowingDate ? true : false}
                />
                {formData.cropType && formData.variety && formData.sowingDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated based on crop variety and sowing date
                  </p>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => router.push('/onboarding/farm')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  ← Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Add Crop'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}