import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Navbar({ user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
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
        <li className={`dropdown ${dropdownOpen ? 'active' : ''}`}>
          <a href="#" onClick={toggleDropdown}>Life Cycle</a>
          <div className="dropdown-content">
            <Link href="/lifecycle/1">1. What is Called Living?</Link>
            <Link href="/lifecycle/2">2. Childhood, or The No-Place</Link>
            <Link href="/lifecycle/3">3. Real Life, or, The Workplace</Link>
            <Link href="/lifecycle/4">4. Nightlife, or, The Dark Side</Link>
            <Link href="/lifecycle/5">5. Untitled</Link>
            <Link href="/lifecycle/6">6. Untitled</Link>
            <Link href="/lifecycle/7">7. Untitled</Link>
            <Link href="/lifecycle/8">8. Untitled</Link>
            <Link href="/lifecycle/9">9. Untitled</Link>
            <Link href="/lifecycle/10">10. Untitled</Link>
          </div>
        </li>
        <li>
          {user ? (
            <Link href="/dashboard" className={router.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className={router.pathname === '/login' ? 'active' : ''}>
              Login
            </Link>
          )}
        </li>
      </ul>
    </div>
  );
}
