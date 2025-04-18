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

  // Determine if user can manage announcements (professors and CDAs)
  const canManageAnnouncements = userRole === 'professor' || userRole === 'CDA';

  return (
    <Layout title="RELIGST18N: What is Called Living? Course Dashboard - Home">
      <div className="tab-content active">
        <h2>Welcome to "What is Called Living?"</h2>
        <p>Here you will find everything you need for the class. 
    The site will continue to update as we progress, so please keep an eye out for changes. 
    The nature of this class is spontaneous, so we count on you to stay informed. Weekly pages with required readings, reflection prompts, and instructions for assignments will be published one week in advance under the "Life Cycle" Tab. </p>
        
        <div style={{ marginTop: '30px' }}>
          <h3>This Week: Childhood, or The No-Place. </h3>
          <ul>
            <li>On Tuesday April 22nd, We are meeting at: 9:30 - 10:50PM, Lake Lagunita Firepit</li>
            <li>On Thursday April 24th, We are meeting at: 1:30 - 2:50PM, Encina Center 464 </li>
            <li>TO-DO: Week 4 Assigned Reading</li>
          </ul>
        </div>
        
        {/* Show announcements to everyone, logged in or not */}
        <AnnouncementsComponent 
          user={user} 
          canManageAnnouncements={canManageAnnouncements} 
        />
      </div>
    </Layout>
  );
}
