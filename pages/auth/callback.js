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

    // For email verification links, we'll simply redirect to dashboard
    // This avoids any token processing that might invalidate the current session
    const handleAuthRedirect = async () => {
      try {
        const hash = window.location.hash;
        
        // Check if this appears to be a verification link (contains token in hash)
        if (hash && hash.includes('access_token')) {
          // Just check if we're already logged in
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Already logged in, just redirect to dashboard
            // Don't process the token in the URL at all
            setMessage('Redirecting you to the dashboard...');
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
            return;
          }
        }
        
        // For all other cases or if not logged in
        // Check current session without trying to process URL tokens
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is authenticated - redirect to dashboard
          setMessage('You are logged in. Redirecting...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          // No active session - redirect to login
          setMessage('Please log in to continue...');
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage('Authentication error. Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    };

    handleAuthRedirect();
  }, [router.isReady]);

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
