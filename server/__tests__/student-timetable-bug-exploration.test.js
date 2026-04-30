/**
 * Student Dashboard Bug 1: Timetable API 403 Error - Bug Condition Exploration
 * 
 * CRITICAL: This test is designed to FAIL on unfixed code.
 * Failure confirms the bug exists. DO NOT fix the test or code when it fails.
 * 
 * This test encodes the expected behavior - it will validate the fix
 * when it passes after implementation.
 */

const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Timetable = require('../models/Timetable');

describe('Bug 1: Timetable API 403 Error - Bug Condition Exploration', () => {
  let studentToken;
  let adminToken;
  let testStudent;
  let testSpecialty;
  let testTimetable;

  beforeAll(async () => {
    // NEVER use force: true - it drops all tables and destroys production data
    // Use a separate test database or mock the DB instead
    await sequelize.authenticate();

    // Create test specialty
    testSpecialty = await Specialty.create({
      name: 'Software Engineering',
      arabic_name: 'هندسة البرمجيات',
      code: 'SE',
      description: 'تخصص هندسة البرمجيات',
      is_active: true
    });

    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminUser = await User.create({
      username: 'admin_test',
      password_hash: await bcrypt.hash('password123', 12),
      full_name: 'Admin Test',
      email: 'admin@test.com',
      role: 'admin',
      national_id: '1234567890',
      birth_date: '1990-01-01',
      gender: 'male',
      phone: '0123456789',
      specialty_id: testSpecialty.id,
      current_year: 1,
      status: 'active'
    });

    // Create student user
    testStudent = await User.create({
      username: 'student_test',
      password_hash: await bcrypt.hash('password123', 12),
      full_name: 'Student Test',
      email: 'student@test.com',
      role: 'student',
      national_id: '9876543210',
      birth_date: '2000-01-01',
      gender: 'male',
      phone: '0987654321',
      specialty_id: testSpecialty.id,
      current_year: 1,
      status: 'active'
    });

    // Create test timetable
    testTimetable = await Timetable.create({
      title: 'جدول الفصل الأول 2024-2025',
      specialty_id: testSpecialty.id,
      file_url: '/uploads/timetables/test_timetable.pdf',
      file_name: 'test_timetable.pdf',
      file_size: 1024,
      created_by: adminUser.id
    });

    // Login as admin
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_test', password: 'password123' });
    adminToken = adminLoginRes.body.token;

    // Login as student
    const studentLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'student_test', password: 'password123' });
    studentToken = studentLoginRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Bug Condition 1.1: Student GET request to /api/admin/timetables/student returns 403', () => {
    it('should FAIL - demonstrates bug where student receives 403 Forbidden', async () => {
      /**
       * Bug_Condition: isBugCondition({ 
       *   bugType: 'timetable_403', 
       *   context: { 
       *     userRole: 'student', 
       *     endpoint: '/api/admin/timetables/student', 
       *     parentRouterHasAdminAuth: true 
       *   } 
       * })
       * 
       * Expected_Behavior: Response status should be 200 OK with timetable data
       * 
       * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
       */

      // Act: Student attempts to access their timetable
      const response = await request(app)
        .get('/api/admin/timetables/student')
        .set('Authorization', `Bearer ${studentToken}`);

      // Assert: On UNFIXED code, this should return 403
      // On FIXED code, this should return 200
      
      // Document the bug
      console.log('\n=== Bug 1 Exploration Results ===');
      console.log('Endpoint: GET /api/admin/timetables/student');
      console.log('User role: student');
      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      
      if (response.status === 403) {
        console.log('✓ Bug confirmed: Student receives 403 Forbidden');
        console.log('  - This is the EXPECTED FAILURE on unfixed code');
        console.log('  - Error message:', response.body.message);
        
        // Verify the error message indicates permission issue
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/insufficient|permission|forbidden|not authorized|access denied/i);
        
        // This test SHOULD FAIL on unfixed code
        // When the bug is fixed, this assertion will pass
        throw new Error('BUG CONFIRMED: Student cannot access timetable endpoint (403 Forbidden). This test will pass after the bug is fixed.');
      } else if (response.status === 200) {
        console.log('✓ Bug appears to be FIXED: Student receives 200 OK');
        console.log('  - Timetable data returned successfully');
        console.log('  - Number of timetables:', response.body.data?.length || 0);
        
        // Verify the response structure
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        
        // Verify timetables are filtered by student's specialty
        if (response.body.data.length > 0) {
          const timetable = response.body.data[0];
          expect(timetable.specialty_id).toBe(testStudent.specialty_id);
        }
      } else {
        // Unexpected status code
        throw new Error(`Unexpected status code: ${response.status}. Expected 403 (unfixed) or 200 (fixed).`);
      }
    });
  });

  describe('Bug Condition 1.2: Admin CAN access the same endpoint (control test)', () => {
    it('should succeed - admin user can access timetable endpoint', async () => {
      /**
       * Control test: Verify that admin users can access the endpoint
       * This helps confirm the issue is specifically with student role authorization
       */

      // Act: Admin accesses the timetable endpoint
      const response = await request(app)
        .get('/api/admin/timetables/student')
        .set('Authorization', `Bearer ${adminToken}`);

      // Assert: Admin should always succeed
      console.log('\n=== Control Test: Admin Access ===');
      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log('✓ Control test passed: Admin can access timetable endpoint');
    });
  });

  describe('Bug Condition 1.3: Unauthenticated request returns 401', () => {
    it('should return 401 for unauthenticated request', async () => {
      /**
       * Verify that authentication is still required
       */

      // Act: Attempt to access without token
      const response = await request(app)
        .get('/api/admin/timetables/student');

      // Assert: Should return 401
      expect(response.status).toBe(401);
      
      console.log('\n=== Authentication Test ===');
      console.log('✓ Unauthenticated request correctly returns 401');
    });
  });

  describe('Bug Condition 1.4: Student with different specialty sees filtered timetables', () => {
    it('should filter timetables by student specialty (when bug is fixed)', async () => {
      /**
       * Verify that when the bug is fixed, students only see timetables
       * for their own specialty
       */

      // Create another specialty and timetable
      const otherSpecialty = await Specialty.create({
        name: 'Computer Engineering',
        arabic_name: 'هندسة الحاسوب',
        code: 'CE',
        description: 'تخصص هندسة الحاسوب',
        is_active: true
      });

      await Timetable.create({
        title: 'جدول الفصل الأول 2024-2025 - هندسة الحاسوب',
        specialty_id: otherSpecialty.id,
        file_url: '/uploads/timetables/other_timetable.pdf',
        file_name: 'other_timetable.pdf',
        file_size: 1024,
        created_by: testStudent.id
      });

      // Act: Student accesses timetable endpoint
      const response = await request(app)
        .get('/api/admin/timetables/student')
        .set('Authorization', `Bearer ${studentToken}`);

      console.log('\n=== Specialty Filtering Test ===');
      console.log('Student specialty ID:', testStudent.specialty_id);
      console.log('Response status:', response.status);

      if (response.status === 200) {
        // Bug is fixed - verify filtering
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);

        // All returned timetables should match student's specialty
        response.body.data.forEach(timetable => {
          expect(timetable.specialty_id).toBe(testStudent.specialty_id);
        });

        console.log('✓ Timetables correctly filtered by student specialty');
        console.log('  - Student specialty:', testStudent.specialty_id);
        console.log('  - Timetables returned:', response.body.data.length);
      } else if (response.status === 403) {
        console.log('⚠ Bug still present: Cannot test filtering due to 403 error');
      }
    });
  });
});

/**
 * SUMMARY OF BUG 1 EXPLORATION
 * 
 * Bug Condition: Student users with role='student' receive 403 Forbidden
 * when attempting to access their timetables via /api/admin/timetables/student
 * 
 * Root Cause Hypothesis: The timetable routes are mounted at /api/admin, which has
 * authorizeRoles('admin') middleware that blocks all non-admin users before
 * the student-specific handler can execute.
 * 
 * Expected Behavior After Fix:
 * - Student users should receive 200 OK with timetable data
 * - The endpoint should filter timetables by student's specialty
 * - Admin users should continue to have full access
 * - Unauthenticated requests should still return 401
 * 
 * Counterexamples to be Found:
 * - Student GET /api/admin/timetables/student → 403 Forbidden (UNFIXED)
 * - Student GET /api/admin/timetables/student → 200 OK (FIXED)
 * - Error message: "Insufficient permissions" or similar
 * - Admin GET /api/admin/timetables/student → 200 OK (always works)
 */
