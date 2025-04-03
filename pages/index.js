import Layout from '../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AnnouncementsComponent from '../components/AnnouncementsComponent';

export default function Home() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Safely get current user
    const getUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        setUser(userData.user);
        
        // Get user role from profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();
          
        if (!error && profileData) {
          setUserRole(profileData.role);
        }
      }
    };
    
    getUser();
  }, []);

  return (
    <Layout title="RELIGST18N: What is Called Living? Course Dashboard - Home">
      <div className="tab-content active">
        <h2>Welcome to "What is Called Living?"</h2>
        <p>Here you will find everything you need for the class. 
    The site will continue to update as we progress, so please keep an eye out for changes. 
    The nature of this class is spontaneous, so we count on you to stay informed. Weekly pages with required readings, reflection prompts, and instructions for assignments will be published one week in advance under the "Life Cycle" Tab. </p>
        
        <div style={{ marginTop: '30px' }}>
          <h3>This Week: The Life of Students. </h3>
          <ul>
            <li>On Tuesday April 1st, We are meeting at: 1:30 - 2:50PM, ENCINA CENTER 464 (Homeroom) </li>
            <li>On Thursday April 3rd, We are meeting at: 1:30 - 2:50PM, ENCINA CENTER 464 (Homeroom) </li>
            <li>TO-DO for Next Week: Bing Nursery Signups, Family Photo Upload for Week 2</li>
          </ul>
        </div>
        
        {/* Replace the static announcements with the dynamic component */}
        {user && (
          <AnnouncementsComponent 
            user={user} 
            isProfessor={userRole === 'professor'} 
          />
        )}
      </div>
    </Layout>
  );
}
