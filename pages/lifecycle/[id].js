import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function LifecyclePage() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('theme');

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
    <Layout title={`Course Dashboard - Week ${id}: ${titles[id]}`}>
      <div style={{ width: '100%' }}>
        <header style={{
          backgroundImage: `url('/images/weekone-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          padding: '40px 20px',
          textAlign: 'center',
          textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
        }}>
          <h1>Week {id}: {titles[id]}</h1>
        </header>
        
        <div className="navbar">
          <ul>
            <li>
              <a
                href="#"
                className={activeTab === 'theme' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('theme'); }}
              >
                Theme
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeTab === 'materials' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('materials'); }}
              >
                Materials
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeTab === 'assignment' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('assignment'); }}
              >
                Activity
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeTab === 'activity' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('activity'); }}
              >
                Upload
              </a>
            </li>
          </ul>
        </div>
        
        {/* Theme tab content */}
        <div id="theme" className={`tab-content ${activeTab === 'theme' ? 'active' : ''}`}>
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
        
        {/* Materials tab content */}
        <div id="materials" className={`tab-content ${activeTab === 'materials' ? 'active' : ''}`}>
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
        
        {/* Assignment tab content */}
        <div id="assignment" className={`tab-content ${activeTab === 'assignment' ? 'active' : ''}`}>
          <h2>Assignments</h2>
          <p>The following assignments will help you develop your understanding of the course themes and practice critical thinking and writing skills.</p>
          
          <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
            <h3>Task</h3>
            <p>Upload a picture</p>
            <p><strong>Due:</strong> Upload before Thursday's Class</p>
            <p><strong>Submission Format:</strong> Image document uploaded to the course portal</p>
          </div>
        </div>
        
        {/* Activity tab content */}
        <div id="activity" className={`tab-content ${activeTab === 'activity' ? 'active' : ''}`}>
          <h2>Course Activities</h2>
          <p>Beyond readings and traditional assignments, this course features several experiential learning activities to deepen your engagement with the material.</p>
          
          {/* Upload Grid Section */}
          <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
            <h3>Student Contributions</h3>
            <p>Share your reflections, insights, and creative responses to our course materials. Upload images, videos, or text that represent your engagement with the week's theme.</p>
            
            {/* Upload Form */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
              <h4>Add Your Contribution</h4>
              <div style={{ display: 'flex', marginBottom: '10px' }}>
                <input type="text" placeholder="Enter your name" style={{ flex: 1, padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', marginBottom: '10px' }}>
                <select style={{ padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                </select>
                <input type="file" style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <textarea placeholder="Add a caption or description (optional)" style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}></textarea>
              <button style={{ backgroundColor: '#2d4059', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Upload</button>
            </div>
            
            {/* Add New Entry Box */}
            <div style={{ border: '2px dashed #ccc', borderRadius: '5px', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9' }}>
              <div style={{ fontSize: '40px', color: '#2d4059', marginBottom: '10px' }}>+</div>
              <div style={{ color: '#666' }}>Add your contribution</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
