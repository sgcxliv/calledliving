import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AudioUploader({ userId, receiverId, onMessageSent }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check if it's an audio file
    if (!selectedFile.type.startsWith('audio/')) {
      setMessage('Please upload an audio file (MP3, WAV, etc.)');
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setMessage('File size exceeds 10MB limit.');
      return;
    }
    
    setFile(selectedFile);
    // Don't set message here to avoid displaying filename twice
  };
  
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMessage('');
  };
  
  const uploadAudio = async () => {
    if (!file || !receiverId) {
      setMessage('Please select an audio file first');
      return;
    }
    
    setIsUploading(true);
    setMessage('Uploading your audio...');
    
    try {
      // Generate unique filename
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filename = `${userId}_${timestamp}.${fileExt}`;
      const filePath = `${userId}/${filename}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio-messages')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Use your existing URL method
      const { data: urlData } = supabase.storage
        .from('audio-messages')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      // Save message to database
      const { error: msgError } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: userId,
            receiver_id: receiverId,
            file_path: filePath,
            audio_url: urlData.publicUrl,
            message_type: 'audio',
            file_type: file.type,
            file_name: file.name
          }
        ]);
      
      if (msgError) {
        throw msgError;
      }
      
      // Success!
      setMessage('Audio message sent successfully!');
      setFile(null);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setMessage(`Error: ${error.message || 'Failed to upload audio'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="messaging-composer">
      {message && (
        <div className={`message-status ${message.includes('Error') ? 'error' : ''}`}>
          {message}
        </div>
      )}
      
      <div className="audio-upload-container">
        {file ? (
          // Show selected file in blue at the top
          <div className="selected-file-header">
            <div className="selected-file-name">
              Selected file: {file.name}
            </div>
            <button 
              className="remove-file-btn"
              onClick={clearFile}
              disabled={isUploading}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-instruction">
            Upload audio files to send voice messages
          </div>
        )}
        
        <div className="audio-controls">
          <button 
            className="select-audio-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
          >
            Select Audio File
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            style={{ display: 'none' }}
          />
          
          {file && (
            <button 
              className="send-btn"
              onClick={uploadAudio}
              disabled={isUploading}
            >
              {isUploading ? 'Sending...' : 'Send'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
