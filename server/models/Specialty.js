const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Specialty = sequelize.define('Specialty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  arabic_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  duration_years: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  total_credits: {
    type: DataTypes.INTEGER,
    defaultValue: 120
  },
  annual_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10000.00
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'specialties',
  timestamps: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Specialty;