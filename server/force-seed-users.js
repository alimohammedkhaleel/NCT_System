const bcryptjs = require('bcryptjs');
const { User, Specialty, Student, Professor } = require('./config/models');

const seedUsers = async () => {
  try {
    const saltRounds = 12;
    const adminPassword = await bcryptjs.hash('admin123', saltRounds);
    const accountantPassword = await bcryptjs.hash('accountant123', saltRounds);

    // Admin
    const [admin, adminCreated] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@nctu.edu',
        password_hash: adminPassword,
        full_name: 'Admin User',
        phone: '+20-2-12345678',
        role: 'admin',
        is_active: true
      }
    });
    console.log(adminCreated ? '✅ Admin created' : 'ℹ️ Admin already exists');

    // Accountant
    const [accountant, accountantCreated] = await User.findOrCreate({
      where: { username: 'accountant' },
      defaults: {
        email: 'accountant@nctu.edu',
        password_hash: accountantPassword,
        full_name: 'Accountant User',
        phone: '+20-2-11111111',
        role: 'accountant',
        is_active: true
      }
    });
    console.log(accountantCreated ? '✅ Accountant created' : 'ℹ️ Accountant already exists');

    console.log('✅ Required users guaranteed to exist.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

require('./config/database').authenticate().then(seedUsers).catch(console.error);
