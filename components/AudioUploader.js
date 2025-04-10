import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AudioUploader({ userId, receiverId, onMessageSent }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
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
    setMessage(`Selected file: ${selectedFile.name}`);
  };
  
  const handleCaptionChange = (e) => {
    // Limit caption to 100 characters
    const text = e.target.value.slice(0, 100);
    setCaption(text);
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
      
      // Get public URL
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
            caption: caption,
            file_type: file.type,
            file_name: file.name
          }
        ]);
      
      if (msgError) {
        throw msgError;
      }
      
      // Success!
      setMessage('Audio message uploaded successfully!');
      setFile(null);
      setCaption('');
      
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
  
  const handleTextMessageSend = async () => {
    if (!caption.trim() || !receiverId) {
      setMessage('Please enter a message');
      return;
    }
    
    setIsUploading(true);
    setMessage('Sending message...');
    
    try {
      // Save text message to database
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: userId,
            receiver_id: receiverId,
            text_content: caption.trim(),
            message_type: 'text'
          }
        ]);
      
      if (error) throw error;
      
      setCaption('');
      setMessage('Message sent successfully!');
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending text message:', error);
      setMessage(`Error: ${error.message || 'Failed to send message'}`);
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
      
      <div className="file-upload-area">
        <button 
          className="upload-btn"
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
          <div className="selected-file">
            <span>{file.name}</span>
            <button 
              className="send-audio-btn"
              onClick={uploadAudio}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Send Audio'}
            </button>
          </div>
        )}
      </div>
      
      <div className="text-message-controls">
        <input
          type="text"
          placeholder="Send a text message (max 100 chars)"
          value={caption}
          onChange={handleCaptionChange}
          maxLength={100}
          className="text-message-input"
          disabled={isUploading}
        />
        <span className="chars-count">{caption.length}/100</span>
        <button
          className="text-send-btn"
          onClick={handleTextMessageSend}
          disabled={!caption.trim() || isUploading}
        >
          Send
        </button>
      </div>
    </div>
  );
}