const bcryptjs = require('bcryptjs');
const { User, Specialty, Student, Professor, ProfessorCourse, Course, AcademicYear, Semester, GradeSetting } = require('./config/models');

const seedDatabase = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('✅ Seed data already exists, skipping...');
      return;
    }

    console.log('📌 Creating comprehensive seed data...');

    // Hash passwords
    const saltRounds = 12;
    const adminPassword = await bcryptjs.hash('admin123', saltRounds);
    const profPassword = await bcryptjs.hash('prof123', saltRounds);
    const studentPassword = await bcryptjs.hash('student123', saltRounds);

    // Create default admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@nctu.edu',
      password_hash: adminPassword,
      full_name: 'Admin User',
      phone: '+20-2-12345678',
      role: 'admin',
      is_active: true
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create sample professor (professor1)
    const profUser = await User.create({
      username: 'professor1',
      email: 'prof@nctu.edu',
      password_hash: profPassword,
      full_name: 'Prof. Ahmed Hassan',
      phone: '+20-2-87654321',
      role: 'professor',
      is_active: true
    });
    console.log('✅ Professor user created (username: professor1, password: prof123)');

    // Create professor profile
    const professorRecord = await Professor.create({
      user_id: profUser.id,
      professor_code: 'PROF001',
      department: 'Computer Science',
      hire_date: new Date('2020-01-15'),
      specialization: 'Software Engineering',
      is_active: true
    });
    console.log('✅ Professor profile created');

    // Create another professor user for Postman tests (username: professor)
    const profUser2 = await User.create({
      username: 'professor',
      email: 'professor@nctu.edu',
      password_hash: await bcryptjs.hash('professor123', saltRounds),
      full_name: 'Prof. Mohamed Ali',
      phone: '+20-2-87654322',
      role: 'professor',
      is_active: true
    });
    console.log('✅ Professor user created (username: professor, password: professor123)');

    // Create professor profile for professor2
    const professorRecord2 = await Professor.create({
      user_id: profUser2.id,
      professor_code: 'PROF002',
      department: 'Computer Science',
      hire_date: new Date('2021-01-15'),
      specialization: 'Database Systems',
      is_active: true
    });
    console.log('✅ Professor profile created for professor2');

    // Create sample student
    const studentUser = await User.create({
      username: 'student1',
      email: 'student@nctu.edu',
      password_hash: studentPassword,
      full_name: 'Ali Mohamed',
      phone: '+20-12-3456789',
      role: 'student',
      is_active: true
    });
    console.log('✅ Student user created (username: student1, password: student123)');

    // Create sample specialty
    const specialty = await Specialty.create({
      name: 'Information Technology',
      code: 'IT',
      arabic_name: 'تكنولوجيا المعلومات',
      description: 'Bachelor of Information Technology'
    });
    console.log('✅ Specialty created (IT - Information Technology)');

    // Seed the 6 NCTU specialties with comprehensive data
    console.log('📌 Creating NCTU specialties...');
    const specialtyData = [
      { 
        code: 'MCT', 
        name: 'Mechatronics Technology', 
        arabic_name: 'تكنولوجيا الميكاترونكس', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 15000.00, 
        is_active: true, 
        description: 'برنامج الميكاترونكس يجمع بين الميكانيكا والإلكترونيات والبرمجة والتحكم الآلي' 
      },
      { 
        code: 'AUT', 
        name: 'Autotronics Technology', 
        arabic_name: 'تكنولوجيا الأوتوترونكس', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 14000.00, 
        is_active: true, 
        description: 'برنامج متخصص في إلكترونيات السيارات وأنظمتها الحديثة والتشخيص الإلكتروني' 
      },
      { 
        code: 'ICT', 
        name: 'Information Technology', 
        arabic_name: 'تكنولوجيا المعلومات', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 12000.00, 
        is_active: true, 
        description: 'برنامج تكنولوجيا المعلومات والبرمجيات والشبكات وأمن المعلومات' 
      },
      { 
        code: 'PRO', 
        name: 'Prosthetics Technology', 
        arabic_name: 'تكنولوجيا الأطراف الصناعية', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 16000.00, 
        is_active: true, 
        description: 'برنامج الأطراف الصناعية والأجهزة التقويمية والتأهيل الطبي' 
      },
      { 
        code: 'OIL', 
        name: 'Oil Production Technology', 
        arabic_name: 'تكنولوجيا إنتاج البترول', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 18000.00, 
        is_active: true, 
        description: 'برنامج تكنولوجيا إنتاج ونقل ومعالجة البترول والغاز الطبيعي' 
      },
      { 
        code: 'REN', 
        name: 'Renewable Energy Technology', 
        arabic_name: 'تكنولوجيا الطاقة المتجددة', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 17000.00, 
        is_active: true, 
        description: 'برنامج تكنولوجيا الطاقة الجديدة والمتجددة والطاقة الشمسية وطاقة الرياح' 
      },
    ];
    
    const createdSpecialties = [];
    for (const spec of specialtyData) {
      const existing = await Specialty.findOne({ where: { code: spec.code } });
      if (!existing) {
        const created = await Specialty.create(spec);
        createdSpecialties.push(created);
        console.log(`✅ Specialty created: ${spec.code} - ${spec.arabic_name}`);
      } else {
        createdSpecialties.push(existing);
        console.log(`ℹ️  Specialty exists: ${spec.code} - ${spec.arabic_name}`);
      }
    }

    // Create Academic Years
    console.log('📌 Creating academic years...');
    const currentYear = new Date().getFullYear();
    const academicYearsData = [
      { year_name: `${currentYear - 1}/${currentYear}`, start_date: new Date(`${currentYear - 1}-09-01`), end_date: new Date(`${currentYear}-06-30`), is_active: false },
      { year_name: `${currentYear}/${currentYear + 1}`, start_date: new Date(`${currentYear}-09-01`), end_date: new Date(`${currentYear + 1}-06-30`), is_active: true },
      { year_name: `${currentYear + 1}/${currentYear + 2}`, start_date: new Date(`${currentYear + 1}-09-01`), end_date: new Date(`${currentYear + 2}-06-30`), is_active: false },
    ];

    const createdAcademicYears = [];
    for (const yearData of academicYearsData) {
      const existing = await AcademicYear.findOne({ where: { year_name: yearData.year_name } });
      if (!existing) {
        const created = await AcademicYear.create(yearData);
        createdAcademicYears.push(created);
        console.log(`✅ Academic year created: ${yearData.year_name}`);
      } else {
        createdAcademicYears.push(existing);
      }
    }

    // Create Semesters for current academic year
    console.log('📌 Creating semesters...');
    const currentAcademicYear = createdAcademicYears.find(y => y.is_active);
    if (currentAcademicYear) {
      const semestersData = [
        { 
          semester_name: 'الفصل الدراسي الأول', 
          academic_year_id: currentAcademicYear.id, 
          start_date: new Date(`${currentYear}-09-01`), 
          end_date: new Date(`${currentYear + 1}-01-31`), 
          is_active: true 
        },
        { 
          semester_name: 'الفصل الدراسي الثاني', 
          academic_year_id: currentAcademicYear.id, 
          start_date: new Date(`${currentYear + 1}-02-01`), 
          end_date: new Date(`${currentYear + 1}-06-30`), 
          is_active: false 
        },
      ];

      const createdSemesters = [];
      for (const semData of semestersData) {
        const existing = await Semester.findOne({ 
          where: { 
            semester_name: semData.semester_name,
            academic_year_id: semData.academic_year_id 
          } 
        });
        if (!existing) {
          const created = await Semester.create(semData);
          createdSemesters.push(created);
          console.log(`✅ Semester created: ${semData.semester_name}`);
        } else {
          createdSemesters.push(existing);
        }
      }
    }

    // Create sample courses for each specialty
    console.log('📌 Creating sample courses...');
    const coursesData = [
      // ICT Courses
      { code: 'ICT101', name: 'Introduction to Programming', arabic_name: 'مقدمة في البرمجة', specialty_id: createdSpecialties.find(s => s.code === 'ICT')?.id, year_level: 1, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      { code: 'ICT102', name: 'Database Systems', arabic_name: 'نظم قواعد البيانات', specialty_id: createdSpecialties.find(s => s.code === 'ICT')?.id, year_level: 2, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      { code: 'ICT103', name: 'Web Development', arabic_name: 'تطوير الويب', specialty_id: createdSpecialties.find(s => s.code === 'ICT')?.id, year_level: 2, semester: 2, credits: 3, course_type: 'mandatory', is_active: true },
      { code: 'ICT104', name: 'Network Security', arabic_name: 'أمن الشبكات', specialty_id: createdSpecialties.find(s => s.code === 'ICT')?.id, year_level: 3, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      
      // MCT Courses
      { code: 'MCT101', name: 'Engineering Mechanics', arabic_name: 'الميكانيكا الهندسية', specialty_id: createdSpecialties.find(s => s.code === 'MCT')?.id, year_level: 1, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      { code: 'MCT102', name: 'Control Systems', arabic_name: 'نظم التحكم', specialty_id: createdSpecialties.find(s => s.code === 'MCT')?.id, year_level: 2, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      
      // AUT Courses
      { code: 'AUT101', name: 'Automotive Electronics', arabic_name: 'إلكترونيات السيارات', specialty_id: createdSpecialties.find(s => s.code === 'AUT')?.id, year_level: 1, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      { code: 'AUT102', name: 'Engine Management Systems', arabic_name: 'نظم إدارة المحرك', specialty_id: createdSpecialties.find(s => s.code === 'AUT')?.id, year_level: 2, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      
      // PRO Courses
      { code: 'PRO101', name: 'Prosthetics Design', arabic_name: 'تصميم الأطراف الصناعية', specialty_id: createdSpecialties.find(s => s.code === 'PRO')?.id, year_level: 1, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      
      // OIL Courses
      { code: 'OIL101', name: 'Petroleum Engineering', arabic_name: 'هندسة البترول', specialty_id: createdSpecialties.find(s => s.code === 'OIL')?.id, year_level: 1, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
      
      // REN Courses
      { code: 'REN101', name: 'Solar Energy Systems', arabic_name: 'نظم الطاقة الشمسية', specialty_id: createdSpecialties.find(s => s.code === 'REN')?.id, year_level: 1, semester: 1, credits: 3, course_type: 'mandatory', is_active: true },
    ];

    const createdCourses = [];
    for (const courseData of coursesData) {
      if (courseData.specialty_id) {
        const existing = await Course.findOne({ where: { code: courseData.code } });
        if (!existing) {
          const created = await Course.create(courseData);
          createdCourses.push(created);
          console.log(`✅ Course created: ${courseData.code} - ${courseData.arabic_name}`);
        } else {
          createdCourses.push(existing);
        }
      }
    }

    // Assign professors to all existing courses
    console.log('📌 Assigning professors to courses...');
    const allCourses = await Course.findAll();
    const academicYears = await AcademicYear.findAll({ where: { is_active: true }, limit: 1 });
    const semesters = await Semester.findAll({ where: { is_active: true }, limit: 1 });

    if (allCourses.length > 0 && academicYears.length > 0 && semesters.length > 0) {
      let assignmentCount = 0;
      for (const course of allCourses) {
        // Assign to professor1
        const existingAssignment1 = await ProfessorCourse.findOne({
          where: {
            professor_id: professorRecord.id,
            course_id: course.id
          }
        });

        if (!existingAssignment1) {
          await ProfessorCourse.create({
            professor_id: professorRecord.id,
            course_id: course.id,
            academic_year_id: academicYears[0].id,
            semester_id: semesters[0].id,
            is_primary: true
          });
          assignmentCount++;
        }

        // Assign to professor2 (as secondary)
        const existingAssignment2 = await ProfessorCourse.findOne({
          where: {
            professor_id: professorRecord2.id,
            course_id: course.id
          }
        });

        if (!existingAssignment2) {
          await ProfessorCourse.create({
            professor_id: professorRecord2.id,
            course_id: course.id,
            academic_year_id: academicYears[0].id,
            semester_id: semesters[0].id,
            is_primary: false
          });
          assignmentCount++;
        }
      }
      console.log(`✅ Created ${assignmentCount} professor-course assignments`);
    }

    // Create student record with ICT specialty
    const ictSpecialty = createdSpecialties.find(s => s.code === 'ICT');
    if (ictSpecialty) {
      await Student.create({
        user_id: studentUser.id,
        student_code: 'NCTU-26-001',
        national_id: '30001011234567',
        specialty_id: ictSpecialty.id,
        current_year: 1,
        academic_status: 'active',
        enrollment_date: new Date(),
        total_paid: 0,
        total_due: ictSpecialty.annual_fee
      });
      console.log('✅ Student record created (ICT specialty)');
    }

    // Create Grade Settings for courses
    console.log('📌 Creating grade settings...');
    const activeSemester = await Semester.findOne({ where: { is_active: true } });
    if (activeSemester && createdCourses.length > 0) {
      let gradeSettingsCount = 0;
      for (const course of createdCourses) {
        const existing = await GradeSetting.findOne({
          where: {
            course_id: course.id,
            semester_id: activeSemester.id
          }
        });

        if (!existing) {
          await GradeSetting.create({
            course_id: course.id,
            semester_id: activeSemester.id,
            midterm_percentage: 30,
            final_percentage: 40,
            coursework_percentage: 20,
            practical_percentage: 10,
            passing_grade: 50,
            is_active: true
          });
          gradeSettingsCount++;
        }
      }
      console.log(`✅ Created ${gradeSettingsCount} grade settings`);
    }

    // Create accountant user
    const existingAccountant = await User.findOne({ where: { username: 'accountant' } });
    if (!existingAccountant) {
      const accountantPassword = await bcryptjs.hash('accountant123', saltRounds);
      await User.create({
        username: 'accountant',
        email: 'accountant@nctu.edu',
        password_hash: accountantPassword,
        full_name: 'Accountant User',
        phone: '+20-2-11111111',
        role: 'accountant',
        is_active: true
      });
      console.log('✅ Accountant user created (username: accountant, password: accountant123)');
    }

    console.log('\n📝 Default Credentials:');
    console.log('═══════════════════════════════════');
    console.log('👤 Admin:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('───────────────────────────────────');
    console.log('👨‍🏫 Professors:');
    console.log('   Username: professor1');
    console.log('   Password: prof123');
    console.log('   ');
    console.log('   Username: professor');
    console.log('   Password: professor123');
    console.log('───────────────────────────────────');
    console.log('👨‍🎓 Student:');
    console.log('   Username: student1');
    console.log('   Password: student123');
    console.log('───────────────────────────────────');
    console.log('💰 Accountant:');
    console.log('   Username: accountant');
    console.log('   Password: accountant123');
    console.log('═══════════════════════════════════');
    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${createdSpecialties.length} Specialties`);
    console.log(`   • ${createdAcademicYears.length} Academic Years`);
    console.log(`   • ${createdCourses.length} Courses`);
    console.log(`   • 4 Users (1 Admin, 2 Professors, 1 Student, 1 Accountant)`);
    console.log(`   • 2 Professor Profiles`);
    console.log(`   • 1 Student Profile`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

module.exports = seedDatabase;
