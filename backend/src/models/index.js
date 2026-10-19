const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');
const Employee = require('./employee.model');

// Relationships: one User has one Employee profile
User.hasOne(Employee, { foreignKey: 'userId', as: 'employee' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Employee = Employee;

// db.Employee = require('./employee.model.js')(sequelize, Sequelize);

module.exports = db;