import Layout from '../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Safely get current user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    
    getUser();
  }, []);

  return (
    <Layout title="RELIGST18N: What is Called Living? Course Dashboard - Home">
      <div className="tab-content active">
        <h2>Welcome to RELIGST18N: What is Called Living?</h2>
        <p>Here you will find everything you need for the class. 
    The site will continue to update as we progress, so please keep an eye out for changes. 
    The nature of this class is spontaneous, so we count on you to stay informed. Weekly pages will be published one week in advance. </p>
        
        <div style={{ marginTop: '30px' }}>
          <h3>This Week: The Life of Students. Where are we?</h3>
          <ul>
            <li>On Tuesday April 1st, We are meeting at: 1:30 - 2:50PM, ENCINA WEST 464</li>
            <li>On Thursday April 3rd, We are meeting at: 1:30 - 2:50PM, GREEN LIBRARY WEST STACKS, infront of Call Number: B3209 .B584 F75</li>
            <li>TO-DO for Next Week: Bing Nursery Signups, Family Photo Upload</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3>Announcements</h3>
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0 }}>Welcome to the Course!</h4>
            <p>Please review the syllabus and complete the introductory reading by next week.</p>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginTop: 0 }}>Field Trip Scheduled</h4>
            <p>Our first out-of-class activity is scheduled for Week 2, at the Bing Nursery School. Signup link coming soon. </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
