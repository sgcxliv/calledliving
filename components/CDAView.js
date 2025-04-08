import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioRecorder from './AudioRecorder';
import MessageComponent from './MessageComponent';

export default function CDAView({ user }) {
  const [professor, setProfessor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessor();
  }, []);

  useEffect(() => {
    if (professor) {
      loadMessages();
    }
  }, [professor]);

  const loadProfessor = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professor')
        .limit(1)
        .single();
      
      if (error) throw error;
      setProfessor(data);
    } catch (error) {
      console.error('Error loading professor:', error);
      // Handle case where no professor is found
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${professor.id},receiver_id.eq.${professor.id}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // Remove from local state immediately for better UX
      setMessages(messages.filter(m => m.id !== messageId));
      
      // MessageComponent now handles the actual deletion logic
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  };

  return (
    <div>
      <div className="cda-dashboard">
        <div className="messaging-container">
          <div className="messaging-header">
            <h3>Audio Messages with Professor</h3>
            {!professor && <p>Loading professor information...</p>}
          </div>
          
          {professor ? (
            <>
              <div className="messaging-body">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <div className="empty-icon">💬</div>
                    <p>No messages yet with the professor.</p>
                    <p>Record an audio message or send a text message below.</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <MessageComponent
                      key={message.id}
                      message={message}
                      currentUserId={user.id}
                      onDelete={handleDeleteMessage}
                      senderName={message.sender_id === user.id ? 'You' : 'Professor'}
                    />
                  ))
                )}
              </div>
              
              <AudioRecorder
                userId={user.id}
                receiverId={professor.id}
                onMessageSent={loadMessages}
              />
            </>
          ) : loading ? (
            <div className="loading-container">Loading...</div>
          ) : (
            <div className="error-container">
              <p>No professor found in the system.</p>
              <p>Please contact an administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
