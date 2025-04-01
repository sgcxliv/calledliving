import Head from 'next/head';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Layout({ children, title = 'Course Dashboard' }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Safe way to get user on page load
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        // Only set user if data exists and has user property
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
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
        
        <main>{children}</main>
        
        <div className="footer">
          This site is managed by Stephanie Cho. Please email <a href="mailto:sgcxliv@stanford.edu">sgcxliv@stanford.edu</a> for any issues.
        </div>
      </div>
    </>
  );
}
