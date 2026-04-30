const bcryptjs = require('bcryptjs');
const { User, Professor } = require('./config/models');

async function createTestUsers() {
  try {
    console.log('🔧 Updating test users...');

    const saltRounds = 12;

    // Update student_ahmed to have username student1 and password student123
    const studentUser = await User.findOne({ where: { id: 5 } });
    
    if (studentUser) {
      const studentPassword = await bcryptjs.hash('student123', saltRounds);
      await studentUser.update({
        username: 'student1',
        password_hash: studentPassword
      });
      console.log('✅ Student user updated (username: student1, password: student123)');
      console.log('   National ID: 30001011234567');
    }

    // Check if professor exists
    let profUser = await User.findOne({ where: { username: 'professor' } });
    
    if (!profUser) {
      const profPassword = await bcryptjs.hash('professor123', saltRounds);
      
      profUser = await User.create({
        username: 'professor',
        email: 'professor@test.nctu.edu',
        password_hash: profPassword,
        full_name: 'Prof. Mohamed Ali',
        phone: '+20-2-87654322',
        role: 'professor',
        is_active: true
      });
      console.log('✅ Professor user created (username: professor, password: professor123)');

      await Professor.create({
        user_id: profUser.id,
        professor_code: 'PROF002',
        department: 'Computer Science',
        hire_date: new Date('2021-01-15'),
        specialization: 'Database Systems',
        is_active: true
      });
      console.log('✅ Professor profile created');
    } else {
      console.log('ℹ️  Professor user already exists');
    }

    console.log('\n📝 Test Credentials:');
    console.log('-----------------------------------');
    console.log('Student:');
    console.log('  Username: student1');
    console.log('  Password: student123');
    console.log('  National ID: 30001011234567');
    console.log('-----------------------------------');
    console.log('Professor:');
    console.log('  Username: professor');
    console.log('  Password: professor123');
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTestUsers();
