/**
 * Integration Tests for Professor Grades Course-Student Linking Fix
 * 
 * Tests complete workflows from course creation to grade calculation
 * Covers Tasks 8.1 - 8.5
 */

const request = require('supertest');
const { sequelize } = require('../config/models');
const User = require('../models/User');
const Professor = require('../models/Professor');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Specialty = require('../models/Specialty');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const ProfessorCourse = require('../models/ProfessorCourse');
const Grade = require('../models/Grade');
const CourseGradeConfig = require('../models/CourseGradeConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const adminRoutes = require('../routes/adminRoutes');
const gradeRoutes = require('../routes/gradeRoutes');

app.use('/admin', adminRoutes);
app.use('/grades', gradeRoutes);

describe('Integration Tests - Professor Grades Full Workflows', () => {
  let adminUser, adminToken;
  let professorUser, professorRecord, professorToken;
  let specialty, academicYear, semester1, semester2;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create admin user
    adminUser = await User.create({
      username: 'admin001',
      email: 'admin@test.com',
      password_hash: hashedPassword,
      full_name: 'Admin User',
      role: 'admin',
      is_active: true
    });

    adminToken = jwt.sign(
      { id: adminUser.id, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create professor user
    professorUser = await User.create({
      username: 'prof001',
      email: 'professor@test.com',
      password_hash: hashedPassword,
      full_name: 'Dr. Ahmed Ali',
      role: 'professor',
      is_active: true
    });

    professorRecord = await Professor.create({
      user_id: professorUser.id,
      professor_code: 'PROF-001',
      department: 'Computer Science',
      is_active: true
    });

    professorToken = jwt.sign(
      { id: professorUser.id, role: 'professor' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create specialty
    specialty = await Specialty.create({
      code: 'ICT',
      name: 'Information Technology',
      arabic_name: 'تكنولوجيا المعلومات'
    });

    // Create academic year
    academicYear = await AcademicYear.create({
      specialty_id: specialty.id,
      year_number: 1,
      academic_season: '2024-2025'
    });

    // Create semesters
    semester1 = await Semester.create({
      academic_year_id: academicYear.id,
      semester_name: 'Fall',
      arabic_name: 'الفصل الدراسي الأول',
      start_date: '2024-09-01',
      end_date: '2025-01-31',
      is_active: true
    });

    semester2 = await Semester.create({
      academic_year_id: academicYear.id,
      semester_name: 'Spring',
      arabic_name: 'الفصل الدراسي الثاني',
      start_date: '2025-02-01',
      end_date: '2025-06-30',
      is_active: true
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('8.1 - Full flow: Add course with semester → verify in Admin Courses', () => {
    test('Should create course with semester and retrieve it correctly', async () => {
      // Step 1: Create course with semester
      const courseData = {
        course_code: 'ICT101',
        course_name: 'Introduction to Programming',
        arabic_name: 'مقدمة في البرمجة',
        specialty_id: specialty.id,
        academic_year_id: 1,
        semester_id: semester1.id,
        credit_hours: 3,
        is_active: true
      };

      const createResponse = await request(app)
        .post('/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.semester_id).toBe(semester1.id);

      const courseId = createResponse.body.data.id;

      // Step 2: Verify course appears in Admin Courses list
      const listResponse = await request(app)
        .get('/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.success).toBe(true);

      const createdCourse = listResponse.body.data.find(c => c.id === courseId);
      expect(createdCourse).toBeDefined();
      expect(createdCourse.semester_id).toBe(semester1.id);
      expect(createdCourse.semester_arabic).toBe('الفصل الدراسي الأول');
    });

    test('Should filter courses by semester', async () => {
      // Create another course with different semester
      await Course.create({
        course_code: 'ICT102',
        course_name: 'Data Structures',
        arabic_name: 'هياكل البيانات',
        specialty_id: specialty.id,
        academic_year_id: 1,
        semester_id: semester2.id,
        credit_hours: 3,
        is_active: true
      });

      // Filter by semester1
      const response = await request(app)
        .get('/admin/courses')
        .query({ semester_id: semester1.id })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      // All returned courses should be from semester1
      response.body.data.forEach(course => {
        expect(course.semester_id).toBe(semester1.id);
      });
    });
  });

  describe('8.2 - Full flow: Add course → verify in Professor Grades', () => {
    let testCourse;

    beforeAll(async () => {
      // Create a course
      testCourse = await Course.create({
        course_code: 'ICT201',
        course_name: 'Advanced Programming',
        arabic_name: 'البرمجة المتقدمة',
        specialty_id: specialty.id,
        academic_year_id: 1,
        semester_id: semester1.id,
        credit_hours: 3,
        is_active: true
      });

      // Assign professor to course
      await ProfessorCourse.create({
        professor_id: professorRecord.id,
        course_id: testCourse.id,
        academic_year_id: academicYear.id,
        semester_id: semester1.id,
        is_primary: true
      });
    });

    test('Should see assigned course in professor grades page', async () => {
      const response = await request(app)
        .get('/grades/professor/courses')
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      
      const assignedCourse = response.body.data.find(c => c.id === testCourse.id);
      expect(assignedCourse).toBeDefined();
      expect(assignedCourse.semester_id).toBe(semester1.id);
    });
  });

  describe('8.3 - Full flow: Add students → select course → verify students appear', () => {
    let testCourse, student1, student2, student3;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      // Create course
      testCourse = await Course.create({
        course_code: 'ICT301',
        course_name: 'Database Systems',
        arabic_name: 'نظم قواعد البيانات',
        specialty_id: specialty.id,
        academic_year_id: 1,
        semester_id: semester1.id,
        credit_hours: 3,
        is_active: true
      });

      // Assign professor to course
      await ProfessorCourse.create({
        professor_id: professorRecord.id,
        course_id: testCourse.id,
        academic_year_id: academicYear.id,
        semester_id: semester1.id,
        is_primary: true
      });

      // Create students in same specialty and year
      const user1 = await User.create({
        username: 'student001',
        email: 'student1@test.com',
        password_hash: hashedPassword,
        full_name: 'محمد أحمد',
        role: 'student',
        is_active: true
      });

      student1 = await Student.create({
        user_id: user1.id,
        student_code: 'STU-001',
        specialty_id: specialty.id,
        current_year: 1,
        academic_status: 'active'
      });

      const user2 = await User.create({
        username: 'student002',
        email: 'student2@test.com',
        password_hash: hashedPassword,
        full_name: 'فاطمة علي',
        role: 'student',
        is_active: true
      });

      student2 = await Student.create({
        user_id: user2.id,
        student_code: 'STU-002',
        specialty_id: specialty.id,
        current_year: 1,
        academic_status: 'active'
      });

      // Create student in different year (should NOT appear)
      const user3 = await User.create({
        username: 'student003',
        email: 'student3@test.com',
        password_hash: hashedPassword,
        full_name: 'علي محمود',
        role: 'student',
        is_active: true
      });

      student3 = await Student.create({
        user_id: user3.id,
        student_code: 'STU-003',
        specialty_id: specialty.id,
        current_year: 2, // Different year
        academic_status: 'active'
      });
    });

    test('Should display correct students after selecting course', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: testCourse.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const studentIds = response.body.data.map(s => s.student_id);
      
      // Should include students from same specialty and year
      expect(studentIds).toContain(student1.id);
      expect(studentIds).toContain(student2.id);
      
      // Should NOT include student from different year
      expect(studentIds).not.toContain(student3.id);
    });

    test('Should include course info with semester', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: testCourse.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.course_info).toBeDefined();
      expect(response.body.course_info.semester_name).toBe('الفصل الدراسي الأول');
    });
  });

  describe('8.4 - Full flow: Add grades → verify grade calculation', () => {
    let testCourse, testStudent;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      // Create course
      testCourse = await Course.create({
        course_code: 'ICT401',
        course_name: 'Software Engineering',
        arabic_name: 'هندسة البرمجيات',
        specialty_id: specialty.id,
        academic_year_id: 1,
        semester_id: semester1.id,
        credit_hours: 3,
        is_active: true
      });

      // Assign professor
      await ProfessorCourse.create({
        professor_id: professorRecord.id,
        course_id: testCourse.id,
        academic_year_id: academicYear.id,
        semester_id: semester1.id,
        is_primary: true
      });

      // Create course config
      await CourseGradeConfig.create({
        course_id: testCourse.id,
        ass1_max: 30.00,
        ass2_max: 30.00,
        final_max: 150.00,
        p_value: 30.00,
        m_value: 21.00,
        d_value: 15.00
      });

      // Create student
      const user = await User.create({
        username: 'student101',
        email: 'student101@test.com',
        password_hash: hashedPassword,
        full_name: 'سارة خالد',
        role: 'student',
        is_active: true
      });

      testStudent = await Student.create({
        user_id: user.id,
        student_code: 'STU-101',
        specialty_id: specialty.id,
        current_year: 1,
        academic_status: 'active'
      });
    });

    test('Should calculate grades correctly based on config', async () => {
      // Add grade
      const gradeData = {
        student_id: testStudent.id,
        course_id: testCourse.id,
        academic_year_id: academicYear.id,
        semester_id: semester1.id,
        assignment1_grade: 'P', // 30 points
        assignment2_grade: 'M', // 21 points
        final_exam_score: 120
      };

      const response = await request(app)
        .post('/grades/professor/save-grade')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(gradeData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify calculations
      const grade = response.body.data;
      expect(grade.assignment1_score).toBe(30.00);
      expect(grade.assignment2_score).toBe(21.00);
      expect(grade.final_exam_score).toBe(120.00);
      expect(grade.total_score).toBe(171.00); // 30 + 21 + 120
      
      // Calculate expected percentage: (171 / 210) * 100 = 81.43%
      expect(grade.total_percentage).toBeCloseTo(81.43, 1);
    });

    test('Should preserve grade settings functionality', async () => {
      // Verify course config is used correctly
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: testCourse.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.course_config).toBeDefined();
      expect(response.body.course_config.p_value).toBe(30.00);
      expect(response.body.course_config.m_value).toBe(21.00);
      expect(response.body.course_config.d_value).toBe(15.00);
    });
  });

  describe('8.5 - Full flow: Use filters → verify correct results', () => {
    let course1, course2, student1, student2;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      // Create courses in different semesters
      course1 = await Course.create({
        course_code: 'ICT501',
        course_name: 'Web Development',
        arabic_name: 'تطوير الويب',
        specialty_id: specialty.id,
        academic_year_id: 1,
        semester_id: semester1.id,
        credit_hours: 3,
        is_active: true
      });

      course2 = await Course.create({
        course_code: 'ICT502',
        course_name: 'Mobile Development',
        arabic_name: 'تطوير التطبيقات',
        specialty_id: specialty.id,
        academic_year_id: 1,
        semester_id: semester2.id,
        credit_hours: 3,
        is_active: true
      });

      // Assign both courses to professor
      await ProfessorCourse.create({
        professor_id: professorRecord.id,
        course_id: course1.id,
        academic_year_id: academicYear.id,
        semester_id: semester1.id,
        is_primary: true
      });

      await ProfessorCourse.create({
        professor_id: professorRecord.id,
        course_id: course2.id,
        academic_year_id: academicYear.id,
        semester_id: semester2.id,
        is_primary: true
      });

      // Create students
      const user1 = await User.create({
        username: 'student201',
        email: 'student201@test.com',
        password_hash: hashedPassword,
        full_name: 'أحمد محمد',
        role: 'student',
        is_active: true
      });

      student1 = await Student.create({
        user_id: user1.id,
        student_code: 'STU-201',
        specialty_id: specialty.id,
        current_year: 1,
        academic_status: 'active'
      });

      const user2 = await User.create({
        username: 'student202',
        email: 'student202@test.com',
        password_hash: hashedPassword,
        full_name: 'ليلى حسن',
        role: 'student',
        is_active: true
      });

      student2 = await Student.create({
        user_id: user2.id,
        student_code: 'STU-202',
        specialty_id: specialty.id,
        current_year: 1,
        academic_status: 'active'
      });
    });

    test('Should filter courses by semester correctly', async () => {
      // Filter by semester1
      const response = await request(app)
        .get('/grades/professor/courses')
        .query({ semester_id: semester1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      
      const courseIds = response.body.data.map(c => c.id);
      expect(courseIds).toContain(course1.id);
      expect(courseIds).not.toContain(course2.id);
    });

    test('Should filter courses by specialty and semester', async () => {
      const response = await request(app)
        .get('/admin/courses')
        .query({ 
          specialty_id: specialty.id,
          semester_id: semester1.id 
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      // All courses should match both filters
      response.body.data.forEach(course => {
        expect(course.specialty_id).toBe(specialty.id);
        expect(course.semester_id).toBe(semester1.id);
      });
    });

    test('Should return students for correct semester course', async () => {
      // Get students for course1 (semester1)
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Verify course info includes correct semester
      expect(response.body.course_info.semester_name).toBe('الفصل الدراسي الأول');
    });
  });
});
