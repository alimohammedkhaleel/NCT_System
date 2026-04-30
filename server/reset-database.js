/**
 * Database Reset Script
 * This script will:
 * 1. Drop all tables
 * 2. Recreate all tables
 * 3. Seed with default data (admin, accountant, 6 specialties)
 */

const bcryptjs = require('bcryptjs');
const { sequelize, User, Specialty, AcademicYear, Semester } = require('./config/models');

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset...\n');

    // Step 1: Drop all tables
    console.log('📌 Step 1: Dropping all tables...');
    await sequelize.drop();
    console.log('✅ All tables dropped successfully\n');

    // Step 2: Recreate all tables
    console.log('📌 Step 2: Creating tables...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully\n');

    // Step 3: Seed default data
    console.log('📌 Step 3: Seeding default data...\n');

    const saltRounds = 12;

    // Create Admin user
    const adminPassword = await bcryptjs.hash('admin123', saltRounds);
    await User.create({
      username: 'admin',
      email: 'admin@nctu.edu',
      password_hash: adminPassword,
      full_name: 'Admin User',
      phone: '+20-2-12345678',
      role: 'admin',
      is_active: true
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create Accountant user
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

    // Create the 6 NCTU specialties
    const specialtyData = [
      { 
        code: 'ICT', 
        name: 'Information Technology', 
        arabic_name: 'تكنولوجيا المعلومات', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 12000.00, 
        is_active: true, 
        description: 'برنامج تكنولوجيا المعلومات والبرمجيات والشبكات' 
      },
      { 
        code: 'MCT', 
        name: 'Mechatronics Technology', 
        arabic_name: 'تكنولوجيا الميكاترونكس', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 15000.00, 
        is_active: true, 
        description: 'برنامج الميكاترونكس يجمع بين الميكانيكا والإلكترونيات والبرمجة' 
      },
      { 
        code: 'AUT', 
        name: 'Autotronics Technology', 
        arabic_name: 'تكنولوجيا الأوتوترونكس', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 14000.00, 
        is_active: true, 
        description: 'برنامج متخصص في إلكترونيات السيارات وأنظمتها الحديثة' 
      },
      { 
        code: 'REN', 
        name: 'Renewable Energy Technology', 
        arabic_name: 'تكنولوجيا الطاقة الجديدة والمتجددة', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 17000.00, 
        is_active: true, 
        description: 'برنامج تكنولوجيا الطاقة الجديدة والمتجددة' 
      },
      { 
        code: 'OIL', 
        name: 'Oil Production Technology', 
        arabic_name: 'تكنولوجيا البترول', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 18000.00, 
        is_active: true, 
        description: 'برنامج تكنولوجيا إنتاج ونقل ومعالجة البترول' 
      },
      { 
        code: 'PRO', 
        name: 'Prosthetics Technology', 
        arabic_name: 'تكنولوجيا الأطراف الصناعية', 
        duration_years: 4, 
        total_credits: 132, 
        annual_fee: 16000.00, 
        is_active: true, 
        description: 'برنامج الأطراف الصناعية والأجهزة التقويمية' 
      },
    ];

    console.log('\n📚 Creating specialties...');
    for (const spec of specialtyData) {
      const specialty = await Specialty.create(spec);
      console.log(`✅ ${spec.code} - ${spec.arabic_name}`);

      // Create 4 academic years for each specialty
      for (let yearNum = 1; yearNum <= 4; yearNum++) {
        const yearNames = {
          1: 'السنة الأولى',
          2: 'السنة الثانية',
          3: 'السنة الثالثة',
          4: 'السنة الرابعة'
        };

        const academicYear = await AcademicYear.create({
          specialty_id: specialty.id,
          year_number: yearNum,
          year_name: yearNames[yearNum],
          is_active: true
        });

        // Create 2 semesters for each academic year
        await Semester.create({
          academic_year_id: academicYear.id,
          semester_name: 'الفصل الأول',
          semester_number: 1,
          is_active: true
        });

        await Semester.create({
          academic_year_id: academicYear.id,
          semester_name: 'الفصل الثاني',
          semester_number: 2,
          is_active: true
        });
      }
    }

    console.log('\n✅ Database reset completed successfully!\n');
    console.log('📝 Default Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('───────────────────────────────────────');
    console.log('Accountant:');
    console.log('  Username: accountant');
    console.log('  Password: accountant123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

// Run the reset
resetDatabase();
