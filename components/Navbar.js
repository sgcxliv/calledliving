import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Navbar({ user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="navbar">
      <ul>
        <li>
          <Link href="/" legacyBehavior>
            <a className={router.pathname === '/' ? 'active' : ''}>Main</a>
          </Link>
        </li>
        <li>
          <Link href="/syllabus" legacyBehavior>
            <a className={router.pathname === '/syllabus' ? 'active' : ''}>Syllabus</a>
          </Link>
        </li>
        <li>
          <Link href="/calendar" legacyBehavior>
            <a className={router.pathname === '/calendar' ? 'active' : ''}>Calendar</a>
          </Link>
        </li>
        <li className={`dropdown ${dropdownOpen ? 'active' : ''}`}>
          <a href="#" onClick={toggleDropdown}>Life Cycle</a>
          <div className="dropdown-content">
            <Link href="/lifecycle/1" legacyBehavior><a>1. What is Called Living?</a></Link>
            <Link href="/lifecycle/2" legacyBehavior><a>2. Childhood, or The No-Place</a></Link>
            <Link href="/lifecycle/3" legacyBehavior><a>3. Real Life, or, The Workplace</a></Link>
            <Link href="/lifecycle/4" legacyBehavior><a>4. Nightlife, or, The Dark Side</a></Link>
            <Link href="/lifecycle/5" legacyBehavior><a>5. Untitled</a></Link>
            <Link href="/lifecycle/6" legacyBehavior><a>6. Untitled</a></Link>
            <Link href="/lifecycle/7" legacyBehavior><a>7. Untitled</a></Link>
            <Link href="/lifecycle/8" legacyBehavior><a>8. Untitled</a></Link>
            <Link href="/lifecycle/9" legacyBehavior><a>9. Untitled</a></Link>
            <Link href="/lifecycle/10" legacyBehavior><a>10. Untitled</a></Link>
          </div>
        </li>
        <li>
          <Link href="/login" legacyBehavior>
            <a className={router.pathname === '/login' ? 'active' : ''}>
              {user ? 'Dashboard' : 'Login'}
            </a>
          </Link>
        </li>
      </ul>
    </div>
  );
}
