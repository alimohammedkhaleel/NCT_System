/**
 * Comprehensive seed script for NCTU ERP System
 * Seeds: 6 specialties, academic years, semesters, ICT branch courses, users
 *
 * Run: node seed-all.js
 * Safe to run multiple times (uses findOrCreate).
 */

require('dotenv').config();
const bcryptjs = require('bcryptjs');
const { sequelize, defineAssociations } = require('./config/models');

const User = require('./models/User');
const Specialty = require('./models/Specialty');
const AcademicYear = require('./models/AcademicYear');
const Semester = require('./models/Semester');
const Course = require('./models/Course');
const Student = require('./models/Student');
const Professor = require('./models/Professor');

// =====================================================
// 1. التخصصات الستة
// =====================================================
const SPECIALTIES = [
  { code: 'MCT', name: 'Mechatronics Technology',       arabic_name: 'تكنولوجيا الميكاترونكس',       duration_years: 4, total_credits: 132, annual_fee: 15000.00, description: 'برنامج الميكاترونكس يجمع بين الميكانيكا والإلكترونيات والبرمجة والتحكم الآلي' },
  { code: 'AUT', name: 'Autotronics Technology',        arabic_name: 'تكنولوجيا الأوتوترونكس',        duration_years: 4, total_credits: 132, annual_fee: 14000.00, description: 'برنامج متخصص في إلكترونيات السيارات وأنظمتها الحديثة والتشخيص الإلكتروني' },
  { code: 'ICT', name: 'Information Technology',        arabic_name: 'تكنولوجيا المعلومات',           duration_years: 4, total_credits: 132, annual_fee: 12000.00, description: 'برنامج تكنولوجيا المعلومات - فرعان: البرمجيات والشبكات (السنة 3 و4)' },
  { code: 'PRO', name: 'Prosthetics Technology',        arabic_name: 'تكنولوجيا الأطراف الصناعية',    duration_years: 4, total_credits: 132, annual_fee: 16000.00, description: 'برنامج الأطراف الصناعية والأجهزة التقويمية والتأهيل الطبي' },
  { code: 'OIL', name: 'Oil Production Technology',     arabic_name: 'تكنولوجيا إنتاج البترول',       duration_years: 4, total_credits: 132, annual_fee: 18000.00, description: 'برنامج تكنولوجيا إنتاج ونقل ومعالجة البترول والغاز الطبيعي' },
  { code: 'REN', name: 'Renewable Energy Technology',   arabic_name: 'تكنولوجيا الطاقة المتجددة',     duration_years: 4, total_credits: 132, annual_fee: 17000.00, description: 'برنامج تكنولوجيا الطاقة الجديدة والمتجددة والطاقة الشمسية وطاقة الرياح' },
];

