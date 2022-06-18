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
            type: DataTypes.ENUM('pending', 'accepted','reject','cancel'),
            allowNull: false,
            defaultValue: 'pending',
        },
        is_come: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
            comment:"0 is for not come and 1 is for come"
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    },
    {
        sequelize: database,
        modelName: "booking",
        underscored: true

    }

);

s_date.hasOne(booking, { onDelete: "CASCADE", foreignKey: "sch_id" });
booking.belongsTo(s_date, { foreignKey: "sch_id" });

user.hasMany(booking, { onDelete: "CASCADE", foreignKey: "doctor_id" });
booking.belongsTo(user, { foreignKey: "doctor_id" });

user.hasMany(booking, { onDelete: "CASCADE", foreignKey: "user_id" });
booking.belongsTo(user, { foreignKey: "user_id" });

calender.hasMany(booking, { onDelete: "CASCADE", foreignKey: "doctor_id" });
booking.belongsTo(calender, { foreignKey: "calender_id" });

module.exports = booking;