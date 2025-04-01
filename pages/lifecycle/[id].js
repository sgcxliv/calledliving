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
  const [deleting, setDeleting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  const titles = {
    '1': 'What is Called Living?',
  };

  // Fetch submissions when the page loads
  useEffect(() => {
    if (id) {
      fetchSubmissions();
    }
  }, [id]);
  
  // Function to fetch submissions
  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('student_contributions')
        .select('*')
        .eq('week_id', id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }
      
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  // Function to delete a submission
  const handleDeleteSubmission = async (submissionId, filePath) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('contributions')
        .remove([filePath]);
      
      if (storageError) {
        throw storageError;
      }
      
      // Delete the database record
      const { error: deleteError } = await supabase
        .from('student_contributions')
        .delete()
        .eq('id', submissionId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Remove the submission from local state
      setSubmissions(submissions.filter(submission => submission.id !== submissionId));
      
    } catch (error) {
      console.error('Error deleting submission:', error);
      setError('Error deleting submission: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
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
      
      // Add the new submission to the list immediately
      const newSubmission = {
        id: Date.now(), // Temporary ID until we refresh
        week_id: id,
        contributor_name: name,
        media_type: mediaType,
        caption: caption,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        created_at: new Date()
      };
      
      setSubmissions([newSubmission, ...submissions]);
      
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
  
  // Handle image enlargement
  const handleImageEnlarge = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  // Close enlarged image when clicking outside or pressing ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEnlargedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <Layout title={`Course Dashboard - Week ${id}: ${titles[id]}`}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* ... Previous header and other sections remain the same ... */}
        
        {/* Enlarged Image Lightbox */}
        {enlargedImage && (
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
        )}
        
        {/* Class Submissions Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Class Submissions</h2>
          
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
                    disabled={deleting}
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      padding: '5px 10px',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      zIndex: 10
                    }}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
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
                        handleImageEnlarge(imageUrl);
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
      </div>
    </Layout>
  );
}
