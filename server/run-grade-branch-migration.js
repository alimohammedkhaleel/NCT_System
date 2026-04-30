/**
 * Standalone Migration Runner: Add student_branch_at_creation field to grades table
 * 
 * This script adds the student_branch_at_creation field to the grades table
 * for historical tracking of student branch at the time of grade creation.
 * 
 * Usage: node run-grade-branch-migration.js
 */

const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function runMigration() {
  try {
    console.log('🚀 Starting Grades Branch Migration...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check if student_branch_at_creation column already exists in grades table
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'grades' 
        AND COLUMN_NAME = 'student_branch_at_creation'
    `);

    if (columns.length > 0) {
      console.log('⚠️  student_branch_at_creation field already exists in grades table');
      console.log('❓ Migration may have already been run. Exiting...\n');
      process.exit(0);
    }

    console.log('📝 Adding student_branch_at_creation field to grades table...\n');

    // Add student_branch_at_creation column to grades table
    await sequelize.query(`
      ALTER TABLE grades 
      ADD COLUMN student_branch_at_creation ENUM('Software', 'Network') NULL 
      COMMENT 'فرع الطالب وقت إنشاء الدرجة (للحفظ التاريخي - لا يتغير حتى لو تغير فرع الطالب)'
      AFTER student_id
    `);
    console.log('✅ Added student_branch_at_creation column to grades table');

    // Add index on student_branch_at_creation field for filtering performance
    await sequelize.query(`
      CREATE INDEX idx_grades_student_branch_at_creation ON grades(student_branch_at_creation)
    `);
    console.log('✅ Added index on student_branch_at_creation field');

    // Verify the changes
    const [newColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'grades' 
        AND COLUMN_NAME = 'student_branch_at_creation'
    `);

    console.log('\n📊 Verification - New column added:');
    console.table(newColumns);

    // Check indexes
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM grades WHERE Key_name LIKE '%student_branch%'
    `);

    console.log('\n📊 Verification - New indexes added:');
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Seq_in_index: idx.Seq_in_index
    })));

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Grade model already updated with student_branch_at_creation field');
    console.log('   2. beforeSave hook already implemented to capture student branch');
    console.log('   3. Historical branch tracking now available for audit purposes');
    console.log('   4. Branch consistency validation already implemented\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();