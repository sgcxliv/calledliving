import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioRecorder from './AudioRecorder';
import AnnouncementsComponent from './AnnouncementsComponent';

export default function ProfessorView({ user }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'announcements'

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadMessages(selectedStudent.id);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          messages!sender_id(count)
        `)
        .eq('role', 'student');
      
      if (error) throw error;
      setStudents(data || []);
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
      
      // Mark messages as read (implement this feature later)
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

  // If in student chat mode and a student is selected, show the chat
  if (activeTab === 'students' && selectedStudent) {
    return (
      <div>
        <div className="professor-tabs">
          <button
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Student Messages
          </button>
          <button
            className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('announcements');
              setSelectedStudent(null);
            }}
          >
            Manage Announcements
          </button>
        </div>

        <button
          className="back-btn"
          onClick={() => setSelectedStudent(null)}
        >
          Back to Student List
        </button>
        
        <div className="messaging-container">
          <div className="messaging-header">
            <h3>Audio Messages with {selectedStudent.name}</h3>
          </div>
          
          <div className="messaging-body">
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No messages yet with this student.</p>
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
                      {message.sender_id === user.id ? 'You' : selectedStudent.name}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <AudioRecorder
            userId={user.id}
            receiverId={selectedStudent.id}
            onMessageSent={() => loadMessages(selectedStudent.id)}
          />
        </div>
      </div>
    );
  }

  // Show student list (default view)
  return (
    <div>
      <div className="professor-tabs">
        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Student Messages
        </button>
        <button
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Manage Announcements
        </button>
      </div>

      <div className="student-list">
        <h3>Student Messages</h3>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading students...</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No students enrolled yet.</p>
        ) : (
          students.map(student => (
            <div
              key={student.id}
              className="student-item"
              onClick={() => setSelectedStudent(student)}
            >
              <span className="student-name">{student.name}</span>
              {student.messages && student.messages.length > 0 && (
                <span className="new-message-indicator">
                  {student.messages.length}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
