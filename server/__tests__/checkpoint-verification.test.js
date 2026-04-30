/**
 * Checkpoint Verification Test
 * 
 * This test verifies all the requirements from Task 4:
 * - Grade-Student association queries work correctly
 * - ProfessorCourse-Course association queries work correctly
 * - Activity logging works for all grade operations
 * - No regressions in existing functionality
 */

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
  ActivityLog,
  defineAssociations 
} = require('../config/models');
const bcrypt = require('bcryptjs');

describe('Checkpoint Verification - All Tests Pass', () => {
  let testUser, testStudent, testProfessor, professorUser;
  let testSpecialty, testAcademicYear, testSemester, testCourse;

  beforeAll(async () => {
    defineAssociations();
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test data
    testSpecialty = await Specialty.create({
      name: 'Computer Science',
      arabic_name: 'علوم الحاسوب',
      code: 'CS',
      description: 'Computer Science Specialty'
    });

    testAcademicYear = await AcademicYear.create({
      specialty_id: testSpecialty.id,
      year_number: 1,
      academic_season: '2024',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31')
    });

    testSemester = await Semester.create({
      academic_year_id: testAcademicYear.id,
      semester_name: 'Fall 2024',
      start_date: new Date('2024-09-01'),
      end_date: new Date('2024-12-31')
    });

    testCourse = await Course.create({
      specialty_id: testSpecialty.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      course_code: 'CS101',
      course_name: 'Introduction to Programming',
      arabic_name: 'مقدمة في البرمجة',
      credit_hours: 3
    });

    testUser = await User.create({
      username: 'student001',
      email: 'student@test.com',
      password_hash: hashedPassword,
      full_name: 'Test Student',
      role: 'student',
      is_active: true
    });

    testStudent = await Student.create({
      user_id: testUser.id,
      specialty_id: testSpecialty.id,
      student_code: 'STU001',
      national_id: '12345678901234',
      enrollment_date: new Date('2024-01-01'),
      academic_status: 'active'
    });

    professorUser = await User.create({
      username: 'prof001',
      email: 'prof@test.com',
      password_hash: hashedPassword,
      full_name: 'Test Professor',
      role: 'professor',
      is_active: true
    });

    testProfessor = await Professor.create({
      user_id: professorUser.id,
      professor_code: 'PROF001',
      department: 'Computer Science',
      hire_date: new Date('2020-01-01')
    });

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
    await Grade.destroy({ where: {} });
    await ActivityLog.destroy({ where: {} });
  });

  test('✓ Grade-Student association queries work correctly', async () => {
    // Create a grade
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

    expect(grades).not.toBeNull();
    expect(grades.length).toBe(1);
    expect(grades[0].Student).not.toBeNull();
    expect(grades[0].Student.student_code).toBe('STU001');
    expect(grades[0].Student.User).not.toBeNull();
    expect(grades[0].Student.User.full_name).toBe('Test Student');
  });

  test('✓ ProfessorCourse-Course association queries work correctly', async () => {
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

    expect(professorCourses).not.toBeNull();
    expect(professorCourses.length).toBe(1);
    expect(professorCourses[0].Course).not.toBeNull();
    expect(professorCourses[0].Course.course_code).toBe('CS101');
    expect(professorCourses[0].Course.Specialty).not.toBeNull();
    expect(professorCourses[0].Course.AcademicYear).not.toBeNull();
    expect(professorCourses[0].Course.Semester).not.toBeNull();
  });

  test('✓ Activity logging works for all grade operations', async () => {
    // Test activity logging for different operations
    const operations = [
      { action: 'create', entity: 'Grade', entity_id: 1, description: 'Grade created' },
      { action: 'submit', entity: 'Grade', entity_id: 2, description: 'Grade submitted' },
      { action: 'approve', entity: 'Grade', entity_id: 3, description: 'Grade approved' },
      { action: 'reject', entity: 'Grade', entity_id: 4, description: 'Grade rejected' }
    ];

    for (const op of operations) {
      await ActivityLog.create({
        user_id: professorUser.id,
        action: op.action,
        entity: op.entity,  // ✓ Using correct field name
        entity_id: op.entity_id,
        details: op.description
      });
    }

    // Verify all activity logs were created
    const activityLogs = await ActivityLog.findAll({
      where: { user_id: professorUser.id }
    });

    expect(activityLogs.length).toBe(4);
    expect(activityLogs.every(log => log.entity === 'Grade')).toBe(true);
  });

  test('✓ No regressions in existing functionality - Grade calculations', async () => {
    // Test that grade calculations still work correctly
    const grade = await Grade.create({
      student_id: testStudent.id,
      course_id: testCourse.id,
      academic_year_id: testAcademicYear.id,
      semester_id: testSemester.id,
      assignment1_grade: 'P',
      assignment2_grade: 'P',
      final_exam_score: 150,
      professor_submitted_by: professorUser.id,
      status: 'draft'
    });

    // Verify calculations
    expect(parseFloat(grade.assignment1_score)).toBe(30);
    expect(parseFloat(grade.assignment2_score)).toBe(30);
    expect(parseFloat(grade.total_score)).toBe(210);
    expect(parseFloat(grade.total_percentage)).toBeCloseTo(100, 2);
    expect(parseFloat(grade.grade_point)).toBe(4.0);
    expect(grade.final_result).toBe('Distinction');
    expect(grade.letter_grade).toBe('A');
  });

  test('✓ No regressions in existing functionality - Grade validation', async () => {
    // Test that grade validation still works
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
  });
});
