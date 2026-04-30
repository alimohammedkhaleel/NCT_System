const { sequelize } = require('./server/config/models');

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check academic_years table
    const [academicYears] = await sequelize.query('DESCRIBE academic_years');
    console.log('📋 Academic Years Table:');
    academicYears.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} | ${col.Type}`);
    });

    // Check semesters table
    const [semesters] = await sequelize.query('DESCRIBE semesters');
    console.log('\n📋 Semesters Table:');
    semesters.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} | ${col.Type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSchema();
