/**
 * Standalone Migration Runner: Add branch field to students table
 * 
 * This script adds the branch field to the students table to support
 * ICT branch selection for 3rd and 4th year students.
 * 
 * Usage: node run-branch-migration.js
 */

const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function runMigration() {
  try {
    console.log('🚀 Starting Students Branch Migration...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check if branch column already exists in students table
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND COLUMN_NAME = 'branch'
    `);

    if (columns.length > 0) {
      console.log('⚠️  Branch field already exists in students table');
      console.log('❓ Migration may have already been run. Exiting...\n');
      process.exit(0);
    }

    console.log('📝 Adding branch field to students table...\n');

    // Add branch column to students table
    await sequelize.query(`
      ALTER TABLE students 
      ADD COLUMN branch ENUM('Software', 'Network') NULL 
      COMMENT 'فرع الطالب (للسنة الثالثة والرابعة في ICT) - البرمجيات أو الشبكات'
      AFTER current_year
    `);
    console.log('✅ Added branch column to students table');

    // Add index on branch field for filtering performance
    await sequelize.query(`
      CREATE INDEX idx_students_branch ON students(branch)
    `);
    console.log('✅ Added index on branch field');

    // Add composite index for common queries (specialty + year + branch)
    await sequelize.query(`
      CREATE INDEX idx_students_specialty_year_branch ON students(specialty_id, current_year, branch)
    `);
    console.log('✅ Added composite index on specialty_id, current_year, branch');

    // Verify the changes
    const [newColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND COLUMN_NAME = 'branch'
    `);

    console.log('\n📊 Verification - New column added:');
    console.table(newColumns);

    // Check indexes
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM students WHERE Key_name LIKE '%branch%'
    `);

    console.log('\n📊 Verification - New indexes added:');
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Seq_in_index: idx.Seq_in_index
    })));

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Student model already updated with branch field');
    console.log('   2. Registration endpoint already supports branch validation');
    console.log('   3. Branch update endpoint already implemented');
    console.log('   4. Course filtering by branch already implemented\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();