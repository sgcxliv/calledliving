// pages/lifecycle/[id]/upload.js
import LifecycleLayout from '../../../components/LifecycleLayout';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function LifecycleUpload() {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  
  if (!id) {
    return <div>Loading...</div>;
  }
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would implement the actual file upload logic
    // For example, using Supabase storage or another solution
    console.log({
      name,
      mediaType,
      caption,
      file
    });
    
    // For now, just show a simple alert
    alert('Your contribution has been submitted!');
    
    // Reset the form
    setName('');
    setMediaType('image');
    setCaption('');
    setFile(null);
    
    // You could redirect to a success page or reload
    // router.push(`/lifecycle/${id}/upload?success=true`);
  };

  return (
    <LifecycleLayout id={id} title="Upload" activeTab="upload">
      <h2>Course Activities</h2>
      <p>Beyond readings and traditional assignments, this course features several experiential learning activities to deepen your engagement with the material.</p>
      
      {/* Upload Grid Section */}
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h3>Student Contributions</h3>
        <p>Share your reflections, insights, and creative responses to our course materials. Upload images, videos, or text that represent your engagement with the week's theme.</p>
        
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
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
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
              style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <textarea
            placeholder="Add a caption or description (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
          ></textarea>
          <button
            type="submit"
            style={{ backgroundColor: '#2d4059', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Upload
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
