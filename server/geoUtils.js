// US City coordinates - approximate lat/lng for major cities
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

// Function to get coordinates for a city
function getCoordinates(city, state) {
  const key = `${city}, ${state}`;
  return cityCoordinates[key] || null;
}

// Convert student data to GeoJSON
function convertToGeoJSON(students) {
  const features = [];
  const locationGroups = {};
  
  // Group students by location
  students.forEach(student => {
    const locationKey = `${student.city}, ${student.state}`;
    if (!locationGroups[locationKey]) {
      locationGroups[locationKey] = {
        city: student.city,
        state: student.state,
        students: []
      };
    }
    locationGroups[locationKey].students.push(student);
  });
  
  // Create GeoJSON features for each location
  Object.values(locationGroups).forEach(location => {
    const coords = getCoordinates(location.city, location.state);
    
    if (coords) {
      // Count industries
      const industries = {};
      location.students.forEach(student => {
        if (student.industry_name) {
          industries[student.industry_name] = (industries[student.industry_name] || 0) + 1;
        }
      });
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        },
        properties: {
          city: location.city,
          state: location.state,
          location_name: `${location.city}, ${location.state}`,
          student_count: location.students.length,
          students: location.students.map(s => ({
            id: s.student_id,
            name: `${s.first_name} ${s.last_name}`,
            email: s.email,
            degree: s.degree,
            graduation_year: s.graduation_year,
            honors: s.honors,
            industry: s.industry_name,
            club: s.club_name,
            club_category: s.club_category
          })),
          industries: industries
        }
      });
    }
  });
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

module.exports = {
  getCoordinates,
  convertToGeoJSON
};

