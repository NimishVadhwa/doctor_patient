const { Model, DataTypes } = require('sequelize');
const database = require('../database');

class calender_date extends Model { }

calender_date.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_holiday: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
            comment:"0 is not for holiday and 1 is for holiday"
        }
    },
    {
        sequelize: database,
        modelName: "calender_date",
        underscored: true

    }

);


module.exports = calender_date;