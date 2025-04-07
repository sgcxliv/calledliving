import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Add fallback for missing credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Auth features may not work properly.');
}

// Get the site URL dynamically based on environment
const getSiteUrl = () => {
  // For server-side rendering
  if (typeof window === 'undefined') {
    // Use environment variable or default to your production URL
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://whatiscalledliving.vercel.app/';
  }
  
  // For client-side rendering
  return window.location.origin;
};

// Create Supabase client with proper auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // This is the critical part - set the redirect URL to your callback page
    redirectTo: `${getSiteUrl()}/auth/callback`,
  },
});

// Helper function to safely get the current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
