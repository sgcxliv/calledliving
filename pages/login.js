import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
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
    <Layout title="Course Dashboard - Login">
      <div className="tab-content active">
        <h2>Student Login</h2>
        <p>Please log in to access your audio messaging portal.</p>
        
        <LoginForm />
      </div>
    </Layout>
  );
}
