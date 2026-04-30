const sequelize = require('./config/database');
const Student = require('./models/Student');
const User = require('./models/User');

Student.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Student, { foreignKey: 'user_id' });

async function checkAvatars() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const students = await Student.findAll({
      include: [{
        model: User,
        attributes: ['id', 'full_name', 'avatar_url']
      }],
      limit: 10
    });

    console.log('📊 Sample students with avatar data:\n');
    students.forEach(s => {
      console.log(`ID: ${s.id} | Name: ${s.User?.full_name || 'N/A'} | Avatar: ${s.User?.avatar_url || 'NULL'}`);
    });

    // Check if any avatars exist
    const withAvatars = students.filter(s => s.User?.avatar_url);
    console.log(`\n📸 Students with avatars: ${withAvatars.length}/${students.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAvatars();
