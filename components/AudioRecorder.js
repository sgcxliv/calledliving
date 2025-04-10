import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ImprovedAudioRecorder({ userId, receiverId, onMessageSent }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [message, setMessage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Revoke any object URLs to prevent memory leaks
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, audioUrl]);

  const startRecording = async () => {
    try {
      // Reset states
      setAudioBlob(null);
      setAudioUrl('');
      setIsPreviewMode(false);
      setRecordingTime(0);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a MediaRecorder with a widely supported format
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm' 
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const chunks = audioChunksRef.current;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsPreviewMode(true);
        
        console.log('Recording completed:', {
          format: mediaRecorder.mimeType,
          size: `${(blob.size / 1024).toFixed(2)} KB`,
          duration: `${recordingTime} seconds`
        });
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setMessage('Recording...');
      
      // Clear any existing timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Start timer
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Automatically stop after 5 minutes
        if (seconds >= 300) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMessage(`Error: ${error.message || 'Could not access microphone'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // First stop the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Then stop the recording
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setMessage('Recording stopped - preview your message below');
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl('');
    setIsPreviewMode(false);
    setCaption('');
    setRecordingTime(0);
    setMessage('');
    
    // Revoke the object URL to free up memory
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const uploadAudio = async (blob) => {
    if (!blob || !receiverId) {
      setMessage('Error: Missing audio data or receiver ID');
      return;
    }
    
    setIsUploading(true);
    setMessage('Sending message...');
    
    try {
      // Generate unique filename
      const timestamp = new Date().getTime();
      const filename = `${userId}_${timestamp}.webm`;
      
      console.log(`Uploading file: ${filename} (audio/webm)`);
      
      // Convert Blob to File for better compatibility
      const file = new File([blob], filename, { type: 'audio/webm' });
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('audio-messages')
        .upload(`public/${filename}`, file, {
          contentType: 'audio/webm', // Explicitly set content type
          cacheControl: '3600' // Optional: Set cache control
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Storage error: ${error.message}`);
      }
      
      console.log('File uploaded successfully');
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('audio-messages')
        .getPublicUrl(`public/${filename}`);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      console.log('Got public URL:', urlData.publicUrl);
      
      // Save message to database
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: userId,
            receiver_id: receiverId,
            file_path: filename,
            audio_url: urlData.publicUrl,
            caption: caption.trim() || null,
            duration: recordingTime
          }
        ]);
      
      if (msgError) {
        console.error('Database error:', msgError);
        throw new Error(`Database error: ${msgError.message}`);
      }
      
      console.log('Message saved to database');
      
      // Clear the audio state after successful upload
      setAudioBlob(null);
      setAudioUrl('');
      setIsPreviewMode(false);
      setCaption('');
      setRecordingTime(0);
      setMessage('Message sent successfully!');
      
      // Revoke the object URL to free up memory
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(`Error: ${error.message || 'Failed to send message'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's an audio file
    if (!file.type.match('audio.*')) {
      setMessage('Please upload an audio file');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage('File size exceeds 10MB limit. Please keep recordings under 5 minutes.');
      return;
    }
    
    try {
      // Create a blob URL for the file so we can preview it
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
      setIsPreviewMode(true);
      setMessage('Audio file loaded - preview your message below');
      
      // Get the duration of the audio file
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.round(audio.duration);
        setRecordingTime(duration);
      });
    } catch (error) {
      console.error('Error processing audio file:', error);
      setMessage(`Error: ${error.message || 'Could not process audio file'}`);
    }
    
    // Reset the file input
    e.target.value = '';
  };

  const handleSendMessage = () => {
    if (audioBlob) {
      uploadAudio(audioBlob);
    } else {
      setMessage('No audio recorded or selected');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCaptionChange = (e) => {
    // Limit caption to 100 characters
    const text = e.target.value.slice(0, 100);
    setCaption(text);
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
      const { data, error } = await supabase
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
      
      {isPreviewMode ? (
        // Preview mode (after recording or file selection)
        <div className="audio-preview">
          <audio 
            controls 
            src={audioUrl}
            className="audio-player"
          ></audio>
          
          <div className="preview-actions">
            <input
              type="text"
              placeholder="Add a caption (optional, max 100 chars)"
              value={caption}
              onChange={handleCaptionChange}
              maxLength={100}
              className="caption-input"
            />
            <div className="chars-count">{caption.length}/100</div>
            
            <div className="button-group">
              <button
                className="cancel-btn"
                onClick={cancelRecording}
                disabled={isUploading}
              >
                Cancel
              </button>
              
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isUploading}
              >
                {isUploading ? 'Sending...' : 'Send Audio'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Recording/Upload mode
        <div className="audio-controls">
          <div className="control-buttons">
            <button
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isUploading}
            >
              <i className="record-icon">{isRecording ? '⏹️' : '🎤'}</i>
              <span>{isRecording ? 'Stop' : 'Record'}</span>
              {isRecording && <span className="recording-time">{formatTime(recordingTime)}</span>}
            </button>
            
            <div className="upload-container">
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={isRecording || isUploading}
              >
                <i className="upload-icon">📎</i>
                <span>Upload</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          
          <div className="text-message-controls">
            <input
              type="text"
              placeholder="Send a text message (max 100 chars)"
              value={caption}
              onChange={handleCaptionChange}
              maxLength={100}
              className="text-message-input"
              disabled={isRecording || isUploading}
            />
            <span className="chars-count">{caption.length}/100</span>
            <button
              className="text-send-btn"
              onClick={handleTextMessageSend}
              disabled={!caption.trim() || isRecording || isUploading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
