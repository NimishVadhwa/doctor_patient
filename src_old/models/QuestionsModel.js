const { Model, DataTypes } = require('sequelize');
const database = require('../database');

class question extends Model { }

question.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: database,
        modelName: "question",
        underscored: true

    }

);


module.exports = question;