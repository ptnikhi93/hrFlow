const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;

// db.Employee = require('./employee.model.js')(sequelize, Sequelize);

module.exports = db;