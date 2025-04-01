// pages/lifecycle/[id].js
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LifecyclePage() {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
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
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${id}/${mediaType}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('contributions')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Save metadata to database
      const { error: insertError } = await supabase
        .from('student_contributions')
        .insert({
          week_id: id,
          contributor_name: name,
          media_type: mediaType,
          caption: caption,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          created_at: new Date()
        });
        
      if (insertError) {
        throw insertError;
      }
      
      // Success!
      setSuccess(true);
      setName('');
      setMediaType('image');
      setCaption('');
      setFile(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

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
        
        {/* Theme Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>What is Called Living, for Students?</h2>
          <p>This section explores the central themes of "What is Called Living?" We take the fact of living for granted, as we should. Why focus on each breath if it just comes and goes without thinking? Or so we think. But the same logic need not apply to the idea of "life" itself.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Questions to think about</h3>
            <ul>
              <li>Exploration of various conceptions of "living" as a term in everyday language usage</li>
              <li>Critical reflection on contemporary modes of living, what it was, and what it has become</li>
           <li>Living at Stanford, and the Life of Students</li>

            </ul>
          </div>
        </div>
        
{/* Materials Section */}
<div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
  <h2>Course Materials</h2>
  <p>The following materials are required for this course. Links to digital resources are provided where available.</p>
  
  <div style={{ marginTop: '30px' }}>
    <h3>Required Texts</h3>
    <ul>
      <li>
        <a 
          href="/readings/benjamin.pdf" 
          download
          style={{ color: '#2596be', textDecoration: 'none' }}
        >
          Benjamin, Walter. "The Life of Students"
        </a>
      </li>
    </ul>
  </div>
</div>

        
        {/* Assignment Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Assignment</h2>
          <p>Upload a picture that represents your interpretation of "living" as discussed in this week's readings.</p>
          
          <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>Task</h3>
            <p>Upload a picture</p>
            <p><strong>Due:</strong> Upload before Thursday's Class</p>
            <p><strong>Submission Format:</strong> Image document uploaded to the course portal</p>
          </div>
        </div>
        
        {/* Upload Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Upload Your Contribution</h2>
          <p>Share your reflections, insights, and creative responses to our course materials.</p>
          
          {success && (
            <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>
              Your contribution has been uploaded successfully!
            </div>
          )}
          
          {error && (
            <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={uploading}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="mediaType" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Media Type</label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                disabled={uploading}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="text">Text</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="file" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>File</label>
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                disabled={uploading}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="caption" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Caption or Description</label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={uploading}
              style={{ 
                backgroundColor: uploading ? '#999' : '#2d4059', 
                color: 'white', 
                border: 'none', 
                padding: '10px 15px', 
                borderRadius: '4px', 
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {uploading ? 'Uploading...' : 'Submit Contribution'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
