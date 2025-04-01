import { useState } from 'react';
import Layout from '../components/Layout';

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState('Calendar');

  const courseSchedule = [
    { week: 1, date: 'April 1st', topic: 'Introductions', assignments: 'Meal & Item Exchange', time: '1:30 - 2:50, Room' },
    { week: 2, date: 'April 3rd', topic: 'Student Life', assignments: 'Bing Nursery Sign-Ups', time: '1:30 - 2:50, Room' },
    { week: 3, date: 'April 8th', topic: 'Family Matters', assignments: 'Upload a Family Photo', time: '1:30 - 2:50, Room' },
    { week: 4, date: 'April 10th', topic: 'Recess', assignments: 'Play!', time: '1:30 - 2:50, Room' },
    { week: 5, date: 'April 15th', topic: 'Making a Living', assignments: 'Interview Clips', time: '1:30 - 2:50, Room' },
    { week: 6, date: 'April 17th', topic: 'Work-Life Balance', assignments: '?', time: '1:30 - 2:50, Room' },
    { week: 6, date: 'April 22nd', topic: 'Nightlife', assignments: 'Signs of Nightlife', time: '1:30 - 2:50, Room' },
    { week: 6, date: 'April 24th', topic: 'Staying Awake', assignments: '?', time: '9:30 - 10:50, Room' }
  ];

  return (
    <Layout>
      <div className="course-dashboard">
        <div className="navbar">
          <a href="/" className={activeTab === 'Main' ? 'active' : ''}>Main</a>
          <a href="/syllabus" className={activeTab === 'Syllabus' ? 'active' : ''}>Syllabus</a>
          <a href="/calendar" className={activeTab === 'Calendar' ? 'active' : ''}>Calendar</a>
          <div className="dropdown">
            <a href="#" className={activeTab === 'Life Cycle' ? 'active' : ''}>Life Cycle</a>
            <div className="dropdown-content">
              {[
                '1. What is Called Living?',
                '2. Childhood, or The No-Place',
                '3. Real Life, or, The Workplace',
                '4. Nightlife, or, The Dark Side',
                '5. Untitled',
                '6. Untitled',
                '7. Untitled',
                '8. Untitled',
                '9. Untitled',
                '10. Untitled'
              ].map((item, index) => (
                <a key={index} href={`/lifecycle/${index + 1}`}>{item}</a>
              ))}
            </div>
          </div>
          <a href="/login" className={activeTab === 'Login' ? 'active' : ''}>Login</a>
        </div>

        <div className="tab-content active">
          <h2>Course Calendar</h2>
          <p>Below is the schedule for the entire course. Please note that this schedule is subject to change.</p>
          
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Date</th>
                <th>Topic</th>
                <th>Assignments</th>
                <th>Time & Place</th>
              </tr>
            </thead>
            <tbody>
              {courseSchedule.map((session, index) => (
                <tr key={index}>
                  <td>{session.week}</td>
                  <td>{session.date}</td>
                  <td>{session.topic}</td>
                  <td>{session.assignments}</td>
                  <td>{session.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
