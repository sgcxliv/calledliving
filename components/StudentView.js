import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioRecorder from './AudioRecorder';
import MessageComponent from './MessageComponent';

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
    try {
      // Remove from local state immediately for better UX
      setMessages(messages.filter(m => m.id !== messageId));
      
      // MessageComponent now handles the actual deletion logic
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  };

  if (loading) return <div className="loading-container">Loading conversations...</div>;

  return (
    <div>
      <div className="messaging-container">
        <div className="messaging-header">
          <h3>Audio Messages with Professor {professor?.name || 'Abbasi'}</h3>
        </div>
        
        <div className="messaging-body">
          {messages.length === 0 ? (
            <div className="empty-messages">
              <div className="empty-icon">💬</div>
              <p>No messages yet. Start the conversation!</p>
              <p>Record an audio message or send a text message below.</p>
            </div>
          ) : (
            messages.map(message => (
              <MessageComponent
                key={message.id}
                message={message}
                currentUserId={user.id}
                onDelete={handleDeleteMessage}
                senderName={message.sender_id === user.id ? 'You' : `Professor ${professor?.name || 'Abbasi'}`}
              />
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
