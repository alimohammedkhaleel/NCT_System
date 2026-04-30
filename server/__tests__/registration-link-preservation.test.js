const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const RegistrationLink = require('../models/RegistrationLink');
const RegistrationRequest = require('../models/RegistrationRequest');
const Specialty = require('../models/Specialty');
const User = require('../models/User');

describe('Registration Link Preservation Tests - Verify Unchanged Behavior', () => {
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
    expiresAt.setDate(expiresAt.getDate() + 1);

    testLink = await RegistrationLink.create({
      created_by: 1,
      expires_at: expiresAt,
      is_used: false
    });
  });

  describe('Preservation 4.1: Invalid tokens are rejected', () => {
    it('should reject invalid token with "رابط غير صالح"', async () => {
      const invalidTokens = [
        'invalid-token-123',
        'not-a-uuid',
        '00000000-0000-0000-0000-000000000000',
        'malformed-token',
        ''
      ];

      for (const token of invalidTokens) {
        const getResponse = await request(app)
          .get(`/api/auth/register-link/${token}`)
          .expect(404);

        expect(getResponse.body.success).toBe(false);
        expect(getResponse.body.message).toBe('رابط غير صالح');
      }

      console.log('✓ PRESERVATION VALIDATED: Invalid tokens rejected correctly');
    });

    it('should reject POST with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/register-link/invalid-token')
        .send({
          full_name: 'Test Student',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'test@test.com',
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('الرابط غير صالح أو منتهي الصلاحية');

      console.log('✓ PRESERVATION VALIDATED: POST with invalid token rejected');
    });
  });

  describe('Preservation 4.2: Expired links are rejected', () => {
    it('should reject expired link with "انتهت صلاحية الرابط"', async () => {
      // Create multiple expired links with different expiration times
      const expiredDates = [
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        new Date(Date.now() - 1000) // 1 second ago
      ];

      for (const expiredDate of expiredDates) {
        const expiredLink = await RegistrationLink.create({
          created_by: 1,
          expires_at: expiredDate,
          is_used: false
        });

        const getResponse = await request(app)
          .get(`/api/auth/register-link/${expiredLink.token}`)
          .expect(400);

        expect(getResponse.body.success).toBe(false);
        expect(getResponse.body.message).toBe('انتهت صلاحية الرابط');

        await expiredLink.destroy();
      }

      console.log('✓ PRESERVATION VALIDATED: Expired links rejected correctly');
    });

    it('should reject POST with expired link', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const expiredLink = await RegistrationLink.create({
        created_by: 1,
        expires_at: expiredDate,
        is_used: false
      });

      const response = await request(app)
        .post(`/api/auth/register-link/${expiredLink.token}`)
        .send({
          full_name: 'Test Student',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'test@test.com',
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('الرابط غير صالح أو منتهي الصلاحية');

      console.log('✓ PRESERVATION VALIDATED: POST with expired link rejected');
    });
  });

  describe('Preservation 4.3: Duplicate national_id is rejected', () => {
    it('should reject duplicate national_id with correct error message', async () => {
      // First student registers successfully
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

      // Second student attempts to register with same national_id
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Student Two',
          national_id: '12345678901234', // Same national_id
          birth_date: '2000-02-02',
          gender: 'female',
          email: 'student2@test.com',
          phone: '+20-2222222222',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('يوجد طلب مسبق بهذا الرقم القومي');

      console.log('✓ PRESERVATION VALIDATED: Duplicate national_id rejected correctly');
    });
  });

  describe('Preservation 4.4: Missing required fields are rejected', () => {
    it('should reject registration with missing full_name', async () => {
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          // full_name missing
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'test@test.com',
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');
    });

    it('should reject registration with missing national_id', async () => {
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Test Student',
          // national_id missing
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'test@test.com',
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');
    });

    it('should reject registration with missing email', async () => {
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Test Student',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          // email missing
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');
    });

    it('should reject registration with missing specialty_id', async () => {
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Test Student',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'test@test.com',
          phone: '+20-1234567890'
          // specialty_id missing
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');
    });

    it('should reject registration with missing birth_date', async () => {
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Test Student',
          national_id: '12345678901234',
          // birth_date missing
          gender: 'male',
          email: 'test@test.com',
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');
    });

    it('should reject registration with missing gender', async () => {
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Test Student',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          // gender missing
          email: 'test@test.com',
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');
    });

    it('should reject registration with missing phone', async () => {
      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send({
          full_name: 'Test Student',
          national_id: '12345678901234',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'test@test.com',
          // phone missing
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');
    });

    console.log('✓ PRESERVATION VALIDATED: Missing required fields rejected correctly');
  });

  describe('Preservation 4.5: Specialty retrieval works correctly', () => {
    it('should return active specialties when accessing valid link', async () => {
      const response = await request(app)
        .get(`/api/auth/register-link/${testLink.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.specialties).toBeDefined();
      expect(Array.isArray(response.body.data.specialties)).toBe(true);
      expect(response.body.data.specialties.length).toBeGreaterThan(0);
      expect(response.body.data.specialties[0]).toHaveProperty('id');
      expect(response.body.data.specialties[0]).toHaveProperty('code');
      expect(response.body.data.specialties[0]).toHaveProperty('name');
      expect(response.body.data.specialties[0]).toHaveProperty('arabic_name');

      console.log('✓ PRESERVATION VALIDATED: Specialty retrieval works correctly');
    });
  });
});
