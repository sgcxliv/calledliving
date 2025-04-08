import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AnnouncementsComponent = ({ user, canManageAnnouncements }) => {
  // State to store all announcements
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for new announcement form
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    link: '',
    linkText: ''
  });

  // File upload state
  const [file, setFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [editFile, setEditFile] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // State for editing an existing announcement
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    link: '',
    linkText: '',
    fileName: '',
    filePath: '',
    fileType: ''
  });

  // State to control form visibility
  const [showForm, setShowForm] = useState(false);

  // Load announcements on component mount
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes for new announcements
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form input changes for editing announcements
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection for new announcements
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File is too large. Maximum file size is 10MB.');
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  // Handle file selection for editing announcements
  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File is too large. Maximum file size is 10MB.');
        return;
      }
      
      setEditFile(selectedFile);
    }
  };

  // Upload file to Supabase storage
  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    setFileUploading(true);
    
    try {
      const { data, error } = await supabase.storage
        .from('announcement-files')
        .upload(filePath, file);
      
      if (error) throw error;
      
      return {
        path: filePath,
        name: file.name,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
      return null;
    } finally {
      setFileUploading(false);
    }
  };

  // Delete file from Supabase storage
  const deleteFile = async (filePath) => {
    try {
      const { error } = await supabase.storage
        .from('announcement-files')
        .remove([filePath]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Get public URL for file
  const getFileURL = (filePath) => {
    return supabase.storage
      .from('announcement-files')
      .getPublicUrl(filePath).data.publicUrl;
  };

  // Start editing an announcement
  const handleStartEdit = (announcement) => {
    setEditingAnnouncement(announcement.id);
    setEditFormData({
      title: announcement.title,
      content: announcement.content,
      link: announcement.link || '',
      linkText: announcement.link_text || '',
      fileName: announcement.file_name || '',
      filePath: announcement.file_path || '',
      fileType: announcement.file_type || ''
    });
    setShowForm(false); // Close the new announcement form if it's open
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingAnnouncement(null);
    setEditFormData({
      title: '',
      content: '',
      link: '',
      linkText: '',
      fileName: '',
      filePath: '',
      fileType: ''
    });
    setEditFile(null);
  };

  // Clear file from new announcement form
  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear file from edit form
  const handleClearEditFile = async () => {
    const filePath = editFormData.filePath;
    
    if (filePath) {
      // Delete the existing file if it's being removed
      try {
        await deleteFile(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    setEditFormData(prev => ({
      ...prev,
      fileName: '',
      filePath: '',
      fileType: ''
    }));
    
    setEditFile(null);
    
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Save edited announcement
  const handleSaveEdit = async (id) => {
    try {
      // Check if there's a new file to upload
      let fileData = {
        file_name: editFormData.fileName,
        file_path: editFormData.filePath,
        file_type: editFormData.fileType
      };

      // If there's a new file, upload it
      if (editFile) {
        // If there's an existing file and we're replacing it, delete the old one
        if (editFormData.filePath) {
          await deleteFile(editFormData.filePath);
        }
        
        const uploadedFile = await uploadFile(editFile);
        if (uploadedFile) {
          fileData = {
            file_name: uploadedFile.name,
            file_path: uploadedFile.path,
            file_type: uploadedFile.type
          };
        }
      } 
      // If fileName is empty but filePath exists, it means user cleared the file
      else if (!editFormData.fileName && editFormData.filePath) {
        await deleteFile(editFormData.filePath);
        fileData = {
          file_name: null,
          file_path: null,
          file_type: null
        };
      }
      
      const updatedItem = {
        title: editFormData.title,
        content: editFormData.content,
        link: editFormData.link || null,
        link_text: editFormData.linkText || null,
        ...fileData
      };
      
      const { data, error } = await supabase
        .from('announcements')
        .update(updatedItem)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Update the announcement in the local state
      setAnnouncements(announcements.map(announcement => 
        announcement.id === id ? data[0] : announcement
      ));
      
      // Reset editing state
      setEditingAnnouncement(null);
      setEditFormData({
        title: '',
        content: '',
        link: '',
        linkText: '',
        fileName: '',
        filePath: '',
        fileType: ''
      });
      setEditFile(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Error updating announcement. Please try again.');
    }
  };
  
// Handle new announcement form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Upload file if present
    let fileData = {};
    if (file) {
      const uploadedFile = await uploadFile(file);
      if (uploadedFile) {
        fileData = {
          file_name: uploadedFile.name,
          file_path: uploadedFile.path,
          file_type: uploadedFile.type
        };
      }
    }
    
    // Create new announcement
    const newItem = {
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      link: newAnnouncement.link || null,
      link_text: newAnnouncement.linkText || null,
      professor_id: user.id,
      created_at: new Date().toISOString(),
      ...fileData
    };
    
    const { data, error } = await supabase
      .from('announcements')
      .insert([newItem])
      .select();
    
    if (error) throw error;
    
    // Add to the beginning of the array (newest first)
    setAnnouncements([data[0], ...announcements]);
    
    // Trigger email notification for the new announcement
  try {
    const response = await fetch('/api/send-announcement-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        announcementId: data[0].id,
        courseId: data[0].course_id
      })
    });
  
    // Get the response data
    const emailResult = await response.json();
  
    // Show the preview URL as an alert if available
    if (emailResult.previewUrl && process.env.NEXT_PUBLIC_SHOW_EMAIL_PREVIEW === 'true') {
      alert(`📧 Test Email Created! View at: ${emailResult.previewUrl}`);
    }
  } catch (error) {
    console.error('Error with email notification:', error);
  }
    
    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      link: '',
      linkText: ''
    });
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Hide form after submission
    setShowForm(false);
  } catch (error) {
    console.error('Error creating announcement:', error);
    alert('Error posting announcement. Please try again.');
  }
};

  // Function to handle announcement deletion
  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      // Get the announcement to delete
      const announcementToDelete = announcements.find(a => a.id === id);
      
      // Delete associated file if it exists
      if (announcementToDelete.file_path) {
        await deleteFile(announcementToDelete.file_path);
      }
      
      // Delete the announcement
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from local state
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return '📄';
    
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎬';
    if (fileType.includes('audio')) return '🔊';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
    
    return '📄';
  };

  const renderFileAttachment = (announcement) => {
  if (!announcement.file_path) return null;

  const fileUrl = getFileURL(announcement.file_path);
  const fileType = announcement.file_type || '';

  // Image handling
  if (fileType.startsWith('image/')) {
    return (
      <div style={{ 
        maxWidth: '100%', 
        marginBottom: '15px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <img 
          src={fileUrl} 
          alt={announcement.file_name}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  // Video handling
  if (fileType.startsWith('video/')) {
    return (
      <div style={{ 
        maxWidth: '100%', 
        marginBottom: '15px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <video 
          controls 
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        >
          <source src={fileUrl} type={fileType} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Audio handling
  if (fileType.startsWith('audio/')) {
    return (
      <div style={{ 
        maxWidth: '100%', 
        marginBottom: '15px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <audio 
          controls 
          style={{
            width: '100%',
            display: 'block'
          }}
        >
          <source src={fileUrl} type={fileType} />
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }

  // PDF handling (inline preview if possible)
  if (fileType === 'application/pdf') {
    return (
      <div style={{ 
        maxWidth: '100%', 
        marginBottom: '15px',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <object 
          data={fileUrl} 
          type="application/pdf" 
          width="100%" 
          height="100%"
        >
          <a 
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#0066cc',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 12px',
              backgroundColor: '#f0f7ff',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
            download={announcement.file_name}
          >
            <span>{getFileIcon(fileType)}</span>
            <span>Download PDF: {announcement.file_name}</span>
          </a>
        </object>
      </div>
    );
  }

  // Fallback for other file types - download link
  return (
    <div style={{ marginBottom: '10px' }}>
      <a 
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#0066cc',
          textDecoration: 'none',
          fontWeight: '500',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '8px 12px',
          backgroundColor: '#f0f7ff',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}
        download={announcement.file_name}
      >
        <span>{getFileIcon(fileType)}</span>
        <span>Download: {announcement.file_name}</span>
      </a>
    </div>
  );
};


  return (
    <div className="announcements-container" style={{ 
      padding: '25px 30px 30px',
      marginTop: '30px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          margin: '0',
          color: '#333'
        }}>Announcements</h3>
        
        {canManageAnnouncements && !editingAnnouncement && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            style={{
              backgroundColor: showForm ? '#6c757d' : '#444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s'
            }}
          >
            {showForm ? 'Cancel' : 'Add Announcement'}
          </button>
        )}
      </div>
      
      {/* Add Announcement Form - Only visible when adding new announcements */}
      {canManageAnnouncements && showForm && !editingAnnouncement && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          marginBottom: '25px',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ 
            marginTop: '0', 
            marginBottom: '15px',
            fontSize: '1.2rem',
            color: '#444' 
          }}>New Announcement</h4>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                color: '#555'
              }}>
                Title
              </label>
              <input 
                type="text" 
                name="title"
                value={newAnnouncement.title}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                color: '#555'
              }}>
                Content
              </label>
              <textarea 
                name="content"
                value={newAnnouncement.content}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                rows="4"
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                color: '#555'
              }}>
                Link (optional)
              </label>
              <input 
                type="url" 
                name="link"
                value={newAnnouncement.link}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                color: '#555'
              }}>
                Link Text (optional)
              </label>
              <input 
                type="text" 
                name="linkText"
                value={newAnnouncement.linkText}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                color: '#555'
              }}>
                Attachment (optional)
              </label>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px'
                  }}
                />
                {file && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#f0f7ff',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    <button 
                      type="button" 
                      onClick={handleClearFile}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        marginLeft: 'auto'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <small style={{ color: '#666' }}>
                  Accepted file types: PDF, Word, Excel, images, etc. Max size: 10MB
                </small>
              </div>
            </div>
            
            <button 
              type="submit" 
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
              disabled={fileUploading}
            >
              {fileUploading ? 'Uploading...' : 'Post Announcement'}
            </button>
          </form>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '30px',
          color: '#666'
        }}>
          Loading announcements...
        </div>
      )}
      
      {/* No announcements message */}
      {!loading && announcements.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '6px',
          color: '#666',
          border: '1px dashed #ddd'
        }}>
          No announcements yet.
        </div>
      )}
      
      {/* Announcements List - Newest First */}
      {!loading && announcements.length > 0 && (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {announcements.map(announcement => (
            <div 
              key={announcement.id} 
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #eee'
              }}
            >
              {/* Edit Form - Shown when editing this announcement */}
              {canManageAnnouncements && editingAnnouncement === announcement.id ? (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ 
                    marginTop: '0', 
                    marginBottom: '15px',
                    fontSize: '1.2rem',
                    color: '#444' 
                  }}>Edit Announcement</h4>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontWeight: '500',
                      color: '#555'
                    }}>
                      Title
                    </label>
                    <input 
                      type="text" 
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontWeight: '500',
                      color: '#555'
                    }}>
                      Content
                    </label>
                    <textarea 
                      name="content"
                      value={editFormData.content}
                      onChange={handleEditInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      rows="4"
                      required
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontWeight: '500',
                      color: '#555'
                    }}>
                      Link (optional)
                    </label>
                    <input 
                      type="url" 
                      name="link"
                      value={editFormData.link}
                      onChange={handleEditInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontWeight: '500',
                      color: '#555'
                    }}>
                      Link Text (optional)
                    </label>
                    <input 
                      type="text" 
                      name="linkText"
                      value={editFormData.linkText}
                      onChange={handleEditInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontWeight: '500',
                      color: '#555'
                    }}>
                      Attachment (optional)
                    </label>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {/* Show existing file if one exists */}
                      {editFormData.fileName && !editFile && (
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          backgroundColor: '#f0f7ff',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}>
                          <span>{getFileIcon(editFormData.fileType)} {editFormData.fileName}</span>
                          <button 
                            type="button" 
                            onClick={handleClearEditFile}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              marginLeft: 'auto'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      
                      {/* File input for selecting a new file */}
                      {!editFormData.fileName || editFile ? (
                        <>
                          <input 
                            type="file" 
                            onChange={handleEditFileChange}
                            ref={editFileInputRef}
                            style={{
                              padding: '8px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px'
                            }}
                          />
                          {/* Show selected file info if a new file is selected */}
                          {editFile && (
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              backgroundColor: '#f0f7ff',
                              borderRadius: '4px',
                              fontSize: '0.9rem'
                            }}>
                              <span>{editFile.name} ({(editFile.size / 1024).toFixed(2)} KB)</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setEditFile(null);
                                  if (editFileInputRef.current) {
                                    editFileInputRef.current.value = '';
                                  }
                                  }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc3545',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  marginLeft: 'auto'
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </>
                      ) : null}
                      <small style={{ color: '#666' }}>
                        Accepted file types: PDF, Word, Excel, images, etc. Max size: 10MB
                      </small>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button 
                      onClick={() => handleSaveEdit(announcement.id)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        flex: '1',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      disabled={fileUploading}
                    >
                      {fileUploading ? 'Uploading...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Regular announcement view (not editing)
                <>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '10px',
                    borderBottom: '1px solid #f0f0f0',
                    paddingBottom: '10px'
                  }}>
                    <h4 style={{ 
                      margin: '0',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {announcement.title}
                    </h4>
                    <span style={{ 
                      fontSize: '0.9rem',
                      color: '#888',
                      marginLeft: '10px'
                    }}>
                      {formatDate(announcement.created_at)}
                    </span>
                  </div>
                  
                  <div style={{
                    marginBottom: '15px',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    color: '#444',
                    whiteSpace: 'pre-line'
                  }}>
                    {announcement.content}
                  </div>
                  
                  {/* Display file attachment if it exists */}
                  {announcement.file_path && renderFileAttachment(announcement)}
                  {/* Display link if it exists */}
                  {announcement.link && (
                    <div style={{ marginBottom: '10px' }}>
                      <a 
                        href={announcement.link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#0066cc',
                          textDecoration: 'none',
                          fontWeight: '500',
                          display: 'inline-block',
                          padding: '5px 10px',
                          backgroundColor: '#f0f7ff',
                          borderRadius: '4px'
                        }}
                      >
                        {announcement.link_text || 'View Link'}
                      </a>
                    </div>
                  )}
                  
                  {canManageAnnouncements && (
                    <div style={{ 
                      marginTop: '10px',
                      textAlign: 'right',
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: '10px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px'
                    }}>
                      <button
                        onClick={() => handleStartEdit(announcement)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0066cc',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: '5px 10px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: '5px 10px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsComponent;
