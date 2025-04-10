import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MessageComponent({ message, currentUserId, onDelete, senderName }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const isOwnMessage = message.sender_id === currentUserId;
  const hasAudio = Boolean(message.audio_url);
  const hasText = Boolean(message.text_content || message.caption);
  
  // This useEffect ensures audio elements properly initialize
  useEffect(() => {
    if (hasAudio && audioRef.current) {
      // Force reload of audio source to ensure it's properly loaded
      audioRef.current.load();
      
      // Add error handling for audio playback issues
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
      });
      
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
      };
      
      const handlePause = () => {
        setIsPlaying(false);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      // Add event listeners
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      // Clean up event listeners
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [hasAudio, message.audio_url]);
  
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
  
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Try to play and handle any errors
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };
  
  const handleProgressBarClick = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newPosition = (offsetX / rect.width) * duration;
    
    audioRef.current.currentTime = newPosition;
  };
  
  const downloadAudio = () => {
    if (!message.audio_url) return;
    
    // Create temporary link element
    const a = document.createElement('a');
    a.href = message.audio_url;
    a.download = message.file_path || 'audio-message.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
              ref={audioRef}
              controls 
              src={message.audio_url} 
              className="audio-player"
              preload="metadata"
            >
              <source src={message.audio_url} type="audio/mpeg" />
              <source src={message.audio_url} type="audio/webm" />
              <source src={message.audio_url} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
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
