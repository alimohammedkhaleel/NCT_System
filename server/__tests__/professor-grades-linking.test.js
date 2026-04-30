/**
 * Backend Tests for Professor Grades Course-Student Linking Fix
 * 
 * Tests the new getStudentsByCourse endpoint that fetches students
 * based on specialty_id, academic_year_id, and semester_id
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
const gradeRoutes = require('../routes/gradeRoutes');
app.use('/grades', gradeRoutes);

describe('Professor Grades Course-Student Linking', () => {
  let professorUser, professorRecord, professorToken;
  let specialty1, specialty2;
  let academicYear1, academicYear2;
  let semester1, semester2;
  let course1, course2, course3;
  let student1, student2, student3, student4;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create specialties
    specialty1 = await Specialty.create({
      code: 'ICT',
      name: 'Information Technology',
      arabic_name: 'تكنولوجيا المعلومات'
    });

    specialty2 = await Specialty.create({
      code: 'MCT',
      name: 'Mechatronics Technology',
      arabic_name: 'تكنولوجيا الميكاترونكس'
    });

    // Create academic years
    academicYear1 = await AcademicYear.create({
      specialty_id: specialty1.id,
      year_number: 1,
      academic_season: '2024-2025'
    });

    academicYear2 = await AcademicYear.create({
      specialty_id: specialty1.id,
      year_number: 2,
      academic_season: '2024-2025'
    });

    // Create semesters
    semester1 = await Semester.create({
      academic_year_id: academicYear1.id,
      semester_name: 'Fall',
      arabic_name: 'الفصل الدراسي الأول',
      start_date: '2024-09-01',
      end_date: '2025-01-31',
      is_active: true
    });

    semester2 = await Semester.create({
      academic_year_id: academicYear1.id,
      semester_name: 'Spring',
      arabic_name: 'الفصل الدراسي الثاني',
      start_date: '2025-02-01',
      end_date: '2025-06-30',
      is_active: true
    });

    // Create professor user
    const hashedPassword = await bcrypt.hash('password123', 12);
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

    // Generate JWT token for professor
    professorToken = jwt.sign(
      { id: professorUser.id, role: 'professor' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create courses
    course1 = await Course.create({
      course_code: 'ICT101',
      course_name: 'Introduction to Programming',
      arabic_name: 'مقدمة في البرمجة',
      specialty_id: specialty1.id,
      academic_year_id: 1, // Year 1
      semester_id: semester1.id,
      credit_hours: 3,
      is_active: true
    });

    course2 = await Course.create({
      course_code: 'ICT102',
      course_name: 'Data Structures',
      arabic_name: 'هياكل البيانات',
      specialty_id: specialty1.id,
      academic_year_id: 2, // Year 2
      semester_id: semester1.id,
      credit_hours: 3,
      is_active: true
    });

    course3 = await Course.create({
      course_code: 'MCT101',
      course_name: 'Robotics Basics',
      arabic_name: 'أساسيات الروبوتات',
      specialty_id: specialty2.id,
      academic_year_id: 1,
      semester_id: semester1.id,
      credit_hours: 3,
      is_active: true
    });

    // Assign professor to course1
    await ProfessorCourse.create({
      professor_id: professorRecord.id,
      course_id: course1.id,
      academic_year_id: academicYear1.id,
      semester_id: semester1.id,
      is_primary: true
    });

    // Create students
    const studentUser1 = await User.create({
      username: 'student001',
      email: 'student1@test.com',
      password_hash: hashedPassword,
      full_name: 'محمد أحمد',
      role: 'student',
      is_active: true
    });

    student1 = await Student.create({
      user_id: studentUser1.id,
      student_code: 'STU-001',
      specialty_id: specialty1.id,
      current_year: 1, // Same as course1
      academic_status: 'active'
    });

    const studentUser2 = await User.create({
      username: 'student002',
      email: 'student2@test.com',
      password_hash: hashedPassword,
      full_name: 'فاطمة علي',
      role: 'student',
      is_active: true
    });

    student2 = await Student.create({
      user_id: studentUser2.id,
      student_code: 'STU-002',
      specialty_id: specialty1.id,
      current_year: 1, // Same as course1
      academic_status: 'active'
    });

    const studentUser3 = await User.create({
      username: 'student003',
      email: 'student3@test.com',
      password_hash: hashedPassword,
      full_name: 'علي محمود',
      role: 'student',
      is_active: true
    });

    student3 = await Student.create({
      user_id: studentUser3.id,
      student_code: 'STU-003',
      specialty_id: specialty1.id,
      current_year: 2, // Different year
      academic_status: 'active'
    });

    const studentUser4 = await User.create({
      username: 'student004',
      email: 'student4@test.com',
      password_hash: hashedPassword,
      full_name: 'سارة خالد',
      role: 'student',
      is_active: true
    });

    student4 = await Student.create({
      user_id: studentUser4.id,
      student_code: 'STU-004',
      specialty_id: specialty2.id, // Different specialty
      current_year: 1,
      academic_status: 'active'
    });

    // Create a grade for student1 in course1
    await Grade.create({
      student_id: student1.id,
      course_id: course1.id,
      academic_year_id: academicYear1.id,
      semester_id: semester1.id,
      professor_submitted_by: professorRecord.id,
      assignment1_grade: 'P',
      assignment2_grade: 'M',
      final_exam_score: 120,
      status: 'draft'
    });

    // Create course config
    await CourseGradeConfig.create({
      course_id: course1.id,
      ass1_max: 30.00,
      ass2_max: 30.00,
      final_max: 150.00,
      p_value: 30.00,
      m_value: 21.00,
      d_value: 15.00
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /grades/professor/students-by-course', () => {
    test('6.1 - Should return students in same specialty and year (success case)', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Should return student1 and student2 (same specialty and year)
      expect(response.body.data.length).toBe(2);
      
      const studentIds = response.body.data.map(s => s.student_id);
      expect(studentIds).toContain(student1.id);
      expect(studentIds).toContain(student2.id);
      expect(studentIds).not.toContain(student3.id); // Different year
      expect(studentIds).not.toContain(student4.id); // Different specialty
    });

    test('6.2 - Should return 403 for unauthorized professor', async () => {
      // Create another professor not assigned to course1
      const otherProfUser = await User.create({
        username: 'prof002',
        email: 'prof2@test.com',
        password_hash: await bcrypt.hash('password123', 12),
        full_name: 'Dr. Sara Ahmed',
        role: 'professor',
        is_active: true
      });

      const otherProfRecord = await Professor.create({
        user_id: otherProfUser.id,
        professor_code: 'PROF-002',
        department: 'Mathematics',
        is_active: true
      });

      const otherToken = jwt.sign(
        { id: otherProfUser.id, role: 'professor' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('صلاحية');
    });

    test('6.3 - Should return correct students (same specialty and year)', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      
      const students = response.body.data;
      
      // All students should have same specialty and year as course
      students.forEach(student => {
        expect(student.current_year).toBe(1); // course1 is for year 1
        // specialty_id is checked implicitly by the query
      });
    });

    test('6.4 - Should NOT return students from other specialties', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      
      const studentIds = response.body.data.map(s => s.student_id);
      
      // student4 is from specialty2, should NOT be included
      expect(studentIds).not.toContain(student4.id);
    });

    test('6.5 - Should NOT return students from other years', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      
      const studentIds = response.body.data.map(s => s.student_id);
      
      // student3 is from year 2, should NOT be included
      expect(studentIds).not.toContain(student3.id);
    });

    test('6.6 - Should include students without grades (LEFT JOIN)', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      
      const students = response.body.data;
      
      // student1 has a grade, student2 does not
      const student1Data = students.find(s => s.student_id === student1.id);
      const student2Data = students.find(s => s.student_id === student2.id);
      
      expect(student1Data).toBeDefined();
      expect(student1Data.grade).toBeDefined();
      expect(student1Data.grade.assignment1_grade).toBe('P');
      
      expect(student2Data).toBeDefined();
      expect(student2Data.grade).toBeNull(); // No grade yet
    });

    test('6.7 - Should return course config with response', async () => {
      const response = await request(app)
        .get('/grades/professor/students-by-course')
        .query({ course_id: course1.id })
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.course_config).toBeDefined();
      expect(response.body.course_config.ass1_max).toBe(30.00);
      expect(response.body.course_config.ass2_max).toBe(30.00);
      expect(response.body.course_config.final_max).toBe(150.00);
      expect(response.body.course_config.p_value).toBe(30.00);
      expect(response.body.course_config.m_value).toBe(21.00);
      expect(response.body.course_config.d_value).toBe(15.00);
    });
  });
});
