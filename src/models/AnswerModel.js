const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const question = require('./QuestionsModel.js');

class answer extends Model { }

answer.init(
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
        modelName: "answer",
        underscored: true

    }

);

question.hasMany(answer, { onDelete: "CASCADE", foreignKey: "question_id" });
answer.belongsTo(question,{ foreignKey: "question_id" });



module.exports = answer;