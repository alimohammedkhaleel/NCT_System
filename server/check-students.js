const sequelize = require('./config/database');
const Student = require('./models/Student');
const User = require('./models/User');
const Specialty = require('./models/Specialty');

// Setup associations
Student.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Student, { foreignKey: 'user_id' });
Student.belongsTo(Specialty, { foreignKey: 'specialty_id' });

async function checkStudents() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Get all students
    const students = await Student.findAll({
      include: [{
        model: User,
        attributes: ['full_name', 'email']
      }],
      order: [['id', 'ASC']]
    });

    console.log(`📊 Total students: ${students.length}\n`);
    console.log('📋 List of all students:\n');

    students.forEach((s, index) => {
      console.log(`${index + 1}. ID: ${s.id} | Code: ${s.student_code} | Name: ${s.User?.full_name || 'N/A'} | Year: ${s.current_year} | Status: ${s.academic_status}`);
    });

    // Search for specific student
    const searchName = 'سجى';
    console.log(`\n🔍 Searching for students with name containing "${searchName}":\n`);
    
    const found = students.filter(s => s.User?.full_name?.includes(searchName));
    if (found.length > 0) {
      found.forEach(s => {
        console.log(`✅ Found: ID: ${s.id} | Code: ${s.student_code} | Name: ${s.User?.full_name}`);
      });
    } else {
      console.log(`❌ No students found with name containing "${searchName}"`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStudents();
