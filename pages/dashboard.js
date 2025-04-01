import Layout from '../components/Layout';
import StudentView from '../components/StudentView';
import ProfessorView from '../components/ProfessorView';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Get user role from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
      } else {
        setUserRole(data?.role);
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
