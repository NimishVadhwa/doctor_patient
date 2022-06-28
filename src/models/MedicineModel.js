const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const booking = require('./BookingModel.js');

class medicine extends Model { }

medicine.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        total_no_of_med_days: {
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
        med_name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        med_type: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        med_desc: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        med_time: {
            type: DataTypes.ENUM('morning', 'evening', 'afternoon'),
            allowNull: false,
            defaultValue: 'morning'
        }
    },
    {
        sequelize: database,
        modelName: "medicine",
        underscored: true

    }

);

booking.hasMany(medicine, { onDelete: "CASCADE", foreignKey: "booking_id" });
medicine.belongsTo(booking,{ foreignKey: "booking_id" });



module.exports = medicine;