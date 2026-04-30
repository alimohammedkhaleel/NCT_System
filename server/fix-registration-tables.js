const db = require('./config/database');

const migrations = [
  'ALTER TABLE registration_links ADD COLUMN used_by INT NULL',
  'ALTER TABLE registration_links ADD COLUMN used_at DATETIME NULL',
  'ALTER TABLE registration_requests ADD COLUMN birth_date DATE NULL',
  "ALTER TABLE registration_requests ADD COLUMN gender ENUM('male','female') NULL",
  'ALTER TABLE registration_requests ADD COLUMN address TEXT NULL',
  'ALTER TABLE registration_requests ADD COLUMN high_school_certificate VARCHAR(50) NULL',
  'ALTER TABLE registration_requests ADD COLUMN high_school_grade DECIMAL(5,2) NULL',
  'ALTER TABLE registration_requests ADD COLUMN guardian_name VARCHAR(100) NULL',
  'ALTER TABLE registration_requests ADD COLUMN guardian_phone VARCHAR(20) NULL',
  'ALTER TABLE registration_requests ADD COLUMN guardian_relation VARCHAR(50) NULL',
  'ALTER TABLE registration_requests ADD COLUMN rejection_reason TEXT NULL',
  'ALTER TABLE registration_requests ADD COLUMN reviewed_by INT NULL',
  'ALTER TABLE registration_requests ADD COLUMN reviewed_at DATETIME NULL',
  'ALTER TABLE registration_requests ADD COLUMN created_user_id INT NULL'
];

(async () => {
  for (const sql of migrations) {
    try {
      await db.query(sql);
      console.log('OK:', sql.substring(0, 70));
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('SKIP (exists):', sql.substring(0, 70));
      } else {
        console.error('FAIL:', e.message);
      }
    }
  }
  console.log('Done.');
  process.exit(0);
})();
