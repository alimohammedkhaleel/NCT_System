const { User } = require('./server/models');
const { sequelize } = require('./server/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    const professors = await User.findAll({
      where: { role: 'professor' },
      attributes: ['id', 'username', 'email', 'role', 'is_active']
    });
    
    console.log('\nProfessor users found:', professors.length);
    professors.forEach(prof => {
      console.log(`- ID: ${prof.id}, Username: ${prof.username}, Email: ${prof.email}, Active: ${prof.is_active}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
