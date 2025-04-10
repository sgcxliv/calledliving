import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioUploader from './AudioUploader';
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
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('role', 'student');
      
      if (studentsError) throw studentsError;
      
      if (studentsData?.length > 0) {
        const studentsWithMessages = await Promise.all(studentsData.map(async (student) => {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${student.id},receiver_id.eq.${student.id}`)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(1);
          
          const profile = userProfiles.find(p => p.user_id === student.id);
          
          return {
            ...student,
            lastMessage: messagesData?.[0] || null,
            profile_picture_url: profile?.profile_picture_url
          };
        }));
        
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
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  };

  const handleMessageSent = () => {
    if (selectedStudent) loadMessages(selectedStudent.id);
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
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getMessagePreview = (message) => {
    if (!message) return '';
    if (message.text_content) {
      return message.text_content.slice(0, 30) + (message.text_content.length > 30 ? '...' : '');
    } else if (message.caption) {
      return message.caption.slice(0, 30) + (message.caption.length > 30 ? '...' : '');
    } else if (message.audio_url) {
      return '🎵 Audio message';
    }
    return '';
  };

  if (selectedStudent && activeTab === 'messages') {
    return (
      <div className="professor-view-container">
        <button className="back-btn" onClick={() => setSelectedStudent(null)}>
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
                <p>Upload an audio file or send a text message below.</p>
              </div>
            ) : (
              messages.map(message => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  currentUserId={user.id}
                  onDelete={handleDeleteMessage}
                  senderName={message.sender_id === user.id ? 'You' : selectedStudent.name}
                />
              ))
            )}
          </div>
          
          <AudioUploader
            userId={user.id}
            receiverId={selectedStudent.id}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="professor-view-container">
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
          <p className="messaging-instructions">
            Click on a student to view and exchange messages
          </p>
          
          {loading ? (
            <div className="loading-spinner">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="empty-state">No students found</div>
          ) : (
            <div className="student-cards">
              {students.map(student => (
                <div 
                  key={student.id}
                  className={`student-card ${student.lastMessage?.sender_id === student.id ? 'unread' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="student-avatar">
                    <img 
                      src={student.profile_picture_url || '/images/default-avatar.png'} 
                      alt={student.name}
                      onError={(e) => {e.target.src = '/images/default-avatar.png'}}
                    />
                  </div>
                  <div className="student-info">
                    <h4>{student.name}</h4>
                    <p className="last-message-preview">
                      {getMessagePreview(student.lastMessage)}
                    </p>
                  </div>
                  <div className="message-time">
                    {formatLastMessageTime(student.lastMessage?.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'profile' && <UserDashboard user={user} />}
    </div>
  );
}
