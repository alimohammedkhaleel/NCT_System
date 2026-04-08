const bcryptjs = require('bcryptjs');
const { User, Specialty, Student } = require('./config/models');

const seedDatabase = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('✅ Seed data already exists, skipping...');
      return;
    }

    console.log('📌 Creating seed data...');

    // Hash passwords
    const saltRounds = 12;
    const adminPassword = await bcryptjs.hash('admin123', saltRounds);
    const profPassword = await bcryptjs.hash('prof123', saltRounds);
    const studentPassword = await bcryptjs.hash('student123', saltRounds);

    // Create default admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@nctu.edu',
      password_hash: adminPassword,
      full_name: 'Admin User',
      phone: '+20-2-12345678',
      role: 'admin',
      is_active: true
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create sample professor
    const profUser = await User.create({
      username: 'professor1',
      email: 'prof@nctu.edu',
      password_hash: profPassword,
      full_name: 'Prof. Ahmed Hassan',
      phone: '+20-2-87654321',
      role: 'professor',
      is_active: true
    });
    console.log('✅ Professor user created (username: professor1, password: prof123)');

    // Create sample student
    const studentUser = await User.create({
      username: 'student1',
      email: 'student@nctu.edu',
      password_hash: studentPassword,
      full_name: 'Ali Mohamed',
      phone: '+20-12-3456789',
      role: 'student',
      is_active: true
    });
    console.log('✅ Student user created (username: student1, password: student123)');

    // Create sample specialty
    const specialty = await Specialty.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Bachelor of Information Technology'
    });
    console.log('✅ Specialty created (IT - Information Technology)');

    // Create student record
    await Student.create({
      user_id: studentUser.id,
      student_code: 'NCTU-26-001',
      national_id: '30001011234567',
      specialty_id: specialty.id,
      current_year: 1,
      academic_status: 'active',
      enrollment_date: new Date(),
      total_paid: 0,
      total_due: 50000
    });
    console.log('✅ Student record created');

    console.log('\n📝 Default Credentials:');
    console.log('-----------------------------------');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('-----------------------------------');
    console.log('Professor:');
    console.log('  Username: professor1');
    console.log('  Password: prof123');
    console.log('-----------------------------------');
    console.log('Student:');
    console.log('  Username: student1');
    console.log('  Password: student123');
    console.log('-----------------------------------\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

module.exports = seedDatabase;
