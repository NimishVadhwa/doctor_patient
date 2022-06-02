const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const s_date = require('./Schedule_dateModel');

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
        status: {
            type: DataTypes.ENUM('upcoming', 'ongoing', 'completed','cancel'),
            allowNull: false,
            defaultValue: 'upcoming'
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


module.exports = schedule;