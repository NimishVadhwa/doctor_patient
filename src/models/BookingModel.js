const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const user = require('./UserModel');
const s_date = require('./SchdeuleModel');
const calender = require('./Calender_dateModel');

class booking extends Model { }

booking.init(
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
            type: DataTypes.ENUM('pending', 'accepted', 'reject', 'cancel', 're_schedule_pending','completed'),
            allowNull: false,
            defaultValue: 'pending',
            comment:"pending for requesting the booking, accepted is for accept the booking request, re_schedule_pending is for applying the re-schedules, cancel is for cancel the booking from patient side, reject is for reject the booking by admin side"
        },
        is_come: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
            comment:"0 is for not come and 1 is for come"
        },
        is_doctor_apply: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
            comment:"0 is for not apply by doctor and 1 is for apply by doctor"
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        patient_feedback: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: database,
        modelName: "booking",
        underscored: true

    }

);

s_date.hasOne(booking, { onDelete: "CASCADE", foreignKey: "sch_id" });
booking.belongsTo(s_date, { foreignKey: "sch_id" });

user.hasMany(booking, { onDelete: "CASCADE", foreignKey: "doctor_id", as:"doctor" });
booking.belongsTo(user, { foreignKey: "doctor_id", as:"doctor"});

user.hasMany(booking, { onDelete: "CASCADE", foreignKey: "user_id", as:"patient" });
booking.belongsTo(user, { foreignKey: "user_id", as:"patient" });

calender.hasMany(booking, { onDelete: "CASCADE", foreignKey: "calender_id" });
booking.belongsTo(calender, { foreignKey: "calender_id" });

module.exports = booking;