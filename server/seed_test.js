const { User, Student, Professor, Course, Grade, AcademicYear, Specialty, Semester, CourseGradeConfig } = require('./config/models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // 1. Get default Specialty, Year, Semester
    const specialty = await Specialty.findOne() || await Specialty.create({ name: 'IT', arabic_name: 'تقنية معلومات', code: 'IT01', description: 'IT', total_years: 4 });
    const year = await AcademicYear.findOne({ where: { is_active: true } }) || await AcademicYear.findOne();
    const semester = await Semester.findOne({ where: { is_active: true } }) || await Semester.findOne();

    // 2. Ensure we have courses for Year 1 (at least 4) and Year 2 (at least 1)
    const y1Courses = [];
    for(let i=1; i<=4; i++) {
      const [c] = await Course.findOrCreate({
        where: { course_code: `Y1C${i}` },
        defaults: { course_name: `Year 1 Course ${i}`, arabic_name: `مادة سنة أولى ${i}`, specialty_id: specialty.id, academic_year_id: year.id, semester_id: semester.id, credit_hours: 3 }
      });
      await CourseGradeConfig.findOrCreate({ where: { course_id: c.id }, defaults: { total_mark: 100, year_work_max: 40, midterm_max: 20, final_max: 40, pass_percentage: 60 }});
      y1Courses.push(c);
    }
    
    const [y2Course] = await Course.findOrCreate({
      where: { course_code: 'Y2C1' },
      defaults: { course_name: 'Year 2 Course 1', arabic_name: 'مادة سنة ثانية 1', specialty_id: specialty.id, academic_year_id: year.id, semester_id: semester.id, credit_hours: 3 }
    });
    await CourseGradeConfig.findOrCreate({ where: { course_id: y2Course.id }, defaults: { total_mark: 100, year_work_max: 40, midterm_max: 20, final_max: 40, pass_percentage: 60 }});

    // 3. Create Professor
    const pHash = await bcrypt.hash('password123', 12);
    const [pUser] = await User.findOrCreate({
      where: { email: 'dr.test@example.com' },
      defaults: { username: 'dr_test', full_name: 'د. تيست', national_id: '12345678901234', password_hash: pHash, role: 'professor' }
    });
    const [prof] = await Professor.findOrCreate({
      where: { user_id: pUser.id },
      defaults: { professor_code: 'P-123', specialty_id: specialty.id, qualification: 'PhD', years_of_experience: 5 }
    });

    // 4. Create Students
    const createStudent = async (email, username, fullName, code, yearLvl) => {
      const [sUser] = await User.findOrCreate({
        where: { email },
        defaults: { username, full_name: fullName, national_id: Date.now().toString().slice(-14), password_hash: pHash, role: 'student' }
      });
      const [student] = await Student.findOrCreate({
        where: { student_code: code },
        defaults: { user_id: sUser.id, specialty_id: specialty.id, current_year: yearLvl, academic_status: 'active', national_id: Date.now().toString().slice(-14) }
      });
      return student;
    };

    const s1 = await createStudent('s1_fail4@test.com', 's1_fail4', 'طالب سقط 4 مواد', 'ST-001', 1);
    const s2 = await createStudent('s2_fail3@test.com', 's2_fail3', 'طالب سقط 3 مواد', 'ST-002', 1);
    const s3 = await createStudent('s3_fail1@test.com', 's3_fail1', 'طالب سقط مادة (سنة 2)', 'ST-003', 2);

    const addFailGrade = async (student_id, course_id) => {
      await Grade.create({
        student_id, course_id, academic_year_id: year.id, semester_id: semester.id, professor_id: prof.id,
        year_work_score: 10, midterm_score: 5, final_exam_score: 10, // Total = 25 (Fail)
        total_percentage: 25, is_passed: false, status: 'approved', submitted_by: pUser.id, approved_by: pUser.id, professor_submitted_by: prof.id
      });
    };

    // Delete existing grades for these students first
    await Grade.destroy({ where: { student_id: [s1.id, s2.id, s3.id] } });

    // s1 fails 4 courses
    for(let i=0; i<4; i++) await addFailGrade(s1.id, y1Courses[i].id);
    // s2 fails 3 courses
    for(let i=0; i<3; i++) await addFailGrade(s2.id, y1Courses[i].id);
    // s3 fails 1 course in year 2
    await addFailGrade(s3.id, y2Course.id);

    console.log('Seed completed successfully. Students and grades added.');
  } catch(e) { console.error(e); }
  process.exit(0);
}
seed();
