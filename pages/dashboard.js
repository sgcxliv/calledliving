import Layout from '../components/Layout';
import StudentView from '../components/StudentView';
import ProfessorView from '../components/ProfessorView';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      
      if (!data || !data.user) {
        // Not logged in
        setLoading(false);
        return;
      }
      
      setUser(data.user);
      
      // Get user role from profiles table
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (error) throw error;
        setUserRole(profileData?.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
      
      setLoading(false);
    };
    
    getUser();
  }, [router]);

  if (loading) {
    return (
      <Layout title="Course Dashboard - Loading">
        <div className="tab-content active">
          <h2>Loading...</h2>
          <p>Please wait while we load your dashboard.</p>
        </div>
      </Layout>
    );
  }

  // If not logged in, show login message
  if (!user) {
    return (
      <Layout title="Course Dashboard - Access Required">
        <div className="tab-content active">
          <h2>Login Required</h2>
          <p>You need to be logged in to access the audio messaging dashboard.</p>
          <p>
            <Link href="/login" legacyBehavior>
              <a className="login-btn" style={{ display: 'inline-block', maxWidth: '200px', textAlign: 'center', marginTop: '20px' }}>
                Go to Login
              </a>
            </Link>
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Course Dashboard - ${userRole === 'professor' ? 'Professor' : 'Student'} Dashboard`}>
      <div className="tab-content active">
        <h2>{userRole === 'professor' ? 'Professor' : 'Student'} Dashboard</h2>
        
        {userRole === 'professor' ? (
          <ProfessorView user={user} />
        ) : (
          <StudentView user={user} />
        )}
      </div>
    </Layout>
  );
}
