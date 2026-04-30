const bcryptjs = require('bcryptjs');
const { User, Professor, Student, Specialty, sequelize } = require('./config/models');

async function cleanAndSeed() {
  try {
    console.log('🧹 Cleaning database...');
    
    // Delete all test/inactive professors
    await User.destroy({
      where: {
        role: 'professor',
        is_active: false
      }
    });
    console.log('✅ Removed inactive professors');
    
    // Delete test students
    await User.destroy({
      where: {
        role: 'student',
        username: { [sequelize.Sequelize.Op.like]: 'st_%' }
      }
    });
    console.log('✅ Removed test students');
    
    // Create active professor if not exists
    const profExists = await User.findOne({ where: { username: 'professor', role: 'professor' } });
    if (!profExists) {
      const profPassword = await bcryptjs.hash('professor123', 12);
      const profUser = await User.create({
        username: 'professor',
        email: 'professor@nctu.edu',
        password_hash: profPassword,
        full_name: 'Dr. Ahmed Hassan',
        phone: '+20-2-87654321',
        role: 'professor',
        is_active: true
      });
      
      // Create professor record
      const ictSpecialty = await Specialty.findOne({ where: { code: 'ICT' } });
      if (ictSpecialty) {
        await Professor.create({
          user_id: profUser.id,
          professor_code: 'PROF-001',
          department: 'Information Technology',
          specialty_id: ictSpecialty.id,
          hire_date: new Date(),
          is_active: true
        });
      }
      console.log('✅ Created professor user (username: professor, password: professor123)');
    }
    
    // Create test students
    const studentPassword = await bcryptjs.hash('student123', 12);
    const specialties = await Specialty.findAll({ where: { is_active: true } });
    
    for (let i = 1; i <= 3; i++) {
      const studentExists = await User.findOne({ where: { username: `student${i}` } });
      if (!studentExists) {
        const studentUser = await User.create({
          username: `student${i}`,
          email: `student${i}@nctu.edu`,
          password_hash: studentPassword,
          full_name: `Student ${i}`,
          phone: `+20-12-345678${i}`,
          role: 'student',
          is_active: true
        });
        
        const specialty = specialties[i % specialties.length];
        await Student.create({
          user_id: studentUser.id,
          student_code: `NCTU-26-00${i}`,
          national_id: `3000101123456${i}`,
          specialty_id: specialty.id,
          current_year: (i % 4) + 1,
          academic_status: 'active',
          enrollment_date: new Date(),
          total_paid: 0,
          total_due: specialty.annual_fee || 15000
        });
        console.log(`✅ Created student${i} (password: student123)`);
      }
    }
    
    console.log('\n✅ Database cleaned and seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Professor: professor / professor123');
    console.log('Accountant: accountant / accountant123');
    console.log('Students: student1, student2, student3 / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanAndSeed();
