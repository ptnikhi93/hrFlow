const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkIn: {
    type: DataTypes.DATE,
  },
  checkOut: {
    type: DataTypes.DATE,
  },
  workHours: {
    type: DataTypes.DECIMAL(5, 2),
  },
  status: {
    type: DataTypes.ENUM('present', 'half_day', 'absent', 'leave'),
    allowNull: false,
    defaultValue: 'present',
  },
}, {
  tableName: 'attendances',
  timestamps: true,
  indexes: [
    // The database itself refuses a second row for the same employee on the same day
    { unique: true, fields: ['employeeId', 'date'] },
  ],
});

module.exports = Attendance;