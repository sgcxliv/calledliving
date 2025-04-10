import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MessageComponent({ message, currentUserId, onDelete, senderName, userProfiles }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  
  const isOwnMessage = message.sender_id === currentUserId;
  const hasAudio = Boolean(message.audio_url);
  const hasText = Boolean(message.text_content || message.caption);
  const hasTranscription = Boolean(message.transcription);
  
  // Find sender's profile to get profile picture
  const senderProfile = userProfiles?.find(profile => profile.user_id === message.sender_id);
  const profilePicUrl = senderProfile?.profile_picture_url || '/images/default-avatar.png';
  
  useEffect(() => {
    // Reset audio player state when the message changes
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(false);
    
    if (hasAudio && audioRef.current) {
      const audio = audioRef.current;
      
      // Set up audio event listeners
      const onLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const onTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      const onError = (e) => {
        console.error('Audio playback error:', e);
        setAudioError(true);
      };
      
      // Add event listeners
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      
      // Clean up event listeners on unmount
      return () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
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
    const audio = audioRef.current;
    
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Play the audio and handle any errors
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Playback failed:', error);
            setAudioError(true);
          });
      }
    }
  };
  
  const seekAudio = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const progressBar = progressRef.current;
    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newPosition = (offsetX / rect.width) * duration;
    
    audioRef.current.currentTime = newPosition;
    setCurrentTime(newPosition);
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
  
  const skipForward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const skipBackward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, audioRef.current.currentTime - 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  return (
    <div className={`message-container ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <div className="message-header">
        <div className="sender-info">
          <div className="profile-picture">
            <img 
              src={profilePicUrl} 
              alt={isOwnMessage ? 'You' : senderName || 'User'} 
              onError={(e) => {e.target.src = '/images/default-avatar.png'}}
            />
          </div>
          <span className="sender-name">
            {isOwnMessage ? 'You' : senderName || 'User'}
          </span>
        </div>
        <span className="message-time">{formatTimestamp(message.created_at)}</span>
      </div>
      
      <div className="message-content">
        {hasText && (
          <div className="text-message">
            {message.text_content || message.caption}
          </div>
        )}
        
        {hasAudio && (
          <div className="audio-message">
            {/* Hidden audio element */}
            <audio 
              ref={audioRef}
              src={message.audio_url}
              preload="metadata"
              style={{ display: 'none' }}
            />
            
            {audioError ? (
              <div className="audio-error">
                <p>Audio playback error. Please try downloading the file instead.</p>
                <a 
                  href={message.audio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="download-link"
                >
                  Download Audio
                </a>
              </div>
            ) : (
              <div className="custom-audio-player">
                <div className="player-controls">
                  <button className="control-button back-button" onClick={skipBackward}>
                    -10s
                  </button>
                  
                  <button 
                    className={`control-button play-button ${isPlaying ? 'playing' : ''}`} 
                    onClick={togglePlayback}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  
                  <button className="control-button forward-button" onClick={skipForward}>
                    +10s
                  </button>
                </div>
                
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    ref={progressRef}
                    onClick={seekAudio}
                  >
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="time-display">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {hasTranscription && (
              <div className="transcription-container">
                <button 
                  className="transcription-toggle"
                  onClick={() => setShowTranscription(!showTranscription)}
                >
                  {showTranscription ? 'Hide' : 'Show'} Transcription
                </button>
                
                {showTranscription && (
                  <div className="transcription-text">
                    {message.transcription}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
