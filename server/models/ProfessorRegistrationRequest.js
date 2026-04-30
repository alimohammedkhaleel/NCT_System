const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProfessorRegistrationRequest = sequelize.define('ProfessorRegistrationRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Personal Information
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'الاسم الكامل مطلوب' },
      len: { args: [3, 255], msg: 'الاسم يجب أن يكون بين 3 و 255 حرف' }
    }
  },
  national_id: {
    type: DataTypes.STRING(14),
    allowNull: true,
    unique: {
      msg: 'الرقم القومي مستخدم بالفعل'
    },
    validate: {
      is: {
        args: /^[0-9]{14}$/,
        msg: 'الرقم القومي يجب أن يكون 14 رقم'
      }
    }
  },
  // Contact Information
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'البريد الإلكتروني مستخدم بالفعل'
    },
    validate: {
      notEmpty: { msg: 'البريد الإلكتروني مطلوب' },
      isEmail: { msg: 'البريد الإلكتروني غير صحيح' }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9+\-\s()]+$/,
        msg: 'رقم الهاتف غير صحيح'
      }
    }
  },
  // Academic Information
  specialty_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'specialties',
      key: 'id'
    },
    comment: 'التخصص الذي سيدرس فيه الدكتور'
  },
  qualification: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'المؤهل العلمي (بكالوريوس، ماجستير، دكتوراه)'
  },
  years_of_experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'سنوات الخبرة يجب أن تكون رقم موجب' },
      max: { args: [50], msg: 'سنوات الخبرة يجب أن تكون أقل من 50' }
    },
    comment: 'عدد سنوات الخبرة في التدريس'
  },
  // Password (hashed)
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'كلمة المرور المشفرة'
  },
  // Login username (stored for account creation on approval)
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'اسم المستخدم لتسجيل الدخول'
  },
  // Department & Specialization (stored for professor profile on approval)
  department: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'القسم'
  },
  specialization: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'التخصص الدقيق'
  },
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'حالة الطلب'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'سبب الرفض (إن وجد)'
  },
  // Processing Information
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ معالجة الطلب'
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'الأدمن الذي عالج الطلب'
  },
  // Created User ID (after approval)
  created_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'معرف المستخدم الذي تم إنشاؤه بعد القبول'
  },
  created_professor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'professors',
      key: 'id'
    },
    comment: 'معرف الدكتور الذي تم إنشاؤه بعد القبول'
  }
}, {
  tableName: 'professor_registration_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_status',
      fields: ['status']
    },
    {
      name: 'idx_email',
      fields: ['email']
    },
    {
      name: 'idx_national_id',
      fields: ['national_id']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_specialty_id',
      fields: ['specialty_id']
    }
  ]
});

module.exports = ProfessorRegistrationRequest;
