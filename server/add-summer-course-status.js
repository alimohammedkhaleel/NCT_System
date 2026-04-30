/**
 * Migration: Add 'summer_course' to students.academic_status ENUM
 * Run: node server/add-summer-course-status.js
 */
const sequelize = require('./config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // MySQL: modify ENUM column to add summer_course
    await sequelize.query(`
      ALTER TABLE students 
      MODIFY COLUMN academic_status 
      ENUM('active', 'graduated', 'suspended', 'transferred', 'dropped', 'summer_course') 
      NOT NULL DEFAULT 'active'
    `);

    console.log('✅ Successfully added summer_course to academic_status ENUM');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
