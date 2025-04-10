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
          .remove([`public/${message.file_path}`]);
        
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
            <audio 
              controls 
              src={message.audio_url} 
              className="audio-player" 
              preload="none"
            ></audio>
          </div>
        )}
        
        {hasText && (
          <div className="text-content">
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
