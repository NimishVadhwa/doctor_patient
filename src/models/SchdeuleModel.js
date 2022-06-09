const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const s_date = require('./Calender_dateModel');
const user = require('./UserModel');

class schedule extends Model { }

schedule.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false
        }
    },
    {
        sequelize: database,
        modelName: "schedule",
        underscored: true

    }

);

s_date.hasMany(schedule, { onDelete: "CASCADE", foreignKey: "calender_id" });
schedule.belongsTo(s_date, { foreignKey: "calender_id" });

user.hasMany(schedule, { onDelete: "CASCADE", foreignKey: "doctor_id" });
schedule.belongsTo(user, { foreignKey: "doctor_id" });

module.exports = schedule;