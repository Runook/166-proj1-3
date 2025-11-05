import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentForm.css';

function StudentForm({ onClose }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    club_id: '',
    location_id: '',
    industry_id: '',
    graduation_year: new Date().getFullYear(),
    degree: 'BS'
  });
  
  const [clubs, setClubs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const degrees = ['BS', 'BA', 'MS', 'MA', 'PhD', 'MEng', 'Other'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clubsRes, locationsRes, industriesRes] = await Promise.all([
        axios.get('/api/clubs'),
        axios.get('/api/locations'),
        axios.get('/api/industries')
      ]);
      
      setClubs(clubsRes.data);
      setLocations(locationsRes.data);
      setIndustries(industriesRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const dataToSend = {
        ...formData,
        club_id: formData.club_id || null,
        location_id: formData.location_id || null,
        industry_id: formData.industry_id || null
      };

      await axios.post('/api/students', dataToSend);
      setSuccess(true);
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        club_id: '',
        location_id: '',
        industry_id: '',
        graduation_year: new Date().getFullYear(),
        degree: 'BS'
      });

      // Auto close and refresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Add New Student</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">✅ Student added successfully! They will appear on the map.</div>}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g., John"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g., Doe"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., john.doe@example.edu"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Education</h3>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="degree">Degree</label>
                <select
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                >
                  {degrees.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="graduation_year">Graduation Year</label>
                <input
                  type="number"
                  id="graduation_year"
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  min="2000"
                  max="2100"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Current Status</h3>
            
            <div className="form-field">
              <label htmlFor="club_id">Club/Organization</label>
              <select
                id="club_id"
                name="club_id"
                value={formData.club_id}
                onChange={handleChange}
              >
                <option value="">Select a club (optional)</option>
                {clubs.map((club) => (
                  <option key={club.club_id} value={club.club_id}>
                    {club.name} {club.category && `(${club.category})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="location_id">Current Location *</label>
              <select
                id="location_id"
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc.loc_id} value={loc.loc_id}>
                    {loc.city}, {loc.state}
                  </option>
                ))}
              </select>
              <small className="field-hint">This is where the student will appear on the map</small>
            </div>

            <div className="form-field">
              <label htmlFor="industry_id">Industry</label>
              <select
                id="industry_id"
                name="industry_id"
                value={formData.industry_id}
                onChange={handleChange}
              >
                <option value="">Select an industry (optional)</option>
                {industries.map((ind) => (
                  <option key={ind.industry_id} value={ind.industry_id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentForm;

