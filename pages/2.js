// pages/lifecycle/2.js
import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ChildhoodPage() {
  const id = '2'; // Hardcoded for this specific page
  const [name, setName] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  const titles = {
    '2': 'Childhood, or The No-Place',
  };

  // Fetch submissions when the page loads
  useEffect(() => {
    fetchSubmissions();
  }, []);
  
  // Function to fetch submissions (same as previous page)
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

  // Function to delete a submission (same as previous page)
  const handleDeleteSubmission = async (submissionId, filePath) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
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
    }
  };

  // Handle file change (same as previous page)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  // Handle submission (same as previous page)
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
  
  return (
    <Layout title={`Course Dashboard - Week ${id}: ${titles[id]}`}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Enlarged Image Overlay */}
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

        <header style={{
          backgroundImage: `url('/images/weektwo-background.jpg')`, // You'd create a new background image
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
        
        {/* Theme Section - Customize for Week 2 */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Childhood: The No-Place</h2>
          <p>Childhood is often seen as a liminal space – neither here nor there, a realm of imagination and potentiality. This week, we explore childhood not as a preparatory stage, but as a complex, nuanced experience of being.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Questions to think about</h3>
            <ul>
              <li>Childhood as a social and historical construct</li>
              <li>Memory, imagination, and the landscape of childhood experience</li>
              <li>The politics of childhood and innocence</li>
              <li>Representations of childhood in literature and visual media</li>
            </ul>
          </div>
        </div>
        
        {/* Materials Section - Customize for Week 2 */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Course Materials</h2>
          <p>The following materials are required for this week's exploration of childhood.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Required Texts</h3>
            <ul>
              <li>
                <a 
                  href="/readings/bachelard-poetics-of-space.pdf" 
                  download
                  style={{ color: '#2596be', textDecoration: 'none' }}
                >
                  Bachelard, Gaston. "The Poetics of Space" (Selections on Childhood Spaces)
                </a>
              </li>
              <li>
                <a 
                  href="/readings/benjamin-childhood-berlin.pdf" 
                  download
                  style={{ color: '#2596be', textDecoration: 'none' }}
                >
                  Benjamin, Walter. "Berlin Childhood Around 1900" (Excerpts)
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Assignment Section - Customize for Week 2 */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Assignment: Childhood Memories</h2>
          <p>Create a visual or textual representation of a childhood memory that reveals something about space, imagination, or the complexity of childhood experience.</p>
          
          <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>Task</h3>
            <p>Upload an image, video, or text that captures a moment, space, or memory from childhood.</p>
            <p><strong>Due:</strong> Before Next Week's Class</p>
            <p><strong>Submission Format:</strong> Creative media uploaded to the course portal</p>
          </div>
        </div>

        {/* Rest of the component remains the same as the previous page (upload form and submissions section) */}
        
        {/* Upload Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Upload Your Contribution</h2>
          <p>Share your reflections on childhood and memory.</p>
          
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
          
          {/* Form remains the same as previous page */}
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            {/* ... (same form code as previous page) ... */}
          </form>
        </div>
        
        {/* Submissions Section */}
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Class Submissions</h2>
          
          {submissions.length === 0 ? (
            <p>No submissions yet. Be the first to contribute!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {submissions.map((submission) => (
                // ... (same submission rendering code as previous page)
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}