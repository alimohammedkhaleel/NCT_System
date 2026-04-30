/**
 * Seed a test student for ICT specialty and enroll them in a course.
 * Run: node seed-test-student.js
 */

const bcrypt = require('bcryptjs');
const { User, Student, Specialty, AcademicYear, Semester, Course, StudentEnrollment, ProfessorCourse, Professor } = require('./config/models');

(async () => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    console.log('✅ DB connected\n');

    // Get ICT specialty
    const ict = await Specialty.findOne({ where: { code: 'ICT' } });
    if (!ict) { console.error('❌ ICT specialty not found'); process.exit(1); }
    console.log('✅ ICT specialty: id=' + ict.id);

    // Get Year 1 for ICT
    const year1 = await AcademicYear.findOne({ where: { specialty_id: ict.id, year_number: 1 } });
    if (!year1) { console.error('❌ ICT Year 1 not found. Run seed-ict-structure.js first'); process.exit(1); }
    console.log('✅ ICT Year 1: id=' + year1.id);

    // Get Semester 1
    const sem1 = await Semester.findOne({ where: { academic_year_id: year1.id } });
    if (!sem1) { console.error('❌ Semester not found'); process.exit(1); }
    console.log('✅ Semester: ' + sem1.semester_name + ' id=' + sem1.id);

    // Get a course from Year 1 Sem 1
    const course = await Course.findOne({ where: { academic_year_id: year1.id, semester_id: sem1.id } });
    if (!course) { console.error('❌ No courses found for ICT Year 1 Sem 1'); process.exit(1); }
    console.log('✅ Course: ' + course.course_code + ' - ' + course.arabic_name);

    // Create or find test student user
    let studentUser = await User.findOne({ where: { username: 'student1' } });
    if (!studentUser) {
      const hash = await bcrypt.hash('student123', 12);
      studentUser = await User.create({
        username: 'student1',
        email: 'student1@nctu.edu',
        password_hash: hash,
        full_name: 'علي محمد',
        phone: '+20-12-3456789',
        role: 'student',
        is_active: true
      });
      console.log('✅ Created student user: student1 / student123');
    } else {
      console.log('⏭️  Student user exists: student1');
    }

    // Create or find student record
    let student = await Student.findOne({ where: { user_id: studentUser.id } });
    if (!student) {
      student = await Student.create({
        user_id: studentUser.id,
        student_code: 'NCTU-26-001',
        national_id: '30001011234567',
        specialty_id: ict.id,
        current_year: 1,
        branch: null,
        academic_status: 'active',
        enrollment_date: new Date(),
        total_paid: 0,
        total_due: 12000
      });
      console.log('✅ Created student record: NCTU-26-001');
    } else {
      console.log('⏭️  Student record exists: ' + student.student_code);
    }

    // Enroll student in the course
    const existingEnrollment = await StudentEnrollment.findOne({
      where: { student_id: student.id, course_id: course.id }
    });
    if (!existingEnrollment) {
      await StudentEnrollment.create({
        student_id: student.id,
        course_id: course.id,
        academic_year_id: year1.id,
        semester_id: sem1.id,
        enrollment_status: 'enrolled'
      });
      console.log('✅ Student enrolled in: ' + course.course_code);
    } else {
      console.log('⏭️  Already enrolled in: ' + course.course_code);
    }

    // Assign professor1 to this course if not already
    const prof = await Professor.findOne({ where: { professor_code: 'PROF001' } });
    if (prof) {
      const existingAssignment = await ProfessorCourse.findOne({
        where: { professor_id: prof.id, course_id: course.id }
      });
      if (!existingAssignment) {
        await ProfessorCourse.create({
          professor_id: prof.id,
          course_id: course.id,
          academic_year_id: year1.id,
          semester_id: sem1.id,
          is_primary: true
        });
        console.log('✅ Professor1 assigned to: ' + course.course_code);
      } else {
        console.log('⏭️  Professor1 already assigned to: ' + course.course_code);
      }
    }

    console.log('\n========================================');
    console.log('✅ Test data ready!');
    console.log('========================================');
    console.log('Student:  student1 / student123');
    console.log('Course:   ' + course.course_code + ' - ' + course.arabic_name);
    console.log('Professor: professor1 / prof123');
    console.log('\nRun: node test-grade-workflow.js');

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
