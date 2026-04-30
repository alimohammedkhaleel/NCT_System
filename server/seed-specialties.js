/**
 * Seed script to ensure all 6 NCTU specialties exist in the database.
 * Run with: node seed-specialties.js
 * Safe to run multiple times - uses upsert logic (won't duplicate).
 */

const sequelize = require('./config/database');
const Specialty = require('./models/Specialty');

const specialtyData = [
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
    code: 'ICT',
    name: 'Information and Communication Technology',
    arabic_name: 'تكنولوجيا المعلومات والاتصالات',
    duration_years: 4,
    total_credits: 132,
    annual_fee: 12000.00,
    is_active: true,
    description: 'برنامج تكنولوجيا المعلومات والبرمجيات والشبكات - يشمل فرعي البرمجيات والشبكات'
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
  {
    code: 'OIL',
    name: 'Oil Production Technology',
    arabic_name: 'تكنولوجيا إنتاج البترول',
    duration_years: 4,
    total_credits: 132,
    annual_fee: 18000.00,
    is_active: true,
    description: 'برنامج تكنولوجيا إنتاج ونقل ومعالجة البترول'
  },
  {
    code: 'REN',
    name: 'Renewable Energy Technology',
    arabic_name: 'تكنولوجيا الطاقة المتجددة',
    duration_years: 4,
    total_credits: 132,
    annual_fee: 17000.00,
    is_active: true,
    description: 'برنامج تكنولوجيا الطاقة الجديدة والمتجددة'
  }
];

const seedSpecialties = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    console.log('📌 Seeding 6 NCTU specialties...\n');

    let created = 0;
    let skipped = 0;

    for (const spec of specialtyData) {
      const existing = await Specialty.findOne({ where: { code: spec.code } });

      if (existing) {
        // Update arabic_name and other fields in case they changed
        await existing.update({
          arabic_name: spec.arabic_name,
          name: spec.name,
          duration_years: spec.duration_years,
          total_credits: spec.total_credits,
          annual_fee: spec.annual_fee,
          is_active: spec.is_active,
          description: spec.description
        });
        console.log(`⏭️  Already exists (updated): ${spec.code} - ${spec.arabic_name}`);
        skipped++;
      } else {
        await Specialty.create(spec);
        console.log(`✅ Created: ${spec.code} - ${spec.arabic_name}`);
        created++;
      }
    }

    console.log('\n========================================');
    console.log(`✅ Done! Created: ${created} | Updated: ${skipped}`);
    console.log('========================================');
    console.log('\n📋 All 6 specialties:');
    console.log('  1. MCT - تكنولوجيا الميكاترونكس');
    console.log('  2. AUT - تكنولوجيا الأوتوترونكس');
    console.log('  3. ICT - تكنولوجيا المعلومات والاتصالات (Software + Network branches)');
    console.log('  4. PRO - تكنولوجيا الأطراف الصناعية');
    console.log('  5. OIL - تكنولوجيا إنتاج البترول');
    console.log('  6. REN - تكنولوجيا الطاقة المتجددة');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding specialties:', error.message);
    process.exit(1);
  }
};

seedSpecialties();
