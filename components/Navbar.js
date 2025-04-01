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

  return (
    <div className="navbar bg-gray-800 text-white flex">
      <div className="flex-1 flex">
        <Link 
          href="/" 
          className={`nav-tab ${router.pathname === '/' ? 'active' : ''}`}
        >
          Main
        </Link>
        <Link 
          href="/syllabus" 
          className={`nav-tab ${router.pathname === '/syllabus' ? 'active' : ''}`}
        >
          Syllabus
        </Link>
        <Link 
          href="/calendar" 
          className={`nav-tab ${router.pathname === '/calendar' ? 'active' : ''}`}
        >
          Calendar
        </Link>
        
        {/* Life Cycle Dropdown */}
        <div 
          className={`relative nav-tab ${activeDropdown === 'lifeCycle' ? 'active' : ''}`}
          onClick={() => toggleDropdown('lifeCycle')}
        >
          Life Cycle
          {activeDropdown === 'lifeCycle' && (
            <div className="absolute top-full left-0 bg-gray-700 w-64 z-50">
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
                <Link 
                  key={index} 
                  href={`/lifecycle/${index + 1}`} 
                  className="block px-4 py-2 hover:bg-gray-600"
                >
                  {topic}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Login/Dashboard Tab */}
        <Link 
          href={user ? "/dashboard" : "/login"} 
          className={`nav-tab ${router.pathname === '/login' || router.pathname === '/dashboard' ? 'active' : ''}`}
        >
          {user ? 'Dashboard' : 'Login'}
        </Link>
      </div>
    </div>
  );
}
