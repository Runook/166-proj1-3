import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './GraduateMap.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// US City coordinates
const cityCoordinates = {
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'New York City, NY': { lat: 40.7128, lng: -74.0060 },
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'Washington, DC': { lat: 38.9072, lng: -77.0369 },
  'Minneapolis, MN': { lat: 44.9778, lng: -93.2650 },
  'Detroit, MI': { lat: 42.3314, lng: -83.0458 }
};

function GraduateMap({ graduateData }) {
  // Group graduates by location
  const locationGroups = useMemo(() => {
    const groups = {};
    
    graduateData.forEach(graduate => {
      const locationKey = `${graduate.city}, ${graduate.state}`;
      if (!groups[locationKey]) {
        groups[locationKey] = {
          city: graduate.city,
          state: graduate.state,
          graduates: [],
          industries: {}
        };
      }
      groups[locationKey].graduates.push(graduate);
      
      // Count industries
      if (graduate.industry_name) {
        groups[locationKey].industries[graduate.industry_name] = 
          (groups[locationKey].industries[graduate.industry_name] || 0) + 1;
      }
    });
    
    return Object.values(groups);
  }, [graduateData]);

  // Get color based on student count
  const getMarkerColor = (count) => {
    if (count >= 5) return '#e53e3e';
    if (count >= 3) return '#dd6b20';
    if (count >= 2) return '#d69e2e';
    return '#38a169';
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={[39.8283, -98.5795]} 
        zoom={4} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locationGroups.map((location, index) => {
          const coords = cityCoordinates[`${location.city}, ${location.state}`];
          
          if (!coords) return null;
          
          const count = location.graduates.length;
          const radius = Math.min(10 + count * 3, 30);
          
          return (
            <CircleMarker
              key={index}
              center={[coords.lat, coords.lng]}
              radius={radius}
              fillColor={getMarkerColor(count)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              <Popup maxWidth={400} className="custom-popup">
                <div className="popup-content">
                  <h3 className="popup-title">
                    📍 {location.city}, {location.state}
                  </h3>
                  <div className="popup-stats">
                    <span className="student-count">
                      {count} {count === 1 ? 'Graduate' : 'Graduates'}
                    </span>
                  </div>

                  {Object.keys(location.industries).length > 0 && (
                    <div className="industries-section">
                      <h4>Industries:</h4>
                      <div className="industries-list">
                        {Object.entries(location.industries)
                          .sort((a, b) => b[1] - a[1])
                          .map(([industry, count]) => (
                            <span key={industry} className="industry-tag">
                              {industry} ({count})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="graduates-section">
                    <h4>Graduates:</h4>
                    <div className="graduates-list">
                      {location.graduates.map((grad) => (
                        <div key={grad.student_id} className="graduate-item">
                          <div className="graduate-name">
                            👤 {grad.first_name} {grad.last_name}
                          </div>
                          <div className="graduate-details">
                            {grad.degree && (
                              <span className="detail-badge degree">
                                {grad.degree} {grad.graduation_year && `'${grad.graduation_year.toString().slice(-2)}`}
                              </span>
                            )}
                            {grad.honors && (
                              <span className="detail-badge honors">
                                🎖️ {grad.honors}
                              </span>
                            )}
                          </div>
                          {grad.industry_name && (
                            <div className="graduate-industry">
                              💼 {grad.industry_name}
                            </div>
                          )}
                          {grad.club_name && (
                            <div className="graduate-club">
                              🏛️ {grad.club_name}
                            </div>
                          )}
                          {grad.email && (
                            <div className="graduate-email">
                              ✉️ {grad.email}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="map-legend">
        <h4>Graduate Count</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#38a169' }}></div>
            <span>1 graduate</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#d69e2e' }}></div>
            <span>2 graduates</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#dd6b20' }}></div>
            <span>3-4 graduates</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#e53e3e' }}></div>
            <span>5+ graduates</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraduateMap;

