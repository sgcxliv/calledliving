// pages/lifecycle/[id]/theme.js
import Layout from '../../../components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LifecycleTheme() {
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

  return (
    <Layout title={`Course Dashboard - Week ${id}: ${titles[id]} - Theme`}>
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
        
        {/* Navigation */}
        <nav className="course-navbar" style={{ marginBottom: '20px' }}>
          <Link href={`/lifecycle/${id}/theme`} passHref>
            <div className="tab active-tab">
              <span>Theme</span>
            </div>
          </Link>
          
          <Link href={`/lifecycle/${id}/materials`} passHref>
            <div className="tab">
              <span>Materials</span>
            </div>
          </Link>
          
          <Link href={`/lifecycle/${id}/activity`} passHref>
            <div className="tab">
              <span>Activity</span>
            </div>
          </Link>
          
          <Link href={`/lifecycle/${id}/upload`} passHref>
            <div className="tab">
              <span>Upload</span>
            </div>
          </Link>
        </nav>
        
        {/* Theme content */}
        <div className="tab-content active" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h2>What is Called Living, for Students?</h2>
          <p>This section explores the central themes of "What is Called Living?" We take the fact of living for granted, as we should. Why focus on each breath if it just comes and goes without thinking? Or so we think. But the same logic need not apply to the idea of "life" itself.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Questions to think about</h3>
            <ul>
              <li>Exploration of various conceptions of "living" across cultures and time periods</li>
              <li>Critical reflection on contemporary modes of living</li>
              <li>Philosophical inquiry into the meaning and purpose of life</li>
              <li>Consideration of alternative perspectives on existence and being</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>Weekly Focus Questions</h3>
            <p>Each week, we'll explore a different facet of "living" through these guiding questions:</p>
            <ol>
              <li>How do we define "living" in contrast to merely existing?</li>
              <li>What role does consciousness play in our understanding of life?</li>
              <li>How do different societies conceptualize the meaning of a good life?</li>
              <li>In what ways do our daily practices reflect or challenge our philosophical commitments?</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}
