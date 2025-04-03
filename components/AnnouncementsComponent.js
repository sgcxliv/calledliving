import React, { useState, useEffect } from 'react';
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create new announcement
      const newItem = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        link: newAnnouncement.link || null,
        link_text: newAnnouncement.linkText || null,
        professor_id: user.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('announcements')
        .insert([newItem])
        .select();
      
      if (error) throw error;
      
      // Add to the beginning of the array (newest first)
      setAnnouncements([data[0], ...announcements]);
      
      // Reset form
      setNewAnnouncement({
        title: '',
        content: '',
        link: '',
        linkText: ''
      });
      
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
        
        {canManageAnnouncements && (
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
      
      {/* Add Announcement Form - Only visible to professors/CDAs */}
      {canManageAnnouncements && showForm && (
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
            
            <div style={{ marginBottom: '20px' }}>
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
                transition: 'background-color 0.2s'
              }}
            >
              Post Announcement
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
                  paddingTop: '10px'
                }}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsComponent;
