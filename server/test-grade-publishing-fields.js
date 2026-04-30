/**
 * Test Script: Verify Grade Publishing Fields
 * 
 * This script tests that the new publishing fields are properly defined
 * in the Grade model and can be used in queries.
 * 
 * Usage: node test-grade-publishing-fields.js
 */

const sequelize = require('./config/database');
const Grade = require('./models/Grade');

async function testPublishingFields() {
  try {
    console.log('🧪 Testing Grade Publishing Fields...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get model attributes
    const attributes = Grade.rawAttributes;
    
    console.log('📋 Checking for publishing fields in Grade model:\n');
    
    const requiredFields = ['is_published', 'published_at', 'published_by'];
    let allFieldsPresent = true;
    
    for (const field of requiredFields) {
      if (attributes[field]) {
        console.log(`✅ ${field}:`);
        console.log(`   Type: ${attributes[field].type.constructor.name}`);
        console.log(`   Nullable: ${attributes[field].allowNull !== false ? 'Yes' : 'No'}`);
        console.log(`   Default: ${attributes[field].defaultValue || 'None'}`);
        console.log(`   Comment: ${attributes[field].comment || 'None'}`);
        console.log('');
      } else {
        console.log(`❌ ${field}: NOT FOUND`);
        allFieldsPresent = false;
      }
    }

    if (!allFieldsPresent) {
      console.log('⚠️  Some fields are missing from the model definition.');
      console.log('   Make sure you have updated server/models/Grade.js\n');
      process.exit(1);
    }

    // Check if table columns exist in database
    console.log('🔍 Checking database table structure...\n');
    
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'grades' 
        AND COLUMN_NAME IN ('is_published', 'published_at', 'published_by')
      ORDER BY COLUMN_NAME
    `);

    if (columns.length === 0) {
      console.log('⚠️  Publishing fields not found in database table.');
      console.log('   Run the migration first: node run-grade-publishing-migration.js\n');
      process.exit(1);
    }

    console.log('✅ Database columns found:');
    console.table(columns);

    // Test a simple query with the new fields
    console.log('\n🔍 Testing query with publishing fields...\n');
    
    const testQuery = await Grade.findAll({
      attributes: ['id', 'is_published', 'published_at', 'published_by'],
      where: {
        is_published: false
      },
      limit: 5
    });

    console.log(`✅ Query successful! Found ${testQuery.length} unpublished grades (showing max 5)`);
    
    if (testQuery.length > 0) {
      console.log('\nSample data:');
      testQuery.forEach(grade => {
        console.log(`   Grade ID: ${grade.id}, Published: ${grade.is_published}, Published At: ${grade.published_at || 'N/A'}, Published By: ${grade.published_by || 'N/A'}`);
      });
    }

    console.log('\n✅ All tests passed! Publishing fields are working correctly.\n');
    
    console.log('📝 Summary:');
    console.log('   ✅ Model definition includes all publishing fields');
    console.log('   ✅ Database table has all required columns');
    console.log('   ✅ Queries with publishing fields work correctly\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run the test
testPublishingFields();
