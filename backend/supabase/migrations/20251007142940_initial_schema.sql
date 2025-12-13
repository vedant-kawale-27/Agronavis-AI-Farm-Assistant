-- AgroNavis Database Schema
-- Run this in Supabase SQL Editor

-- Enhanced Farmers table
CREATE TABLE farmers (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  education_level TEXT,
  years_of_experience INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Farms table
CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_area DECIMAL NOT NULL,
  address TEXT,
  location JSONB, -- {latitude, longitude, state, district, village}
  soil_type TEXT CHECK (soil_type IN ('sandy', 'clay', 'loamy', 'silt', 'peaty', 'chalky')),
  irrigation_type TEXT CHECK (irrigation_type IN ('drip', 'sprinkler', 'flood', 'rainfed', 'manual')),
  ownership_type TEXT CHECK (ownership_type IN ('owned', 'leased', 'shared')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Crops table
CREATE TABLE crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  variety TEXT,
  sowing_date DATE,
  expected_harvest_date DATE,
  area_allocated DECIMAL NOT NULL,
  season TEXT CHECK (season IN ('kharif', 'rabi', 'zaid', 'perennial')),
  current_growth_stage TEXT CHECK (current_growth_stage IN ('sowing', 'germination', 'vegetative', 'flowering', 'fruiting', 'harvesting')),
  yield_expectation DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Farm resources table
CREATE TABLE farm_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  resource_type TEXT CHECK (resource_type IN ('tractor', 'harvester', 'plough', 'irrigation_pump', 'sprayer', 'storage')),
  quantity INTEGER DEFAULT 1,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'average', 'poor')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Soil health history table
CREATE TABLE soil_health_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  ph_level DECIMAL,
  nitrogen DECIMAL,
  phosphorus DECIMAL,
  potassium DECIMAL,
  organic_carbon DECIMAL,
  moisture_level DECIMAL,
  tested_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Previous yield records
CREATE TABLE yield_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  variety TEXT,
  season TEXT,
  year INTEGER NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT DEFAULT 'kg',
  quality_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to farmers table
CREATE TRIGGER update_farmers_updated_at 
BEFORE UPDATE ON farmers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_health_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE yield_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers table
CREATE POLICY "Users can view own farmer profile" ON farmers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own farmer profile" ON farmers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own farmer profile" ON farmers
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for farms table
CREATE POLICY "Farmers can view own farms" ON farms
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own farms" ON farms
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own farms" ON farms
  FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own farms" ON farms
  FOR DELETE USING (auth.uid() = farmer_id);

-- RLS Policies for crops table  
CREATE POLICY "Farmers can view crops on own farms" ON crops
  FOR SELECT USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can insert crops on own farms" ON crops
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can update crops on own farms" ON crops
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can delete crops on own farms" ON crops
  FOR DELETE USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

-- RLS Policies for farm_resources table
CREATE POLICY "Farmers can view resources on own farms" ON farm_resources
  FOR SELECT USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can insert resources on own farms" ON farm_resources
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can update resources on own farms" ON farm_resources
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can delete resources on own farms" ON farm_resources
  FOR DELETE USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

-- RLS Policies for soil_health_history table
CREATE POLICY "Farmers can view soil health on own farms" ON soil_health_history
  FOR SELECT USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can insert soil health on own farms" ON soil_health_history
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

-- RLS Policies for yield_history table
CREATE POLICY "Farmers can view yield history on own farms" ON yield_history
  FOR SELECT USING (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

CREATE POLICY "Farmers can insert yield history on own farms" ON yield_history
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT farmer_id FROM farms WHERE id = farm_id
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_farmers_id ON farmers(id);
CREATE INDEX idx_farms_farmer_id ON farms(farmer_id);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_farm_resources_farm_id ON farm_resources(farm_id);
CREATE INDEX idx_soil_health_farm_id ON soil_health_history(farm_id);
CREATE INDEX idx_yield_history_farm_id ON yield_history(farm_id);
CREATE INDEX idx_crops_type_season ON crops(crop_type, season);
CREATE INDEX idx_yield_history_year ON yield_history(year);

-- Insert some sample data for testing (optional)
-- Note: This will only work after a user signs up through Google OAuth

-- Sample crop types and varieties (reference data)
CREATE TABLE crop_varieties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type TEXT NOT NULL,
  variety TEXT NOT NULL,
  season TEXT[] NOT NULL, -- Array of applicable seasons
  avg_yield_per_acre DECIMAL,
  growth_duration_days INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert common crop varieties
INSERT INTO crop_varieties (crop_type, variety, season, avg_yield_per_acre, growth_duration_days) VALUES
('Rice', 'Basmati', ARRAY['kharif'], 25.0, 120),
('Rice', 'IR64', ARRAY['kharif'], 30.0, 110),
('Wheat', 'HD2967', ARRAY['rabi'], 35.0, 120),
('Wheat', 'PBW343', ARRAY['rabi'], 32.0, 125),
('Cotton', 'Bt Cotton', ARRAY['kharif'], 20.0, 180),
('Sugarcane', 'Co238', ARRAY['perennial'], 400.0, 365),
('Maize', 'Pioneer', ARRAY['kharif', 'rabi'], 40.0, 90),
('Soybean', 'JS335', ARRAY['kharif'], 15.0, 100);

-- Enable RLS on crop_varieties (read-only for all authenticated users)
ALTER TABLE crop_varieties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view crop varieties" ON crop_varieties
  FOR SELECT TO authenticated USING (true);