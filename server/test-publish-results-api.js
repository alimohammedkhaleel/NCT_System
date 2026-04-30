/**
 * Manual test script for publish results API endpoints
 * 
 * This script tests:
 * 1. GET /api/admin/grades/stats - Get grade statistics
 * 2. POST /api/admin/publish-results - Publish results
 * 
 * Run with: node test-publish-results-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/admin';

// You'll need to replace this with a valid admin JWT token
const ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN_HERE';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testGetGradeStats() {
  console.log('\n=== Testing GET /api/admin/grades/stats ===\n');
  
  try {
    // Test 1: Get all grade stats
    console.log('Test 1: Get all grade stats (no filters)');
    const response1 = await api.get('/grades/stats');
    console.log('✓ Success:', JSON.stringify(response1.data, null, 2));
    
    // Test 2: Get stats for specific semester
    console.log('\nTest 2: Get stats for semester_id=1');
    const response2 = await api.get('/grades/stats?semester_id=1');
    console.log('✓ Success:', JSON.stringify(response2.data, null, 2));
    
    // Test 3: Get stats for specific academic year
    console.log('\nTest 3: Get stats for academic_year_id=1');
    const response3 = await api.get('/grades/stats?academic_year_id=1');
    console.log('✓ Success:', JSON.stringify(response3.data, null, 2));
    
    // Test 4: Get stats for specific specialty
    console.log('\nTest 4: Get stats for specialty_id=1');
    const response4 = await api.get('/grades/stats?specialty_id=1');
    console.log('✓ Success:', JSON.stringify(response4.data, null, 2));
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function testPublishResults() {
  console.log('\n=== Testing POST /api/admin/publish-results ===\n');
  
  try {
    // Test 1: Publish results for specific semester and academic year
    console.log('Test 1: Publish results for semester_id=1, academic_year_id=1');
    const response1 = await api.post('/publish-results', {
      semester_id: 1,
      academic_year_id: 1
    });
    console.log('✓ Success:', JSON.stringify(response1.data, null, 2));
    
    // Test 2: Publish results with specialty filter
    console.log('\nTest 2: Publish results for semester_id=1, academic_year_id=1, specialty_id=1');
    const response2 = await api.post('/publish-results', {
      semester_id: 1,
      academic_year_id: 1,
      specialty_id: 1
    });
    console.log('✓ Success:', JSON.stringify(response2.data, null, 2));
    
    // Test 3: Publish specific grades by IDs
    console.log('\nTest 3: Publish specific grades by IDs');
    const response3 = await api.post('/publish-results', {
      grade_ids: [1, 2, 3]
    });
    console.log('✓ Success:', JSON.stringify(response3.data, null, 2));
    
    // Test 4: Error case - no parameters
    console.log('\nTest 4: Error case - no parameters');
    try {
      await api.post('/publish-results', {});
    } catch (error) {
      console.log('✓ Expected error:', error.response?.data);
    }
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Publish Results API Endpoints');
  console.log('='.repeat(60));
  
  if (ADMIN_TOKEN === 'YOUR_ADMIN_JWT_TOKEN_HERE') {
    console.log('\n⚠️  WARNING: Please replace ADMIN_TOKEN with a valid JWT token');
    console.log('You can get a token by logging in as admin and copying it from the response\n');
    return;
  }
  
  await testGetGradeStats();
  await testPublishResults();
  
  console.log('\n' + '='.repeat(60));
  console.log('Tests completed!');
  console.log('='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(console.error);
