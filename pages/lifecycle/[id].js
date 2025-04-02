// pages/lifecycle/[id].js
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function LifecyclePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const titles = {
    '1': 'What is Called Living?',
    // Other titles commented out in original code
  };

  if (!id || !titles[id]) {
    return (
      <Layout title="Course Dashboard - Not Found">
        <div className="tab-content active">
          <h2>Page Not Found</h2>
          <p>The requested lifecycle page does not exist.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`Course Dashboard - Week ${id}: ${titles[id]}`}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{
          backgroundImage: `url('/images/weekone-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          padding: '40px 20px',
          textAlign: 'center',
          textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h1>Week {id}: {titles[id]}</h1>
        </header>
        
        {/* Theme Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>What is Called Living, for Students?</h2>
          <p>This section explores the central themes of "What is Called Living?" We take the fact of living for granted, as we should. Why focus on each breath if it just comes and goes without thinking? Or so we think. But the same logic need not apply to the idea of "life" itself.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Questions to think about</h3>
            <ul>
              <li>Exploration of various conceptions of "living" as a term in everyday language usage</li>
              <li>Critical reflection on contemporary modes of living, what it was, and what it has become</li>
              <li>Living at Stanford, and the Life of Students</li>
            </ul>
          </div>
        </div>
        
        {/* Materials Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Course Materials</h2>
          <p>The following materials are required for this course. Links to digital resources are provided where available.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Required Texts</h3>
            <ul>
              <li>
                <a 
                  href="/readings/benjamin.pdf" 
                  download
                  style={{ color: '#2596be', textDecoration: 'none' }}
                >
                  Benjamin, Walter. "The Life of Students"
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Link to upload page */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          <Link href={`/lifecycle/upload/${id}`} passHref>
            <button
              style={{ 
                backgroundColor: '#2d4059', 
                color: 'white', 
                border: 'none', 
                padding: '12px 20px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Go to Assignment & Upload Page
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
