// pages/lifecycle/[id]/upload.js
import LifecycleLayout from '../../../components/LifecycleLayout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { uploadFileToSupabase, saveContributionMetadata } from '../../../utils/fileUpload';

export default function LifecycleUpload() {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  if (!id) {
    return <div>Loading...</div>;
  }
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null); // Clear any previous errors
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
      
      // 1. Upload file to Supabase Storage
      const { path, error: uploadError } = await uploadFileToSupabase(
        file, 
        mediaType, 
        id,
        supabase
      );
        
      if (uploadError) {
        throw new Error(uploadError);
      }
      
      // 2. Save metadata to Supabase database
      const { error: metadataError } = await saveContributionMetadata({
        week_id: id,
        contributor_name: name,
        media_type: mediaType,
        caption: caption,
        file_path: path,
        file_size: file.size,
        file_type: file.type,
        created_at: new Date()
      }, supabase);
        
      if (metadataError) {
        throw new Error(metadataError);
      }
      
      // Success!
      setSuccess(true);
      setName('');
      setMediaType('image');
      setCaption('');
      setFile(null);
      
      // Reload the page after 2 seconds to show the new contribution
      setTimeout(() => {
        router.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <LifecycleLayout id={id} title="Upload" activeTab="upload">
      <h2>Course Activities</h2>
      <p>Beyond readings and traditional assignments, this course features several experiential learning activities to deepen your engagement with the material.</p>
      
      {/* Upload Grid Section */}
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h3>Student Contributions</h3>
        <p>Share your reflections, insights, and creative responses to our course materials. Upload images, videos, or text that represent your engagement with the week's theme.</p>
        
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
        
        {/* Upload Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h4>Add Your Contribution</h4>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={uploading}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              disabled={uploading}
              style={{ padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '120px' }}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="text">Text</option>
            </select>
            <input
              type="file"
              onChange={handleFileChange}
              required
              disabled={uploading}
              style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <textarea
            placeholder="Add a caption or description (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploading}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
          ></textarea>
          <button
            type="submit"
            disabled={uploading}
            style={{ 
              backgroundColor: uploading ? '#999' : '#2d4059', 
              color: 'white', 
              border: 'none', 
              padding: '8px 15px', 
              borderRadius: '4px', 
              cursor: uploading ? 'not-allowed' : 'pointer' 
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        
        {/* Gallery Section */}
        <h4 style={{ marginTop: '30px' }}>Class Contributions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {/* This would be populated with actual contributions from students */}
          <div style={{ border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden', height: '200px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#666', textAlign: 'center', padding: '15px' }}>Student contributions will appear here.</p>
          </div>
          
          {/* Placeholder for new uploads */}
          <div style={{ border: '2px dashed #ccc', borderRadius: '5px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontSize: '40px', color: '#2d4059', marginBottom: '10px' }}>+</div>
            <div style={{ color: '#666' }}>Add your contribution</div>
          </div>
        </div>
      </div>
    </LifecycleLayout>
  );
}
