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
            .order('created_at', { ascending: fa
