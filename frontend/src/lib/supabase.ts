import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable for OAuth redirects
    flowType: 'pkce'
  }
})

// Google OAuth sign in
export const signInWithGoogle = async () => {
  try {
    console.log('Initiating Google sign in')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    console.log('Google sign in result:', { data, error })
    
    if (error) {
      console.error('Error signing in with Google:', error)
    } else {
      console.log('Google sign in initiated successfully')
    }
    
    return { data, error }
  } catch (err) {
    console.error('Exception signing in with Google:', err)
    return { data: null, error: err }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getCurrentSession = () => {
  return supabase.auth.getSession()
}

// Auto-create or update user profile in Supabase
const createOrUpdateProfile = async (user: any, metadata?: any) => {
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError)
      return
    }

    const profileData = {
      id: user.id,
      email: user.email || '',
      first_name: metadata?.firstName || user.user_metadata?.first_name || '',
      last_name: metadata?.lastName || user.user_metadata?.last_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      updated_at: new Date().toISOString()
    }

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error updating profile:', updateError)
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Error creating profile:', insertError)
      }
    }
  } catch (error) {
    console.error('Error in createOrUpdateProfile:', error)
  }
}