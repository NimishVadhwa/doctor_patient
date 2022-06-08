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
            type: DataTypes.ENUM('pending', 'accepted','reject'),
            allowNull: false,
            defaultValue: 'pending',
        },
        reason: {
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

s_date.hasOne(booking, { onDelete: "CASCADE", foreignKey: "s_date_id" });
booking.belongsTo(s_date, { foreignKey: "s_date_id" });

user.hasMany(booking, { onDelete: "CASCADE", foreignKey: "doctor_id" });
booking.belongsTo(user, { foreignKey: "doctor_id" });

user.hasMany(booking, { onDelete: "CASCADE", foreignKey: "user_id" });
booking.belongsTo(user, { foreignKey: "user_id" });

calender.hasMany(booking, { onDelete: "CASCADE", foreignKey: "doctor_id" });
booking.belongsTo(calender, { foreignKey: "calender_id" });

module.exports = booking;