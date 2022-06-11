const { Model, DataTypes } = require('sequelize');
const database = require('../database');

class media extends Model { }

media.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        path: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('banner'),
            allowNull: false,
            defaultValue: 'banner',
        }
        
    },
    {
        sequelize: database,
        modelName: "media",
        underscored: true

    }

);


module.exports = media;