import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data && data.user) {
          // User is logged in, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkUser();
  }, [router]);
  
  return (
    <Layout title="Course Dashboard - Login">
      <div className="tab-content active">
        {checkingAuth ? (
          <p>Checking authentication status...</p>
        ) : (
          <>
            <h2>Student Login</h2>
            <p>Please log in to access your audio messaging portal. All other parts of the site are freely accessible without login.</p>
            <LoginForm onSuccessfulLogin={() => router.push('/dashboard')} />
          </>
        )}
      </div>
    </Layout>
  );
}
