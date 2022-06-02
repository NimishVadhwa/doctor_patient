const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const user = require('./UserModel');

class user_profile extends Model { }

user_profile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        age: {
            type: DataTypes.INTEGER
        },
        gender: {
            type: DataTypes.TEXT
        },
        address: {
            type: DataTypes.TEXT
        },
        specility: {
            type: DataTypes.TEXT
        },
        experience: {
            type: DataTypes.INTEGER
        },
        education: {
            type: DataTypes.TEXT
        },
        qualification: {
            type: DataTypes.TEXT
        }
    },
    {
        sequelize: database,
        modelName: "user_profile",
        underscored: true

    }

);

user.hasMany(user_profile, { onDelete: "CASCADE", foreignKey: "user_id" });
user_profile.belongsTo(user, { foreignKey: "user_id" });


module.exports = user_profile;