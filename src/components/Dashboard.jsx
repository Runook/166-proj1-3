import React, { useState } from 'react';
import axios from 'axios';
import ClubManager from './ClubManager';
import StudentForm from './StudentForm';
import './Dashboard.css';

function Dashboard({ user, onLogout, children }) {
  const [showClubForm, setShowClubForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      await axios.post('/api/logout', { sessionId });
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h2>Welcome, {user.username}! 👋</h2>
          </div>
          <div className="header-right">
            <button 
              className="action-button club-btn"
              onClick={() => setShowClubForm(true)}
            >
              🏛️ Add Club
            </button>
            <button 
              className="action-button student-btn"
              onClick={() => setShowStudentForm(true)}
            >
              👤 Add Student
            </button>
            <button 
              className="action-button logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {showClubForm && (
        <ClubManager 
          onClose={() => setShowClubForm(false)}
        />
      )}

      {showStudentForm && (
        <StudentForm 
          onClose={() => setShowStudentForm(false)}
        />
      )}

      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}

export default Dashboard;

