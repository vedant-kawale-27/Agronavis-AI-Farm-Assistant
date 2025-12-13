import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/context/AuthContext'
import ProtectedRoute from '../auth/components/ProtectedRoute'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import DashboardContent from '../components/Dashboard' // Import with a different name
import LanguageSwitcher from '../components/LanguageSwitcher'
import styles from '../styles/Dashboard.module.css'

interface FarmerProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  location?: string
  created_at: string
}

interface Farm {
  id: string
  farm_name: string
  farm_size: number
  location: string
  latitude?: number
  longitude?: number
}

interface Crop {
  id: string
  crop_type: string
  variety: string
  area_allocated: number
  planting_date: string
  expected_harvest_date: string
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const { t, i18n } = useTranslation()
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [farms, setFarms] = useState<Farm[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        // Load farmer profile
        const { data: profileData, error: profileError } = await supabase
          .from('farmers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
        } else {
          setProfile(profileData);
        }

        // Load farms
        const { data: farmsData, error: farmsError } = await supabase
          .from('farms')
          .select('*')
          .eq('farmer_id', user.id);

        if (farmsError) {
          console.error('Error loading farms:', farmsError);
        } else {
          setFarms(farmsData || []);
        }

        // Load crops
        const { data: cropsData, error: cropsError } = await supabase
          .from('crops')
          .select('*')
          .eq('farmer_id', user.id);

        if (cropsError) {
          console.error('Error loading crops:', cropsError);
        } else {
          setCrops(cropsData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && !(event.target as Element).closest('.relative')) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Function to get display name based on current language
  const getDisplayName = () => {
    const currentLang = i18n.language
    
    if (currentLang === 'hi' || currentLang === 'bn') {
      return 'Suraj' // Hardcoded for Hindi and Bengali
    } else {
      // For English, use profile name from database
      return profile?.full_name || 'User'
    }
  }

  // Demo menu handlers
  const handleMenuOption = (option: string) => {
    setMenuOpen(false)
    
    switch (option) {
      case 'settings':
        alert('Settings page - Demo version')
        break
      case 'legalNotices':
        alert('Legal Notices page - Demo version')
        break
      case 'contact':
        alert('Contact page - Demo version')
        break
      case 'sales':
        alert('Sales page - Demo version')
        break
      case 'signOut':
        handleSignOut()
        break
      default:
        break
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-green-600 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center">
                <div className={styles.logoContainer}>
                  <Image
                    src="/images/AgronavisLogo.png"
                    alt="AgroNavis Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain scale-100"
                  />
                </div>
                <h1 className="text-xl font-bold text-white ml-2">{t('dashboard.title')}</h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <LanguageSwitcher />
                <span className="text-white text-xs sm:text-sm">
                  {t('dashboard.welcome')}, {getDisplayName()}!
                </span>
                
                {/* 3-dots menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1.5 text-white hover:bg-green-700 rounded-full transition-colors"
                    aria-label="Menu"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={() => handleMenuOption('settings')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ⚙️ {t('dashboard.menu.settings')}
                      </button>
                      <button
                        onClick={() => handleMenuOption('legalNotices')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        📋 {t('dashboard.menu.legalNotices')}
                      </button>
                      <button
                        onClick={() => handleMenuOption('contact')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        📞 {t('dashboard.menu.contact')}
                      </button>
                      <button
                        onClick={() => handleMenuOption('sales')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        💰 {t('dashboard.menu.sales')}
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => handleMenuOption('signOut')}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🚪 {t('dashboard.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* Import our enhanced Dashboard component */}
                <div className="mx-auto w-full max-w-4xl">
                  <div className="bg-white rounded-lg shadow">
                    {/* This imports the new enhanced Dashboard component we created */}
                    <DashboardContent />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;