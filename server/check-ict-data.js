const sequelize = require('./config/database');
const Specialty = require('./models/Specialty');
const AcademicYear = require('./models/AcademicYear');
const Semester = require('./models/Semester');
const Course = require('./models/Course');

(async () => {
  await sequelize.authenticate();

  // Get ICT specialty
  const ict = await Specialty.findOne({ where: { code: 'ICT' } });
  console.log('ICT Specialty:', ict ? `id=${ict.id}, name=${ict.name}` : 'NOT FOUND');

  if (!ict) { process.exit(0); }

  // Get all academic years for ICT
  const years = await AcademicYear.findAll({
    where: { specialty_id: ict.id },
    order: [['year_number', 'ASC']]
  });
  console.log('\nICT Academic Years (' + years.length + '):');
  for (const y of years) {
    console.log('  Year ' + y.year_number + ' (id=' + y.id + ', active=' + y.is_active + ')');

    const sems = await Semester.findAll({ where: { academic_year_id: y.id } });
    if (sems.length === 0) {
      console.log('    -> No semesters');
    } else {
      for (const s of sems) {
        console.log('    -> Semester: ' + s.semester_name + ' (id=' + s.id + ')');
      }
    }

    // Count courses for this year
    const courses = await Course.findAll({ where: { academic_year_id: y.id } });
    console.log('    -> Courses: ' + courses.length);
    for (const c of courses) {
      console.log('       ' + c.course_code + ' | ' + c.course_name + ' | branch=' + (c.branch || 'NULL'));
    }
  }

  // All specialties summary
  const allSpecs = await Specialty.findAll({ order: [['code', 'ASC']] });
  console.log('\nAll Specialties (' + allSpecs.length + '):');
  for (const s of allSpecs) {
    const yCount = await AcademicYear.count({ where: { specialty_id: s.id } });
    console.log('  ' + s.code + ' - ' + s.arabic_name + ' | years=' + yCount);
  }

  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
