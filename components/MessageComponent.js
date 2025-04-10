import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MessageComponent({ message, currentUserId, onDelete, senderName }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const isOwnMessage = message.sender_id === currentUserId;
  const hasAudio = Boolean(message.audio_url);
  const hasText = Boolean(message.text_content || message.caption);
  
  // Initialize audio player and handle errors
  useEffect(() => {
    if (hasAudio && audioRef.current) {
      setAudioError(null);
      
      const audio = audioRef.current;
      
      // Force reload of audio source
      audio.load();
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        console.log("Audio metadata loaded:", {
          duration: audio.duration,
          src: audio.src
        });
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        console.log("Audio playback started");
      };
      
      const handlePause = () => {
        setIsPlaying(false);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      // Improved error handling with detailed logging
      const handleError = (e) => {
        console.error('Audio playback error:', e);
        
        // Get detailed error information
        if (audio.error) {
          console.error('Audio element error code:', audio.error.code);
          console.error('Audio element error message:', audio.error.message);
          
          let errorMessage = "Error playing audio";
          switch(audio.error.code) {
            case 1: 
              errorMessage = "Audio fetching aborted"; 
              break;
            case 2: 
              errorMessage = "Network error while loading audio"; 
              break;
            case 3: 
              errorMessage = "Audio format not supported"; 
              break;
            case 4: 
              errorMessage = "Audio source not accessible"; 
              break;
            default: 
              errorMessage = `Error: ${audio.error.message || "unknown issue"}`;
          }
          setAudioError(errorMessage);
        }
      };
      
      // Add event listeners
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      // Clean up event listeners
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
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
        // Fix the path - this should match how files are stored
        let filePath = message.file_path;
        
        // If file_path doesn't include "public/" but should (check your storage structure)
        if (!filePath.includes('/') && message.audio_url.includes('public/')) {
          filePath = `public/${filePath}`;
        }
        
        // If file_path doesn't include user ID but should (check your storage structure)
        if (message.audio_url.includes(`${message.sender_id}/`) && !filePath.includes(`${message.sender_id}/`)) {
          filePath = `${message.sender_id}/${filePath}`;
        }
        
        console.log("Deleting audio file:", filePath);
        
        const { error: storageError } = await supabase.storage
          .from('audio-messages')
          .remove([filePath]);
        
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
      // Reset any previous errors
      setAudioError(null);
      
      // Try to play and handle any errors
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          setAudioError("Couldn't play audio. Try downloading instead.");
        });
      }
    }
  };
  
  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
  };
  
  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration || 0, 
      audioRef.current.currentTime + 5
    );
  };
  
  const handleProgressBarClick = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newPosition = (offsetX / rect.width) * (audioRef.current.duration || 0);
    
    audioRef.current.currentTime = newPosition;
  };
  
  // Improved download method that works directly with Supabase storage
  const downloadAudio = async () => {
    if (!message.audio_url) return;
    
    setIsDownloading(true);
    setAudioError(null);
    
    try {
      let filePath = message.file_path;
      
      // Make sure we have the correct path format
      if (!filePath.includes('/') && message.audio_url.includes('public/')) {
        filePath = `public/${filePath}`;
      }
      
      // If file_path doesn't include user ID but should
      if (message.audio_url.includes(`${message.sender_id}/`) && !filePath.includes(`${message.sender_id}/`)) {
        filePath = `${message.sender_id}/${filePath}`;
      }
      
      console.log("Downloading file:", filePath);
      
      // Get the file directly from storage
      const { data, error } = await supabase.storage
        .from('audio-messages')
        .download(filePath);
      
      if (error) {
        console.error("Download error:", error);
        setAudioError(`Download failed: ${error.message}`);
        return;
      }
      
      console.log("File downloaded successfully, size:", data.size);
      
      // Determine file type based on path
      let contentType = 'audio/mpeg';
      if (filePath.endsWith('.webm')) {
        contentType = 'audio/webm';
      } else if (filePath.endsWith('.wav')) {
        contentType = 'audio/wav';
      }
      
      // Create blob and download
      const blob = new Blob([data], { type: contentType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'audio-message';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up blob URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audio:', error);
      setAudioError(`Error: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
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
  
  // Test function to debug audio URLs - can be removed in production
  const debugAudioUrl = () => {
    console.log("Audio URL:", message.audio_url);
    console.log("File path:", message.file_path);
    
    // Try to fetch the URL to see if it's accessible
    fetch(message.audio_url, { method: 'HEAD' })
      .then(response => {
        console.log("URL status:", response.status);
        console.log("Content type:", response.headers.get('content-type'));
      })
      .catch(err => {
        console.error("URL fetch error:", err);
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
            {/* Use a custom audio player UI with separate controls */}
            <div className="custom-audio-player">
              {/* Hidden audio element - this is the actual player */}
              <audio 
                ref={audioRef}
                preload="metadata"
                style={{ display: 'none' }}
              >
                {/* Only use ONE source element for better reliability */}
                <source src={message.audio_url} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
              
              {/* Custom player UI */}
              <div className="player-controls">
                <button 
                  className="skip-back-button"
                  onClick={skipBackward}
                  aria-label="Skip backward 5 seconds"
                  disabled={!duration}
                >
                  ⏪
                </button>
                
                <button 
                  className="play-button"
                  onClick={togglePlayback}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "⏸️" : "▶️"}
                </button>
                
                <button 
                  className="skip-forward-button"
                  onClick={skipForward}
                  aria-label="Skip forward 5 seconds"
                  disabled={!duration}
                >
                  ⏩
                </button>
                
                <button 
                  className="download-button"
                  onClick={downloadAudio}
                  aria-label="Download audio"
                  disabled={isDownloading}
                >
                  {isDownloading ? "⏳" : "⬇️"}
                </button>
              </div>
              
              <div 
                className="progress-bar" 
                ref={progressBarRef}
                onClick={handleProgressBarClick}
              >
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentTime / (duration || 1)) * 100) || 0}%` }}
                ></div>
              </div>
              
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              {audioError && (
                <div className="audio-error">
                  {audioError}
                </div>
              )}
            </div>
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
