const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const calender = require('../models/Calender_dateModel');
const booking = require('../models/BookingModel');
const user_profile = require('../models/User_profileModel');

exports.time_list = async (req, res, next) => {

    const schema = joi.object({
        date: joi.string().required()
    })

    try {
        
        await schema.validateAsync(req.body);

        const data = await calender.findAll({
            where : { date : req.body.date },
            include:[{
                model : schedule,
            }],
            group: ['schedules.start_time', 'schedules.end_time']
        })

        return res.status(200).json({
            data: data,
            status: true,
            message: "Time slot list by date"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.booking = async (req, res, next) => {

    const schema = joi.object({
        date_id : joi.number().required(),
        start_time : joi.string().required(),
        end_time : joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        const check = await calender.findOne({
            where : { id : req.body.date_id }
        });

        if(!check) throw new Error('Date not found');

        await booking.create({
            start_time : req.body.start_time,
            end_time : req.body.end_time,
            status : 'pending',
            calender_id : req.body.date_id,
            user_id : req.user_id
        });

        return res.status(200).json({
            data: [],
            status: true,
            message: "Slot book successfully"
        });

    } catch (err) {
        err.status= 400;
        next(err);
    }

}

exports.request_list = async (req, res, next) => {

    try {

        const data = await booking.findAll({
            where :{ status :'pending' },
            include:[{
                model:user
            }]
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "Request list"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}


exports.assign_doctor = async (req, res, next) => {

    const schema = joi.object({
        doctor_id : joi.number().required(),
        status : joi.string().required(),
        slot_id : joi.number().required(),
        booking_id : joi.number().required(),
        reason:joi.string().allow('')
    });

    try {
        await schema.validateAsync(req.body);

        await booking.update({
            s_date_id: req.body.slot_id,
            doctor_id: req.body.doctor_id,
            status : req.body.status,
            reason:req.body.reason,
        },{where : { id : req.body.booking_id } })

        return res.status(200).json({
            data: [],
            status: true,
            message: "Successfull"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}