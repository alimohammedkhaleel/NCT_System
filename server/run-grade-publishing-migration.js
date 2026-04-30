/**
 * Standalone Migration Runner: Add publishing fields to grades table
 * 
 * This script adds the publishing fields (is_published, published_at, published_by)
 * to the grades table to support the grade publishing feature.
 * 
 * Usage: node run-grade-publishing-migration.js
 * 
 * Related to: NCTU Dashboard UI Enhancements - Task 7.1
 */

const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function runMigration() {
  try {
    console.log('🚀 Starting Grade Publishing Migration...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check if columns already exist
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'grades' 
        AND COLUMN_NAME IN ('is_published', 'published_at', 'published_by')
    `);

    if (columns.length > 0) {
      console.log('⚠️  Publishing fields already exist in grades table:');
      columns.forEach(col => console.log(`   - ${col.COLUMN_NAME}`));
      console.log('\n❓ Migration may have already been run. Exiting...\n');
      process.exit(0);
    }

    console.log('📝 Adding publishing fields to grades table...\n');

    // Add is_published column
    await sequelize.query(`
      ALTER TABLE grades 
      ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE 
      COMMENT 'هل تم نشر الدرجة للطالب'
    `);
    console.log('✅ Added is_published column');

    // Add published_at column
    await sequelize.query(`
      ALTER TABLE grades 
      ADD COLUMN published_at DATETIME NULL 
      COMMENT 'تاريخ النشر'
    `);
    console.log('✅ Added published_at column');

    // Add published_by column
    await sequelize.query(`
      ALTER TABLE grades 
      ADD COLUMN published_by INT NULL 
      COMMENT 'الأدمن الذي نشر الدرجة'
    `);
    console.log('✅ Added published_by column');

    // Add foreign key constraint
    await sequelize.query(`
      ALTER TABLE grades 
      ADD CONSTRAINT fk_grades_published_by 
      FOREIGN KEY (published_by) REFERENCES users(id) 
      ON UPDATE CASCADE 
      ON DELETE SET NULL
    `);
    console.log('✅ Added foreign key constraint on published_by');

    // Add index for better query performance
    await sequelize.query(`
      CREATE INDEX idx_grades_is_published ON grades(is_published)
    `);
    console.log('✅ Added index on is_published');

    // Verify the changes
    const [newColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'grades' 
        AND COLUMN_NAME IN ('is_published', 'published_at', 'published_by')
      ORDER BY COLUMN_NAME
    `);

    console.log('\n📊 Verification - New columns added:');
    console.table(newColumns);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update Grade model in server/models/Grade.js');
    console.log('   2. Update gradeController.js to filter by is_published');
    console.log('   3. Create admin interface for publishing grades\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
