const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const s_date = require('./Calender_dateModel');
const user = require('./UserModel');
const schedule = require('./SchdeuleModel');
const booking = require('./BookingModel');

class re_schedule extends Model { }

re_schedule.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        old_start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        old_end_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        is_reschedule: {
            type: DataTypes.ENUM('0', '1','2'),
            allowNull: false,
            defaultValue: '0',
            comment: "0 is for requesting the re-schedule and 1 is for accept the reschedule and 2 is for cancel the re-schedule"
        }
    },
    {
        sequelize: database,
        modelName: "re_schedule",
        underscored: true

    }

);

s_date.hasMany(re_schedule, { onDelete: "CASCADE", foreignKey: "calender_id" });
re_schedule.belongsTo(s_date, { foreignKey: "calender_id" });

booking.hasOne(re_schedule, { onDelete: "CASCADE", foreignKey: "booking_id" });
re_schedule.belongsTo(booking, { foreignKey: "booking_id" });

schedule.hasOne(re_schedule, { onDelete: "CASCADE", foreignKey: "schedule_id" });
re_schedule.belongsTo(schedule, { foreignKey: "schedule_id" });

user.hasMany(re_schedule, { onDelete: "CASCADE", foreignKey: "user_id" });
re_schedule.belongsTo(user, { foreignKey: "user_id" });

module.exports = re_schedule;