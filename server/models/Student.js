const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Student Model ====================
const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  student_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'كود الطالب الفريد (مثل NCTU-2024-001)'
  },
  national_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'الرقم القومي'
  },
  specialty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'specialties',
      key: 'id'
    }
  },
  current_year: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 4
    }
  },
  current_semester: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 2
    },
    comment: 'الترم الحالي (1 أو 2)'
  },
  branch: {
    type: DataTypes.ENUM('Software', 'Network'),
    allowNull: true,
    comment: 'فرع الطالب (للسنة الثالثة والرابعة في ICT) - البرمجيات أو الشبكات'
  },
  academic_status: {
    type: DataTypes.ENUM('active', 'graduated', 'suspended', 'transferred', 'dropped', 'summer_course', 'repeat_year'),
    defaultValue: 'active'
  },
  enrollment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  graduation_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  qr_secret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: 'سر QR Code الفريد'
  },
  qr_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'بيانات QR Code (JSON)'
  },
  qr_image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'صورة QR Code (Base64)'
  },
  profile_picture: {
    type: DataTypes.BLOB,
    allowNull: true
  },
  total_paid: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: 'المبلغ المدفوع'
  },
  total_due: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: 'المبلغ المستحق'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'students',
  timestamps: false,
  indexes: [
    { fields: ['student_code'] },
    { fields: ['national_id'] },
    { fields: ['academic_status'] },
    { fields: ['current_year'] },
    { fields: ['user_id'] },
    { fields: ['specialty_id'] },
    { fields: ['branch'] },
    { fields: ['specialty_id', 'current_year', 'branch'] }
  ]
});

module.exports = Student;
