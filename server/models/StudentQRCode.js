const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Student QR Code Model ====================
const StudentQRCode = sequelize.define('StudentQRCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  qr_secret: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'سر QR Code الفريد'
  },
  qr_data: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'بيانات QR Code (يحتوي على رابط التسجيل أو token)'
  },
  qr_image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'صورة QR Code (base64)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'هل QR Code نشط؟'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ انتهاء صلاحية QR Code المؤقت'
  },
  scanned_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ آخر مسح للـ QR Code'
  },
  scan_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'عدد مرات مسح QR Code'
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
  tableName: 'student_qr_codes',
  timestamps: false,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['qr_secret'] },
    { fields: ['is_active'] }
  ]
});

module.exports = StudentQRCode;
