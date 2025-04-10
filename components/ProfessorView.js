import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioRecorder from './AudioRecorder';
import MessageComponent from './MessageComponent';
import UserDashboard from './UserDashboard';

export default function ProfessorView({ user }) {
  const [activeTab, setActiveTab] = useState('messages');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState([]);

  useEffect(() => {
    if (user) {
      loadStudents();
      fetchUserProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      loadMessages(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchUserProfiles = async () => {
    try {
      // Fetch all user profiles to get profile pictures
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, profile_picture_url');
      
      if (error) throw error;
      
      setUserProfiles(data || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      // Get all students with their most recent message time
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role
        `)
        .eq('role', 'student');
      
      if (studentsError) throw studentsError;
      
      if (studentsData && studentsData.length > 0) {
        // Get the unread message count for each student
        const studentsWithMessages = await Promise.all(studentsData.map(async (student) => {
          // Get the most recent message for this student
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${student.id},receiver_id.eq.${student.id}`)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (messagesError) {
            console.error('Error fetching messages for student:', messagesError);
            return student;
          }
          
          // Find the profile picture for this student
          const profile = userProfiles.find(p => p.user_id === student.id);
          
          return {
            ...student,
            lastMessage: messagesData && messagesData.length > 0 ? messagesData[0] : null,
            profile_picture_url: profile?.profile_picture_url
          };
        }));
        
        // Sort students by their most recent message time (if any)
        studentsWithMessages.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
        });
        
        setStudents(studentsWithMessages);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${studentId},receiver_id.eq.${studentId}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read (could be implemented in future)
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // Remove from local state immediately for better UX
      setMessages(messages.filter(m => m.id !== messageId));
      
      // MessageComponent handles the actual deletion logic
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  };

  const handleMessageSent = () => {
    // Reload messages after sending
    if (selectedStudent) {
      loadMessages(selectedStudent.id);
    }
    
    // Refresh user profiles
    fetchUserProfiles();
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Calculate message preview text
  const getMessagePreview = (message) => {
    if (!message) return '';
    
    if (message.text_content) {
      return message.text_content.slice(0, 30) + (message.text_content.length > 30 ? '...' : '');
    } else if (message.caption) {
      return message.caption.slice(0, 30) + (message.caption.length > 30 ? '...' : '');
    } else if (message.transcription) {
      return message.transcription.slice(0, 30) + (message.transcription.length > 30 ? '...' : '');
    } else if (message.audio_url) {
      return '🎤 Audio message';
    } else {
      return '';
    }
  };

  // If a student is selected and in messages tab, show the chat
  if (selectedStudent && activeTab === 'messages') {
    return (
      <div>
        <button
          className="back-btn"
          onClick={() => setSelectedStudent(null)}
        >
          ← Back to Student List
        </button>
        
        <div className="messaging-container">
          <div className="messaging-header">
            <div className="student-chat-header">
              <div className="profile-picture-small">
                <img 
                  src={selectedStudent.profile_picture_url || '/images/default-avatar.png'}
                  alt={selectedStudent.name}
                  onError={(e) => {e.target.src = '/images/default-avatar.png'}}
                />
              </div>
              <h3>Messages with {selectedStudent.name}</h3>
            </div>
          </div>
          
          <div className="messaging-body">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <div className="empty-icon">💬</div>
                <p>No messages yet with this student.</p>
                <p>Record an audio message or send a text message below.</p>
              </div>
            ) : (
              messages.map(message => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  currentUserId={user.id}
                  onDelete={handleDeleteMessage}
                  senderName={message.sender_id === user.id ? 'You' : selectedStudent.name}
                  userProfiles={userProfiles}
                />
              ))
            )}
          </div>
          
          <AudioRecorder
            userId={user.id}
            receiverId={selectedStudent.id}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="professor-tabs">
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Student Messages
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
      </div>
      
      {activeTab === 'messages' && (
        <div className="student-list">
          <h3>Students</h3>
          {loading ? (
            <div className="loading-container">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="empty-messages">
              <p>No students enrolled yet.</p>
            </div>
          ) : (
            <div className="student-conversations">
              {students.map(student => (
                <div
                  key={student.id}
                  className="student-conversation-item"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="conversation-avatar">
                    <img 
                      src={student.profile_picture_url || '/images/default-avatar.png'}
                      alt={student.name}
                      onError={(e) => {e.target.src = '/images/default-avatar.png'}}
                    />
                  </div>
                  
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <span className="student-name">{student.name}</span>
                      {student.lastMessage && (
                        <span className="last-message-time">
                          {formatLastMessageTime(student.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    
                    <div className="conversation-preview">
                      {student.lastMessage ? (
                        <span className="message-preview">
                          {student.lastMessage.sender_id === user.id ? 'You: ' : ''}
                          {getMessagePreview(student.lastMessage)}
                        </span>
                      ) : (
                        <span className="no-messages">No messages yet</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
