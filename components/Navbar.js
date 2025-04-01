import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Navbar({ user }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();

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

  return (
    <nav className="course-navbar">
      <div className={`tab ${isActive('/')}`}>
        <Link href="/">Main</Link>
      </div>
      
      <div className={`tab ${isActive('/syllabus')}`}>
        <Link href="/syllabus">Syllabus</Link>
      </div>
      
      <div className={`tab ${isActive('/calendar')}`}>
        <Link href="/calendar">Calendar</Link>
      </div>
      
      <div 
        className={`tab dropdown ${activeDropdown === 'lifeCycle' ? 'active-dropdown' : ''}`}
        onClick={() => toggleDropdown('lifeCycle')}
      >
        <span>Life Cycle</span>
        {activeDropdown === 'lifeCycle' && (
          <div className="dropdown-content">
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
              <Link key={index} href={`/lifecycle/${index + 1}`}>
                {topic}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div className={`tab ${isActive('/login') || isActive('/dashboard')}`}>
        <Link href={user ? "/dashboard" : "/login"}>
          {user ? 'Dashboard' : 'Login'}
        </Link>
      </div>
    </nav>
  );
}
