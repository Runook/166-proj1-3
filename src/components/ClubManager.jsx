import React, { useState } from 'react';
import axios from 'axios';
import './ClubManager.css';

function ClubManager({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Academic'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'Academic',
    'Arts',
    'Sports',
    'Cultural',
    'Professional',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('/api/clubs', formData);
      setSuccess(true);
      setFormData({ name: '', category: 'Academic' });
      
      // Auto close after success
      setTimeout(() => {
        window.location.reload(); // Refresh to show new club
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏛️ Create New Club</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="club-form">
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">✅ Club created successfully!</div>}

          <div className="form-field">
            <label htmlFor="club-name">Club Name *</label>
            <input
              type="text"
              id="club-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Data Science Society"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="club-category">Category</label>
            <select
              id="club-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClubManager;

