import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout title="Course Dashboard - Main">
      <h2>Welcome to "What is Called Living?"</h2>
      <p>This is the main landing page for our course. Use the navigation tabs above to explore different sections of the course site.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Course Highlights</h3>
        <ul>
          <li>Explore the concept of "living" through various lenses</li>
          <li>Engage in field trips, films, readings, and discussions</li>
          <li>Develop critical thinking skills through philosophical inquiry</li>
          <li>Participate in collective writing and self-examination activities</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Announcements</h3>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '5px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
          marginBottom: '15px' 
        }}>
          <h4 style={{ marginTop: 0 }}>Welcome to the Course!</h4>
          <p>Please review the syllabus and complete the introductory assignment by next week.</p>
        </div>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '5px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
        }}>
          <h4 style={{ marginTop: 0 }}>Field Trip Scheduled</h4>
          <p>Our first field trip to the scent shop is scheduled for Week 3. Please sign up in the portal.</p>
        </div>
      </div>
    </Layout>
  );
}

// Disable server-side rendering to prevent potential errors
export const config = {
  runtime: 'client'
};
