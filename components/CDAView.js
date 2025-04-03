import { useState } from 'react';
import AnnouncementsComponent from './AnnouncementsComponent';

export default function CDAView({ user }) {
  // CDA View is simpler - it only needs to manage announcements
  
  return (
    <div>
      <div className="cda-dashboard">
        <h2>Course Assistant Dashboard</h2>
        <p>Welcome to the Course Assistant view. Here you can manage course announcements.</p>
        
        <div className="announcements-management">
          <h3>Manage Course Announcements</h3>
          <p>Create and manage announcements for the course that will be displayed on the home page.</p>
          
          <AnnouncementsComponent 
            user={user} 
            isProfessor={true} // Reuse the professor permissions for announcements
          />
        </div>
      </div>
    </div>
  );
}