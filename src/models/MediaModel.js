const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const booking = require('./BookingModel.js');

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
            type: DataTypes.ENUM('banner','report'),
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

booking.hasOne(media, { onDelete: "CASCADE", foreignKey: "booking_id" });
media.belongsTo(booking,{ foreignKey: "booking_id" });

module.exports = media;