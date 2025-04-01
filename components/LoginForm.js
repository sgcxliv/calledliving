import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <Layout title="Course Dashboard - Login">
        <div className="tab-content active">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Course Dashboard - Login">
      <div className="tab-content active">
        <h2>Student Login</h2>
        <p>Please log in to access your audio messaging portal. All other parts of the site are freely accessible without login.</p>
        
        <LoginForm />
      </div>
    </Layout>
  );
}
