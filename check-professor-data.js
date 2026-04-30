const { sequelize, User, Professor, ProfessorCourse, Course } = require('./server/config/models');

async function checkProfessorData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find professor user
    const profUser = await User.findOne({ where: { username: 'professor' } });
    if (!profUser) {
      console.log('❌ Professor user not found');
      return;
    }
    console.log(`✅ Professor user found: ID=${profUser.id}, Username=${profUser.username}, Role=${profUser.role}`);

    // Find professor profile
    const professor = await Professor.findOne({ where: { user_id: profUser.id } });
    if (!professor) {
      console.log('❌ Professor profile not found for this user');
      return;
    }
    console.log(`✅ Professor profile found: ID=${professor.id}, Code=${professor.professor_code}`);

    // Find professor courses
    const professorCourses = await ProfessorCourse.findAll({
      where: { professor_id: professor.id },
      include: [{ model: Course }]
    });
    console.log(`📚 Professor has ${professorCourses.length} courses assigned`);
    
    if (professorCourses.length > 0) {
      professorCourses.forEach(pc => {
        console.log(`  - Course: ${pc.Course.course_name} (${pc.Course.course_code})`);
      });
    } else {
      console.log('⚠️ Professor has no courses assigned - this is why the API returns 404');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProfessorData();
