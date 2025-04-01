import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LifecyclePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const titles = {
    '1': 'What is Called Living?',
    '2': 'Childhood, or The No-Place',
    '3': 'Real Life, or, The Workplace',
    '4': 'Nightlife, or, The Dark Side',
    '5': 'Untitled',
    '6': 'Untitled',
    '7': 'Untitled',
    '8': 'Untitled',
    '9': 'Untitled',
    '10': 'Untitled',
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

  // Determine which sub-page we're on
  const subpage = router.query.subpage || 'theme';

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
        
        {/* Navbar links to separate pages */}
        <nav className="course-navbar" style={{ marginBottom: '20px' }}>
          <Link href={`/lifecycle/${id}/theme`} passHref>
            <div className={`tab ${subpage === 'theme' ? 'active-tab' : ''}`}>
              <span>Theme</span>
            </div>
          </Link>
          
          <Link href={`/lifecycle/${id}/materials`} passHref>
            <div className={`tab ${subpage === 'materials' ? 'active-tab' : ''}`}>
              <span>Materials</span>
            </div>
          </Link>
          
          <Link href={`/lifecycle/${id}/activity`} passHref>
            <div className={`tab ${subpage === 'activity' ? 'active-tab' : ''}`}>
              <span>Activity</span>
            </div>
          </Link>
          
          <Link href={`/lifecycle/${id}/upload`} passHref>
            <div className={`tab ${subpage === 'upload' ? 'active-tab' : ''}`}>
              <span>Upload</span>
            </div>
          </Link>
        </nav>
      </div>
    </Layout>
  );
}
