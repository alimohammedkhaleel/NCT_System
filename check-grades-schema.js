const { sequelize } = require('./server/config/models');

async function checkGradesSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get table structure
    const [results] = await sequelize.query('DESCRIBE grades');
    
    console.log('\n📋 Grades Table Schema:');
    console.log('='.repeat(80));
    
    results.forEach(column => {
      console.log(`${column.Field.padEnd(30)} | ${column.Type.padEnd(20)} | ${column.Null} | ${column.Key}`);
    });
    
    console.log('='.repeat(80));
    
    // Check for specific columns
    const hasAssignment1 = results.some(col => col.Field === 'assignment1_grade');
    const hasAssignment2 = results.some(col => col.Field === 'assignment2_grade');
    
    console.log('\n🔍 Column Check:');
    console.log(`assignment1_grade: ${hasAssignment1 ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`assignment2_grade: ${hasAssignment2 ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasAssignment1 || !hasAssignment2) {
      console.log('\n⚠️ Missing columns detected!');
      console.log('Run this SQL to fix:');
      console.log(`
ALTER TABLE grades 
ADD COLUMN assignment1_grade ENUM('P', 'M', 'D') NULL AFTER semester_id,
ADD COLUMN assignment2_grade ENUM('P', 'M', 'D') NULL AFTER assignment1_score;
      `);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkGradesSchema();
