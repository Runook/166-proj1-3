const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(express.json());

// Simple in-memory session store (for demo purposes)
const sessions = new Map();

// Helper function to generate simple session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// API: Get all clubs
app.get('/api/clubs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT club_id, name, category FROM jc6292.club ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Get all graduation years
app.get('/api/years', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT year FROM jc6292.graduated_in ORDER BY year DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Get graduate location data with filters
app.get('/api/graduate-locations', async (req, res) => {
  try {
    const { club_id, year } = req.query;
    
    let query = `
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        l.loc_id,
        l.city,
        l.state,
        l.country,
        l.city || ', ' || l.state as location_name,
        g.year as graduation_year,
        g.degree,
        g.honors,
        i.industry_id,
        i.name as industry_name,
        c.club_id,
        c.name as club_name,
        c.category as club_category
      FROM jc6292.student s
      LEFT JOIN jc6292.graduated_in g ON s.student_id = g.student_id
      LEFT JOIN jc6292.lives_in li ON s.student_id = li.student_id AND li.until_date IS NULL
      LEFT JOIN jc6292.location l ON li.loc_id = l.loc_id
      LEFT JOIN jc6292.works_in w ON s.student_id = w.student_id AND w.end_year IS NULL
      LEFT JOIN jc6292.industry i ON w.industry_id = i.industry_id
      LEFT JOIN jc6292.member_of m ON s.student_id = m.student_id AND m.leave_date IS NULL
      LEFT JOIN jc6292.club c ON m.club_id = c.club_id
      WHERE l.loc_id IS NOT NULL
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (club_id) {
      query += ` AND c.club_id = $${paramCount}`;
      params.push(club_id);
      paramCount++;
    }
    
    if (year) {
      query += ` AND g.year = $${paramCount}`;
      params.push(year);
      paramCount++;
    }
    
    query += ' ORDER BY s.last_name, s.first_name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const { club_id, year } = req.query;
    
    // Get location distribution
    let locationQuery = `
      SELECT 
        l.city,
        l.state,
        COUNT(DISTINCT s.student_id) as student_count
      FROM jc6292.student s
      JOIN jc6292.lives_in li ON s.student_id = li.student_id AND li.until_date IS NULL
      JOIN jc6292.location l ON li.loc_id = l.loc_id
      LEFT JOIN jc6292.graduated_in g ON s.student_id = g.student_id
      LEFT JOIN jc6292.member_of m ON s.student_id = m.student_id AND m.leave_date IS NULL
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (club_id) {
      locationQuery += ` AND m.club_id = $${paramCount}`;
      params.push(club_id);
      paramCount++;
    }
    
    if (year) {
      locationQuery += ` AND g.year = $${paramCount}`;
      params.push(year);
      paramCount++;
    }
    
    locationQuery += ' GROUP BY l.city, l.state ORDER BY student_count DESC';
    
    // Get industry distribution
    let industryQuery = `
      SELECT 
        i.name as industry_name,
        COUNT(DISTINCT s.student_id) as student_count
      FROM jc6292.student s
      JOIN jc6292.works_in w ON s.student_id = w.student_id AND w.end_year IS NULL
      JOIN jc6292.industry i ON w.industry_id = i.industry_id
      LEFT JOIN jc6292.graduated_in g ON s.student_id = g.student_id
      LEFT JOIN jc6292.member_of m ON s.student_id = m.student_id AND m.leave_date IS NULL
      WHERE 1=1
    `;
    
    const params2 = [];
    let paramCount2 = 1;
    
    if (club_id) {
      industryQuery += ` AND m.club_id = $${paramCount2}`;
      params2.push(club_id);
      paramCount2++;
    }
    
    if (year) {
      industryQuery += ` AND g.year = $${paramCount2}`;
      params2.push(year);
      paramCount2++;
    }
    
    industryQuery += ' GROUP BY i.name ORDER BY student_count DESC';
    
    const [locationResult, industryResult] = await Promise.all([
      pool.query(locationQuery, params),
      pool.query(industryQuery, params2)
    ]);
    
    res.json({
      locations: locationResult.rows,
      industries: industryResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== Authentication APIs ==========

// API: Register user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Simple user storage (using club table temporarily for demo)
    // In production, create a proper users table
    const sessionId = generateSessionId();
    sessions.set(sessionId, { username, email });
    
    res.json({ 
      success: true, 
      sessionId,
      user: { username, email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// API: Login user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Simple authentication (accept any username/password for demo)
    const sessionId = generateSessionId();
    sessions.set(sessionId, { username });
    
    res.json({ 
      success: true, 
      sessionId,
      user: { username }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// API: Logout
app.post('/api/logout', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ success: true });
});

// API: Verify session
app.post('/api/verify-session', (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);
  
  if (session) {
    res.json({ valid: true, user: session });
  } else {
    res.json({ valid: false });
  }
});

// ========== Club Management APIs ==========

// API: Create club
app.post('/api/clubs', async (req, res) => {
  try {
    const { name, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Club name is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO jc6292.club (name, category) VALUES ($1, $2) RETURNING *',
      [name, category || null]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Club name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create club' });
    }
  }
});

// ========== Location and Industry APIs ==========

// API: Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jc6292.location ORDER BY city'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Get all industries
app.get('/api/industries', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jc6292.industry ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Create location
app.post('/api/locations', async (req, res) => {
  try {
    const { city, state, country } = req.body;
    
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO jc6292.location (city, state, country) VALUES ($1, $2, $3) RETURNING *',
      [city, state || null, country || 'USA']
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// API: Create industry
app.post('/api/industries', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Industry name is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO jc6292.industry (name) VALUES ($1) RETURNING *',
      [name]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Industry already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create industry' });
    }
  }
});

// ========== Student Management APIs ==========

// API: Create student with all related data
app.post('/api/students', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      first_name, 
      last_name, 
      email,
      club_id,
      location_id,
      industry_id,
      graduation_year,
      degree
    } = req.body;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    await client.query('BEGIN');
    
    // 1. Insert student
    const studentResult = await client.query(
      'INSERT INTO jc6292.student (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *',
      [first_name, last_name, email || null]
    );
    
    const student = studentResult.rows[0];
    const student_id = student.student_id;
    
    // 2. Add location if provided
    if (location_id) {
      await client.query(
        'INSERT INTO jc6292.lives_in (student_id, loc_id, since_date) VALUES ($1, $2, CURRENT_DATE)',
        [student_id, location_id]
      );
    }
    
    // 3. Add industry if provided
    if (industry_id) {
      await client.query(
        'INSERT INTO jc6292.works_in (student_id, industry_id, start_year) VALUES ($1, $2, $3)',
        [student_id, industry_id, new Date().getFullYear()]
      );
    }
    
    // 4. Add club membership if provided
    if (club_id) {
      await client.query(
        'INSERT INTO jc6292.member_of (student_id, club_id, join_date) VALUES ($1, $2, CURRENT_DATE)',
        [student_id, club_id]
      );
    }
    
    // 5. Add graduation record if provided
    if (graduation_year && degree) {
      // First ensure the year exists in year_dim
      await client.query(
        'INSERT INTO jc6292.year_dim (year) VALUES ($1) ON CONFLICT (year) DO NOTHING',
        [graduation_year]
      );
      
      await client.query(
        'INSERT INTO jc6292.graduated_in (student_id, year, degree) VALUES ($1, $2, $3)',
        [student_id, graduation_year, degree]
      );
    }
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      student: student,
      message: 'Student created successfully'
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create student: ' + err.message });
    }
  } finally {
    client.release();
  }
});

// API: Get all students
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jc6292.student ORDER BY last_name, first_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Serve React app for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const serverPort = process.env.PORT || port;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`Server running on port ${serverPort}`);
});

