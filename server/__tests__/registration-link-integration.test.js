const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const RegistrationLink = require('../models/RegistrationLink');
const RegistrationRequest = require('../models/RegistrationRequest');
const Specialty = require('../models/Specialty');
const User = require('../models/User');

describe('Registration Link Integration Tests - End-to-End Scenarios', () => {
  let adminToken;
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
  });

  describe('Integration 5.1: Admin creates link, multiple students register successfully', () => {
    it('should allow 5+ students to register using same link within 24 hours', async () => {
      // Admin creates registration link
      const createLinkResponse = await request(app)
        .post('/api/admin/registration-links')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ expires_in_days: 1 })
        .expect(201);

      expect(createLinkResponse.body.success).toBe(true);
      expect(createLinkResponse.body.data.token).toBeDefined();

      const linkToken = createLinkResponse.body.data.token;

      // 7 students register using the same link
      const students = [];
      for (let i = 1; i <= 7; i++) {
        students.push({
          full_name: `Student ${i}`,
          national_id: `${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
          birth_date: `2000-0${i > 9 ? 1 : i}-0${i > 9 ? i - 9 : i}`,
          gender: i % 2 === 0 ? 'female' : 'male',
          email: `student${i}@test.com`,
          phone: `+20-${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
          specialty_id: testSpecialty.id
        });
      }

      const registrationResults = [];
      for (const student of students) {
        const response = await request(app)
          .post(`/api/auth/register-link/${linkToken}`)
          .send(student);

        registrationResults.push({
          name: student.full_name,
          status: response.status,
          success: response.body.success
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }

      // Verify all 7 students registered successfully
      const registrationCount = await RegistrationRequest.count();
      expect(registrationCount).toBe(7);

      // Verify link is still usable (not marked as used)
      const link = await RegistrationLink.findOne({ where: { token: linkToken } });
      expect(link).toBeDefined();
      expect(new Date(link.expires_at) > new Date()).toBe(true);

      console.log('✓ INTEGRATION TEST PASSED: 7 students registered successfully using same link');
      console.log('✓ Link remains usable for future registrations');
    });
  });

  describe('Integration 5.2: Link expiration flow', () => {
    it('should allow registrations before expiration, reject after expiration', async () => {
      // Create a link that expires in 2 seconds
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + 2);

      const link = await RegistrationLink.create({
        created_by: 1,
        expires_at: expiresAt,
        is_used: false
      });

      // Student 1 registers immediately (should succeed)
      const response1 = await request(app)
        .post(`/api/auth/register-link/${link.token}`)
        .send({
          full_name: 'Student One',
          national_id: '11111111111111',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'student1@test.com',
          phone: '+20-1111111111',
          specialty_id: testSpecialty.id
        })
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Wait for link to expire
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Student 2 attempts to register after expiration (should fail)
      const response2 = await request(app)
        .post(`/api/auth/register-link/${link.token}`)
        .send({
          full_name: 'Student Two',
          national_id: '22222222222222',
          birth_date: '2000-02-02',
          gender: 'female',
          email: 'student2@test.com',
          phone: '+20-2222222222',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.message).toBe('الرابط غير صالح أو منتهي الصلاحية');

      // Verify only 1 registration was created
      const registrationCount = await RegistrationRequest.count();
      expect(registrationCount).toBe(1);

      console.log('✓ INTEGRATION TEST PASSED: Expiration flow works correctly');
    });
  });

  describe('Integration 5.3: Mixed scenario - success and validation failures', () => {
    it('should handle mix of successful and failed registrations', async () => {
      // Create registration link
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      const link = await RegistrationLink.create({
        created_by: 1,
        expires_at: expiresAt,
        is_used: false
      });

      // Student 1: Successful registration
      const response1 = await request(app)
        .post(`/api/auth/register-link/${link.token}`)
        .send({
          full_name: 'Student One',
          national_id: '11111111111111',
          birth_date: '2000-01-01',
          gender: 'male',
          email: 'student1@test.com',
          phone: '+20-1111111111',
          specialty_id: testSpecialty.id
        })
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Student 2: Duplicate national_id (should fail)
      const response2 = await request(app)
        .post(`/api/auth/register-link/${link.token}`)
        .send({
          full_name: 'Student Two',
          national_id: '11111111111111', // Same as Student 1
          birth_date: '2000-02-02',
          gender: 'female',
          email: 'student2@test.com',
          phone: '+20-2222222222',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.message).toBe('يوجد طلب مسبق بهذا الرقم القومي');

      // Student 3: Missing required field (should fail)
      const response3 = await request(app)
        .post(`/api/auth/register-link/${link.token}`)
        .send({
          full_name: 'Student Three',
          national_id: '33333333333333',
          birth_date: '2000-03-03',
          gender: 'male',
          // email missing
          phone: '+20-3333333333',
          specialty_id: testSpecialty.id
        })
        .expect(400);

      expect(response3.body.success).toBe(false);
      expect(response3.body.message).toContain('يرجى ملء جميع الحقول المطلوبة');

      // Student 4: Successful registration
      const response4 = await request(app)
        .post(`/api/auth/register-link/${link.token}`)
        .send({
          full_name: 'Student Four',
          national_id: '44444444444444',
          birth_date: '2000-04-04',
          gender: 'female',
          email: 'student4@test.com',
          phone: '+20-4444444444',
          specialty_id: testSpecialty.id
        })
        .expect(200);

      expect(response4.body.success).toBe(true);

      // Student 5: Successful registration
      const response5 = await request(app)
        .post(`/api/auth/register-link/${link.token}`)
        .send({
          full_name: 'Student Five',
          national_id: '55555555555555',
          birth_date: '2000-05-05',
          gender: 'male',
          email: 'student5@test.com',
          phone: '+20-5555555555',
          specialty_id: testSpecialty.id
        })
        .expect(200);

      expect(response5.body.success).toBe(true);

      // Verify only 3 successful registrations (1, 4, 5)
      const registrationCount = await RegistrationRequest.count();
      expect(registrationCount).toBe(3);

      console.log('✓ INTEGRATION TEST PASSED: Mixed scenario handled correctly');
      console.log('✓ 3 successful registrations, 2 validation failures');
    });
  });

  describe('Integration 5.4: Database state verification', () => {
    it('should verify correct database state after multiple registrations', async () => {
      // Create registration link
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      const link = await RegistrationLink.create({
        created_by: 1,
        expires_at: expiresAt,
        is_used: false
      });

      const initialLinkState = {
        token: link.token,
        is_used: link.is_used,
        expires_at: link.expires_at
      };

      // 4 students register
      for (let i = 1; i <= 4; i++) {
        await request(app)
          .post(`/api/auth/register-link/${link.token}`)
          .send({
            full_name: `Student ${i}`,
            national_id: `${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
            birth_date: `2000-0${i}-0${i}`,
            gender: i % 2 === 0 ? 'female' : 'male',
            email: `student${i}@test.com`,
            phone: `+20-${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
            specialty_id: testSpecialty.id
          })
          .expect(200);
      }

      // Reload link from database
      await link.reload();

      // Verify link state
      expect(link.token).toBe(initialLinkState.token);
      expect(link.expires_at.getTime()).toBe(initialLinkState.expires_at.getTime());
      // Note: is_used might still be false or ignored after fix

      // Verify all 4 registration requests were created
      const requests = await RegistrationRequest.findAll({
        order: [['created_at', 'ASC']]
      });

      expect(requests.length).toBe(4);

      // Verify each registration request has correct data
      for (let i = 0; i < 4; i++) {
        expect(requests[i].full_name).toBe(`Student ${i + 1}`);
        expect(requests[i].national_id).toBe(`${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}${i + 1}`);
        expect(requests[i].email).toBe(`student${i + 1}@test.com`);
        expect(requests[i].specialty_id).toBe(testSpecialty.id);
        expect(requests[i].status).toBe('pending');
      }

      console.log('✓ INTEGRATION TEST PASSED: Database state is correct');
      console.log('✓ All 4 registration requests created with correct data');
      console.log('✓ Link remains usable');
    });
  });

  describe('Integration 5.5: Full workflow - Admin to Student Registration', () => {
    it('should complete full workflow from admin link creation to student registration', async () => {
      // Step 1: Admin creates registration link
      const createLinkResponse = await request(app)
        .post('/api/admin/registration-links')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ expires_in_days: 1 })
        .expect(201);

      expect(createLinkResponse.body.success).toBe(true);
      const linkToken = createLinkResponse.body.data.token;
      const registrationUrl = createLinkResponse.body.data.registration_url;

      console.log('Step 1: Admin created link:', registrationUrl);

      // Step 2: Student accesses the link to view registration form
      const getLinkResponse = await request(app)
        .get(`/api/auth/register-link/${linkToken}`)
        .expect(200);

      expect(getLinkResponse.body.success).toBe(true);
      expect(getLinkResponse.body.data.valid).toBe(true);
      expect(getLinkResponse.body.data.specialties).toBeDefined();

      console.log('Step 2: Student accessed link and viewed specialties');

      // Step 3: Student submits registration
      const registerResponse = await request(app)
        .post(`/api/auth/register-link/${linkToken}`)
        .send({
          full_name: 'Ahmed Mohamed',
          national_id: '12345678901234',
          birth_date: '2000-01-15',
          gender: 'male',
          email: 'ahmed@test.com',
          phone: '+20-1234567890',
          specialty_id: testSpecialty.id,
          high_school_certificate: 'ثانوية عامة',
          high_school_grade: '95.5',
          guardian_name: 'Mohamed Ahmed',
          guardian_phone: '+20-9876543210',
          guardian_relation: 'الأب'
        })
        .expect(200);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.message).toBe('تم إرسال طلبك بنجاح، انتظر موافقة الإدارة');

      console.log('Step 3: Student registered successfully');

      // Step 4: Admin views registration requests
      const getRequestsResponse = await request(app)
        .get('/api/admin/registration-requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(getRequestsResponse.body.success).toBe(true);
      expect(getRequestsResponse.body.data.length).toBe(1);
      expect(getRequestsResponse.body.data[0].full_name).toBe('Ahmed Mohamed');
      expect(getRequestsResponse.body.data[0].status).toBe('pending');

      console.log('Step 4: Admin viewed registration request');

      // Step 5: Another student uses the same link
      const secondRegisterResponse = await request(app)
        .post(`/api/auth/register-link/${linkToken}`)
        .send({
          full_name: 'Fatima Ali',
          national_id: '98765432109876',
          birth_date: '2000-02-20',
          gender: 'female',
          email: 'fatima@test.com',
          phone: '+20-1111111111',
          specialty_id: testSpecialty.id
        })
        .expect(200);

      expect(secondRegisterResponse.body.success).toBe(true);

      console.log('Step 5: Second student registered successfully using same link');

      // Verify final state
      const finalRequestsResponse = await request(app)
        .get('/api/admin/registration-requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(finalRequestsResponse.body.data.length).toBe(2);

      console.log('✓ FULL WORKFLOW INTEGRATION TEST PASSED');
      console.log('✓ 2 students registered successfully using same link');
    });
  });
});
