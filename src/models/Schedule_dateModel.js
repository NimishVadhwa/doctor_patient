const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const user = require('./UserModel');

class schedule_date extends Model { }

schedule_date.init(
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
        }        
    },
    {
        sequelize: database,
        modelName: "schedule_date",
        underscored: true

    }

);

user.hasMany(schedule_date, { onDelete: "CASCADE", foreignKey: "doctor_id" });
schedule_date.belongsTo(user, { foreignKey: "doctor_id" });


module.exports = schedule_date;