import Layout from '../components/Layout';
import SignupForm from '../components/SignupForm';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data && data.user) {
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
    <Layout title="Course Dashboard - Signup">
      <div className="tab-content active">
        {checkingAuth ? (
          <p>Checking authentication status...</p>
        ) : (
          <>
            <h2>Student Registration</h2>
            <p>Create an account to access the audio messaging portal.</p>
            
            <SignupForm onSuccessfulSignup={() => router.push('/dashboard')} />
            
            <div className="auth-toggle">
              <p>Already have an account? <Link href="/login">Log in here</Link></p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
