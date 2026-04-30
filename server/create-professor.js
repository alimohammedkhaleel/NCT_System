const bcryptjs = require('bcryptjs');
const { User, Professor, ProfessorCourse, Course, AcademicYear, Semester } = require('./config/models');

async function createProfessor() {
  try {
    // Check if professor user already exists
    const existingUser = await User.findOne({ where: { username: 'professor' } });
    
    if (existingUser) {
      console.log('✅ Professor user already exists');
      
      // Check if professor profile exists
      const existingProf = await Professor.findOne({ where: { user_id: existingUser.id } });
      
      if (!existingProf) {
        // Create professor profile
        const professorRecord = await Professor.create({
          user_id: existingUser.id,
          professor_code: 'PROF002',
          department: 'Computer Science',
          hire_date: new Date('2021-01-15'),
          specialization: 'Database Systems',
          is_active: true
        });
        console.log('✅ Professor profile created');
        
        // Assign to all courses
        const allCourses = await Course.findAll({ limit: 10 });
        const academicYears = await AcademicYear.findAll({ limit: 1 });
        const semesters = await Semester.findAll({ limit: 1 });

        if (allCourses.length > 0 && academicYears.length > 0 && semesters.length > 0) {
          for (const course of allCourses) {
            const existingAssignment = await ProfessorCourse.findOne({
              where: {
                professor_id: professorRecord.id,
                course_id: course.id
              }
            });

            if (!existingAssignment) {
              await ProfessorCourse.create({
                professor_id: professorRecord.id,
                course_id: course.id,
                academic_year_id: academicYears[0].id,
                semester_id: semesters[0].id,
                is_primary: false
              });
            }
          }
          console.log(`✅ Professor assigned to ${allCourses.length} courses`);
        }
      } else {
        console.log('✅ Professor profile already exists');
      }
      
      process.exit(0);
    }

    // Create professor user
    const saltRounds = 12;
    const password = await bcryptjs.hash('professor123', saltRounds);
    
    const profUser = await User.create({
      username: 'professor',
      email: 'professor@nctu.edu',
      password_hash: password,
      full_name: 'Prof. Mohamed Ali',
      phone: '+20-2-87654322',
      role: 'professor',
      is_active: true
    });
    console.log('✅ Professor user created (username: professor, password: professor123)');

    // Create professor profile
    const professorRecord = await Professor.create({
      user_id: profUser.id,
      professor_code: 'PROF002',
      department: 'Computer Science',
      hire_date: new Date('2021-01-15'),
      specialization: 'Database Systems',
      is_active: true
    });
    console.log('✅ Professor profile created');

    // Assign to all courses
    const allCourses = await Course.findAll({ limit: 10 });
    const academicYears = await AcademicYear.findAll({ limit: 1 });
    const semesters = await Semester.findAll({ limit: 1 });

    if (allCourses.length > 0 && academicYears.length > 0 && semesters.length > 0) {
      for (const course of allCourses) {
        await ProfessorCourse.create({
          professor_id: professorRecord.id,
          course_id: course.id,
          academic_year_id: academicYears[0].id,
          semester_id: semesters[0].id,
          is_primary: false
        });
      }
      console.log(`✅ Professor assigned to ${allCourses.length} courses`);
    }

    console.log('\n✅ Professor setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createProfessor();
