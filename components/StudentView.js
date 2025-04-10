import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioUploader from './AudioUploader';
import MessageComponent from './MessageComponent';
import UserDashboard from './UserDashboard';

export default function StudentView({ user }) {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professor, setProfessor] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfessorAndMessages();
    }
  }, [user]);

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
        
        // Get messages between student and professor
        await loadMessages(professors[0]?.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  };

  const handleMessageSent = () => {
    // Reload messages after sending
    if (professor) {
      loadMessages(professor.id);
    }
  };

  return (
    <div>
      <div className="student-tabs">
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
      </div>
      
      {activeTab === 'messages' && (
        <div className="messaging-container">
          <div className="messaging-header">
            <h3>Messages with Professor {professor?.name || 'Abbasi'}</h3>
            <p className="messaging-instructions">
              Upload audio files to send voice messages or use text chat.
            </p>
          </div>
          
          <div className="messaging-body">
            {loading ? (
              <div className="loading-container">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="empty-messages">
                <div className="empty-icon">💬</div>
                <p>No messages yet. Start the conversation!</p>
                <p>Upload an audio file or send a text message below.</p>
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
          
          <AudioUploader
            userId={user.id}
            receiverId={professor?.id}
            onMessageSent={handleMessageSent}
          />
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div className="profile-container">
          <UserDashboard user={user} />
        </div>
      )}
    </div>
  );
}
