// pages/lifecycle/[id].js
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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
  const [submissions, setSubmissions] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const titles = {
    '1': 'What is Called Living?',
    '2': 'Childhood, or the No-place',
    // Other titles can be added here
  };

  const backgroundImages = {
    '1': '/images/weekone-background.jpg',
    '2': '/images/weektwo-background.jpg',
  };
  
  const themeContent = {
    '1': {
      title: 'What is Called Living, for Students?',
      description: 'This section explores the central themes of "What is Called Living?" We take the fact of living for granted, as we should. Why focus on each breath if it just comes and goes without thinking? Or so we think. But the same logic need not apply to the idea of "life" itself.',
      questions: [
        'Exploration of various conceptions of "living" as a term in everyday language usage',
        'Critical reflection on contemporary modes of living, what it was, and what it has become',
        'Living at Stanford, and the Life of Students'
      ]
    },
    '2': {
      title: 'Childhood as a No-place',
      description: 'Childhood exists as both a historical phase and a mythical construct, a space where imagination and reality blur. We examine how childhood functions as both memory and possibility.',
      questions: [
        'How is childhood constructed as both a physical and metaphysical space?',
        'What is the relationship between childhood memory and adult identity?',
        'How do social and cultural forces shape our understanding of childhood?'
      ]
    }
  };

  const requiredReadings = {
    '1': [
      {
        title: 'Benjamin, Walter. "The Life of Students"',
        path: '/readings/benjamin.pdf'
      }
    ],
    '2': [
      {
        title: 'Ulanowicz, Anastasia. "Summary of Centuries of Childhood by Phillip Aries"',
        path: '/readings/ulanowicz.pdf'
      },
      {
        title: 'Huizinga, Johan. "Nature and Significance of Play as a Cultural Phenomenon"',
        path: '/readings/huizinga.pdf'
      }
    ]
  };

  // Fetch submissions when the page loads
  useEffect(() => {
    if (id === '2') {
      fetchSubmissions();
    }
  }, [id]);
  
  // Function to fetch submissions
  const fetchSubmissions = async () => {
    try {
      console.log('Fetching submissions for week:', id);
      
      const { data, error } = await supabase
        .from('student_contributions')
        .select('*')
        .eq('week_id', id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }
      
      console.log('Fetched submissions:', data?.length || 0);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error in fetch operation:', error);
    }
  };

  // Function to delete a submission - FIXED
  const handleDeleteSubmission = async (submissionId, filePath) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      console.log('Starting deletion for ID:', submissionId, 'Path:', filePath);
      
      // Step 1: Delete the database record first
      const { data: deleteData, error: deleteError } = await supabase
        .from('student_contributions')
        .delete()
        .eq('id', submissionId);
      
      if (deleteError) {
        console.error('Database deletion error:', deleteError);
        throw deleteError;
      }
      
      console.log('Database deletion successful');
      
      // Step 2: Delete the file from storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('contributions')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Storage deletion error:', storageError);
        console.warn('File deletion failed but database record was removed');
      } else {
        console.log('Storage deletion successful');
      }
      
      // Step 3: Update local state immediately
      setSubmissions(prevSubmissions => 
        prevSubmissions.filter(submission => submission.id !== submissionId)
      );
    } catch (error) {
      console.error('Error in delete operation:', error);
      setError('Error deleting submission: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!id || !titles[id]) {
    return (
      <Layout title="Course Dashboard - Not Found">
        <div className="tab-content active">
          <h2>Page Not Found</h2>
          <p>The requested lifecycle page has yet to be published.</p>
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
      const { data: insertData, error: insertError } = await supabase
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
      
      // Clear success message after 3 seconds and refresh submissions
      setTimeout(() => {
        setSuccess(false);
        fetchSubmissions(); // Refresh to get the accurate data with server IDs
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };
  
  // Render the enlarged image overlay
  const renderEnlargedImageOverlay = () => {
    if (!enlargedImage) return null;
    
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          cursor: 'pointer'
        }}
        onClick={() => setEnlargedImage(null)}
      >
        <img 
          src={enlargedImage} 
          alt="Enlarged submission" 
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
          }} 
        />
      </div>
    );
  };
  
  return (
    <Layout title={`Course Dashboard - Week ${id}: ${titles[id]}`}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Enlarged Image Overlay */}
        {renderEnlargedImageOverlay()}
        
        {/* Header with week-specific background */}
        <header style={{
          backgroundImage: `url('${backgroundImages[id] || '/images/default-background.jpg'}')`,
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
        
        {/* Theme Section - Week specific */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>{themeContent[id].title}</h2>
          <p>{themeContent[id].description}</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Questions to think about</h3>
            <ul>
              {themeContent[id].questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Materials Section - Week specific */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Course Materials</h2>
          <p>You are required to read and review the following materials (readings, movies, songs) for this week. Links and PDFs to digital resources are provided where available.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Required Texts</h3>
            <ul>
              {requiredReadings[id].map((reading, index) => (
                <li key={index}>
                  <a 
                    href={reading.path} 
                    download
                    style={{ color: '#2596be', textDecoration: 'none' }}
                  >
                    {reading.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Only render assignment/upload section for Week 2 */}
        {id === '2' && (
          <>
            {/* Assignment Section */}
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <h2>Assignment: Task</h2>
              <p>Upload a picture of you and your family which means something to you and which you'd be open to discussing with the class.</p>
              
              <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>Task</h3>
                <p>Upload Your Photo Here. </p>
                <p><strong>Due:</strong> Before Class on Tuesday (1:30 PM, April 8th)</p>
                <p><strong>Submission Format:</strong> Image, with a short optional caption if you wish to provide some context.</p>
              </div>
            </div>
            
            {/* Upload Section */}
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <h2>Upload Your Contribution</h2>
              <p>Share your reflections on childhood spaces and how they shaped your identity.</p>
              
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
            
            {/* Class Submissions Section */}
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              <h2>Class Submissions</h2>
              
              {isDeleting && (
                <div style={{ padding: '10px', backgroundColor: '#cce5ff', color: '#004085', borderRadius: '4px', marginBottom: '15px' }}>
                  Deleting submission... Please wait.
                </div>
              )}
              
              {submissions.length === 0 ? (
                <p>No submissions yet. Be the first to contribute!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {submissions.map((submission) => (
                    <div key={submission.id} style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteSubmission(submission.id, submission.file_path)}
                        disabled={isDeleting}
                        style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px', 
                          backgroundColor: isDeleting ? '#999' : '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          padding: '5px 10px',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          zIndex: 10
                        }}
                      >
                        Delete
                      </button>
                      
                      <div style={{ padding: '12px 15px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                        <p style={{ fontWeight: 'bold', margin: '0', fontSize: '16px' }}>{submission.contributor_name}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          {new Date(submission.created_at).toLocaleDateString()} {new Date(submission.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {submission.media_type === 'image' && (
                        <div 
                          style={{ 
                            width: '100%', 
                            height: '220px', 
                            overflow: 'hidden',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            const imageUrl = `${supabase.storage.from('contributions').getPublicUrl(submission.file_path).data.publicUrl}`;
                            setEnlargedImage(imageUrl);
                          }}
                        >
                          <img 
                            src={`${supabase.storage.from('contributions').getPublicUrl(submission.file_path).data.publicUrl}`}
                            alt={submission.caption} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                            }}
                          />
                        </div>
                      )}
                      
                      {submission.media_type === 'video' && (
                        <div style={{ width: '100%', height: '220px' }}>
                          <video 
                            src={`${supabase.storage.from('contributions').getPublicUrl(submission.file_path).data.publicUrl}`}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      
                      {submission.media_type === 'text' && (
                        <div style={{ padding: '15px', backgroundColor: '#f9f9f9', height: '180px', overflow: 'auto' }}>
                          <p style={{ whiteSpace: 'pre-wrap' }}>{submission.caption}</p>
                        </div>
                      )}
                      
                      {/* Only show caption separately for image and video */}
                      {(submission.media_type === 'image' || submission.media_type === 'video') && (
                        <div style={{ padding: '15px' }}>
                          <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.5' }}>{submission.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
