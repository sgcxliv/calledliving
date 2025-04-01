// pages/lifecycle/[id]/materials.js
import Layout from '../../../components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LifecycleMaterials() {
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
    <Layout title={`Course Dashboard - Week ${id}: ${titles[id]} - Materials`}>
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
            <div className="tab">
              <span>Theme</span>
            </div>
          </Link>
          
          <Link href={`/lifecycle/${id}/materials`} passHref>
            <div className="tab active-tab">
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
        
        {/* Materials content */}
        <div className="tab-content active" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h2>Course Materials</h2>
          <p>The following materials are required for this course. Links to digital resources are provided where available.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Required Texts</h3>
            <ul>
              <li><a href="#" style={{ color: '#2596be', textDecoration: 'none' }}>Nagel, Thomas. "What Is It Like to Be a Bat?"</a></li>
              <li><a href="#" style={{ color: '#2596be', textDecoration: 'none' }}>Camus, Albert. "The Myth of Sisyphus"</a></li>
              <li><a href="#" style={{ color: '#2596be', textDecoration: 'none' }}>Le Guin, Ursula K. "The Ones Who Walk Away from Omelas"</a></li>
              <li><a href="#" style={{ color: '#2596be', textDecoration: 'none' }}>Dostoyevsky, Fyodor. "Notes from Underground" (excerpts)</a></li>
            </ul>
          </div>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Films</h3>
            <ul>
              <li><a href="#" style={{ color: '#2596be', textDecoration: 'none' }}>Kurosawa, Akira. "Ikiru" (1952)</a></li>
              <li><a href="#" style={{ color: '#2596be', textDecoration: 'none' }}>Malick, Terrence. "The Tree of Life" (2011)</a></li>
              <li><a href="#" style={{ color: '#2596be', textDecoration: 'none' }}>Kiarostami, Abbas. "Taste of Cherry" (1997)</a></li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
