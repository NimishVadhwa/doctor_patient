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
        },
        is_reschedule: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
            comment: "0 is for not reschedule, 1 is for requesting the re-schedule and 2 is for accept the reschedule and 3 is for cancel the re-schedule"
        },
        re_start_time: {
            type: DataTypes.TIME,
            allowNull: true
        },
        re_end_time: {
            type: DataTypes.TIME,
            allowNull: true
        }
    },
    {
        sequelize: database,
        modelName: "schedule",
        underscored: true

    }

);

s_date.hasMany(schedule, { onDelete: "CASCADE", foreignKey: "s_date_id" });
schedule.belongsTo(s_date, { foreignKey: "s_date_id" });

s_date.hasMany(schedule, { onDelete: "CASCADE", foreignKey: "res_date_id", as:"reSchedule" });
schedule.belongsTo(s_date, { foreignKey: "res_date_id", as: "reSchedule" });


user.hasMany(schedule, { onDelete: "CASCADE", foreignKey: "doctor_id" });
schedule.belongsTo(user, { foreignKey: "doctor_id" });

module.exports = schedule;