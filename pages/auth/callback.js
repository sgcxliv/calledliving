// pages/auth/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    // Only run this effect once the router is ready
    if (!router.isReady) return;

    const handleAuthRedirect = async () => {
      try {
        // Check if there's an error in the URL parameters
        const { error: errorParam } = router.query;
        
        // Even if there's an error parameter, the user might still be authenticated
        // Get the current session directly from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          // User is authenticated - redirect to dashboard or home page
          setMessage('Authentication successful! Redirecting...');
          
          // Short delay to give user feedback
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          // No active session - redirect to login with error message
          setMessage('Verification failed or session expired. Redirecting to login...');
          
          setTimeout(() => {
            router.push('/login?error=verification_failed');
          }, 1500);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage('Authentication error. Redirecting to login...');
        
        setTimeout(() => {
          router.push('/login?error=auth_error');
        }, 1500);
      }
    };

    handleAuthRedirect();
  }, [router.isReady, router.query]);

  return (
    <Layout title="Account Verification">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ marginBottom: '16px' }}>Account Verification</h2>
        <p>{message}</p>
      </div>
    </Layout>
  );
}