const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const RegistrationLink = require('../models/RegistrationLink');
const RegistrationRequest = require('../models/RegistrationRequest');
const Specialty = require('../models/Specialty');
const User = require('../models/User');

describe('Registration Link Bug Exploration - UNFIXED CODE', () => {
  let adminToken;
  let testLink;
  let testSpecialty;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create admin user for authentication
    const bcrypt = require('bcryptjs');
    const adminUser = await User.create({
      username: 'admin_test',
      email: 'admin@test.com',
      password_hash: await bcrypt.hash('password123', 12),
      full_name: 'Admin Test',
      phone: '+20-1234567890',
      role: 'admin',
      is_active: true
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_test', password: 'password123' });
    
    adminToken = loginRes.body.token;

    // Create test specialty
    testSpecialty = await Specialty.create({
      code: 'TEST',
      name: 'Test Specialty',
      arabic_name: 'تخصص تجريبي',
      duration_years: 4,
      total_credits: 120,
      annual_fee: 10000,
      is_active: true
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await RegistrationRequest.destroy({ where: {}, truncate: true });
    await RegistrationLink.destroy({ where: {}, truncate: true });

    // Create a fresh registration link with 24-hour expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours from now

    testLink = await RegistrationLink.create({
      created_by: 1,
      expires_at: expiresAt,
      is_used: false
    });
  });

  describe('Bug Condition 1.2: Second student GET request after first use', () => {
    it('should FAIL - demonstrates bug where valid link is rejected after first use', async () => {
      // First student accesses the link (GET request)
      const firstGetResponse = await request(app)
        .get(`/api/auth/register-link/${testLink.token}`)
        .expect(200);

      expect(firstGetResponse.body.success).toBe(true);
      expect(firstGetResponse.body.data.valid).toBe(true);

      // First student submits registration
      const firstPostResponse = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Student One',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'student1@test.com',
          phone: '+20-1111111111',
          specialty_id: testSpecialty.id
        })
        .expect(200);

      expect(firstPostResponse.body.success).toBe(true);

      // Reload link from database to check is_used flag
      await testLink.reload();
      console.log('Link is_used after first registration:', testLink.is_used);

      // Second student attempts to access the same link (GET request)
      // BUG: This should succeed but will fail with "تم استخدام هذا الرابط من قبل"
      const secondGetResponse = await request(app)
        .get(`/api/auth/register-link/${testLink.token}`);

      console.log('Second GET response:', secondGetResponse.body);

      // EXPECTED: Should succeed (status 200)
      // ACTUAL: Will fail with status 400 and message "تم استخدام هذا الرابط من قبل"
      expect(secondGetResponse.status).toBe(400);
      expect(secondGetResponse.body.success).toBe(false);
      expect(secondGetResponse.body.message).toBe('تم استخدام هذا الرابط من قبل');

      console.log('✗ BUG CONFIRMED: Valid, non-expired link rejected after first use');
      console.log('✗ Root cause: is_used check at line 68-69 in authRoutes.js');
    });
  });

  describe('Bug Condition 1.3: Second student POST request after first registration', () => {
    it('should FAIL - demonstrates bug where second registration is rejected', async () => {
      // First student completes registration
      const firstPostResponse = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Student One',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'student1@test.com',
          phone: '+20-1111111111',
          specialty_id: testSpecialty.id
        })
        .expect(200);

      expect(firstPostResponse.body.success).toBe(true);

      // Reload link to verify it's marked as used
      await testLink.reload();
      console.log('Link is_used after first registration:', testLink.is_used);
      expect(testLink.is_used).toBe(true);

      // Second student attempts to register using the same link
      // BUG: This should succeed but will fail with "الرابط غير صالح أو منتهي الصلاحية"
      const secondPostResponse = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Student Two',
          national_id: '98765432109876',
          birth_date: '2000-02-02',
          gender: 'female',
          email: 'student2@test.com',
          phone: '+20-2222222222',
          specialty_id: testSpecialty.id
        });

      console.log('Second POST response:', secondPostResponse.body);

      // EXPECTED: Should succeed (status 200)
      // ACTUAL: Will fail with status 400 and message "الرابط غير صالح أو منتهي الصلاحية"
      expect(secondPostResponse.status).toBe(400);
      expect(secondPostResponse.body.success).toBe(false);
      expect(secondPostResponse.body.message).toBe('الرابط غير صالح أو منتهي الصلاحية');

      console.log('✗ BUG CONFIRMED: Second registration rejected with valid, non-expired link');
      console.log('✗ Root cause: is_used check at line 82 and update at line 115 in authRoutes.js');
    });
  });

  describe('Bug Condition 1.4: Multiple sequential registrations', () => {
    it('should FAIL - only first student succeeds, others are blocked', async () => {
      const students = [
        {
          full_name: 'Student One',
          national_id: '11111111111111',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'student1@test.com',
          phone: '+20-1111111111',
          specialty_id: testSpecialty.id
        },
        {
          full_name: 'Student Two',
          national_id: '22222222222222',
          birth_date: '2000-02-02',
          gender: 'female',
          email: 'student2@test.com',
          phone: '+20-2222222222',
          specialty_id: testSpecialty.id
        },
        {
          full_name: 'Student Three',
          national_id: '33333333333333',
          birth_date: '2000-03-03',
          gender: 'male',
          email: 'student3@test.com',
          phone: '+20-3333333333',
          specialty_id: testSpecialty.id
        }
      ];

      const results = [];

      for (let i = 0; i < students.length; i++) {
        const response = await request(app)
          .post(`/api/auth/register-link/${testLink.token}`)
          .send(students[i]);

        results.push({
          studentIndex: i + 1,
          status: response.status,
          success: response.body.success,
          message: response.body.message
        });

        console.log(`Student ${i + 1} registration:`, {
          status: response.status,
          success: response.body.success,
          message: response.body.message
        });
      }

      // EXPECTED: All 3 students should succeed
      // ACTUAL: Only first student succeeds, others fail
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(false);

      console.log('✗ BUG CONFIRMED: Only 1 out of 3 students could register with same link');
      console.log('✗ Expected: 3 successful registrations');
      console.log('✗ Actual: 1 successful, 2 rejected');
    });
  });
});
