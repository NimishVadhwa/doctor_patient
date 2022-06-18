const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const question = require('./QuestionsModel');

class ques_answer extends Model { }

ques_answer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: database,
        modelName: "ques_answer",
        underscored: true

    }

);

question.hasMany(ques_answer, { onDelete: "CASCADE" });
ques_answer.belongsTo(question);



module.exports = ques_answer;