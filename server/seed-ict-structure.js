/**
 * Seed script for ICT full academic structure:
 * - 4 academic years (السنة 1-4)
 * - 2 semesters per year (الفصل الأول + الثاني)
 * - Sample courses per year/semester with branch assignments for year 3 & 4
 *
 * Run: node seed-ict-structure.js
 * Safe to run multiple times.
 */

const sequelize = require('./config/database');
const Specialty = require('./models/Specialty');
const AcademicYear = require('./models/AcademicYear');
const Semester = require('./models/Semester');
const Course = require('./models/Course');

// ==================== COURSE DATA ====================
// Year 1 & 2: branch = null (all students)
// Year 3 & 4: branch = 'Software' | 'Network' | 'Both'

const coursesByYear = {
  1: {
    sem1: [
      { code: 'ICT-1-1-01', name: 'Introduction to Programming', arabic_name: 'مقدمة في البرمجة', branch: null },
      { code: 'ICT-1-1-02', name: 'Mathematics for Computing', arabic_name: 'رياضيات الحاسب', branch: null },
      { code: 'ICT-1-1-03', name: 'Computer Fundamentals', arabic_name: 'أساسيات الحاسب', branch: null },
      { code: 'ICT-1-1-04', name: 'English for IT', arabic_name: 'اللغة الإنجليزية لتقنية المعلومات', branch: null },
    ],
    sem2: [
      { code: 'ICT-1-2-01', name: 'Data Structures', arabic_name: 'هياكل البيانات', branch: null },
      { code: 'ICT-1-2-02', name: 'Digital Logic', arabic_name: 'المنطق الرقمي', branch: null },
      { code: 'ICT-1-2-03', name: 'Operating Systems Basics', arabic_name: 'أساسيات أنظمة التشغيل', branch: null },
      { code: 'ICT-1-2-04', name: 'Technical Writing', arabic_name: 'الكتابة التقنية', branch: null },
    ]
  },
  2: {
    sem1: [
      { code: 'ICT-2-1-01', name: 'Object Oriented Programming', arabic_name: 'البرمجة كائنية التوجه', branch: null },
      { code: 'ICT-2-1-02', name: 'Database Systems', arabic_name: 'قواعد البيانات', branch: null },
      { code: 'ICT-2-1-03', name: 'Computer Networks Intro', arabic_name: 'مقدمة في شبكات الحاسب', branch: null },
      { code: 'ICT-2-1-04', name: 'Web Development Basics', arabic_name: 'أساسيات تطوير الويب', branch: null },
    ],
    sem2: [
      { code: 'ICT-2-2-01', name: 'Algorithms', arabic_name: 'الخوارزميات', branch: null },
      { code: 'ICT-2-2-02', name: 'Software Engineering', arabic_name: 'هندسة البرمجيات', branch: null },
      { code: 'ICT-2-2-03', name: 'Linux Administration', arabic_name: 'إدارة نظام لينكس', branch: null },
      { code: 'ICT-2-2-04', name: 'Statistics for IT', arabic_name: 'الإحصاء لتقنية المعلومات', branch: null },
    ]
  },
  3: {
    sem1: [
      // Shared (Both)
      { code: 'ICT-3-1-01', name: 'Information Security', arabic_name: 'أمن المعلومات', branch: 'Both' },
      { code: 'ICT-3-1-02', name: 'Project Management', arabic_name: 'إدارة المشاريع', branch: 'Both' },
      // Software branch
      { code: 'ICT-3-1-SW1', name: 'Advanced Web Development', arabic_name: 'تطوير الويب المتقدم', branch: 'Software' },
      { code: 'ICT-3-1-SW2', name: 'Mobile App Development', arabic_name: 'تطوير تطبيقات الجوال', branch: 'Software' },
      // Network branch
      { code: 'ICT-3-1-NW1', name: 'Network Protocols', arabic_name: 'بروتوكولات الشبكات', branch: 'Network' },
      { code: 'ICT-3-1-NW2', name: 'Network Security', arabic_name: 'أمن الشبكات', branch: 'Network' },
    ],
    sem2: [
      // Shared (Both)
      { code: 'ICT-3-2-01', name: 'Cloud Computing', arabic_name: 'الحوسبة السحابية', branch: 'Both' },
      { code: 'ICT-3-2-02', name: 'Research Methods', arabic_name: 'مناهج البحث العلمي', branch: 'Both' },
      // Software branch
      { code: 'ICT-3-2-SW1', name: 'Software Testing', arabic_name: 'اختبار البرمجيات', branch: 'Software' },
      { code: 'ICT-3-2-SW2', name: 'API Development', arabic_name: 'تطوير واجهات برمجة التطبيقات', branch: 'Software' },
      // Network branch
      { code: 'ICT-3-2-NW1', name: 'Wireless Networks', arabic_name: 'الشبكات اللاسلكية', branch: 'Network' },
      { code: 'ICT-3-2-NW2', name: 'Network Administration', arabic_name: 'إدارة الشبكات', branch: 'Network' },
    ]
  },
  4: {
    sem1: [
      // Shared (Both)
      { code: 'ICT-4-1-01', name: 'Graduation Project 1', arabic_name: 'مشروع التخرج الأول', branch: 'Both' },
      { code: 'ICT-4-1-02', name: 'Professional Ethics', arabic_name: 'أخلاقيات المهنة', branch: 'Both' },
      // Software branch
      { code: 'ICT-4-1-SW1', name: 'DevOps & CI/CD', arabic_name: 'ديف أوبس والنشر المستمر', branch: 'Software' },
      { code: 'ICT-4-1-SW2', name: 'AI & Machine Learning', arabic_name: 'الذكاء الاصطناعي والتعلم الآلي', branch: 'Software' },
      // Network branch
      { code: 'ICT-4-1-NW1', name: 'Network Virtualization', arabic_name: 'افتراضية الشبكات', branch: 'Network' },
      { code: 'ICT-4-1-NW2', name: 'Cybersecurity Advanced', arabic_name: 'الأمن السيبراني المتقدم', branch: 'Network' },
    ],
    sem2: [
      // Shared (Both)
      { code: 'ICT-4-2-01', name: 'Graduation Project 2', arabic_name: 'مشروع التخرج الثاني', branch: 'Both' },
      { code: 'ICT-4-2-02', name: 'Entrepreneurship', arabic_name: 'ريادة الأعمال', branch: 'Both' },
      // Software branch
      { code: 'ICT-4-2-SW1', name: 'Distributed Systems', arabic_name: 'الأنظمة الموزعة', branch: 'Software' },
      { code: 'ICT-4-2-SW2', name: 'Software Architecture', arabic_name: 'معمارية البرمجيات', branch: 'Software' },
      // Network branch
      { code: 'ICT-4-2-NW1', name: 'Network Design Project', arabic_name: 'مشروع تصميم الشبكات', branch: 'Network' },
      { code: 'ICT-4-2-NW2', name: 'IoT Networks', arabic_name: 'شبكات إنترنت الأشياء', branch: 'Network' },
    ]
  }
};

