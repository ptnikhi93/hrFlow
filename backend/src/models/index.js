const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');
const Employee = require('./employee.model');
const Attendance = require('./attendance.model');

// Relationships: one User has one Employee profile
User.hasOne(Employee, { foreignKey: 'userId', as: 'employee' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// One Employee has many Attendance records
Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Employee = Employee;
db.Attendance = Attendance;

// db.Employee = require('./employee.model.js')(sequelize, Sequelize);

module.exports = db;