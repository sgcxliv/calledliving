import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import '../styles/messaging-styles.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle auth state changes if needed
        if (event === 'SIGNED_OUT') {
          // Redirect to home page on logout
          router.push('/');
        }
      }
    );
    
    return () => {
      // Clean up the subscription
      authListener?.subscription.unsubscribe();
    };
  }, [router]);
  
  return <Component {...pageProps} />;
}

export default MyApp;
