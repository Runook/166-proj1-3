const http = require('http');
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 System Diagnostic Check\n');
console.log('='.repeat(50));

// Check 1: Environment variables
console.log('\n1️⃣  Checking environment variables...');
const envVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT', 'PORT'];
let envOk = true;
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask password
    if (varName === 'DB_PASSWORD') {
      console.log(`   ✅ ${varName}: ${'*'.repeat(value.length)}`);
    } else {
      console.log(`   ✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`   ❌ ${varName}: NOT SET`);
    envOk = false;
  }
});

if (!envOk) {
  console.log('\n⚠️  Missing environment variables! Please check .env file.');
  process.exit(1);
}

// Check 2: Database connection
console.log('\n2️⃣  Testing database connection...');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('   ✅ Database connection successful');
    
    // Check 3: Port availability
    console.log('\n3️⃣  Checking port availability...');
    const backendPort = process.env.PORT || 3001;
    const frontendPort = 3000;
    
    // Check backend port
    const backendCheck = http.get(`http://localhost:${backendPort}/api/clubs`, (res) => {
      console.log(`   ✅ Backend server is running on port ${backendPort}`);
      checkFrontend();
    }).on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log(`   ⚠️  Backend server is NOT running on port ${backendPort}`);
        console.log('      → Run: npm run dev');
      } else {
        console.log(`   ❌ Backend port error: ${err.message}`);
      }
      checkFrontend();
    });
    
    backendCheck.setTimeout(2000, () => {
      backendCheck.destroy();
      console.log(`   ⚠️  Backend server is NOT responding on port ${backendPort}`);
      console.log('      → Run: npm run dev');
      checkFrontend();
    });
    
    function checkFrontend() {
      // Check frontend port
      const frontendCheck = http.get(`http://localhost:${frontendPort}`, (res) => {
        console.log(`   ✅ Frontend server is running on port ${frontendPort}`);
        finish();
      }).on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          console.log(`   ⚠️  Frontend server is NOT running on port ${frontendPort}`);
          console.log('      → Run: npm run dev');
        } else {
          console.log(`   ❌ Frontend port error: ${err.message}`);
        }
        finish();
      });
      
      frontendCheck.setTimeout(2000, () => {
        frontendCheck.destroy();
        console.log(`   ⚠️  Frontend server is NOT responding on port ${frontendPort}`);
        console.log('      → Run: npm run dev');
        finish();
      });
    }
    
    function finish() {
      console.log('\n' + '='.repeat(50));
      console.log('\n📋 Summary:');
      console.log('   ✅ Database connection: OK');
      console.log('   ✅ Environment variables: OK');
      console.log('\n💡 Next steps:');
      console.log('   1. If servers are not running, execute:');
      console.log('      ./start.sh');
      console.log('   2. Then visit: http://localhost:3000');
      console.log('\n');
      pool.end();
    }
  })
  .catch((err) => {
    console.log(`   ❌ Database connection failed: ${err.message}`);
    console.log('\n📝 Please check:');
    console.log('   1. Database credentials in .env file');
    console.log('   2. Network connectivity');
    console.log('   3. Database server is accessible');
    console.log('\n');
    process.exit(1);
  });

