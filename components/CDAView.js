import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioRecorder from './AudioRecorder';

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
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      // Only allow deleting if sender is current user
      const message = messages.find(m => m.id === messageId);
      if (message.sender_id !== user.id) {
        alert("You can only delete messages you've sent.");
        return;
      }
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      
      // Remove from local state
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message. Please try again.');
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
                  <p style={{ textAlign: 'center', color: '#666' }}>No messages yet with the professor.</p>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className="message">
                      <div className="message-time">
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                      <div className="message-content">
                        <audio controls src={message.audio_url}></audio>
                        {message.sender_id === user.id && (
                          <div className="message-actions">
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        <span style={{ fontSize: '12px', display: 'block', marginTop: '5px' }}>
                          {message.sender_id === user.id ? 'You' : 'Professor'}
                        </span>
                      </div>
                    </div>
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
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>No professor found in the system.</p>
          )}
        </div>
      </div>
    </div>
  );
}
