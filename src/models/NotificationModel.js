const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const user = require('./UserModel.js');

class notification extends Model { }

notification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('read', 'un_read'),
            allowNull: false,
            defaultValue: 'un_read',
        }
    },
    {
        sequelize: database,
        modelName: "notification",
        underscored: true

    }

);

user.hasMany(notification, { onDelete: "CASCADE", foreignKey: "user_id" });
notification.belongsTo(user,{ foreignKey: "user_id" });



module.exports = notification;