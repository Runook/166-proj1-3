import React from 'react';
import './FilterPanel.css';

function FilterPanel({ 
  clubs, 
  years, 
  selectedClub, 
  selectedYear, 
  onClubChange, 
  onYearChange,
  onToggleStats,
  showStats
}) {
  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label htmlFor="club-filter">
          <span className="filter-icon">🏛️</span>
          Club/Organization:
        </label>
        <select 
          id="club-filter"
          value={selectedClub} 
          onChange={(e) => onClubChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Clubs</option>
          {clubs.map((club) => (
            <option key={club.club_id} value={club.club_id}>
              {club.name} {club.category && `(${club.category})`}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="year-filter">
          <span className="filter-icon">📅</span>
          Graduation Year:
        </label>
        <select 
          id="year-filter"
          value={selectedYear} 
          onChange={(e) => onYearChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year.year} value={year.year}>
              {year.year}
            </option>
          ))}
        </select>
      </div>

      <button 
        className={`stats-button ${showStats ? 'active' : ''}`}
        onClick={onToggleStats}
      >
        <span className="filter-icon">📊</span>
        {showStats ? 'Hide' : 'Show'} Statistics
      </button>
    </div>
  );
}

export default FilterPanel;

