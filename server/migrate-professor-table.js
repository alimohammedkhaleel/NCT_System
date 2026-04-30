const sequelize = require('./config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const queries = [
      'ALTER TABLE professor_registration_requests ADD COLUMN username VARCHAR(100) NULL AFTER password_hash',
      'ALTER TABLE professor_registration_requests ADD COLUMN department VARCHAR(255) NULL AFTER username',
      'ALTER TABLE professor_registration_requests ADD COLUMN specialization VARCHAR(255) NULL AFTER department'
    ];

    for (const q of queries) {
      try {
        await sequelize.query(q);
        console.log('Added column:', q.match(/ADD COLUMN (\w+)/)[1]);
      } catch (e) {
        if (e.message.includes('Duplicate column')) {
          console.log('Column already exists, skipping:', q.match(/ADD COLUMN (\w+)/)[1]);
        } else {
          console.error('Error:', e.message);
        }
      }
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (e) {
    console.error('Connection error:', e.message);
    process.exit(1);
  }
})();
