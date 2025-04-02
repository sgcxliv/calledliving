import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AudioRecorder({ userId, receiverId, onMessageSent }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        await uploadAudio(audioBlob);
        setAudioChunks(chunks);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Automatically stop after 8 minutes
        if (seconds >= 480) {
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const uploadAudio = async (audioBlob) => {
    try {
      // Generate unique filename
      const filename = `${userId}_${new Date().getTime()}.mp3`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('audio-messages')
        .upload(`public/${filename}`, audioBlob);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('audio-messages')
        .getPublicUrl(`public/${filename}`);
      
      // Save message to database
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: userId,
            receiver_id: receiverId,
            file_path: filename,
            audio_url: urlData.publicUrl
          }
        ]);
      
      if (msgError) throw msgError;
      
      if (onMessageSent) {
        onMessageSent();
      }
      
      alert('Audio message sent successfully!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's an audio file
    if (!file.type.match('audio.*')) {
      alert('Please upload an audio file.');
      return;
    }
    
    // Check file size (max 10MB - approx 8 min of audio)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please keep recordings under 8 minutes.');
      return;
    }
    
    await uploadAudio(file);
    e.target.value = '';
  };

  const handleUploadClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };

  return (
    <div className="messaging-footer">
      <div className="audio-controls">
        <button
          className="audio-btn"
          onClick={toggleRecording}
        >
          <i>{isRecording ? '⏹️' : '🎤'}</i>
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>(max 8 min)</span>
        </button>
        
        <button
          className="audio-btn"
          onClick={handleUploadClick}
        >
          <i>📎</i> Upload Audio
        </button>
        
        {/* Hidden file input - controlled by the Upload Audio button */}
        <input
          type="file"
          ref={fileInputRef}
          id="audio-upload"
          className="audio-upload"
          accept="audio/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }} // Hide this input element
        />
        
        {isRecording && (
          <span className="recording-indicator">
            Recording... <span>{formatTime(recordingTime)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
