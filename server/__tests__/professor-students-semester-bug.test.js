/**
 * Bug Condition Exploration Test - Professor Students Display Fix
 * 
 * Property 1: Bug Condition - فلترة الطلاب بدون مراعاة الترم
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * 
 * Bug Description:
 * - جدول students لا يحتوي على حقل current_semester
 * - دالة getStudentsByCourse تفلتر بناءً على specialty_id و current_year فقط
 * - النتيجة: يظهر طلاب من ترمات مختلفة عند اختيار مادة في ترم محدد
 */

const request = require('supertest');
const app = require('../server');
const { 
  sequelize, 
  User, 
  Professor, 
  Student, 
  Course, 
  Specialty, 
  AcademicYear, 
  Semester,
  ProfessorCourse 
} = require('../config/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Professor Students Display - Bug Condition: Semester Filtering', () => {
  let professorUser;
  let professorRecord;
  let professorToken;
  let testSpecialty;
  let testAcademicYear;
  let semester1; // Fall
  let semester2; // Spring
  let courseInSemester1;
  let courseInSemester2;
  let studentsInSemester1 = [];
  let studentsInSemester2 = [];

  beforeAll(async () => {
    const timestamp = Date.now();
    
    // Create professor user
    const hashedPassword = await bcrypt.hash('professor123', 10);
    professorUser = await User.create({
      username: `testprof_${timestamp}`,
      full_name: 'Test Professor',
      email: `testprof_${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'professor',
      is_active: true
    });

    professorRecord = await Professor.create({
      user_id: professorUser.id,
      professor_code: `PROF${timestamp}`,
      department: 'Computer Science',
      hire_date: new Date()
    });

    // Generate JWT token
    professorToken = jwt.sign(
      { id: professorUser.id, role: professorUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test specialty
    testSpecialty = await Specialty.create({
      code: `CS${timestamp}`,
      name: 'Computer Science',
      arabic_name: 'علوم الحاسب',
      duration_years: 4,
      total_credits: 120,
      annual_fee: 15000,
      is_active: true
    });

    // Create academic year
    testAcademicYear = await AcademicYear.create({
      specialty_id: testSpecialty.id,
      year_number: 2,
      academic_season: '2024',
      is_active: true
    });

    // Create two semesters
    semester1 = await Semester.create({
      academic_year_id: testAcademicYear.id,
      semester_name: 'Fall',
      start_date: new Date('2024-09-01'),
      end_date: new Date('2024-12-31'),
      is_active: true
    });

    semester2 = await Semester.create({
      academic_year_id: testAcademicYear.id,
      semester_name: 'Spring',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-05-31'),
      is_active: true
    });

    // Create courses in different semesters
    courseInSemester1 = await Course.create({
      course_code: `CS201_${timestamp}`,
      course_name: 'Advanced Programming',
      arabic_name: 'برمجة متقدمة',
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: semester1.id,
      credit_hours: 3,
      is_active: true
    });

    courseInSemester2 = await Course.create({
      course_code: `CS202_${timestamp}`,
      course_name: 'Database Systems',
      arabic_name: 'قواعد البيانات',
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: semester2.id,
      credit_hours: 3,
      is_active: true
    });

    // Assign courses to professor
    await ProfessorCourse.create({
      professor_id: professorRecord.id,
      course_id: courseInSemester1.id,
      academic_year_id: testAcademicYear.id,
      semester_id: semester1.id
    });

    await ProfessorCourse.create({
      professor_id: professorRecord.id,
      course_id: courseInSemester2.id,
      academic_year_id: testAcademicYear.id,
      semester_id: semester2.id
    });

    // Create 3 students in semester 1 (simplified for testing)
    for (let i = 1; i <= 3; i++) {
      const studentUser = await User.create({
        username: `student_s1_${timestamp}_${i}`,
        full_name: `Student Semester 1 - ${i}`,
        email: `student.s1.${timestamp}.${i}@nctu.edu`,
        password_hash: await bcrypt.hash('student123', 10),
        role: 'student',
        is_active: true
      });

      const student = await Student.create({
        user_id: studentUser.id,
        student_code: `CS${timestamp}S1${String(i).padStart(3, '0')}`,
        national_id: `111${timestamp}${String(i).padStart(4, '0')}`,
        specialty_id: testSpecialty.id,
        current_year: 2, // السنة الثانية
        // NOTE: current_semester field doesn't exist yet - this is the bug!
        // When fixed, this should be: current_semester: semester1.id
        academic_status: 'active',
        enrollment_date: new Date()
      });

      studentsInSemester1.push(student);
    }

    // Create 2 students in semester 2 (simplified for testing)
    for (let i = 1; i <= 2; i++) {
      const studentUser = await User.create({
        username: `student_s2_${timestamp}_${i}`,
        full_name: `Student Semester 2 - ${i}`,
        email: `student.s2.${timestamp}.${i}@nctu.edu`,
        password_hash: await bcrypt.hash('student123', 10),
        role: 'student',
        is_active: true
      });

      const student = await Student.create({
        user_id: studentUser.id,
        student_code: `CS${timestamp}S2${String(i).padStart(3, '0')}`,
        national_id: `222${timestamp}${String(i).padStart(4, '0')}`,
        specialty_id: testSpecialty.id,
        current_year: 2, // السنة الثانية
        // NOTE: current_semester field doesn't exist yet - this is the bug!
        // When fixed, this should be: current_semester: semester2.id
        academic_status: 'active',
        enrollment_date: new Date()
      });

      studentsInSemester2.push(student);
    }
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    if (professorRecord) {
      await ProfessorCourse.destroy({ where: { professor_id: professorRecord.id } });
    }
    
    // Delete students and their users
    for (const student of [...studentsInSemester1, ...studentsInSemester2]) {
      const user = await User.findByPk(student.user_id);
      await student.destroy();
      if (user) await user.destroy();
    }

    // Delete courses
    if (courseInSemester1) await courseInSemester1.destroy();
    if (courseInSemester2) await courseInSemester2.destroy();

    // Delete semesters
    if (semester1) await semester1.destroy();
    if (semester2) await semester2.destroy();

    // Delete academic year
    if (testAcademicYear) await testAcademicYear.destroy();

    // Delete specialty
    if (testSpecialty) await testSpecialty.destroy();

    // Delete professor and user
    if (professorRecord) await professorRecord.destroy();
    if (professorUser) await professorUser.destroy();

    await sequelize.close();
  });

  test.only('Bug Condition: Semester 1 course returns students from both semesters (EXPECTED TO FAIL)', async () => {
    // When professor selects a course in Semester 1
    const response = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorToken}`)
      .query({ course_id: courseInSemester1.id });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const students = response.body.data;

    // EXPECTED BEHAVIOR (will fail on unfixed code):
    // Should return ONLY students from semester 1 (3 students)
    expect(students.length).toBe(3);

    // All returned students should be from semester 1
    const semester1StudentIds = studentsInSemester1.map(s => s.id);
    for (const student of students) {
      expect(semester1StudentIds).toContain(student.student_id);
    }

    // UNFIXED CODE BEHAVIOR (current bug):
    // Returns ALL students from the same specialty and year (18 students)
    // This assertion will FAIL on unfixed code, confirming the bug
    const semester2StudentIds = studentsInSemester2.map(s => s.id);
    for (const student of students) {
      // No students from semester 2 should be present
      expect(semester2StudentIds).not.toContain(student.student_id);
    }
  });

  test('Bug Condition: Semester 2 course returns students from both semesters (EXPECTED TO FAIL)', async () => {
    // When professor selects a course in Semester 2
    const response = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorToken}`)
      .query({ course_id: courseInSemester2.id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const students = response.body.data;

    // EXPECTED BEHAVIOR (will fail on unfixed code):
    // Should return ONLY students from semester 2 (2 students)
    expect(students.length).toBe(2);

    // All returned students should be from semester 2
    const semester2StudentIds = studentsInSemester2.map(s => s.id);
    for (const student of students) {
      expect(semester2StudentIds).toContain(student.student_id);
    }

    // UNFIXED CODE BEHAVIOR (current bug):
    // Returns ALL students from the same specialty and year (18 students)
    // This assertion will FAIL on unfixed code, confirming the bug
    const semester1StudentIds = studentsInSemester1.map(s => s.id);
    for (const student of students) {
      // No students from semester 1 should be present
      expect(semester1StudentIds).not.toContain(student.student_id);
    }
  });

  test('Bug Condition: Students from wrong semester appear in results (EXPECTED TO FAIL)', async () => {
    // Test for Semester 1 course
    const response1 = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorToken}`)
      .query({ course_id: courseInSemester1.id });

    const students1 = response1.body.data;
    const semester2StudentIds = studentsInSemester2.map(s => s.id);
    
    // Check if any semester 2 students appear (they shouldn't)
    const wrongSemesterStudents1 = students1.filter(s => 
      semester2StudentIds.includes(s.student_id)
    );

    // EXPECTED: No students from semester 2 should appear
    // UNFIXED CODE: Will have students from semester 2 (bug confirmed)
    expect(wrongSemesterStudents1.length).toBe(0);

    // Test for Semester 2 course
    const response2 = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorToken}`)
      .query({ course_id: courseInSemester2.id });

    const students2 = response2.body.data;
    const semester1StudentIds = studentsInSemester1.map(s => s.id);
    
    // Check if any semester 1 students appear (they shouldn't)
    const wrongSemesterStudents2 = students2.filter(s => 
      semester1StudentIds.includes(s.student_id)
    );

    // EXPECTED: No students from semester 1 should appear
    // UNFIXED CODE: Will have students from semester 1 (bug confirmed)
    expect(wrongSemesterStudents2.length).toBe(0);
  });

  test('Bug Condition: Total student count is incorrect (EXPECTED TO FAIL)', async () => {
    // For Semester 1 course
    const response1 = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorToken}`)
      .query({ course_id: courseInSemester1.id });

    // EXPECTED: 3 students (only semester 1)
    // UNFIXED CODE: 5 students (both semesters)
    expect(response1.body.data.length).toBe(3);

    // For Semester 2 course
    const response2 = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorToken}`)
      .query({ course_id: courseInSemester2.id });

    // EXPECTED: 2 students (only semester 2)
    // UNFIXED CODE: 5 students (both semesters)
    expect(response2.body.data.length).toBe(2);
  });
});
