import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Layout({ children, user }) {
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchProfilePicture();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const fetchProfilePicture = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_picture_url')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (!error && data) {
        setProfilePicture(data.profile_picture_url);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <div>
      <header>
        <div className="header-container">
          <div className="logo-section">
            <h1>Course Dashboard</h1>
          </div>
          
          {user && (
            <div className="user-section">
              <div className="user-info">
                <span className="user-email">{user.email}</span>
              </div>
              
              <div className="profile-section">
                <div className="header-profile-picture">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile"
                      onError={(e) => {e.target.src = '/images/default-avatar.png'}}
                    />
                  ) : (
                    <div className="profile-initial">
                      {user.email ? user.email.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                
                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main id="main-content">
        {children}
      </main>
      
      <footer className="footer">
        &copy; {new Date().getFullYear()} Course Dashboard - All rights reserved
      </footer>
    </div>
  );
}
