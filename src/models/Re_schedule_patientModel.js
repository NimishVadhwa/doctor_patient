const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const s_date = require('./Calender_dateModel');
const user = require('./UserModel');
const schedule = require('./SchdeuleModel');
const booking = require('./BookingModel');

class re_schedule_patient extends Model { }

re_schedule_patient.init(
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
        modelName: "re_schedule_patient",
        underscored: true

    }

);

s_date.hasMany(re_schedule_patient, { onDelete: "CASCADE", foreignKey: "calender_id" });
re_schedule_patient.belongsTo(s_date, { foreignKey: "calender_id" });

booking.hasMany(re_schedule_patient, { onDelete: "CASCADE", foreignKey: "booking_id" });
re_schedule_patient.belongsTo(booking, { foreignKey: "booking_id" });

schedule.hasOne(re_schedule_patient, { onDelete: "CASCADE", foreignKey: "schedule_id" });
re_schedule_patient.belongsTo(schedule, { foreignKey: "schedule_id" });

user.hasMany(re_schedule_patient, { onDelete: "CASCADE", foreignKey: "doctor_id", as:"doctor_data" });
re_schedule_patient.belongsTo(user, { foreignKey: "doctor_id", as:"doctor_data"});

user.hasMany(re_schedule_patient, { onDelete: "CASCADE", foreignKey: "user_id", as:"patient_data" });
re_schedule_patient.belongsTo(user, { foreignKey: "user_id", as:"patient_data" });

module.exports = re_schedule_patient;