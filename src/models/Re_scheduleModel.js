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
        status: {
            type: DataTypes.ENUM('pending', 'accept','cancel'),
            allowNull: false,
            defaultValue: 'pending',
            comment: "pending is for requesting the re-schedule and accept is for accept the reschedule and cancel is for cancel the re-schedule"
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true
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

booking.hasMany(re_schedule, { onDelete: "CASCADE", foreignKey: "booking_id" });
re_schedule.belongsTo(booking, { foreignKey: "booking_id" });

schedule.hasOne(re_schedule, { onDelete: "CASCADE", foreignKey: "schedule_id" });
re_schedule.belongsTo(schedule, { foreignKey: "schedule_id" });

user.hasMany(re_schedule, { onDelete: "CASCADE", foreignKey: "doctor_id" });
re_schedule.belongsTo(user, { foreignKey: "doctor_id" });

module.exports = re_schedule;