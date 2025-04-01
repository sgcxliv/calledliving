import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Add fallback for missing credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Auth features may not work properly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
