import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

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
            <h2>Login Portal</h2>
            <p>Please log in to access your audio messaging portal. Professors must be logged in to post announcements. You will be asked to verify your email once upon creation, as long as you click verify (I know it looks wonky), it has worked. All other parts of the site are freely accessible without login.</p>
            
            <LoginForm onSuccessfulLogin={() => router.push('/dashboard')} />
            
            <div className="signup-section" style={{ marginTop: '30px', textAlign: 'center' }}>
              <p>First time here? You'll need to create an account.</p>
              <Link href="/signup" 
                    className="signup-button" 
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      backgroundColor: '#555',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      marginTop: '10px'
                    }}>
                Create an Account
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
