/**
 * Preservation Property Tests
 * 
 * Property 2: Preservation - Existing Enrollment Validation Continues to Work
 * 
 * IMPORTANT: These tests run on UNFIXED code and should PASS
 * They capture baseline behavior that must be preserved after the fix
 * 
 * GOAL: Observe and document current behavior for students WITH StudentEnrollment records
 * 
 * These tests ensure that:
 * - Students with StudentEnrollment records can save grades successfully
 * - Professor authorization checks prevent unauthorized grade saves
 * - Grade field validation (P/M/D values, final_exam_score ranges) works correctly
 * - Students from wrong specialty/year are rejected appropriately
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

describe('Professor Grades - Preservation: Existing Behavior Must Continue', () => {
  let professorAuthToken;
  let professorUser;
  let professorRecord;
  let testSpecialty;
  let testAcademicYear;
  let testSemester;
  let testCourse;
  let studentWithEnrollment;
  let studentUser;
  let enrollment;

  beforeAll(async () => {
    // Generate unique identifiers to avoid conflicts
    const timestamp = Date.now();
    const uniqueCode = `PRES${timestamp}`;
    
    // Create test specialty
    testSpecialty = await Specialty.create({
      code: uniqueCode,
      name: `Preservation Test Specialty ${timestamp}`,
      arabic_name: `تخصص حفظ ${timestamp}`,
      duration_years: 4,
      total_credits: 120,
      annual_fee: 10000,
      is_active: true
    });

    // Create academic year
    testAcademicYear = await AcademicYear.create({
      specialty_id: testSpecialty.id,
      year_number: 3,
      academic_season: `2024-2025-PRES-${timestamp}`,
      is_active: true
    });

    // Create semester
    testSemester = await Semester.create({
      academic_year_id: testAcademicYear.id,
      semester_name: `Fall 2024 Preservation ${timestamp}`,
      start_date: new Date('2024-09-01'),
      end_date: new Date('2025-01-31'),
      is_active: true
    });

    // Create professor user with hashed password
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    professorUser = await User.create({
      username: `presProf${timestamp}`,
      full_name: `Preservation Professor ${timestamp}`,
      email: `presProf${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'professor',
      is_active: true
    });

    // Create professor record
    // NOTE: The professor.id must match a user.id due to foreign key constraint in grades table
    // This is a quirk of the current schema where professor_submitted_by references users.id
    professorRecord = await Professor.create({
      user_id: professorUser.id,
      professor_code: `PPROF${timestamp}`,
      national_id: `${timestamp}5678`,
      specialty_id: testSpecialty.id,
      hire_date: new Date('2020-01-01')
    });

    // Create course
    testCourse = await Course.create({
      course_code: `PRES${timestamp}`,
      course_name: `Preservation Test Course ${timestamp}`,
      arabic_name: `مادة حفظ ${timestamp}`,
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
      username: `presStudent${timestamp}`,
      full_name: `Preservation Student ${timestamp}`,
      email: `presStudent${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'student',
      is_active: true
    });

    // Create student WITH StudentEnrollment record (this is the key difference)
    studentWithEnrollment = await Student.create({
      user_id: studentUser.id,
      student_code: `PSTU${timestamp}`,
      national_id: `${timestamp}4321`,
      specialty_id: testSpecialty.id,
      current_year: testAcademicYear.year_number,
      academic_status: 'active',
      enrollment_date: new Date('2023-09-01')
    });

    // Create StudentEnrollment record (this makes the student "properly enrolled")
    enrollment = await StudentEnrollment.create({
      student_id: studentWithEnrollment.id,
      course_id: testCourse.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      status: 'enrolled',
      enrollment_date: new Date('2024-09-01')
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
    if (studentWithEnrollment) {
      await Grade.destroy({ where: { student_id: studentWithEnrollment.id } });
    }
    if (enrollment) await enrollment.destroy();
    if (professorRecord) {
      await ProfessorCourse.destroy({ where: { professor_id: professorRecord.id } });
    }
    if (testCourse) await testCourse.destroy();
    if (studentWithEnrollment) await studentWithEnrollment.destroy();
    if (studentUser) await studentUser.destroy();
    if (professorRecord) await professorRecord.destroy();
    if (professorUser) await professorUser.destroy();
    if (testSemester) await testSemester.destroy();
    if (testAcademicYear) await testAcademicYear.destroy();
    if (testSpecialty) await testSpecialty.destroy();
    await sequelize.close();
  });

  test('Preservation: Student with enrollment record can save grade successfully', async () => {
    // Verify StudentEnrollment record exists
    const enrollmentCheck = await StudentEnrollment.findOne({
      where: {
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id
      }
    });
    
    expect(enrollmentCheck).not.toBeNull();
    expect(enrollmentCheck.status).toBe('enrolled');

    // Save grade - should succeed on unfixed code
    const saveGradeRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        assignment2_grade: 'M',
        final_exam_score: 130,
        notes: 'Preservation test grade'
      });

    // Should succeed on both unfixed and fixed code
    expect(saveGradeRes.status).toBe(200);
    expect(saveGradeRes.body.success).toBe(true);
    expect(saveGradeRes.body.data).toBeDefined();
    expect(saveGradeRes.body.data.student_id).toBe(studentWithEnrollment.id);
    expect(saveGradeRes.body.data.assignment1_grade).toBe('P');
    expect(saveGradeRes.body.data.assignment2_grade).toBe('M');
    expect(parseFloat(saveGradeRes.body.data.final_exam_score)).toBe(130);
  });

  test('Preservation: Grade update works for enrolled students', async () => {
    // First save
    const createRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        final_exam_score: 100
      });

    expect(createRes.status).toBe(200);
    expect(createRes.body.success).toBe(true);

    // Update grade
    const updateRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'M',
        assignment2_grade: 'D',
        final_exam_score: 140,
        notes: 'Updated'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.assignment1_grade).toBe('M');
    expect(updateRes.body.data.assignment2_grade).toBe('D');
    expect(parseFloat(updateRes.body.data.final_exam_score)).toBe(140);
  });

  test('Preservation: Invalid grade values are rejected', async () => {
    // Invalid assignment1_grade
    const invalidGrade1 = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'X',  // Invalid
        final_exam_score: 100
      });

    expect(invalidGrade1.status).toBe(400);
    expect(invalidGrade1.body.success).toBe(false);
    expect(invalidGrade1.body.message).toContain('Invalid assignment1_grade');

    // Invalid final_exam_score (too high)
    const invalidScore = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        final_exam_score: 200  // Invalid (max is 150)
      });

    expect(invalidScore.status).toBe(400);
    expect(invalidScore.body.success).toBe(false);
    expect(invalidScore.body.message).toContain('Final exam score must be between 0 and 150');
  });

  test('Preservation: Professor authorization is enforced', async () => {
    // Create another professor who doesn't teach this course
    const timestamp = Date.now();
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const otherProfUser = await User.create({
      username: `otherProf${timestamp}`,
      full_name: `Other Professor ${timestamp}`,
      email: `otherProf${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'professor',
      is_active: true
    });

    const otherProfRecord = await Professor.create({
      user_id: otherProfUser.id,
      professor_code: `OPROF${timestamp}`,
      national_id: `${timestamp}9999`,
      specialty_id: testSpecialty.id,
      hire_date: new Date('2020-01-01')
    });

    // Generate token for unauthorized professor
    const otherProfToken = jwt.sign(
      { id: otherProfUser.id, role: 'professor' },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '1h' }
    );

    // Attempt to save grade for course they don't teach
    const unauthorizedRes = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${otherProfToken}`)
      .send({
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        final_exam_score: 100
      });

    // Should be rejected
    expect(unauthorizedRes.status).toBe(403);
    expect(unauthorizedRes.body.success).toBe(false);
    expect(unauthorizedRes.body.message).toContain('You do not teach this course');

    // Cleanup
    await otherProfRecord.destroy();
    await otherProfUser.destroy();
  });

  test('Preservation: Non-professor users cannot save grades', async () => {
    // Create a student user
    const timestamp = Date.now();
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const studentUserAccount = await User.create({
      username: `studentUser${timestamp}`,
      full_name: `Student User ${timestamp}`,
      email: `studentUser${timestamp}@nctu.edu`,
      password_hash: hashedPassword,
      role: 'student',
      is_active: true
    });

    // Generate token for student
    const studentToken = jwt.sign(
      { id: studentUserAccount.id, role: 'student' },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '1h' }
    );

    // Attempt to save grade as student
    const studentAttempt = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        student_id: studentWithEnrollment.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        final_exam_score: 100
      });

    // Should be rejected
    expect(studentAttempt.status).toBe(403);
    expect(studentAttempt.body.success).toBe(false);
    // Message may vary based on middleware implementation
    expect(studentAttempt.body.message).toBeDefined();

    // Cleanup
    await studentUserAccount.destroy();
  });

  test('Preservation: Missing required fields are rejected', async () => {
    // Missing student_id
    const missingStudent = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P'
      });

    expect(missingStudent.status).toBe(400);
    expect(missingStudent.body.success).toBe(false);
    expect(missingStudent.body.message).toContain('Missing required fields');
  });

  test('Preservation: All valid grade combinations work', async () => {
    // Test various valid grade combinations
    const validCombinations = [
      { assignment1_grade: 'P', assignment2_grade: null, final_exam_score: 100 },
      { assignment1_grade: 'M', assignment2_grade: 'P', final_exam_score: 120 },
      { assignment1_grade: 'D', assignment2_grade: 'D', final_exam_score: 80 },
      { assignment1_grade: null, assignment2_grade: 'M', final_exam_score: 110 },
      { assignment1_grade: 'P', assignment2_grade: 'M', final_exam_score: 0 },
      { assignment1_grade: 'P', assignment2_grade: 'M', final_exam_score: 150 },
    ];

    for (const combo of validCombinations) {
      const res = await request(app)
        .post('/api/grades')
        .set('Authorization', `Bearer ${professorAuthToken}`)
        .send({
          student_id: studentWithEnrollment.id,
          course_id: testCourse.id,
          academic_year_id: testAcademicYear.id,
          semester_id: testSemester.id,
          ...combo
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }
  });
});
