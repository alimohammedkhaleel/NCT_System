const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const resetDatabase = async () => {
  let connection;
  try {
    // Connect to MySQL without selecting a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔄 Resetting database...');

    // Drop the existing database
    await connection.execute(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'nctu_erp'}`);
    console.log('✅ Old database dropped');

    // Create a new database
    const dbName = process.env.DB_NAME || 'nctu_erp';
    await connection.execute(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ New database created (${dbName})`);

    await connection.end();

    // Now sync with Sequelize
    const {
      sequelize,
      User,
      Specialty,
      AcademicYear,
      Semester,
      Course,
      Professor,
      ProfessorCourse,
      Student,
      StudentEnrollment,
      Grade,
      FeeInvoice,
      Payment,
      StudentQRCode,
      ActivityLog,
      defineAssociations
    } = require('./config/models');
    
    // Define associations BEFORE syncing
    defineAssociations();
    console.log('✅ Model associations defined');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync without associations first
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully');

    // ================== CREATE SEED DATA ==================
    console.log('\n📌 Creating seed data...\n');

    const saltRounds = 12;

    // ==================== USERS ====================
    // Admin
    const adminPassword = await bcryptjs.hash('admin123', saltRounds);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@nctu.edu',
      password_hash: adminPassword,
      full_name: 'مسئول النظام',
      phone: '+20-2-12345678',
      role: 'admin',
      is_active: true
    });
    console.log('✅ Admin user created (admin/admin123)');

    // Accountant
    const accPassword = await bcryptjs.hash('account123', saltRounds);
    const accountantUser = await User.create({
      username: 'accountant',
      email: 'accountant@nctu.edu',
      password_hash: accPassword,
      full_name: 'محاسب النظام',
      phone: '+20-2-11111111',
      role: 'accountant',
      is_active: true
    });
    console.log('✅ Accountant user created (accountant/account123)');

    // Registrar
    const regPassword = await bcryptjs.hash('reg123', saltRounds);
    const registrarUser = await User.create({
      username: 'registrar',
      email: 'registrar@nctu.edu',
      password_hash: regPassword,
      full_name: 'مسجل الطلاب',
      phone: '+20-2-22222222',
      role: 'registrar',
      is_active: true
    });
    console.log('✅ Registrar user created (registrar/reg123)');

    // Professor
    const profPassword = await bcryptjs.hash('prof123', saltRounds);
    const profUser = await User.create({
      username: 'prof_ahmed',
      email: 'prof.ahmed@nctu.edu',
      password_hash: profPassword,
      full_name: 'أحمد محمود حسن',
      phone: '+20-2-33333333',
      role: 'professor',
      is_active: true
    });
    console.log('✅ Professor user created (prof_ahmed/prof123)');

    // Student
    const studentPassword = await bcryptjs.hash('student123', saltRounds);
    const studentUser = await User.create({
      username: 'student_ahmed',
      email: 'student.ahmed@nctu.edu',
      password_hash: studentPassword,
      full_name: 'أحمد علي محمد',
      phone: '+20-12-3456789',
      role: 'student',
      is_active: true
    });
    console.log('✅ Student user created (student_ahmed/student123)');

    // ==================== SPECIALTIES ====================
    const specialtyData = [
      { code: 'MCT', name: 'Mechatronics Technology', arabic_name: 'تكنولوجيا الميكاترونكس', duration_years: 4, total_credits: 132, annual_fee: 15000.00, is_active: true },
      { code: 'AUT', name: 'Autotronics Technology', arabic_name: 'تكنولوجيا الأوتوترونكس', duration_years: 4, total_credits: 132, annual_fee: 14000.00, is_active: true },
      { code: 'ICT', name: 'Information Technology', arabic_name: 'تكنولوجيا المعلومات', duration_years: 4, total_credits: 132, annual_fee: 12000.00, is_active: true },
      { code: 'PRO', name: 'Prosthetics Technology', arabic_name: 'تكنولوجيا الأطراف الصناعية', duration_years: 4, total_credits: 132, annual_fee: 16000.00, is_active: true },
      { code: 'OIL', name: 'Oil Production Technology', arabic_name: 'تكنولوجيا إنتاج البترول', duration_years: 4, total_credits: 132, annual_fee: 18000.00, is_active: true },
      { code: 'REN', name: 'Renewable Energy Technology', arabic_name: 'تكنولوجيا الطاقة المتجددة', duration_years: 4, total_credits: 132, annual_fee: 17000.00, is_active: true },
    ];
    const createdSpecialties = [];
    for (const spec of specialtyData) {
      const created = await Specialty.create(spec);
      createdSpecialties.push(created);
      console.log(`✅ Specialty: ${spec.code} - ${spec.arabic_name}`);
    }

    // Use ICT as the primary specialty for seed data
    const specialty_ict = createdSpecialties.find(s => s.code === 'ICT');

    // ==================== ACADEMIC YEARS & SEMESTERS (all specialties) ====================
    let year2024_1, semester_fall, semester_spring;
    for (const spec of createdSpecialties) {
      for (let yearNum = 1; yearNum <= 4; yearNum++) {
        const academicYear = await AcademicYear.create({
          specialty_id: spec.id,
          year_number: yearNum,
          is_active: true
        });
        // Create 2 semesters per academic year
        const sem1 = await Semester.create({
          academic_year_id: academicYear.id,
          semester_name: 'الفصل الأول',
          is_active: true
        });
        const sem2 = await Semester.create({
          academic_year_id: academicYear.id,
          semester_name: 'الفصل الثاني',
          is_active: true
        });
        // Keep references for ICT year 1
        if (spec.code === 'ICT' && yearNum === 1) {
          year2024_1 = academicYear;
          semester_fall = sem1;
          semester_spring = sem2;
        }
      }
    }
    console.log('✅ Academic years and semesters created for all specialties');

    // ==================== COURSES ====================
    const course1 = await Course.create({
      specialty_id: specialty_ict.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      course_code: 'ICT101',
      course_name: 'Introduction to Programming',
      arabic_name: 'مقدمة في البرمجة',
      credit_hours: 3,
      is_active: true
    });

    const course2 = await Course.create({
      specialty_id: specialty_ict.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      course_code: 'ICT102',
      course_name: 'Data Structures',
      arabic_name: 'هياكل البيانات',
      credit_hours: 3,
      is_active: true
    });
    console.log('✅ Courses created (ICT101, ICT102)');

    // ==================== PROFESSOR ====================
    const professor = await Professor.create({
      user_id: profUser.id,
      professor_code: 'PROF001',
      department: 'Computer Science',
      hire_date: new Date('2020-01-15'),
      specialization: 'Software Engineering',
      is_active: true
    });
    console.log('✅ Professor profile created');

    // ==================== PROFESSOR COURSES ====================
    await ProfessorCourse.create({
      professor_id: professor.id,
      course_id: course1.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      is_primary: true
    });

    await ProfessorCourse.create({
      professor_id: professor.id,
      course_id: course2.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      is_primary: true
    });
    console.log('✅ Professor courses assigned');

    // ==================== STUDENT ====================
    const student = await Student.create({
      user_id: studentUser.id,
      student_code: '20240001',
      national_id: '30001011234567',
      specialty_id: specialty_ict.id,
      current_year: 1,
      academic_status: 'active',
      enrollment_date: new Date(),
      total_paid: 0,
      total_due: 50000
    });
    console.log('✅ Student profile created (20240001)');

    // ==================== STUDENT ENROLLMENT ====================
    const enrollment1 = await StudentEnrollment.create({
      student_id: student.id,
      course_id: course1.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      status: 'enrolled'
    });

    const enrollment2 = await StudentEnrollment.create({
      student_id: student.id,
      course_id: course2.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      status: 'enrolled'
    });
    console.log('✅ Student enrollments created');

    // ==================== GRADES ====================
    const grade1 = await Grade.create({
      student_id: student.id,
      course_id: course1.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      enrollment_id: enrollment1.id,
      assignment1_grade: 'D',
      assignment1_score: 30,
      assignment2_grade: 'M',
      assignment2_score: 21,
      final_exam_score: 120,
      professor_submitted_by: profUser.id,
      notes: 'Initial grade entry for testing'
    });
    console.log('✅ Grade entry created (course 1)');

    // ==================== FEE INVOICES ====================
    const invoice = await FeeInvoice.create({
      invoice_number: `INV-${Date.now()}`,
      student_id: student.id,
      academic_year_id: year2024_1.id,
      semester_id: semester_fall.id,
      total_amount: 50000,
      paid_amount: 0,
      status: 'pending',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      issued_by: accountantUser.id
    });
    console.log('✅ Fee invoice created');

    // ==================== ACTIVITY LOG ====================
    await ActivityLog.create({
      user_id: adminUser.id,
      action: 'database_init',
      entity: 'System',
      details: JSON.stringify({ message: 'Database initialized with seed data' }),
      ip_address: '127.0.0.1',
      status: 'success'
    });
    console.log('✅ Activity log created');

    console.log('\n🎉 Database reset completed with seed data!\n');
    console.log('📝 Default Credentials:');
    console.log('═══════════════════════════════════════════');
    console.log('ADMIN:');
    console.log('  Username: admin          | Password: admin123');
    console.log('  Role: Full System Control');
    console.log('═══════════════════════════════════════════');
    console.log('PROFESSOR:');
    console.log('  Username: prof_ahmed     | Password: prof123');
    console.log('  Teaches: ICT101, ICT102  | Can enter grades only');
    console.log('═══════════════════════════════════════════');
    console.log('ACCOUNTANT:');
    console.log('  Username: accountant     | Password: account123');
    console.log('  Role: Manage invoices & payments');
    console.log('═══════════════════════════════════════════');
    console.log('REGISTRAR:');
    console.log('  Username: registrar      | Password: reg123');
    console.log('  Role: Student registration & enrollment');
    console.log('═══════════════════════════════════════════');
    console.log('STUDENT:');
    console.log('  Username: student_ahmed  | Password: student123');
    console.log('  Code: 20240001           | Year: 1 (Year 1)');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
};

resetDatabase();