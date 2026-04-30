const { Professor, ProfessorCourse, Course, User, sequelize } = require('./config/models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');
    
    // Find professor user
    const profUser = await User.findOne({ where: { username: 'professor' } });
    if (!profUser) {
      console.log('❌ Professor user not found');
      process.exit(1);
    }
    
    console.log(`Professor User: ${profUser.username} (ID: ${profUser.id})`);
    
    // Find professor record
    const professor = await Professor.findOne({ where: { user_id: profUser.id } });
    if (!professor) {
      console.log('❌ Professor record not found');
      process.exit(1);
    }
    
    console.log(`Professor Record ID: ${professor.id}\n`);
    
    // Find assigned courses
    const professorCourses = await ProfessorCourse.findAll({
      where: { professor_id: professor.id }
    });
    
    console.log(`Assigned Courses: ${professorCourses.length}`);
    
    for (const pc of professorCourses) {
      const course = await Course.findByPk(pc.course_id);
      console.log(`- Course ID: ${pc.course_id}, Code: ${course?.course_code}, Name: ${course?.course_name}`);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
