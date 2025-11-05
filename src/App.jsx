import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GraduateMap from './components/GraduateMap';
import FilterPanel from './components/FilterPanel';
import Statistics from './components/Statistics';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [graduateData, setGraduateData] = useState([]);
  const [statistics, setStatistics] = useState({ locations: [], industries: [] });
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionId = localStorage.getItem('sessionId');
      const savedUser = localStorage.getItem('user');
      
      if (sessionId && savedUser) {
        try {
          const response = await axios.post('/api/verify-session', { sessionId });
          if (response.data.valid) {
            setUser(JSON.parse(savedUser));
          } else {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('user');
          }
        } catch (err) {
          console.error('Session verification failed:', err);
        }
      }
      setAuthChecked(true);
    };
    
    checkSession();
  }, []);

  // Fetch clubs and years on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [clubsRes, yearsRes] = await Promise.all([
          axios.get('/api/clubs'),
          axios.get('/api/years')
        ]);
        setClubs(clubsRes.data);
        setYears(yearsRes.data);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch graduate data when filters change
  useEffect(() => {
    const fetchGraduateData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedClub) params.club_id = selectedClub;
        if (selectedYear) params.year = selectedYear;

        const [dataRes, statsRes] = await Promise.all([
          axios.get('/api/graduate-locations', { params }),
          axios.get('/api/statistics', { params })
        ]);

        setGraduateData(dataRes.data);
        setStatistics(statsRes.data);
      } catch (error) {
        console.error('Error fetching graduate data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraduateData();
  }, [selectedClub, selectedYear]);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  // Show main app if authenticated
  return (
    <Dashboard user={user} onLogout={() => setUser(null)}>
      <div className="app-content">
        <FilterPanel
          clubs={clubs}
          years={years}
          selectedClub={selectedClub}
          selectedYear={selectedYear}
          onClubChange={setSelectedClub}
          onYearChange={setSelectedYear}
          onToggleStats={() => setShowStats(!showStats)}
          showStats={showStats}
        />

        {showStats && (
          <Statistics
            statistics={statistics}
            onClose={() => setShowStats(false)}
          />
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Loading...</div>
          </div>
        )}

        <GraduateMap graduateData={graduateData} />
      </div>
    </Dashboard>
  );
}

export default App;

