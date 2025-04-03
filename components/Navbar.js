import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Navbar({ user }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();

  // Add this useEffect to close dropdown on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setActiveDropdown(null);
    };
    
    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isActive = (path) => {
    return router.pathname === path ? 'active-tab' : '';
  };

  // Navigation helper function to handle clicks on the entire tab area
  const navigateTo = (path) => {
    if (path) router.push(path);
  };

  return (
    <nav className="course-navbar">
      {/* Regular tabs - the entire div is now clickable */}
      <div 
        className={`tab ${isActive('/')}`} 
        onClick={() => navigateTo('/')}
      >
        <span className="w-full h-full block">Main</span>
      </div>
      
      <div 
        className={`tab ${isActive('/syllabus')}`}
        onClick={() => navigateTo('/syllabus')}
      >
        <span className="w-full h-full block">Syllabus</span>
      </div>
      
      <div 
        className={`tab ${isActive('/calendar')}`}
        onClick={() => navigateTo('/calendar')}
      >
        <span className="w-full h-full block">Calendar</span>
      </div>
      
      {/* Dropdown tab */}
      <div 
        className={`tab dropdown ${activeDropdown === 'lifeCycle' ? 'active-dropdown' : ''}`}
        onClick={() => toggleDropdown('lifeCycle')}
      >
        <span className="w-full h-full block">Life Cycle</span>
        {activeDropdown === 'lifeCycle' && (
          <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
            {[
              '1. What is Called Living?',
              '2. Childhood, or The No-Place',
              '3. Real Life, or, The Workplace',
              '4. Nightlife, or, The Dark Side',
              '5. Untitled',
              '6. Untitled',
              '7. Untitled',
              '8. Untitled',
              '9. Untitled',
              '10. Untitled'
            ].map((topic, index) => (
              <div 
                key={index} 
                className="dropdown-item" 
                onClick={() => navigateTo(`/lifecycle/${index + 1}`)}
              >
                {topic}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Login/Dashboard tab */}
      <div 
        className={`tab ${isActive('/login') || isActive('/dashboard')}`}
        onClick={() => navigateTo(user ? "/dashboard" : "/login")}
      >
        <span className="w-full h-full block">
          {user ? 'Reflection Portal' : 'Login'}
        </span>
      </div>
    </nav>
  );
}
