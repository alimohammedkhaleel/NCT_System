const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpecialtyFee = sequelize.define('SpecialtyFee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  specialty_id: { type: DataTypes.INTEGER, allowNull: false },
  year_number: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 4 } },
  fee_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  summer_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: 'رسوم الدراسة الصيفية' },
  course_fail_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: 'رسوم الرسوب في المادة' }
}, {
  tableName: 'specialty_fees',
  timestamps: true,
  indexes: [{ unique: true, fields: ['specialty_id', 'year_number'] }]
});

module.exports = SpecialtyFee;
