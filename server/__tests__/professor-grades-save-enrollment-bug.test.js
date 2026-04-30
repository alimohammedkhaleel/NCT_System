/**
 * Bug Condition Exploration Test
 * 
 * Property 1: Bug Condition - Grade Save Fails for Students Without StudentEnrollment Records
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * 
 * GOAL: Surface counterexamples that demonstrate the bug exists
 * 
 * Bug Condition: Students who match course specialty/year but lack StudentEnrollment records
 * cannot save grades, despite appearing in the professor grades UI.
 * 
 * TEST SETUP REQUIREMENTS:
 * - MySQL database must be running
 * - Database must be seeded with initial data (run: node server/seed-data.js or node server/reset-db.js)
 * - Test creates temporary test data and cleans up after execution
 */

const request = require('supertest');
const app = require('../server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  sequelize, 
  User, 
  Student, 
  Professor, 
  Course, 
  Specialty, 
  AcademicYear, 
  Semester,
  ProfessorCourse,
  StudentEnrollment,
  Grade,
  defineAssociations
} = require('../config/models');

// Define associations before running tests
defineAssociations();

describe('Professor Grades - Bug Condition: Save Fails Without StudentEnrollment', () => {
  let professorAuthToken;
  let professorUser;
  let professorRecord;
  let testSpecialty;
  let testAcademicYear;
  let testSemester;
  let testCourse;
  let studentWithoutEnrollment;
  let studentUser;

  beforeAll(async () => {
    // Generate unique identifiers to avoid conflicts
    const timestamp = Date.now();
    const uniqueCode = `TEST${timestamp}`;
    
    // Create test specialty
    testSpecialty = await Specialty.create({
      code: uniqueCode,
      name: `Test Specialty ${timestamp}`,
      arabic_name: `تخصص اختبار ${timestamp}`,
      duration_years: 4,
      total_credits: 120,
      annual_fee: 10000,
      is_active: true
    });

    // Create academic year
    testAcademicYear = await AcademicYear.create({
      specialty_id: testSpecialty.id,
      year_number: 2,
      academic_season: `2024-2025-${timestamp}`,
      is_active: true
    });

    // Create semester
    testSemester = await Semester.create({
      academic_year_id: testAcademicYear.id,
      semester_name: `Fall 2024 ${timestamp}`,
      start_date: new Date('2024-09-01'),
      end_date: new Date('2025-01-31'),
      is_active: true
    });

    // Create professor user with hashed password
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    professorUser = await User.create({
      username: `testprof${timestamp}`,
      full_name: `Test Professor ${timestamp}`,
      email: `testprof${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'professor',
      is_active: true
    });

    // Create professor record
    professorRecord = await Professor.create({
      user_id: professorUser.id,
      professor_code: `PROF${timestamp}`,
      national_id: `${timestamp}1234`,
      specialty_id: testSpecialty.id,
      hire_date: new Date('2020-01-01')
    });

    // Create course
    testCourse = await Course.create({
      course_code: `TEST${timestamp}`,
      course_name: `Test Course ${timestamp}`,
      arabic_name: `مادة اختبار ${timestamp}`,
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      credit_hours: 3,
      is_active: true
    });

    // Assign professor to course
    await ProfessorCourse.create({
      professor_id: professorRecord.id,
      course_id: testCourse.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id
    });

    // Create student user
    studentUser = await User.create({
      username: `teststudent${timestamp}`,
      full_name: `Test Student ${timestamp}`,
      email: `teststudent${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'student',
      is_active: true
    });

    // Create student WITHOUT StudentEnrollment record
    // This student matches course specialty_id and current_year (year_number)
    studentWithoutEnrollment = await Student.create({
      user_id: studentUser.id,
      student_code: `STU${timestamp}`,
      national_id: `${timestamp}9876`,
      specialty_id: testSpecialty.id,  // Matches course.specialty_id
      current_year: testAcademicYear.year_number,  // Matches academic_year.year_number (2)
      academic_status: 'active',
      enrollment_date: new Date('2023-09-01')
    });

    // Generate JWT token for professor
    professorAuthToken = jwt.sign(
      { id: professorUser.id, role: 'professor' },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup in reverse order of creation
    if (studentWithoutEnrollment) {
      await Grade.destroy({ where: { student_id: studentWithoutEnrollment.id } });
    }
    if (professorRecord) {
      await ProfessorCourse.destroy({ where: { professor_id: professorRecord.id } });
    }
    if (testCourse) await testCourse.destroy();
    if (studentWithoutEnrollment) await studentWithoutEnrollment.destroy();
    if (studentUser) await studentUser.destroy();
    if (professorRecord) await professorRecord.destroy();
    if (professorUser) await professorUser.destroy();
    if (testSemester) await testSemester.destroy();
    if (testAcademicYear) await testAcademicYear.destroy();
    if (testSpecialty) await testSpecialty.destroy();
    await sequelize.close();
  });

  test('Bug Condition: Student appears in getStudentsByCourse but cannot save grade', async () => {
    // STEP 1: Verify student appears in getStudentsByCourse
    const getStudentsRes = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .query({ course_id: testCourse.id });

    expect(getStudentsRes.status).toBe(200);
    expect(getStudentsRes.body.success).toBe(true);
    
    const students = getStudentsRes.body.data;
    const foundStudent = students.find(s => s.student_id === studentWithoutEnrollment.id);
    
    // Student SHOULD appear in UI (this works correctly)
    expect(foundStudent).toBeDefined();
    expect(foundStudent.student_code).toBe(studentWithoutEnrollment.student_code);
    expect(foundStudent.current_year).toBe(testAcademicYear.year_number);

    // STEP 2: Verify NO StudentEnrollment record exists
    const enrollment = await StudentEnrollment.findOne({
      where: {
        student_id: studentWithoutEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id
      }
    });
    
    expect(enrollment).toBeNull(); // Confirms bug condition

    // STEP 3: Attempt to save grade
    const saveGradeRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithoutEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        assignment2_grade: 'M',
        final_exam_score: 120,
        notes: 'Test grade'
      });

    // EXPECTED TO FAIL ON UNFIXED CODE: 400 error "Student is not enrolled in this course"
    // AFTER FIX: Should return 200 with success
    expect(saveGradeRes.status).toBe(200);
    expect(saveGradeRes.body.success).toBe(true);
    expect(saveGradeRes.body.data).toBeDefined();
    expect(saveGradeRes.body.data.student_id).toBe(studentWithoutEnrollment.id);
    expect(saveGradeRes.body.data.assignment1_grade).toBe('P');
    expect(saveGradeRes.body.data.assignment2_grade).toBe('M');
    
    // Verify final_exam_score is saved correctly (may be string or number)
    const finalScore = parseFloat(saveGradeRes.body.data.final_exam_score);
    expect(finalScore).toBe(120);
  });

  test('Bug Condition: Multiple students without enrollment should all save grades', async () => {
    // Create 3 more students without StudentEnrollment records
    const timestamp = Date.now();
    const additionalStudents = [];
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    for (let i = 2; i <= 4; i++) {
      const user = await User.create({
        username: `teststudent${timestamp}${i}`,
        full_name: `Test Student ${timestamp} ${i}`,
        email: `teststudent${timestamp}${i}@nctu.edu`,
        password_hash: hashedPassword,
        role: 'student',
        is_active: true
      });

      const student = await Student.create({
        user_id: user.id,
        student_code: `STU${timestamp}${i}`,
        national_id: `${timestamp}987${i}`,
        specialty_id: testSpecialty.id,
        current_year: testAcademicYear.year_number,  // Use year_number (2)
        academic_status: 'active',
        enrollment_date: new Date('2023-09-01')
      });

      additionalStudents.push({ user, student });
    }

    // Verify all students appear in getStudentsByCourse
    const getStudentsRes = await request(app)
      .get('/api/grades/professor/students-by-course')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .query({ course_id: testCourse.id });

    expect(getStudentsRes.status).toBe(200);
    const students = getStudentsRes.body.data;
    expect(students.length).toBeGreaterThanOrEqual(4);

    // Attempt to save grades for all students
    for (const { student } of additionalStudents) {
      const saveGradeRes = await request(app)
        .post('/api/grades')
        .set('Authorization', `Bearer ${professorAuthToken}`)
        .send({
          student_id: student.id,
          course_id: testCourse.id,
          academic_year_id: testAcademicYear.id,
          semester_id: testSemester.id,
          assignment1_grade: 'P',
          final_exam_score: 100
        });

      // EXPECTED TO FAIL ON UNFIXED CODE
      // AFTER FIX: All should succeed
      expect(saveGradeRes.status).toBe(200);
      expect(saveGradeRes.body.success).toBe(true);
    }

    // Cleanup
    for (const { user, student } of additionalStudents) {
      await Grade.destroy({ where: { student_id: student.id } });
      await student.destroy();
      await user.destroy();
    }
  });

  test('Bug Condition: Grade update should also work without enrollment', async () => {
    // First, attempt to create a grade
    const createRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithoutEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        final_exam_score: 100
      });

    // EXPECTED TO FAIL ON UNFIXED CODE
    expect(createRes.status).toBe(200);
    expect(createRes.body.success).toBe(true);

    // Then, attempt to update the grade
    const updateRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithoutEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'M',
        assignment2_grade: 'D',
        final_exam_score: 120,
        notes: 'Updated grade'
      });

    // EXPECTED TO FAIL ON UNFIXED CODE
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.assignment1_grade).toBe('M');
    expect(updateRes.body.data.assignment2_grade).toBe('D');
    expect(parseFloat(updateRes.body.data.final_exam_score)).toBe(120);
  });

  test('Bug Condition: Student with wrong specialty should still be rejected', async () => {
    // Create a student with DIFFERENT specialty (security test)
    const timestamp = Date.now();
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const wrongSpecialty = await Specialty.create({
      code: `WRONG${timestamp}`,
      name: `Wrong Specialty ${timestamp}`,
      arabic_name: `تخصص خاطئ ${timestamp}`,
      duration_years: 4,
      total_credits: 120,
      annual_fee: 10000,
      is_active: true
    });

    const wrongUser = await User.create({
      username: `wrongstudent${timestamp}`,
      full_name: `Wrong Student ${timestamp}`,
      email: `wrongstudent${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'student',
      is_active: true
    });

    const wrongStudent = await Student.create({
      user_id: wrongUser.id,
      student_code: `WRONG${timestamp}`,
      national_id: `${timestamp}1111`,
      specialty_id: wrongSpecialty.id,  // DIFFERENT specialty
      current_year: testAcademicYear.year_number,  // Same year but different specialty
      academic_status: 'active',
      enrollment_date: new Date('2023-09-01')
    });

    // Attempt to save grade for student with wrong specialty
    const saveGradeRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: wrongStudent.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        final_exam_score: 100
      });

    // Should FAIL on both unfixed and fixed code (security validation)
    // The fix should validate specialty matching, not just remove enrollment check
    expect(saveGradeRes.status).toBe(400);
    expect(saveGradeRes.body.success).toBe(false);

    // Cleanup
    await wrongStudent.destroy();
    await wrongUser.destroy();
    await wrongSpecialty.destroy();
  });
});
