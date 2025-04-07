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
        // First check if there's a hash fragment in the URL
        // This could be an access_token from the email verification
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // If we have tokens in the URL, try to use them
        if (accessToken && type === 'recovery') {
          // This is a password reset flow, let Supabase handle it
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          setMessage('Password reset successful! Redirecting...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
          return;
        }
        
        // For most other cases like verification, just check if we're already logged in
        // This prevents logging out current sessions
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          // User is already authenticated - redirect to dashboard or home page
          setMessage('You are logged in. Redirecting...');
          
          // Short delay to give user feedback
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          // If we have a token in the URL but no session, try to exchange it
          if (accessToken) {
            try {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              // Check if that worked
              const { data: { session: newSession } } = await supabase.auth.getSession();
              
              if (newSession) {
                setMessage('Authentication successful! Redirecting...');
                setTimeout(() => {
                  router.push('/dashboard');
                }, 1500);
                return;
              }
            } catch (e) {
              console.error('Error setting session:', e);
            }
          }
          
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
