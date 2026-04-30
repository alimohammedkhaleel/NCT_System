/**
 * Migration Script - Task 9.2 & 9.3
 * Migrate courses without semester_id to default semester (Fall)
 */

const { sequelize } = require('./config/models');
const Course = require('./models/Course');
const Semester = require('./models/Semester');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function migrateCourses() {
  try {
    console.log('🔄 Starting course semester migration...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Find courses without semester_id
    const coursesWithoutSemester = await Course.findAll({
      where: {
        semester_id: null
      },
      attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'specialty_id', 'academic_year_id']
    });

    if (coursesWithoutSemester.length === 0) {
      console.log('✅ No courses need migration. All courses have semester_id assigned.\n');
      await sequelize.close();
      rl.close();
      return;
    }

    console.log(`📊 Found ${coursesWithoutSemester.length} courses without semester_id\n`);

    // Get available semesters
    const semesters = await Semester.findAll({
      attributes: ['id', 'semester_name', 'academic_year_id', 'is_active'],
      order: [['academic_year_id', 'ASC'], ['semester_name', 'ASC']]
    });

    if (semesters.length === 0) {
      console.log('❌ No semesters found in database!');
      console.log('Please create semesters first before running this migration.\n');
      await sequelize.close();
      rl.close();
      return;
    }

    console.log('📋 Available semesters:');
    semesters.forEach(sem => {
      const arabicName = sem.semester_name === 'Fall' ? 'الفصل الدراسي الأول' : 
                        sem.semester_name === 'Spring' ? 'الفصل الدراسي الثاني' : 
                        'الفصل الصيفي';
      console.log(`   ${sem.id}. ${sem.semester_name} (${arabicName}) - Academic Year: ${sem.academic_year_id}`);
    });
    console.log('');

    // Find default Fall semester (first active Fall semester)
    const defaultSemester = semesters.find(s => s.semester_name === 'Fall' && s.is_active) || semesters[0];
    const defaultArabicName = defaultSemester.semester_name === 'Fall' ? 'الفصل الدراسي الأول' : 
                             defaultSemester.semester_name === 'Spring' ? 'الفصل الدراسي الثاني' : 
                             'الفصل الصيفي';
    
    console.log(`📌 Default semester for migration: ${defaultSemester.semester_name} (${defaultArabicName}) - ID: ${defaultSemester.id}\n`);

    // Show courses to be migrated
    console.log('📝 Courses to be migrated:');
    coursesWithoutSemester.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.course_code} - ${course.course_name}`);
    });
    console.log('');

    // Ask for confirmation
    const answer = await askQuestion('⚠️  Do you want to proceed with the migration? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Migration cancelled by user\n');
      await sequelize.close();
      rl.close();
      return;
    }

    // Perform migration
    console.log('\n🔄 Migrating courses...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const course of coursesWithoutSemester) {
      try {
        await course.update({
          semester_id: defaultSemester.id
        });
        console.log(`✅ Migrated: ${course.course_code} - ${course.course_name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to migrate: ${course.course_code} - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} courses`);
    console.log(`   ❌ Failed: ${errorCount} courses`);
    console.log('');

    if (successCount > 0) {
      console.log('✅ Migration completed successfully!\n');
      console.log('📝 Next steps:');
      console.log('   1. Verify the migrated courses in the admin panel');
      console.log('   2. Update any courses that need different semesters');
      console.log('   3. Test the professor grades page to ensure students appear correctly\n');
    }

    await sequelize.close();
    rl.close();

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error(error);
    await sequelize.close();
    rl.close();
    process.exit(1);
  }
}

// Run the migration
migrateCourses();
