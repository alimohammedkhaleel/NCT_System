const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');
const RegistrationLink = require('../models/RegistrationLink');
const RegistrationRequest = require('../models/RegistrationRequest');
const Specialty = require('../models/Specialty');
const User = require('../models/User');

describe('Registration Branch Validation Tests', () => {
  let adminToken;
  let testLink;
  let ictSpecialty;
  let nonIctSpecialty;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminUser = await User.create({
      username: 'admin_branch_test',
      email: 'admin_branch@test.com',
      password_hash: await bcrypt.hash('password123', 12),
      full_name: 'Admin Branch Test',
      phone: '+20-1234567890',
      role: 'admin',
      is_active: true
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_branch_test', password: 'password123' });
    
    adminToken = loginRes.body.token;

    // Create ICT specialty
    ictSpecialty = await Specialty.create({
      code: 'ICT',
      name: 'Information Technology',
      arabic_name: 'تكنولوجيا المعلومات',
      duration_years: 4,
      total_credits: 132,
      annual_fee: 12000,
      is_active: true
    });

    // Create non-ICT specialty
    nonIctSpecialty = await Specialty.create({
      code: 'MCT',
      name: 'Mechatronics Technology',
      arabic_name: 'تكنولوجيا الميكاترونكس',
      duration_years: 4,
      total_credits: 132,
      annual_fee: 15000,
      is_active: true
    });

    // Create test registration link
    testLink = await RegistrationLink.create({
      token: 'branch-test-token-123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      max_uses: 10,
      current_uses: 0,
      created_by: adminUser.id
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear registration requests before each test
    await RegistrationRequest.destroy({ where: {} });
  });

  describe('ICT Year 3 Student Branch Validation', () => {
    it('should fail when ICT year 3 student registers without branch', async () => {
      const registrationData = {
        full_name: 'Ahmed Mohamed',
        national_id: '12345678901234',
        email: 'ahmed@test.com',
        phone: '+20-1111111111',
        specialty_id: ictSpecialty.id,
        current_year: 3,
        birth_date: '2000-01-01',
        gender: 'male',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'father'
        // branch is missing
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('اختيار الفرع مطلوب');
      expect(response.body.message_en).toContain('Branch selection is required');
    });

    it('should succeed when ICT year 3 student registers with Software branch', async () => {
      const registrationData = {
        full_name: 'Fatima Ali',
        national_id: '12345678901235',
        email: 'fatima@test.com',
        phone: '+20-1111111112',
        specialty_id: ictSpecialty.id,
        current_year: 3,
        branch: 'Software',
        birth_date: '2000-01-01',
        gender: 'female',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'mother'
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created with correct branch
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901235' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBe('Software');
    });

    it('should succeed when ICT year 3 student registers with Network branch', async () => {
      const registrationData = {
        full_name: 'Omar Hassan',
        national_id: '12345678901236',
        email: 'omar@test.com',
        phone: '+20-1111111113',
        specialty_id: ictSpecialty.id,
        current_year: 3,
        branch: 'Network',
        birth_date: '2000-01-01',
        gender: 'male',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'father'
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created with correct branch
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901236' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBe('Network');
    });
  });

  describe('ICT Year 4 Student Branch Validation', () => {
    it('should fail when ICT year 4 student registers without branch', async () => {
      const registrationData = {
        full_name: 'Mona Saeed',
        national_id: '12345678901237',
        email: 'mona@test.com',
        phone: '+20-1111111114',
        specialty_id: ictSpecialty.id,
        current_year: 4,
        birth_date: '1999-01-01',
        gender: 'female',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'mother'
        // branch is missing
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('اختيار الفرع مطلوب');
      expect(response.body.message_en).toContain('Branch selection is required');
    });

    it('should succeed when ICT year 4 student registers with valid branch', async () => {
      const registrationData = {
        full_name: 'Khaled Ahmed',
        national_id: '12345678901238',
        email: 'khaled@test.com',
        phone: '+20-1111111115',
        specialty_id: ictSpecialty.id,
        current_year: 4,
        branch: 'Software',
        birth_date: '1999-01-01',
        gender: 'male',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'father'
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created with correct branch
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901238' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBe('Software');
    });
  });

  describe('ICT Year 1-2 Student Branch Validation', () => {
    it('should succeed when ICT year 1 student registers without branch', async () => {
      const registrationData = {
        full_name: 'Sara Mohamed',
        national_id: '12345678901239',
        email: 'sara@test.com',
        phone: '+20-1111111116',
        specialty_id: ictSpecialty.id,
        current_year: 1,
        birth_date: '2002-01-01',
        gender: 'female',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'mother'
        // branch is not provided (should be allowed)
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created without branch
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901239' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBeNull();
    });

    it('should succeed when ICT year 2 student registers without branch', async () => {
      const registrationData = {
        full_name: 'Youssef Ali',
        national_id: '12345678901240',
        email: 'youssef@test.com',
        phone: '+20-1111111117',
        specialty_id: ictSpecialty.id,
        current_year: 2,
        birth_date: '2001-01-01',
        gender: 'male',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'father'
        // branch is not provided (should be allowed)
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created without branch
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901240' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBeNull();
    });
  });

  describe('Non-ICT Student Branch Validation', () => {
    it('should succeed when non-ICT student registers without branch', async () => {
      const registrationData = {
        full_name: 'Nour Hassan',
        national_id: '12345678901241',
        email: 'nour@test.com',
        phone: '+20-1111111118',
        specialty_id: nonIctSpecialty.id,
        current_year: 3,
        birth_date: '2000-01-01',
        gender: 'female',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'mother'
        // branch is not provided (should be allowed for non-ICT)
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created without branch
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901241' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBeNull();
    });

    it('should succeed when non-ICT year 4 student registers without branch', async () => {
      const registrationData = {
        full_name: 'Mahmoud Saeed',
        national_id: '12345678901242',
        email: 'mahmoud@test.com',
        phone: '+20-1111111119',
        specialty_id: nonIctSpecialty.id,
        current_year: 4,
        birth_date: '1999-01-01',
        gender: 'male',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'father'
        // branch is not provided (should be allowed for non-ICT)
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created without branch
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901242' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBeNull();
    });
  });

  describe('Invalid Branch Value Validation', () => {
    it('should fail when ICT year 3 student provides invalid branch value', async () => {
      const registrationData = {
        full_name: 'Layla Ahmed',
        national_id: '12345678901243',
        email: 'layla@test.com',
        phone: '+20-1111111120',
        specialty_id: ictSpecialty.id,
        current_year: 3,
        branch: 'InvalidBranch', // Invalid branch value
        birth_date: '2000-01-01',
        gender: 'female',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'mother'
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('قيمة الفرع غير صالحة');
      expect(response.body.message_en).toContain('Invalid branch value');
    });

    it('should fail when ICT year 4 student provides empty string as branch', async () => {
      const registrationData = {
        full_name: 'Rami Hassan',
        national_id: '12345678901244',
        email: 'rami@test.com',
        phone: '+20-1111111121',
        specialty_id: ictSpecialty.id,
        current_year: 4,
        branch: '', // Empty string (should be treated as missing)
        birth_date: '1999-01-01',
        gender: 'male',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'father'
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('اختيار الفرع مطلوب');
      expect(response.body.message_en).toContain('Branch selection is required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle specialty with "Information" in name as ICT', async () => {
      // Create specialty with "Information" in name
      const infoSpecialty = await Specialty.create({
        code: 'INFO',
        name: 'Information Systems Technology',
        arabic_name: 'تكنولوجيا نظم المعلومات',
        duration_years: 4,
        total_credits: 132,
        annual_fee: 12000,
        is_active: true
      });

      const registrationData = {
        full_name: 'Hala Mohamed',
        national_id: '12345678901245',
        email: 'hala@test.com',
        phone: '+20-1111111122',
        specialty_id: infoSpecialty.id,
        current_year: 3,
        birth_date: '2000-01-01',
        gender: 'female',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'mother'
        // branch is missing - should fail for Information specialty
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('اختيار الفرع مطلوب');
    });

    it('should allow branch for non-ICT student but not require it', async () => {
      const registrationData = {
        full_name: 'Tamer Ali',
        national_id: '12345678901246',
        email: 'tamer@test.com',
        phone: '+20-1111111123',
        specialty_id: nonIctSpecialty.id,
        current_year: 3,
        branch: 'Software', // Branch provided but not required
        birth_date: '2000-01-01',
        gender: 'male',
        address: 'Test Address',
        guardian_name: 'Guardian Name',
        guardian_phone: '+20-2222222222',
        guardian_relation: 'father'
      };

      const response = await request(app)
        .post(`/api/auth/register-link/${testLink.token}`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('تم إرسال طلبك بنجاح');

      // Verify registration request was created with branch (even though not required)
      const registrationRequest = await RegistrationRequest.findOne({
        where: { national_id: '12345678901246' }
      });
      expect(registrationRequest).toBeTruthy();
      expect(registrationRequest.branch).toBe('Software');
    });
  });
});