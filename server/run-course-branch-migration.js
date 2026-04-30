/**
 * Standalone Migration Runner: Add branch field to courses table
 * 
 * This script adds the branch field to the courses table to support
 * ICT branch-specific courses (Software, Network, Both).
 * 
 * Usage: node run-course-branch-migration.js
 */

const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function runMigration() {
  try {
    console.log('🚀 Starting Courses Branch Migration...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check if branch column already exists in courses table
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'courses' 
        AND COLUMN_NAME = 'branch'
    `);

    if (columns.length > 0) {
      console.log('⚠️  Branch field already exists in courses table');
      console.log('❓ Migration may have already been run. Exiting...\n');
      process.exit(0);
    }

    console.log('📝 Adding branch field to courses table...\n');

    // Add branch column to courses table
    await sequelize.query(`
      ALTER TABLE courses 
      ADD COLUMN branch ENUM('Software', 'Network', 'Both') NULL 
      COMMENT 'فرع المادة: Software=للبرمجيات فقط, Network=للشبكات فقط, Both=للكليهما, NULL=للجميع'
      AFTER semester_id
    `);
    console.log('✅ Added branch column to courses table');

    // Add index on branch field for filtering performance
    await sequelize.query(`
      CREATE INDEX idx_courses_branch ON courses(branch)
    `);
    console.log('✅ Added index on branch field');

    // Add composite index for common queries (specialty + year + branch)
    await sequelize.query(`
      CREATE INDEX idx_courses_specialty_year_branch ON courses(specialty_id, academic_year_id, branch)
    `);
    console.log('✅ Added composite index on specialty_id, academic_year_id, branch');

    // Verify the changes
    const [newColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'courses' 
        AND COLUMN_NAME = 'branch'
    `);

    console.log('\n📊 Verification - New column added:');
    console.table(newColumns);

    // Check indexes
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM courses WHERE Key_name LIKE '%branch%'
    `);

    console.log('\n📊 Verification - New indexes added:');
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Seq_in_index: idx.Seq_in_index
    })));

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Course model already updated with branch field');
    console.log('   2. Course filtering by branch already implemented');
    console.log('   3. Admin course management supports branch assignment');
    console.log('   4. Results publishing interface shows branch information\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();