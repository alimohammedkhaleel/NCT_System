/**
 * Preservation Property Tests
 * 
 * Property 2: Preservation - Courses with custom config continue to display correctly
 * 
 * IMPORTANT: Follow observation-first methodology
 * These tests capture the current behavior on unfixed code and ensure it's preserved after the fix
 */

const request = require('supertest');
const app = require('../server');
const { sequelize, Course, CourseGradeConfig, Specialty, AcademicYear, Semester } = require('../config/models');

describe('Grade Settings - Preservation: Existing Functionality', () => {
  let authToken;
  let testSpecialty;
  let testAcademicYear;
  let testSemester;
  let courseWithCustomConfig;

  beforeAll(async () => {
    // Login as admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nctu.edu',
        password: 'admin123'
      });
    
    authToken = loginRes.body.token;

    // Create test data
    testSpecialty = await Specialty.create({
      code: 'PRES',
      name: 'Preservation Test',
      arabic_name: 'اختبار الحفاظ',
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
      semester_name: 'Spring 2024',
      is_active: true
    });

    // Create course with custom config
    courseWithCustomConfig = await Course.create({
      course_code: 'PRES201',
      course_name: 'Preservation Course',
      arabic_name: 'مادة الحفاظ',
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      credits: 3,
      is_active: true
    });

    await CourseGradeConfig.create({
      course_id: courseWithCustomConfig.id,
      ass1_percentage: 25.00,
      ass2_percentage: 25.00,
      final_percentage: 50.00,
      ass1_max: 50.00,
      ass2_max: 50.00,
      final_max: 100.00,
      p_value: 35.00,
      m_value: 25.00,
      d_value: 18.00
    });
  });

  afterAll(async () => {
    // Cleanup
    if (courseWithCustomConfig) {
      await CourseGradeConfig.destroy({ where: { course_id: courseWithCustomConfig.id } });
      await courseWithCustomConfig.destroy();
    }
    if (testSemester) await testSemester.destroy();
    if (testAcademicYear) await testAcademicYear.destroy();
    if (testSpecialty) await testSpecialty.destroy();
    await sequelize.close();
  });

  test('Preservation: Course with custom config displays custom values', async () => {
    const response = await request(app)
      .get('/api/admin/course-grade-config')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ specialty_id: testSpecialty.id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    const configs = response.body.data;
    const courseConfig = configs.find(c => c.course_id === courseWithCustomConfig.id);
    
    // Should be present
    expect(courseConfig).toBeDefined();
    
    // Should have custom values (NOT default values)
    expect(courseConfig.ass1_percentage).toBe(25.00);
    expect(courseConfig.ass2_percentage).toBe(25.00);
    expect(courseConfig.final_percentage).toBe(50.00);
    expect(courseConfig.ass1_max).toBe(50.00);
    expect(courseConfig.ass2_max).toBe(50.00);
    expect(courseConfig.final_max).toBe(100.00);
    expect(courseConfig.p_value).toBe(35.00);
    expect(courseConfig.m_value).toBe(25.00);
    expect(courseConfig.d_value).toBe(18.00);
    
    // Should have config id (not null)
    expect(courseConfig.id).not.toBeNull();
  });

  test('Preservation: Data structure contains all required fields', async () => {
    const response = await request(app)
      .get('/api/admin/course-grade-config')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ specialty_id: testSpecialty.id });

    expect(response.status).toBe(200);
    const configs = response.body.data;
    
    expect(configs.length).toBeGreaterThan(0);
    
    const courseConfig = configs[0];
    
    // Verify all required fields exist
    expect(courseConfig).toHaveProperty('id');
    expect(courseConfig).toHaveProperty('course_id');
    expect(courseConfig).toHaveProperty('course_code');
    expect(courseConfig).toHaveProperty('course_name');
    expect(courseConfig).toHaveProperty('arabic_name');
    expect(courseConfig).toHaveProperty('specialty_name');
    expect(courseConfig).toHaveProperty('ass1_percentage');
    expect(courseConfig).toHaveProperty('ass2_percentage');
    expect(courseConfig).toHaveProperty('final_percentage');
    expect(courseConfig).toHaveProperty('ass1_max');
    expect(courseConfig).toHaveProperty('ass2_max');
    expect(courseConfig).toHaveProperty('final_max');
    expect(courseConfig).toHaveProperty('p_value');
    expect(courseConfig).toHaveProperty('m_value');
    expect(courseConfig).toHaveProperty('d_value');
  });

  test('Preservation: Filter by specialty_id works correctly', async () => {
    // Create another specialty with a course
    const otherSpecialty = await Specialty.create({
      code: 'OTHER',
      name: 'Other Specialty',
      arabic_name: 'تخصص آخر',
      duration_years: 4,
      total_credits: 120,
      annual_fee: 10000,
      is_active: true
    });

    const otherYear = await AcademicYear.create({
      specialty_id: otherSpecialty.id,
      year_number: 1,
      is_active: true
    });

    const otherSemester = await Semester.create({
      academic_year_id: otherYear.id,
      semester_name: 'Fall 2024',
      is_active: true
    });

    const otherCourse = await Course.create({
      course_code: 'OTHER301',
      course_name: 'Other Course',
      arabic_name: 'مادة أخرى',
      specialty_id: otherSpecialty.id,
      academic_year_id: otherYear.id,
      semester_id: otherSemester.id,
      credits: 3,
      is_active: true
    });

    await CourseGradeConfig.create({
      course_id: otherCourse.id,
      ass1_percentage: 20.00,
      ass2_percentage: 20.00,
      final_percentage: 60.00,
      ass1_max: 40.00,
      ass2_max: 40.00,
      final_max: 120.00,
      p_value: 30.00,
      m_value: 21.00,
      d_value: 15.00
    });

    // Filter by testSpecialty - should NOT include otherCourse
    const response = await request(app)
      .get('/api/admin/course-grade-config')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ specialty_id: testSpecialty.id });

    expect(response.status).toBe(200);
    const configs = response.body.data;
    
    // Should only have courses from testSpecialty
    const courseIds = configs.map(c => c.course_id);
    expect(courseIds).toContain(courseWithCustomConfig.id);
    expect(courseIds).not.toContain(otherCourse.id);

    // Cleanup
    await CourseGradeConfig.destroy({ where: { course_id: otherCourse.id } });
    await otherCourse.destroy();
    await otherSemester.destroy();
    await otherYear.destroy();
    await otherSpecialty.destroy();
  });

  test('Preservation: Response format is correct', async () => {
    const response = await request(app)
      .get('/api/admin/course-grade-config')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('count');
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(typeof response.body.count).toBe('number');
  });
});
