import Head from 'next/head';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children, title = 'Course Dashboard' }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div id="main-content">
        <header>
          <h1>Course Dashboard</h1>
        </header>
        
        <Navbar user={user} />
        
        <main style={{ marginBottom: '80px' }}>
          {children}
        </main>
        
        <div className="footer" style={{ 
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #eaeaea'
        }}>
          This site is managed by Stephanie Cho. Please email <a href="mailto:sgcxliv@stanford.edu">sgcxliv@stanford.edu</a> for any issues.
        </div>
      </div>
    </>
  );
}
