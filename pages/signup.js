import Layout from '../components/Layout';
import SignupForm from '../components/SignupForm';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };

    checkUser();
  }, [router]);

  return (
    <Layout title="Course Dashboard - Signup">
      <div className="tab-content active">
        <h2>Student Registration</h2>
        <p>Create an account to access the audio messaging portal.</p>
        
        <SignupForm />
      </div>
    </Layout>
  );
}
