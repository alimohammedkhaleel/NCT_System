const { User } = require('./config/models');
const bcryptjs = require('bcryptjs');

async function checkUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'is_active', 'password_hash']
    });
    
    console.log('\n=== Users in Database ===\n');
    for (const user of users) {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.is_active}`);
      console.log(`Password Hash: ${user.password_hash.substring(0, 30)}...`);
      
      // Test passwords
      const testPasswords = ['admin123', 'prof123', 'professor123', 'student123', 'accountant123'];
      for (const pwd of testPasswords) {
        const match = await bcryptjs.compare(pwd, user.password_hash);
        if (match) {
          console.log(`✅ Password matches: ${pwd}`);
        }
      }
      console.log('---');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
