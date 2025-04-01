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
    <div className="navbar">
      <ul>
        <li>
          <Link href="/" className={router.pathname === '/' ? 'active' : ''}>
            Main
          </Link>
        </li>
        <li>
          <Link href="/syllabus" className={router.pathname === '/syllabus' ? 'active' : ''}>
            Syllabus
          </Link>
        </li>
        <li>
          <Link href="/calendar" className={router.pathname === '/calendar' ? 'active' : ''}>
            Calendar
          </Link>
        </li>
        <li className={`dropdown ${activeDropdown === 'lifeCycle' ? 'active' : ''}`}>
          <a href="#" onClick={() => toggleDropdown('lifeCycle')}>Life Cycle</a>
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
        </li>
        <li>
          <Link href={user ? "/dashboard" : "/login"} 
            className={router.pathname === '/login' || router.pathname === '/dashboard' ? 'active' : ''}
          >
            {user ? 'Dashboard' : 'Login'}
          </Link>
        </li>
      </ul>
    </div>
  );
}
