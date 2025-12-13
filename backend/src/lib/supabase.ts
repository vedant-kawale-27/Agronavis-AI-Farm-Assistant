import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://klqvywmnzmrzvaobqded.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseServiceKey) {
  throw new Error('Supabase service key is required')
}

// Create Supabase client with service role for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface Farmer {
  id: string;
  full_name: string;
  phone_number: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  education_level?: string;
  years_of_experience?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Farm {
  id?: string;
  farmer_id: string;
  name: string;
  total_area: number;
  address?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    state?: string;
    district?: string;
    village?: string;
  };
  soil_type?: 'sandy' | 'clay' | 'loamy' | 'silt' | 'peaty' | 'chalky';
  irrigation_type?: 'drip' | 'sprinkler' | 'flood' | 'rainfed' | 'manual';
  ownership_type?: 'owned' | 'leased' | 'shared';
  created_at?: string;
}

export interface Crop {
  id?: string;
  farm_id: string;
  crop_type: string;
  variety?: string;
  sowing_date?: string;
  expected_harvest_date?: string;
  area_allocated: number;
  season?: 'kharif' | 'rabi' | 'zaid' | 'perennial';
  current_growth_stage?: 'sowing' | 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
  yield_expectation?: number;
  created_at?: string;
}

export interface FarmResource {
  id?: string;
  farm_id: string;
  resource_type: 'tractor' | 'harvester' | 'plough' | 'irrigation_pump' | 'sprayer' | 'storage';
  quantity?: number;
  condition?: 'excellent' | 'good' | 'average' | 'poor';
  created_at?: string;
}

export interface SoilHealth {
  id?: string;
  farm_id: string;
  ph_level?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  organic_carbon?: number;
  moisture_level?: number;
  tested_date?: string;
  created_at?: string;
}

export interface YieldHistory {
  id?: string;
  farm_id: string;
  crop_type: string;
  variety?: string;
  season?: string;
  year: number;
  quantity: number;
  unit?: string;
  quality_notes?: string;
  created_at?: string;
}

export interface CropVariety {
  id?: string;
  crop_type: string;
  variety: string;
  season: string[];
  avg_yield_per_acre?: number;
  growth_duration_days?: number;
  created_at?: string;
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Admin functions for backend operations
export const createUserProfile = async (userId: string, userData: any) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  return { data, error }
}

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  return { data, error }
}