// =====================================================
// 2. مواد ICT - السنة 1 و 2 (مشتركة) + السنة 3 و 4 (فرعين)
// =====================================================
const ICT_COURSES = {
  1: {
    sem1: [
      { code: 'ICT-1-1-01', name: 'Introduction to Programming',    arabic_name: 'مقدمة في البرمجة',                    branch: null },
      { code: 'ICT-1-1-02', name: 'Mathematics for Computing',      arabic_name: 'رياضيات الحاسب',                      branch: null },
      { code: 'ICT-1-1-03', name: 'Computer Fundamentals',          arabic_name: 'أساسيات الحاسب',                      branch: null },
      { code: 'ICT-1-1-04', name: 'English for IT',                 arabic_name: 'اللغة الإنجليزية لتقنية المعلومات',   branch: null },
    ],
    sem2: [
      { code: 'ICT-1-2-01', name: 'Data Structures',                arabic_name: 'هياكل البيانات',                      branch: null },
      { code: 'ICT-1-2-02', name: 'Digital Logic',                  arabic_name: 'المنطق الرقمي',                       branch: null },
      { code: 'ICT-1-2-03', name: 'Operating Systems Basics',       arabic_name: 'أساسيات أنظمة التشغيل',               branch: null },
      { code: 'ICT-1-2-04', name: 'Technical Writing',              arabic_name: 'الكتابة التقنية',                     branch: null },
    ]
  },
  2: {
    sem1: [
      { code: 'ICT-2-1-01', name: 'Object Oriented Programming',    arabic_name: 'البرمجة كائنية التوجه',               branch: null },
      { code: 'ICT-2-1-02', name: 'Database Systems',               arabic_name: 'قواعد البيانات',                      branch: null },
      { code: 'ICT-2-1-03', name: 'Computer Networks Intro',        arabic_name: 'مقدمة في شبكات الحاسب',               branch: null },
      { code: 'ICT-2-1-04', name: 'Web Development Basics',         arabic_name: 'أساسيات تطوير الويب',                 branch: null },
    ],
    sem2: [
      { code: 'ICT-2-2-01', name: 'Algorithms',                     arabic_name: 'الخوارزميات',                         branch: null },
      { code: 'ICT-2-2-02', name: 'Software Engineering',           arabic_name: 'هندسة البرمجيات',                     branch: null },
      { code: 'ICT-2-2-03', name: 'Linux Administration',           arabic_name: 'إدارة نظام لينكس',                    branch: null },
      { code: 'ICT-2-2-04', name: 'Statistics for IT',              arabic_name: 'الإحصاء لتقنية المعلومات',            branch: null },
    ]
  },
  3: {
    sem1: [
      { code: 'ICT-3-1-01',  name: 'Information Security',          arabic_name: 'أمن المعلومات',                       branch: 'Both' },
      { code: 'ICT-3-1-02',  name: 'Project Management',            arabic_name: 'إدارة المشاريع',                      branch: 'Both' },
      { code: 'ICT-3-1-SW1', name: 'Advanced Web Development',      arabic_name: 'تطوير الويب المتقدم',                 branch: 'Software' },
      { code: 'ICT-3-1-SW2', name: 'Mobile App Development',        arabic_name: 'تطوير تطبيقات الجوال',                branch: 'Software' },
      { code: 'ICT-3-1-NW1', name: 'Network Protocols',             arabic_name: 'بروتوكولات الشبكات',                  branch: 'Network' },
      { code: 'ICT-3-1-NW2', name: 'Network Security',              arabic_name: 'أمن الشبكات',                         branch: 'Network' },
    ],
    sem2: [
      { code: 'ICT-3-2-01',  name: 'Cloud Computing',               arabic_name: 'الحوسبة السحابية',                    branch: 'Both' },
      { code: 'ICT-3-2-02',  name: 'Research Methods',              arabic_name: 'مناهج البحث العلمي',                  branch: 'Both' },
      { code: 'ICT-3-2-SW1', name: 'Software Testing',              arabic_name: 'اختبار البرمجيات',                    branch: 'Software' },
      { code: 'ICT-3-2-SW2', name: 'API Development',               arabic_name: 'تطوير واجهات برمجة التطبيقات',        branch: 'Software' },
      { code: 'ICT-3-2-NW1', name: 'Wireless Networks',             arabic_name: 'الشبكات اللاسلكية',                   branch: 'Network' },
      { code: 'ICT-3-2-NW2', name: 'Network Administration',        arabic_name: 'إدارة الشبكات',                       branch: 'Network' },
    ]
  },
  4: {
    sem1: [
      { code: 'ICT-4-1-01',  name: 'Graduation Project 1',          arabic_name: 'مشروع التخرج الأول',                  branch: 'Both' },
      { code: 'ICT-4-1-02',  name: 'Professional Ethics',           arabic_name: 'أخلاقيات المهنة',                     branch: 'Both' },
      { code: 'ICT-4-1-SW1', name: 'DevOps & CI/CD',                arabic_name: 'ديف أوبس والنشر المستمر',             branch: 'Software' },
      { code: 'ICT-4-1-SW2', name: 'AI & Machine Learning',         arabic_name: 'الذكاء الاصطناعي والتعلم الآلي',      branch: 'Software' },
      { code: 'ICT-4-1-NW1', name: 'Network Virtualization',        arabic_name: 'افتراضية الشبكات',                    branch: 'Network' },
      { code: 'ICT-4-1-NW2', name: 'Cybersecurity Advanced',        arabic_name: 'الأمن السيبراني المتقدم',             branch: 'Network' },
    ],
    sem2: [
      { code: 'ICT-4-2-01',  name: 'Graduation Project 2',          arabic_name: 'مشروع التخرج الثاني',                 branch: 'Both' },
      { code: 'ICT-4-2-02',  name: 'Entrepreneurship',              arabic_name: 'ريادة الأعمال',                       branch: 'Both' },
      { code: 'ICT-4-2-SW1', name: 'Distributed Systems',           arabic_name: 'الأنظمة الموزعة',                     branch: 'Software' },
      { code: 'ICT-4-2-SW2', name: 'Software Architecture',         arabic_name: 'معمارية البرمجيات',                   branch: 'Software' },
      { code: 'ICT-4-2-NW1', name: 'Network Design Project',        arabic_name: 'مشروع تصميم الشبكات',                 branch: 'Network' },
      { code: 'ICT-4-2-NW2', name: 'IoT Networks',                  arabic_name: 'شبكات إنترنت الأشياء',                branch: 'Network' },
    ]
  }
};