const seedICTStructure = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get ICT specialty
    const ict = await Specialty.findOne({ where: { code: 'ICT' } });
    if (!ict) {
      console.error('❌ ICT specialty not found. Run seed-specialties.js first.');
      process.exit(1);
    }
    console.log('✅ ICT specialty found: id=' + ict.id + '\n');

    let yearsCreated = 0, semsCreated = 0, coursesCreated = 0;

    for (let yearNum = 1; yearNum <= 4; yearNum++) {
      // Create or find academic year
      let [academicYear, yearCreated] = await AcademicYear.findOrCreate({
        where: { specialty_id: ict.id, year_number: yearNum },
        defaults: {
          specialty_id: ict.id,
          year_number: yearNum,
          academic_season: '2024-2025',
          is_active: true
        }
      });

      if (yearCreated) {
        yearsCreated++;
        console.log('✅ Created: Year ' + yearNum + ' (id=' + academicYear.id + ')');
      } else {
        console.log('⏭️  Exists:  Year ' + yearNum + ' (id=' + academicYear.id + ')');
      }

      // Create semesters
      for (let semNum = 1; semNum <= 2; semNum++) {
        const semName = 'الفصل الدراسي ' + (semNum === 1 ? 'الأول' : 'الثاني');
        let [semester, semCreated] = await Semester.findOrCreate({
          where: { academic_year_id: academicYear.id, semester_name: semName },
          defaults: {
            academic_year_id: academicYear.id,
            semester_name: semName,
            is_active: true
          }
        });

        if (semCreated) {
          semsCreated++;
          console.log('  ✅ Created: ' + semName + ' (id=' + semester.id + ')');
        } else {
          console.log('  ⏭️  Exists:  ' + semName + ' (id=' + semester.id + ')');
        }

        // Create courses for this year/semester
        const semKey = semNum === 1 ? 'sem1' : 'sem2';
        const courses = coursesByYear[yearNum][semKey];

        for (const courseData of courses) {
          const [course, courseCreated] = await Course.findOrCreate({
            where: { course_code: courseData.code },
            defaults: {
              specialty_id: ict.id,
              academic_year_id: academicYear.id,
              semester_id: semester.id,
              course_code: courseData.code,
              course_name: courseData.name,
              arabic_name: courseData.arabic_name,
              branch: courseData.branch,
              credit_hours: 3,
              is_active: true
            }
          });

          if (courseCreated) {
            coursesCreated++;
            const branchLabel = courseData.branch ? '[' + courseData.branch + ']' : '[All]';
            console.log('    ✅ Course: ' + courseData.code + ' ' + branchLabel + ' - ' + courseData.arabic_name);
          } else {
            console.log('    ⏭️  Exists: ' + courseData.code + ' - ' + courseData.arabic_name);
          }
        }
      }
      console.log('');
    }

    console.log('========================================');
    console.log('✅ ICT Structure Seed Complete!');
    console.log('   Years created:   ' + yearsCreated);
    console.log('   Semesters created: ' + semsCreated);
    console.log('   Courses created:  ' + coursesCreated);
    console.log('========================================');
    console.log('\n📋 ICT Branch Structure:');
    console.log('  Year 1 & 2: All courses shared (no branch)');
    console.log('  Year 3 & 4:');
    console.log('    - Software branch courses (برمجيات)');
    console.log('    - Network branch courses (شبكات)');
    console.log('    - Both branch courses (مشترك)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedICTStructure();
