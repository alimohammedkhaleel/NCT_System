/**
 * Migration: Add 'current_semester' column to students table
 * Run: node server/add-current-semester-column.js
 */

const sequelize = require('./config/database');

async function addCurrentSemesterColumn() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'current_semester'
    `);

    if (results.length > 0) {
      console.log('⚠️  Column current_semester already exists');
      process.exit(0);
    }

    // Add column
    await sequelize.query(`
      ALTER TABLE students 
      ADD COLUMN current_semester INT DEFAULT 1 
      COMMENT 'الترم الحالي (1 أو 2)'
      AFTER current_year
    `);

    console.log('✅ Successfully added current_semester column to students table');
    console.log('📝 Default value: 1 (الترم الأول)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addCurrentSemesterColumn();
