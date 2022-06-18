const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const question = require('./QuestionsModel.js');
const answer = require('./AnswerModel.js');
const user = require('./UserModel.js');

class user_answer extends Model { }

user_answer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        }
    },
    {
        sequelize: database,
        modelName: "user_answer",
        underscored: true

    }

);

question.hasMany(user_answer, { onDelete: "CASCADE", foreignKey: "question_id" });
user_answer.belongsTo(question,{ foreignKey: "question_id" });

answer.hasMany(user_answer, { onDelete: "CASCADE", foreignKey: "answer_id" });
user_answer.belongsTo(answer,{ foreignKey: "answer_id" });

user.hasMany(user_answer, { onDelete: "CASCADE", foreignKey: "user_id" });
user_answer.belongsTo(user,{ foreignKey: "user_id" });



module.exports = user_answer;