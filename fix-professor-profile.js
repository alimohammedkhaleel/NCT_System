const { sequelize, User, Professor, ProfessorCourse, Course } = require('./server/config/models');

async function fixProfessorProfile() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find professor user
    const profUser = await User.findOne({ where: { username: 'professor' } });
    if (!profUser) {
      console.log('❌ Professor user not found');
      return;
    }
    console.log(`✅ Professor user found: ID=${profUser.id}`);

    // Check if professor profile exists
    let professor = await Professor.findOne({ where: { user_id: profUser.id } });
    
    if (!professor) {
      // Create professor profile
      professor = await Professor.create({
        user_id: profUser.id,
        professor_code: `PROF-${Date.now()}`,
        department: 'Engineering',
        specialization: 'Computer Science',
        is_active: true
      });
      console.log(`✅ Created professor profile: ID=${professor.id}, Code=${professor.professor_code}`);
    } else {
      console.log(`✅ Professor profile already exists: ID=${professor.id}`);
    }

    // Find a test course to assign
    const course = await Course.findOne();
    if (course) {
      // Check if already assigned
      const existing = await ProfessorCourse.findOne({
        where: { professor_id: professor.id, course_id: course.id }
      });
      
      if (!existing) {
        await ProfessorCourse.create({
          professor_id: professor.id,
          course_id: course.id,
          academic_year_id: course.academic_year_id,
          semester_id: course.semester_id
        });
        console.log(`✅ Assigned course: ${course.course_name} (${course.course_code})`);
      } else {
        console.log(`✅ Course already assigned: ${course.course_name}`);
      }
    } else {
      console.log('⚠️ No courses found in database to assign');
    }

    console.log('\n✅ Professor profile fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProfessorProfile();