// =====================================================
// MAIN SEED FUNCTION
// =====================================================
async function seedAll() {
  try {
    defineAssociations();
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const saltRounds = 12;

    // --------------------------------------------------
    // STEP 1: Users
    // --------------------------------------------------
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 STEP 1: Creating users...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const usersData = [
      { username: 'admin',      password: 'admin123',      email: 'admin@nctu.edu',      full_name: 'Admin User',          role: 'admin' },
      { username: 'professor1', password: 'prof123',       email: 'prof1@nctu.edu',      full_name: 'Prof. Ahmed Hassan',  role: 'professor' },
      { username: 'professor',  password: 'professor123',  email: 'professor@nctu.edu',  full_name: 'Prof. Mohamed Ali',   role: 'professor' },
      { username: 'student1',   password: 'student123',    email: 'student1@nctu.edu',   full_name: 'Ali Mohamed',         role: 'student' },
      { username: 'accountant', password: 'accountant123', email: 'accountant@nctu.edu', full_name: 'Accountant User',     role: 'accountant' },
    ];

    const createdUsers = {};
    for (const u of usersData) {
      const existing = await User.findOne({ where: { username: u.username } });
      if (!existing) {
        const hash = await bcryptjs.hash(u.password, saltRounds);
        const user = await User.create({ username: u.username, email: u.email, password_hash: hash, full_name: u.full_name, role: u.role, is_active: true });
        createdUsers[u.username] = user;
        console.log(`  ✅ Created: ${u.username} (${u.role})`);
      } else {
        createdUsers[u.username] = existing;
        console.log(`  ⏭️  Exists:  ${u.username}`);
      }
    }

    // --------------------------------------------------
    // STEP 2: Professor profiles
    // --------------------------------------------------
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍🏫 STEP 2: Creating professor profiles...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const profProfiles = [
      { username: 'professor1', code: 'PROF001', dept: 'Computer Science',  spec: 'Software Engineering' },
      { username: 'professor',  code: 'PROF002', dept: 'Computer Science',  spec: 'Database Systems' },
    ];
    for (const p of profProfiles) {
      const user = createdUsers[p.username];
      if (user) {
        const [prof, created] = await Professor.findOrCreate({
          where: { user_id: user.id },
          defaults: { user_id: user.id, professor_code: p.code, department: p.dept, specialization: p.spec, hire_date: new Date('2020-01-15'), is_active: true }
        });
        console.log(created ? `  ✅ Created: ${p.code}` : `  ⏭️  Exists:  ${p.code}`);
      }
    }

    // --------------------------------------------------
    // STEP 3: Specialties
    // --------------------------------------------------
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 STEP 3: Creating 6 specialties...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const createdSpecialties = {};
    for (const s of SPECIALTIES) {
      const [spec, created] = await Specialty.findOrCreate({
        where: { code: s.code },
        defaults: { ...s, is_active: true }
      });
      createdSpecialties[s.code] = spec;
      console.log(created ? `  ✅ Created: ${s.code} - ${s.arabic_name}` : `  ⏭️  Exists:  ${s.code} - ${s.arabic_name}`);
    }

    // --------------------------------------------------
    // STEP 4: ICT Academic Years + Semesters + Courses
    // --------------------------------------------------
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 STEP 4: Creating ICT academic structure (4 years, 2 branches)...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const ict = createdSpecialties['ICT'];
    let yearsCreated = 0, semsCreated = 0, coursesCreated = 0;

    for (let yearNum = 1; yearNum <= 4; yearNum++) {
      const [academicYear, yearCreated] = await AcademicYear.findOrCreate({
        where: { specialty_id: ict.id, year_number: yearNum },
        defaults: { specialty_id: ict.id, year_number: yearNum, academic_season: '2024-2025', is_active: true }
      });
      if (yearCreated) yearsCreated++;
      console.log(`\n  ${yearCreated ? '✅' : '⏭️ '} Year ${yearNum} (id=${academicYear.id})`);

      for (let semNum = 1; semNum <= 2; semNum++) {
        const semName = `الفصل الدراسي ${semNum === 1 ? 'الأول' : 'الثاني'}`;
        const [semester, semCreated] = await Semester.findOrCreate({
          where: { academic_year_id: academicYear.id, semester_name: semName },
          defaults: { academic_year_id: academicYear.id, semester_name: semName, is_active: semNum === 1 }
        });
        if (semCreated) semsCreated++;
        console.log(`    ${semCreated ? '✅' : '⏭️ '} ${semName}`);

        const semKey = semNum === 1 ? 'sem1' : 'sem2';
        for (const c of ICT_COURSES[yearNum][semKey]) {
          const [course, courseCreated] = await Course.findOrCreate({
            where: { course_code: c.code },
            defaults: {
              specialty_id: ict.id,
              academic_year_id: academicYear.id,
              semester_id: semester.id,
              course_code: c.code,
              course_name: c.name,
              arabic_name: c.arabic_name,
              branch: c.branch,
              credit_hours: 3,
              is_active: true
            }
          });
          if (courseCreated) coursesCreated++;
          const branchLabel = c.branch ? `[${c.branch}]` : '[All]  ';
          console.log(`      ${courseCreated ? '✅' : '⏭️ '} ${c.code} ${branchLabel} - ${c.arabic_name}`);
        }
      }
    }

    // --------------------------------------------------
    // STEP 5: Student record
    // --------------------------------------------------
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧑‍🎓 STEP 5: Creating student record...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const studentUser = createdUsers['student1'];
    if (studentUser) {
      const [student, created] = await Student.findOrCreate({
        where: { user_id: studentUser.id },
        defaults: {
          user_id: studentUser.id,
          student_code: 'NCTU-ICT-001',
          national_id: '30001011234567',
          specialty_id: ict.id,
          current_year: 1,
          academic_status: 'active',
          enrollment_date: new Date(),
          total_paid: 0,
          total_due: ict.annual_fee
        }
      });
      console.log(created ? '  ✅ Student record created (ICT, Year 1)' : '  ⏭️  Student record exists');
    }

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║         ✅ SEED COMPLETED SUCCESSFULLY    ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Specialties : 6 (MCT, AUT, ICT, PRO, OIL, REN)`);
    console.log(`║  ICT Years   : ${yearsCreated} new (4 total)`);
    console.log(`║  ICT Semesters: ${semsCreated} new (8 total)`);
    console.log(`║  ICT Courses : ${coursesCreated} new`);
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  🔐 Login Credentials:');
    console.log('║  admin       / admin123');
    console.log('║  professor1  / prof123');
    console.log('║  professor   / professor123');
    console.log('║  student1    / student123');
    console.log('║  accountant  / accountant123');
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  📋 ICT Branch Structure:');
    console.log('║  Year 1 & 2 → All courses (no branch)');
    console.log('║  Year 3 & 4 → Software + Network + Both');
    console.log('╚══════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    if (error.original) console.error('   DB Error:', error.original.sqlMessage);
    process.exit(1);
  }
}

seedAll();
