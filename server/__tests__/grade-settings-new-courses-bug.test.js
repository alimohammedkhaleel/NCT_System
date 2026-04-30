/**
 * Bug Condition Exploration Test
 * 
 * Property 1: Bug Condition - New courses without CourseGradeConfig don't appear in getAllConfigs
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 */

const request = require('supertest');
const app = require('../server');
const { sequelize, Course, CourseGradeConfig, Specialty, AcademicYear, Semester } = require('../config/models');

describe('Grade Settings - Bug Condition: New Courses Not Showing', () => {
  let authToken;
  let testSpecialty;
  let testAcademicYear;
  let testSemester;
  let newCourseWithoutConfig;
  let existingCourseWithConfig;

  beforeAll(async () => {
    // Login as admin to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nctu.edu',
        password: 'admin123'
      });
    
    authToken = loginRes.body.token;

    // Create test data
    testSpecialty = await Specialty.create({
      code: 'TEST',
      name: 'Test Specialty',
      arabic_name: 'تخصص اختبار',
      duration_years: 4,
      total_credits: 120,
      annual_fee: 10000,
      is_active: true
    });

    testAcademicYear = await AcademicYear.create({
      specialty_id: testSpecialty.id,
      year_number: 1,
      is_active: true
    });

    testSemester = await Semester.create({
      academic_year_id: testAcademicYear.id,
      semester_name: 'Fall 2024',
      is_active: true
    });

    // Create a course WITH config (should appear in both old and new code)
    existingCourseWithConfig = await Course.create({
      course_code: 'TEST101',
      course_name: 'Existing Course',
      arabic_name: 'مادة موجودة',
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      credits: 3,
      is_active: true
    });

    await CourseGradeConfig.create({
      course_id: existingCourseWithConfig.id,
      ass1_percentage: 20.00,
      ass2_percentage: 20.00,
      final_percentage: 60.00,
      ass1_max: 40.00,
      ass2_max: 40.00,
      final_max: 120.00,
      p_value: 25.00,
      m_value: 18.00,
      d_value: 12.00
    });

    // Create a NEW course WITHOUT config (BUG: won't appear in unfixed code)
    newCourseWithoutConfig = await Course.create({
      course_code: 'TEST102',
      course_name: 'New Course Without Config',
      arabic_name: 'مادة جديدة بدون إعدادات',
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      credits: 3,
      is_active: true
    });
  });

  afterAll(async () => {
    // Cleanup
    if (newCourseWithoutConfig) await newCourseWithoutConfig.destroy();
    if (existingCourseWithConfig) {
      await CourseGradeConfig.destroy({ where: { course_id: existingCourseWithConfig.id } });
      await existingCourseWithConfig.destroy();
    }
    if (testSemester) await testSemester.destroy();
    if (testAcademicYear) await testAcademicYear.destroy();
    if (testSpecialty) await testSpecialty.destroy();
    await sequelize.close();
  });

  test('Bug Condition: New course without config should appear with default values', async () => {
    // Call getAllConfigs
    const response = await request(app)
      .get('/api/admin/course-grade-config')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ specialty_id: testSpecialty.id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    const configs = response.body.data;
    
    // Find the new course in results
    const newCourseConfig = configs.find(c => c.course_id === newCourseWithoutConfig.id);
    
    // EXPECTED TO FAIL ON UNFIXED CODE: New course won't be in the results
    expect(newCourseConfig).toBeDefined();
    expect(newCourseConfig.course_code).toBe('TEST102');
    
    // Should have default values
    expect(newCourseConfig.ass1_percentage).toBe(15.00);
    expect(newCourseConfig.ass2_percentage).toBe(15.00);
    expect(newCourseConfig.final_percentage).toBe(70.00);
    expect(newCourseConfig.ass1_max).toBe(30.00);
    expect(newCourseConfig.ass2_max).toBe(30.00);
    expect(newCourseConfig.final_max).toBe(150.00);
    expect(newCourseConfig.p_value).toBe(30.00);
    expect(newCourseConfig.m_value).toBe(21.00);
    expect(newCourseConfig.d_value).toBe(15.00);
    
    // id should be null (no config record exists)
    expect(newCourseConfig.id).toBeNull();
  });

  test('Bug Condition: Multiple new courses without config should all appear', async () => {
    // Create 3 more new courses without config
    const newCourses = await Promise.all([
      Course.create({
        course_code: 'TEST103',
        course_name: 'New Course 3',
        arabic_name: 'مادة جديدة 3',
        specialty_id: testSpecialty.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        credits: 3,
        is_active: true
      }),
      Course.create({
        course_code: 'TEST104',
        course_name: 'New Course 4',
        arabic_name: 'مادة جديدة 4',
        specialty_id: testSpecialty.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        credits: 3,
        is_active: true
      }),
      Course.create({
        course_code: 'TEST105',
        course_name: 'New Course 5',
        arabic_name: 'مادة جديدة 5',
        specialty_id: testSpecialty.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        credits: 3,
        is_active: true
      })
    ]);

    const response = await request(app)
      .get('/api/admin/course-grade-config')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ specialty_id: testSpecialty.id });

    expect(response.status).toBe(200);
    const configs = response.body.data;
    
    // EXPECTED TO FAIL ON UNFIXED CODE: New courses won't appear
    // Should have at least 5 courses total (1 with config + 4 without)
    expect(configs.length).toBeGreaterThanOrEqual(5);
    
    // All new courses should be present
    for (const course of newCourses) {
      const found = configs.find(c => c.course_id === course.id);
      expect(found).toBeDefined();
      expect(found.ass1_percentage).toBe(15.00); // Default value
    }

    // Cleanup
    await Promise.all(newCourses.map(c => c.destroy()));
  });

  test('Bug Condition: Filter by specialty should include new courses', async () => {
    const response = await request(app)
      .get('/api/admin/course-grade-config')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ specialty_id: testSpecialty.id });

    expect(response.status).toBe(200);
    const configs = response.body.data;
    
    // EXPECTED TO FAIL ON UNFIXED CODE: Only course with config will appear
    // Should have at least 2 courses (1 with config + 1 without)
    expect(configs.length).toBeGreaterThanOrEqual(2);
    
    // Both courses should be present
    const courseIds = configs.map(c => c.course_id);
    expect(courseIds).toContain(existingCourseWithConfig.id);
    expect(courseIds).toContain(newCourseWithoutConfig.id);
  });
});
