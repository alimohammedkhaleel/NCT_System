/**
 * Fix student specialty assignments and clean up duplicate specialties
 */
const sequelize = require('./config/database');

(async () => {
  await sequelize.authenticate();
  console.log('✅ DB connected\n');

  // Fix سجى - move from INFO (id=3) to ICT (id=1)
  const [sajwaResult] = await sequelize.query(
    "UPDATE students SET specialty_id = 1 WHERE student_code = '36458554'"
  );
  console.log('✅ Fixed سجى specialty: INFO → ICT (rows affected:', sajwaResult.affectedRows, ')');

  // Deactivate INFO specialty (duplicate/old)
  await sequelize.query("UPDATE specialties SET is_active = 0 WHERE code = 'INFO'");
  console.log('✅ Deactivated INFO specialty (duplicate)');

  // Verify all students
  const [students] = await sequelize.query(
    'SELECT u.full_name, s.student_code, s.specialty_id, s.current_year, s.branch, sp.code as spec_code ' +
    'FROM students s ' +
    'JOIN users u ON s.user_id = u.id ' +
    'JOIN specialties sp ON s.specialty_id = sp.id'
  );
  console.log('\n📋 All students after fix:');
  students.forEach(r => {
    console.log('  ' + r.full_name + ' | code=' + r.student_code + ' | spec=' + r.spec_code + ' | year=' + r.current_year + ' | branch=' + (r.branch || 'null'));
  });

  // Show active specialties
  const [specs] = await sequelize.query(
    "SELECT id, code, name, is_active FROM specialties ORDER BY id"
  );
  console.log('\n📋 Specialties:');
  specs.forEach(s => {
    console.log('  id=' + s.id + ' code=' + s.code + ' active=' + s.is_active + ' - ' + s.name);
  });

  process.exit(0);
})().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
