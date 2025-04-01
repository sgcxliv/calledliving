import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioRecorder from './AudioRecorder';

export default function StudentView({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professor, setProfessor] = useState(null);

  useEffect(() => {
    const fetchProfessorAndMessages = async () => {
      setLoading(true);
      try {
        // Find professor
        const { data: professors, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'professor')
          .limit(1);
        
        if (profError) throw profError;
        if (professors && professors.length > 0) {
          setProfessor(professors[0]);
        }
        
        // Get messages between student and professor
        await loadMessages(professors[0]?.id);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfessorAndMessages();
    }
  }, [user]);

  const loadMessages = async (professorId) => {
    if (!professorId || !user) return;
    
    try {
      // Get all messages between user and professor
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${professorId},receiver_id.eq.${professorId}`)
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="messaging-container">
        <div className="messaging-header">
          <h3>Audio Messages with Professor {professor?.name || 'Abbasi'}</h3>
        </div>
        
        <div className="messaging-body">
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No messages yet. Start the conversation!</p>
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
                    {message.sender_id === user.id ? 'You' : `Professor ${professor?.name || 'Abbasi'}`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <AudioRecorder
          userId={user.id}
          receiverId={professor?.id}
          onMessageSent={() => loadMessages(professor?.id)}
        />
      </div>
    </div>
  );
}
