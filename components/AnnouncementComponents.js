import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AnnouncementsComponent = ({ user, isProfessor }) => {
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

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Announcements</h3>
        {isProfessor && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Announcement'}
          </button>
        )}
      </div>
      
      {/* Add Announcement Form - Only visible to professors */}
      {isProfessor && showForm && (
        <div className="bg-gray-100 p-4 mb-6 rounded shadow">
          <h4 className="text-lg font-semibold mb-3">New Announcement</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block mb-1">Title</label>
              <input 
                type="text" 
                name="title"
                value={newAnnouncement.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Content</label>
              <textarea 
                name="content"
                value={newAnnouncement.content}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Link (optional)</label>
              <input 
                type="url" 
                name="link"
                value={newAnnouncement.link}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Link Text (optional)</label>
              <input 
                type="text" 
                name="linkText"
                value={newAnnouncement.linkText}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <button 
              type="submit" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Post Announcement
            </button>
          </form>
        </div>
      )}
      
      {/* Announcements List - Newest First */}
      {!loading && announcements.length === 0 ? (
        <p className="text-center py-4 text-gray-500">No announcements yet.</p>
      ) : (
        announcements.map(announcement => (
          <div 
            key={announcement.id} 
            className="bg-white p-4 rounded shadow mb-4"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-semibold mt-0">{announcement.title}</h4>
              <span className="text-sm text-gray-500">
                {new Date(announcement.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="my-2">{announcement.content}</p>
            {announcement.link && (
              <a 
                href={announcement.link} 
                className="text-blue-600 hover:underline"
              >
                {announcement.link_text || announcement.link}
              </a>
            )}
            {isProfessor && (
              <div className="mt-2 text-right">
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AnnouncementsComponent;
};

export default AnnouncementsComponent;