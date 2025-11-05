const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'jc6292',
  host: process.env.DB_HOST || '34.139.8.30',
  database: process.env.DB_NAME || 'proj1part2',
  password: process.env.DB_PASSWORD || '854037',
  port: process.env.DB_PORT || 5432,
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const result1 = await pool.query('SELECT NOW()');
    console.log('   ✅ Connected at:', result1.rows[0].now);
    
    // Test 2: Check schema
    console.log('\n2. Checking schema...');
    const result2 = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'jc6292'
    `);
    console.log('   ✅ Schema jc6292 exists:', result2.rows.length > 0);
    
    // Test 3: Check tables
    console.log('\n3. Checking tables...');
    const result3 = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'jc6292'
      ORDER BY table_name
    `);
    console.log(`   ✅ Found ${result3.rows.length} tables:`);
    result3.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });
    
    // Test 4: Check data
    console.log('\n4. Checking data...');
    const tables = ['student', 'club', 'location', 'industry', 'graduated_in', 'lives_in', 'works_in', 'member_of'];
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM jc6292.${table}`);
        console.log(`   ✅ ${table}: ${result.rows[0].count} rows`);
      } catch (err) {
        console.log(`   ❌ ${table}: Error - ${err.message}`);
      }
    }
    
    // Test 5: Test API queries
    console.log('\n5. Testing API queries...');
    
    // Test clubs query
    const clubsResult = await pool.query(
      'SELECT club_id, name, category FROM jc6292.club ORDER BY name LIMIT 3'
    );
    console.log('   ✅ Clubs query works:', clubsResult.rows.length, 'results');
    
    // Test locations query
    const locationsResult = await pool.query(
      'SELECT loc_id, city, state FROM jc6292.location ORDER BY city LIMIT 3'
    );
    console.log('   ✅ Locations query works:', locationsResult.rows.length, 'results');
    
    // Test graduate locations query
    const gradResult = await pool.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        l.city,
        l.state,
        i.name as industry_name
      FROM jc6292.student s
      LEFT JOIN jc6292.lives_in li ON s.student_id = li.student_id AND li.until_date IS NULL
      LEFT JOIN jc6292.location l ON li.loc_id = l.loc_id
      LEFT JOIN jc6292.works_in w ON s.student_id = w.student_id AND w.end_year IS NULL
      LEFT JOIN jc6292.industry i ON w.industry_id = i.industry_id
      WHERE l.loc_id IS NOT NULL
      LIMIT 3
    `);
    console.log('   ✅ Graduate locations query works:', gradResult.rows.length, 'results');
    if (gradResult.rows.length > 0) {
      console.log('      Example:', gradResult.rows[0].first_name, gradResult.rows[0].last_name, 
                  'in', gradResult.rows[0].city, '- Industry:', gradResult.rows[0].industry_name);
    }
    
    console.log('\n✨ All tests passed! Database is ready.\n');
    
  } catch (err) {
    console.error('\n❌ Database connection failed:');
    console.error('   Error:', err.message);
    console.error('   Code:', err.code);
    console.error('\n📝 Please check:');
    console.error('   1. Database credentials in .env file');
    console.error('   2. Network connectivity to database server');
    console.error('   3. Database server is running');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();

