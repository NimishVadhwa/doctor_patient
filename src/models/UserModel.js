const { Model, DataTypes } = require('sequelize');
const database = require('../database');
const clinic = require('./ClinicModel')

class user extends Model { }

user.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        phone: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "this is the token which is generated while login"
        },
        fcm_token: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "This is the fire base token"
        },
        is_activated: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
            comment: "0 is for not activate and 1 is for activate"
        },
        is_block: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
            comment: "0 is for not block and 1 is for block"
        },
        type: {
            type: DataTypes.ENUM('doctor', 'patient', 'admin'),
            allowNull: false,
            defaultValue: 'patient'
        },
        rating: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: database,
        modelName: "user",
        underscored: true

    }

);

clinic.hasMany(user, { onDelete: "CASCADE", foreignKey: "clinic_id" });
user.belongsTo(clinic, { foreignKey: "clinic_id" } )

module.exports = user;