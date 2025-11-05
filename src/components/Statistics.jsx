import React from 'react';
import './Statistics.css';

function Statistics({ statistics, onClose }) {
  const { locations, industries } = statistics;

  return (
    <div className="statistics-overlay" onClick={onClose}>
      <div className="statistics-panel" onClick={(e) => e.stopPropagation()}>
        <div className="statistics-header">
          <h2>📊 Statistics</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="statistics-content">
          <div className="stat-section">
            <h3>📍 Top Locations</h3>
            {locations.length > 0 ? (
              <div className="stat-list">
                {locations.map((loc, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-label">
                      {loc.city}, {loc.state}
                    </div>
                    <div className="stat-bar-container">
                      <div 
                        className="stat-bar" 
                        style={{ 
                          width: `${(loc.student_count / locations[0].student_count) * 100}%` 
                        }}
                      />
                      <span className="stat-value">{loc.student_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No location data available</p>
            )}
          </div>

          <div className="stat-section">
            <h3>💼 Top Industries</h3>
            {industries.length > 0 ? (
              <div className="stat-list">
                {industries.map((ind, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-label">
                      {ind.industry_name}
                    </div>
                    <div className="stat-bar-container">
                      <div 
                        className="stat-bar industry" 
                        style={{ 
                          width: `${(ind.student_count / industries[0].student_count) * 100}%` 
                        }}
                      />
                      <span className="stat-value">{ind.student_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No industry data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;

