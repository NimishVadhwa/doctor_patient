const Sequelize = require('sequelize');

const sequelize = new Sequelize('doctor_patient', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
    logging: false
});

module.exports = sequelize;