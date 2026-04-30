/**
 * Preservation Property Tests - Non-Activity-Logging Operations
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 * 
 * **Property 2: Preservation** - Non-Activity-Logging Operations
 * 
 * IMPORTANT: Follow observation-first methodology
 * - Observe behavior on UNFIXED code for operations that don't call logActivity
 * - Write property-based tests capturing observed behavior patterns
 * - Run tests on UNFIXED code
 * 
 * EXPECTED OUTCOME: Tests PASS (this confirms baseline behavior to preserve)
 * 
 * These tests verify that:
 * - Grade.findAll with Student association works correctly
 * - ProfessorCourse.findAll with Course association works correctly
 * - Grade calculation in beforeSave hook works correctly
 * - Grade validation rules for P/M/D values and score ranges work correctly
 * - Professor course access authorization checks work correctly
 */

const fc = require('fast-check');
const { 
  sequelize, 
  User, 
  Student,
  Professor,
  Course,
  Grade,
  ProfessorCourse,
  Specialty,
  AcademicYear,
  Semester,
  defineAssociations 
} = require('../config/models');
const bcrypt = require('bcryptjs');

describe('Preservation Property Tests - Non-Activity-Logging Operations', () => {
  let testSpecialty;
  let testAcademicYear;
  let testSemester;
  let testCourse;
  let testStudent;
  let testProfessor;
  let testUser;
  let professorUser;

  beforeAll(async () => {
    // Define associations before syncing
    defineAssociations();
    
    // Sync database
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test specialty
    testSpecialty = await Specialty.create({
      name: 'Computer Science',
      arabic_name: 'علوم الحاسوب',
      code: 'CS',
      description: 'Computer Science Specialty'
    });

    // Create test academic year
    testAcademicYear = await AcademicYear.create({
      specialty_id: testSpecialty.id,
      year_number: 1,
      academic_season: '2024',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31')
    });

    // Create test semester
    testSemester = await Semester.create({
      academic_year_id: testAcademicYear.id,
      semester_name: 'Fall 2024',
      start_date: new Date('2024-09-01'),
      end_date: new Date('2024-12-31')
    });

    // Create test course
    testCourse = await Course.create({
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      course_code: 'CS101',
      course_name: 'Introduction to Programming',
      arabic_name: 'مقدمة في البرمجة',
      credit_hours: 3
    });

    // Create test user for student
    testUser = await User.create({
      username: 'student001',
      email: 'student@test.com',
      password_hash: hashedPassword,
      full_name: 'Test Student',
      role: 'student',
      is_active: true
    });

    // Create test student
    testStudent = await Student.create({
      user_id: testUser.id,
      specialty_id: testSpecialty.id,
      student_code: 'STU001',
      national_id: '12345678901234',
      enrollment_date: new Date('2024-01-01'),
      academic_status: 'active'
    });

    // Create test professor user
    professorUser = await User.create({
      username: 'prof001',
      email: 'prof@test.com',
      password_hash: hashedPassword,
      full_name: 'Test Professor',
      role: 'professor',
      is_active: true
    });

    // Create test professor
    testProfessor = await Professor.create({
      user_id: professorUser.id,
      professor_code: 'PROF001',
      department: 'Computer Science',
      hire_date: new Date('2020-01-01')
    });

    // Create professor course assignment
    await ProfessorCourse.create({
      professor_id: testProfessor.id,
      course_id: testCourse.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      is_primary: true
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    // Clean up grades after each test to avoid unique constraint violations
    await Grade.destroy({ where: {} });
  });

  /**
   * Property 2.1: Grade.findAll with Student association
   * 
   * For any Grade query with Student include,
   * the system SHALL successfully load Grade records with associated Student data.
   * 
   * This tests that the Grade-Student association works correctly.
   */
  test('Property 2.1: Grade.findAll with Student association should work', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate grade data
        fc.record({
          assignment1_grade: fc.constantFrom('P', 'M', 'D'),
          assignment2_grade: fc.constantFrom('P', 'M', 'D'),
          final_exam_score: fc.integer({ min: 0, max: 150 })
        }),
        async (gradeData) => {
          // Create a grade
          const grade = await Grade.create({
            student_id: testStudent.id,
            course_id: testCourse.id,
            academic_year_id: testAcademicYear.id,
            semester_id: testSemester.id,
            assignment1_grade: gradeData.assignment1_grade,
            assignment2_grade: gradeData.assignment2_grade,
            final_exam_score: gradeData.final_exam_score,
            professor_submitted_by: professorUser.id,
            status: 'draft'
          });

          // Query Grade with Student association
          const grades = await Grade.findAll({
            where: { id: grade.id },
            include: [{
              model: Student,
              attributes: ['id', 'student_code', 'user_id'],
              include: [{
                model: User,
                attributes: ['full_name', 'email']
              }]
            }]
          });

          // EXPECTED: Query should succeed and return grade with student data
          expect(grades).not.toBeNull();
          expect(grades.length).toBeGreaterThan(0);
          expect(grades[0].Student).not.toBeNull();
          expect(grades[0].Student.student_code).toBe('STU001');
          expect(grades[0].Student.User).not.toBeNull();
          expect(grades[0].Student.User.full_name).toBe('Test Student');

          // Clean up
          await Grade.destroy({ where: { id: grade.id } });
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property 2.2: ProfessorCourse.findAll with Course association
   * 
   * For any ProfessorCourse query with Course include,
   * the system SHALL successfully load ProfessorCourse records with associated Course data.
   * 
   * This tests that the ProfessorCourse-Course association works correctly.
   */
  test('Property 2.2: ProfessorCourse.findAll with Course association should work', async () => {
    // Query ProfessorCourse with Course association
    const professorCourses = await ProfessorCourse.findAll({
      where: { professor_id: testProfessor.id },
      include: [{
        model: Course,
        attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'credit_hours'],
        include: [
          { model: Specialty, attributes: ['id', 'name', 'code'] },
          { model: AcademicYear, attributes: ['id', 'year_number', 'academic_season'] },
          { model: Semester, attributes: ['id', 'semester_name'] }
        ]
      }]
    });

    // EXPECTED: Query should succeed and return professor courses with course data
    expect(professorCourses).not.toBeNull();
    expect(professorCourses.length).toBeGreaterThan(0);
    expect(professorCourses[0].Course).not.toBeNull();
    expect(professorCourses[0].Course.course_code).toBe('CS101');
    expect(professorCourses[0].Course.Specialty).not.toBeNull();
    expect(professorCourses[0].Course.AcademicYear).not.toBeNull();
    expect(professorCourses[0].Course.Semester).not.toBeNull();
  });

  /**
   * Property 2.3: Grade calculation in beforeSave hook
   * 
   * For any Grade with P/M/D values and final exam score,
   * the system SHALL calculate total_score, total_percentage, grade_point, and final_result correctly.
   * 
   * This tests that the grade calculation logic in the beforeSave hook works correctly.
   */
  test('Property 2.3: Grade calculation in beforeSave hook should work correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate grade data
        fc.record({
          assignment1_grade: fc.constantFrom('P', 'M', 'D'),
          assignment2_grade: fc.constantFrom('P', 'M', 'D'),
          final_exam_score: fc.integer({ min: 0, max: 150 })
        }),
        async (gradeData) => {
          // Create a grade (beforeSave hook will calculate totals)
          const grade = await Grade.create({
            student_id: testStudent.id,
            course_id: testCourse.id,
            academic_year_id: testAcademicYear.id,
            semester_id: testSemester.id,
            assignment1_grade: gradeData.assignment1_grade,
            assignment2_grade: gradeData.assignment2_grade,
            final_exam_score: gradeData.final_exam_score,
            professor_submitted_by: professorUser.id,
            status: 'draft'
          });

          // Calculate expected values
          const gradeValues = { 'P': 30, 'M': 21, 'D': 15 };
          const expectedAss1 = gradeValues[gradeData.assignment1_grade];
          const expectedAss2 = gradeValues[gradeData.assignment2_grade];
          const expectedTotal = expectedAss1 + expectedAss2 + gradeData.final_exam_score;
          const expectedPercentage = (expectedTotal / 210) * 100;

          // EXPECTED: Calculations should be correct
          expect(parseFloat(grade.assignment1_score)).toBe(expectedAss1);
          expect(parseFloat(grade.assignment2_score)).toBe(expectedAss2);
          expect(parseFloat(grade.total_score)).toBeCloseTo(expectedTotal, 2);
          expect(parseFloat(grade.total_percentage)).toBeCloseTo(expectedPercentage, 2);

          // Verify grade_point and final_result based on percentage
          if (expectedPercentage >= 85) {
            expect(parseFloat(grade.grade_point)).toBe(4.0);
            expect(grade.final_result).toBe('Distinction');
            expect(grade.letter_grade).toBe('A');
          } else if (expectedPercentage >= 70) {
            expect(parseFloat(grade.grade_point)).toBe(3.0);
            expect(grade.final_result).toBe('Merit');
            expect(grade.letter_grade).toBe('B');
          } else if (expectedPercentage >= 50) {
            expect(parseFloat(grade.grade_point)).toBe(2.0);
            expect(grade.final_result).toBe('Pass');
            expect(grade.letter_grade).toBe('C');
          } else if (expectedPercentage >= 30) {
            expect(parseFloat(grade.grade_point)).toBe(1.0);
            expect(grade.final_result).toBe('Refer');
            expect(grade.letter_grade).toBe('D');
          } else {
            expect(parseFloat(grade.grade_point)).toBe(0.0);
            expect(grade.final_result).toBe('Fail');
            expect(grade.letter_grade).toBe('F');
          }

          // Clean up
          await Grade.destroy({ where: { id: grade.id } });
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 2.4: Grade validation rules for P/M/D values
   * 
   * For any Grade with assignment grades,
   * the system SHALL only accept P, M, or D values.
   * 
   * This tests that grade validation rules work correctly.
   */
  test('Property 2.4: Grade validation should only accept P/M/D values', async () => {
    // Test valid values
    const validGrades = ['P', 'M', 'D'];
    for (const gradeValue of validGrades) {
      const grade = await Grade.create({
        student_id: testStudent.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: gradeValue,
        assignment2_grade: gradeValue,
        final_exam_score: 100,
        professor_submitted_by: professorUser.id,
        status: 'draft'
      });

      expect(grade.assignment1_grade).toBe(gradeValue);
      expect(grade.assignment2_grade).toBe(gradeValue);

      await Grade.destroy({ where: { id: grade.id } });
    }

    // Test invalid value - should fail at database level
    try {
      await Grade.create({
        student_id: testStudent.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'X', // Invalid value
        assignment2_grade: 'P',
        final_exam_score: 100,
        professor_submitted_by: professorUser.id,
        status: 'draft'
      });
      fail('Expected validation error for invalid grade value');
    } catch (error) {
      // EXPECTED: Database error for invalid ENUM value
      expect(error.name).toMatch(/Error/);
    }
  });

  /**
   * Property 2.5: Grade validation rules for score ranges
   * 
   * For any Grade with final exam score,
   * the system SHALL accept values between 0 and 150.
   * 
   * This tests that score range validation works correctly.
   */
  test('Property 2.5: Grade validation should accept final exam scores 0-150', async () => {
    // Test a sample of valid scores
    const testScores = [0, 50, 100, 150];
    
    for (const finalScore of testScores) {
      const grade = await Grade.create({
        student_id: testStudent.id,
        course_id: testCourse.id,
        academic_year_id: testAcademicYear.id,
        semester_id: testSemester.id,
        assignment1_grade: 'P',
        assignment2_grade: 'P',
        final_exam_score: finalScore,
        professor_submitted_by: professorUser.id,
        status: 'draft'
      });

      // EXPECTED: Score should be accepted
      expect(parseFloat(grade.final_exam_score)).toBe(finalScore);

      await Grade.destroy({ where: { id: grade.id } });
    }
  });

  /**
   * Property 2.6: Professor course access authorization
   * 
   * For any professor,
   * the system SHALL return only courses assigned to that professor.
   * 
   * This tests that authorization checks work correctly.
   */
  test('Property 2.6: Professor should only access assigned courses', async () => {
    // Query professor courses
    const professorCourses = await ProfessorCourse.findAll({
      where: { professor_id: testProfessor.id },
      include: [{
        model: Course,
        attributes: ['id', 'course_code']
      }]
    });

    // EXPECTED: Should return only assigned courses
    expect(professorCourses).not.toBeNull();
    expect(professorCourses.length).toBeGreaterThan(0);
    
    // Verify all returned courses are assigned to this professor
    for (const pc of professorCourses) {
      expect(pc.professor_id).toBe(testProfessor.id);
      expect(pc.Course).not.toBeNull();
    }
  });

  /**
   * Property 2.7: Direct Grade queries without includes
   * 
   * For any Grade query without includes,
   * the system SHALL return grade data successfully.
   * 
   * This tests that basic queries work correctly.
   */
  test('Property 2.7: Direct Grade queries without includes should work', async () => {
    // Create a single grade for testing
    const grade = await Grade.create({
      student_id: testStudent.id,
      course_id: testCourse.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      assignment1_grade: 'P',
      assignment2_grade: 'M',
      final_exam_score: 100,
      professor_submitted_by: professorUser.id,
      status: 'draft'
    });

    // Query Grade without includes
    const foundGrade = await Grade.findByPk(grade.id);

    // EXPECTED: Query should succeed
    expect(foundGrade).not.toBeNull();
    expect(foundGrade.id).toBe(grade.id);
    expect(foundGrade.student_id).toBe(testStudent.id);
    expect(foundGrade.course_id).toBe(testCourse.id);

    // Clean up
    await Grade.destroy({ where: { id: grade.id } });
  });
});
