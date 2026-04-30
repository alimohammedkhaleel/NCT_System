/**
 * Migration Check Script - Task 9.1
 * Check for courses without semester_id
 */

const { sequelize } = require('./config/models');
const Course = require('./models/Course');
const Semester = require('./models/Semester');

async function checkCoursesWithoutSemester() {
  try {
    console.log('🔍 Checking for courses without semester_id...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check for courses with NULL semester_id
    const coursesWithoutSemester = await Course.findAll({
      where: {
        semester_id: null
      },
      attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'specialty_id', 'academic_year_id']
    });

    if (coursesWithoutSemester.length === 0) {
      console.log('✅ All courses have semester_id assigned');
      console.log('✅ No migration needed\n');
    } else {
      console.log(`⚠️  Found ${coursesWithoutSemester.length} courses without semester_id:\n`);
      
      coursesWithoutSemester.forEach((course, index) => {
        console.log(`${index + 1}. Course ID: ${course.id}`);
        console.log(`   Code: ${course.course_code}`);
        console.log(`   Name: ${course.course_name} (${course.arabic_name})`);
        console.log(`   Specialty ID: ${course.specialty_id}`);
        console.log(`   Academic Year ID: ${course.academic_year_id}`);
        console.log('');
      });

      console.log('⚠️  Migration is needed!\n');
      console.log('📝 Next steps:');
      console.log('   1. Review the courses listed above');
      console.log('   2. Run: node server/migrate-courses-semester.js');
      console.log('   3. This will assign default semester (Fall) to courses without semester_id\n');
    }

    // Show available semesters
    console.log('📋 Available semesters in database:');
    const semesters = await Semester.findAll({
      attributes: ['id', 'semester_name', 'academic_year_id', 'is_active'],
      order: [['academic_year_id', 'ASC'], ['semester_name', 'ASC']]
    });

    if (semesters.length === 0) {
      console.log('   ⚠️  No semesters found in database!');
      console.log('   Please create semesters first before migrating courses.\n');
    } else {
      semesters.forEach(sem => {
        const arabicName = sem.semester_name === 'Fall' ? 'الفصل الدراسي الأول' : 
                          sem.semester_name === 'Spring' ? 'الفصل الدراسي الثاني' : 
                          'الفصل الصيفي';
        console.log(`   - ID: ${sem.id} | ${sem.semester_name} (${arabicName}) | Academic Year: ${sem.academic_year_id} | Active: ${sem.is_active}`);
      });
      console.log('');
    }

    await sequelize.close();
    console.log('✅ Check completed\n');

  } catch (error) {
    console.error('❌ Error checking courses:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the check
checkCoursesWithoutSemester();
