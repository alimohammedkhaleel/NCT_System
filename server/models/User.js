const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// ==================== User Model ====================
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  national_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'professor', 'accountant', 'registrar', 'student'),
    allowNull: false,
    defaultValue: 'student',
    comment: 'دور المستخدم'
  },
  profile_picture: {
    type: DataTypes.BLOB,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'مسار صورة الملف الشخصي (VARCHAR)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  token_version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    comment: 'إصدار التوكن لمنع تعدد الجلسات'
  }
}, {
  tableName: 'users',
  timestamps: false,
  indexes: [
    { fields: ['role'] },
    { fields: ['is_active'] },
    { fields: ['username'] },
    { fields: ['email'] }
  ]
});

// Instance methods
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.generatePasswordHash = async function(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Hooks
User.beforeCreate(async (user) => {
  if (user.password_hash && !user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
    user.password_hash = await user.generatePasswordHash(user.password_hash);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash') && user.password_hash && !user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
    user.password_hash = await user.generatePasswordHash(user.password_hash);
  }
});

module.exports = User;