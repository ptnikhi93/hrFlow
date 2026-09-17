const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.Employee = require('./employee.model.js')(sequelize, Sequelize);

module.exports = db;