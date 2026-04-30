const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegistrationRequest = sequelize.define('RegistrationRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Personal Information
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  national_id: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  // Contact Information
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Academic Information
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
    allowNull: true,
    defaultValue: 1,
    comment: 'السنة الدراسية المطلوبة'
  },
  branch: {
    type: DataTypes.ENUM('Software', 'Network'),
    allowNull: true,
    comment: 'فرع ICT (للسنة الثالثة والرابعة فقط)'
  },
  high_school_certificate: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  high_school_grade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  // Guardian Information
  guardian_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  guardian_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  guardian_relation: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'registration_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RegistrationRequest;
