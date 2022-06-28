const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const booking = require('./BookingModel.js');

class feedback extends Model { }

feedback.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        no_of_days: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        disease: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: database,
        modelName: "feedback",
        underscored: true

    }

);

booking.hasOne(feedback, { onDelete: "CASCADE", foreignKey: "booking_id" });
feedback.belongsTo(booking,{ foreignKey: "booking_id" });



module.exports = feedback;