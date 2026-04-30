
const bcrypt = require('bcryptjs');
const { User, Student, Specialty, AcademicYear, Semester, Course, Grade, StudentEnrollment, Professor } = require('./config/models');

(async () => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    console.log('✅ DB connected\n');

    // 1. Get ICT specialty
    const ict = await Specialty.findOne({ where: { code: 'ICT' } });
    if (!ict) { console.error('❌ ICT specialty not found'); process.exit(1); }

    // 2. Get Years
    const year1 = await AcademicYear.findOne({ where: { specialty_id: ict.id, year_number: 1 } });
    const year2 = await AcademicYear.findOne({ where: { specialty_id: ict.id, year_number: 2 } });
    
    // 3. Get Semesters
    const sem1 = await Semester.findOne({ where: { academic_year_id: year1.id } });
    const sem2 = await Semester.findOne({ where: { academic_year_id: year1.id, semester_name: 'الفصل الدراسي الثاني' } });
    const sem3 = await Semester.findOne({ where: { academic_year_id: year2.id } });

    // 4. Find or Create Professor
    let profUser = await User.findOne({ where: { username: 'prof_test' } });
    if (!profUser) {
      profUser = await User.create({
        username: 'prof_test',
        email: 'prof_test@nctu.edu',
        password_hash: await bcrypt.hash('prof123', 12),
        full_name: 'د. جمال عثمان',
        role: 'professor',
        is_active: true
      });
    }
    let prof = await Professor.findOne({ where: { user_id: profUser.id } });
    if (!prof) {
      prof = await Professor.create({
        user_id: profUser.id,
        professor_code: 'PTEST01',
        specialty_id: ict.id,
        hire_date: new Date(),
        academic_rank: 'Professor'
      });
    }

    // 5. Create Students
    const studentData = [
      { username: 'fail4_y1', name: 'طالب راسب 4 مواد (سنة 1)', year: 1, code: 'F4Y1-01' },
      { username: 'fail3_y1', name: 'طالب راسب 3 مواد (سنة 1)', year: 1, code: 'F3Y1-01' },
      { username: 'fail1_y2', name: 'طالب راسب مادة واحدة (سنة 2)', year: 2, code: 'F1Y2-01' }
    ];

    const students = [];
    for (const data of studentData) {
      let u = await User.findOne({ where: { username: data.username } });
      if (!u) {
        u = await User.create({
          username: data.username,
          email: `${data.username}@nctu.edu`,
          password_hash: await bcrypt.hash('student123', 12),
          full_name: data.name,
          role: 'student',
          is_active: true
        });
      }
      let s = await Student.findOne({ where: { user_id: u.id } });
      if (!s) {
        s = await Student.create({
          user_id: u.id,
          student_code: data.code,
          national_id: '3000' + Math.floor(1000000000 + Math.random() * 9000000000),
          specialty_id: ict.id,
          current_year: data.year,
          academic_status: 'active',
          enrollment_date: new Date()
        });
      }
      students.push(s);
    }

    const [sFail4, sFail3, sFail1Y2] = students;

    // 6. Function to submit grades
    const submitGrade = async (student_id, course_id, ay_id, sem_id, fail = true) => {
      // Find or create enrollment
      await StudentEnrollment.findOrCreate({
        where: { student_id, course_id, academic_year_id: ay_id, semester_id: sem_id },
        defaults: { enrollment_status: 'enrolled' }
      });

      // Create Grade
      const total_percentage = fail ? 45 : 85;
      const final_exam_score = fail ? 30 : 120; // Assuming max is 150, 50% is 75. So 30 is fail.

      await Grade.upsert({
        student_id,
        course_id,
        academic_year_id: ay_id,
        semester_id: sem_id,
        assignment1_score: 10,
        assignment2_score: 5,
        final_exam_score,
        total_score: 15 + final_exam_score,
        total_percentage,
        grade_point: fail ? 1.0 : 3.5,
        status: 'approved', // We set it to approved directly to test bulk promote
        is_published: true,
        professor_submitted_by: profUser.id
      });
    };

    // --- Student Fail 4 (Year 1) ---
    // Needs 4 fails and at least 1 pass to be processed
    await submitGrade(sFail4.id, 1, year1.id, sem1.id, true);
    await submitGrade(sFail4.id, 2, year1.id, sem1.id, true);
    await submitGrade(sFail4.id, 3, year1.id, sem1.id, true);
    await submitGrade(sFail4.id, 4, year1.id, sem1.id, true);
    await submitGrade(sFail4.id, 5, year1.id, sem1.id, false);

    // --- Student Fail 3 (Year 1) ---
    await submitGrade(sFail3.id, 1, year1.id, sem1.id, true);
    await submitGrade(sFail3.id, 2, year1.id, sem1.id, true);
    await submitGrade(sFail3.id, 3, year1.id, sem1.id, true);
    await submitGrade(sFail3.id, 4, year1.id, sem1.id, false);
    await submitGrade(sFail3.id, 5, year1.id, sem1.id, false);

    // --- Student Fail 1 (Year 2) ---
    await submitGrade(sFail1Y2.id, 9, year2.id, sem3.id, true);
    await submitGrade(sFail1Y2.id, 10, year2.id, sem3.id, false);
    await submitGrade(sFail1Y2.id, 11, year2.id, sem3.id, false);
    await submitGrade(sFail1Y2.id, 12, year2.id, sem3.id, false);

    console.log('\n✅ Test data seeded successfully!');
    console.log('----------------------------------------');
    console.log('Students Created:');
    console.log('1. fail4_y1 (NCTU-F4Y1-01) - Should Repeat Year 1');
    console.log('2. fail3_y1 (NCTU-F3Y1-01) - Should go to Summer Course (Y1)');
    console.log('3. fail1_y2 (NCTU-F1Y2-01) - Should go to Summer Course (Y2)');
    console.log('\nProfessor: prof_test / prof123');
    console.log('----------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
})();
