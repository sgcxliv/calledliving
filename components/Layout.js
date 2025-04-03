import Head from 'next/head';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Layout({ children, title = 'REGLIST18N: What is Called Living?' }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get current user in a safe way
    const getUser = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div id="main-content">
        <header>
          <div className="header-container">
            <h1>Course Dashboard</h1>
            {user && (
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            )}
          </div>
        </header>
        
        <Navbar user={user} />
        
        <main style={{ marginBottom: '10px' }}>
          {children}
        </main>
        
        <div className="footer" style={{ 
          marginTop: '5px',
          paddingTop: '5px',
          borderTop: '1px solid #eaeaea'
        }}>
          This site is managed by Stephanie Cho. Please email <a href="mailto:sgcxliv@stanford.edu">sgcxliv@stanford.edu</a> for any issues.
        </div>
      </div>
    </>
  );
}
