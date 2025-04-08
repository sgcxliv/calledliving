import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AudioRecorder from './AudioRecorder';
import MessageComponent from './MessageComponent';

export default function ProfessorView({ user }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      // Remove from local state immediately for better UX
      setMessages(messages.filter(m => m.id !== messageId));
      
      // MessageComponent now handles the actual deletion logic
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  };

  // If a student is selected, show the chat
  if (selectedStudent) {
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
            <h3>Audio Messages with {selectedStudent.name}</h3>
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
                />
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
      <div className="student-list">
        <h3>Student Messages</h3>
        {loading ? (
          <div className="loading-container">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="empty-messages">
            <p>No students enrolled yet.</p>
          </div>
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
