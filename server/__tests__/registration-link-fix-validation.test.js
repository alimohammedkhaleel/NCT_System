const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const RegistrationLink = require('../models/RegistrationLink');
const RegistrationRequest = require('../models/RegistrationRequest');
const Specialty = require('../models/Specialty');
const User = require('../models/User');

describe('Registration Link Fix Validation - FIXED CODE', () => {
  let adminToken;
  let testLink;
  let testSpecialty;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create admin user
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

  describe('Fix Validation 3.1: Multiple students can access same link via GET', () => {
    it('should allow multiple students to access the same link', async () => {
      // First student accesses the link
      const firstGetResponse = await request(app)
        .get(`/api/auth/register-link/${testLink.token}`)
        .expect(200);

      expect(firstGetResponse.body.success).toBe(true);
      expect(firstGetResponse.body.data.valid).toBe(true);
      expect(firstGetResponse.body.data.specialties).toBeDefined();

      // First student submits registration
      await request(app)
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

      // Second student accesses the same link - should succeed
      const secondGetResponse = await request(app)
        .get(`/api/auth/register-link/${testLink.token}`)
        .expect(200);

      expect(secondGetResponse.body.success).toBe(true);
      expect(secondGetResponse.body.data.valid).toBe(true);
      expect(secondGetResponse.body.data.specialties).toBeDefined();

      // Third student also accesses the link - should succeed
      const thirdGetResponse = await request(app)
        .get(`/api/auth/register-link/${testLink.token}`)
        .expect(200);

      expect(thirdGetResponse.body.success).toBe(true);
      expect(thirdGetResponse.body.data.valid).toBe(true);

      console.log('✓ FIX VALIDATED: Multiple students can access same link via GET');
    });
  });

  describe('Fix Validation 3.2: Multiple students can submit registrations via POST', () => {
    it('should allow multiple students to register using the same link', async () => {
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
        },
        {
          full_name: 'Student Four',
          national_id: '44444444444444',
          birth_date: '2000-04-04',
          gender: 'female',
          email: 'student4@test.com',
          phone: '+20-4444444444',
          specialty_id: testSpecialty.id
        },
        {
          full_name: 'Student Five',
          national_id: '55555555555555',
          birth_date: '2000-05-05',
          gender: 'male',
          email: 'student5@test.com',
          phone: '+20-5555555555',
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
          success: response.body.success
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }

      // Verify all 5 students registered successfully
      const registrationCount = await RegistrationRequest.count();
      expect(registrationCount).toBe(5);

      console.log('✓ FIX VALIDATED: All 5 students registered successfully using same link');
    });
  });

  describe('Fix Validation 3.3: Link expiration still works', () => {
    it('should reject expired links with correct error message', async () => {
      // Create an expired link
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // 24 hours ago

      const expiredLink = await RegistrationLink.create({
        created_by: 1,
        expires_at: expiredDate,
        is_used: false
      });

      // Attempt to access expired link
      const getResponse = await request(app)
        .get(`/api/auth/register-link/${expiredLink.token}`)
        .expect(400);

      expect(getResponse.body.success).toBe(false);
      expect(getResponse.body.message).toBe('انتهت صلاحية الرابط');

      // Attempt to register with expired link
      const postResponse = await request(app)
        .post(`/api/auth/register-link/${expiredLink.token}`)
        .send({
          full_name: 'Student Test',
          national_id: '99999999999999',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'test@test.com',
          phone: '+20-9999999999',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(postResponse.body.success).toBe(false);
      expect(postResponse.body.message).toBe('الرابط غير صالح أو منتهي الصلاحية');

      console.log('✓ FIX VALIDATED: Expired links are correctly rejected');
    });
  });

  describe('Fix Validation 3.4: Edge case - link expires exactly at current time', () => {
    it('should reject link that expires at exactly current time', async () => {
      // Create a link that expires right now
      const nowLink = await RegistrationLink.create({
        created_by: 1,
        expires_at: new Date(),
        is_used: false
      });

      // Wait a tiny bit to ensure time has passed
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .get(`/api/auth/register-link/${nowLink.token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('انتهت صلاحية الرابط');

      console.log('✓ FIX VALIDATED: Link expiring at current time is rejected');
    });
  });

  describe('Fix Validation 3.5: Edge case - link expires 1 second in future', () => {
    it('should accept link that expires 1 second in the future', async () => {
      // Create a link that expires 1 second from now
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 1);

      const futureLink = await RegistrationLink.create({
        created_by: 1,
        expires_at: futureDate,
        is_used: false
      });

      const response = await request(app)
        .get(`/api/auth/register-link/${futureLink.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);

      console.log('✓ FIX VALIDATED: Link expiring 1 second in future is accepted');
    });
  });
});
