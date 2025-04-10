import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function UserDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);
  
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, profile_picture_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error) {
        if (data) {
          setName(data.name || '');
          setProfileImage(data.profile_picture_url);
        }
      } else {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const uploadProfilePicture = async (event) => {
    try {
      setUploading(true);
      
      const file = event.target.files[0];
      if (!file) return;
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please upload an image file');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size exceeds 5MB limit');
        return;
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      // Update user profile with the new image URL
      await updateProfile({ profile_picture_url: urlData.publicUrl });
      
      setProfileImage(urlData.publicUrl);
      setMessage('Profile picture updated successfully');
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage(`Error: ${error.message || 'Failed to upload image'}`);
    } finally {
      setUploading(false);
    }
  };
  
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert([{ 
            user_id: user.id,
            ...updates 
          }]);
        
        if (error) throw error;
      }
      
      setMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(`Error: ${error.message || 'Failed to update profile'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name });
      setMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage(`Error: ${error.message || 'Failed to save profile'}`);
    }
  };
  
  return (
    <div className="user-dashboard">
      <h2>User Profile</h2>
      
      {message && (
        <div className={`message-status ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className="profile-section">
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="profile-picture"
                onError={(e) => {e.target.src = '/images/default-avatar.png'}}
              />
            ) : (
              <div className="profile-picture-placeholder">
                {name ? name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
              </div>
            )}
          </div>
          
          <div className="profile-picture-actions">
            <button 
              className="upload-picture-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading || loading}
            >
              {uploading ? 'Uploading...' : 'Upload Picture'}
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={uploadProfilePicture}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {profileImage && (
              <button 
                className="remove-picture-btn"
                onClick={() => {
                  setProfileImage(null);
                  updateProfile({ profile_picture_url: null });
                }}
                disabled={uploading || loading}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        
        <div className="profile-info-section">
          <div className="form-group">
            <label htmlFor="name">Display Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className="form-control"
              disabled={loading}
            />
          </div>
          
          <button
            className="save-profile-btn"
            onClick={handleSaveProfile}
            disabled={loading || uploading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
