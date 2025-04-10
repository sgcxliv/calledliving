import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MessageComponent({ message, currentUserId, onDelete, senderName }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isOwnMessage = message.sender_id === currentUserId;
  const hasAudio = Boolean(message.audio_url);
  const hasText = Boolean(message.text_content || message.caption);
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', message.id);
      
      if (error) throw error;
      
      // If message had an audio file, delete it from storage
      if (message.file_path) {
        const { error: storageError } = await supabase.storage
          .from('audio-messages')
          .remove([message.file_path]);
        
        if (storageError) {
          console.error('Error deleting audio file:', storageError);
        }
      }
      
      // Call parent delete handler
      if (onDelete) {
        onDelete(message.id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  const downloadAudio = async () => {
  if (!message.file_path) return;
  
  try {
    // Generate a proper download URL using the file path
    const { data, error } = await supabase.storage
      .from('audio-messages')  // This is your bucket name - correct
      .createSignedUrl(message.file_path, 60); // Valid for 60 seconds
    
    if (error) {
      console.error('Error generating download URL:', error);
      alert('Unable to download file: ' + error.message);
      return;
    }
    
    // Create temporary link element with the valid signed URL
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = message.file_path.split('/').pop() || 'audio-message.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Download error:', err);
    alert('Error downloading file');
  }
};
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className={`message-container ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <div className="message-sender">
        {isOwnMessage ? 'You' : senderName || 'Other'}
      </div>
      
      <div className="message-bubble">
        {hasAudio && (
          <div className="audio-message">
            <div className="audio-controls">
              <audio 
                controls 
                src={message.audio_url} 
                className="audio-player"
              >
                Your browser does not support the audio element.
              </audio>
              
              <button 
                onClick={downloadAudio}
                className="download-btn"
                title="Download audio"
              >
                Download
              </button>
            </div>
            
            {message.duration && (
              <div className="audio-duration">
                Duration: {Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        )}
        
        {hasText && (
          <div className="message-text">
            {message.text_content || message.caption}
          </div>
        )}
        
        <div className="message-timestamp">
          {formatTimestamp(message.created_at)}
        </div>
      </div>
      
      {isOwnMessage && (
        <div className="message-actions">
          {showDeleteConfirm ? (
            <div className="delete-confirmation">
              <button 
                className="confirm-btn"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button 
                className="cancel-btn"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="delete-btn"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
