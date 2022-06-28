const Sequelize = require('sequelize');

const sequelize = new Sequelize('arabboard_afrad', 'arabboard_afrad', '5gFZ{($?6Emo', {
    dialect: 'mysql',
    host: 'localhost',
    logging: false
});

module.exports = sequelize;