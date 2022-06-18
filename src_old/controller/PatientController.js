const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const calender = require('../models/Calender_dateModel');
const booking = require('../models/BookingModel');
const user_profile = require('../models/User_profileModel');
const re_schedule = require('../models/Re_scheduleModel');
const question = require('../models/QuestionsModel');
const answer = require('../models/AnswerModel');


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
        reason:joi.string().allow(null)
    });

    try {
        await schema.validateAsync(req.body);

        const check = await schedule.findOne({
            where :{ id: req.body.slot_id },
            include:[{
                model : booking
            }]
        })

        if(!check) throw new Error('Schedule/ slot not found');
        
        if (check.booking && check.booking.is_reschedule == '0' ) throw new Error('Doctor is applied for reschedule');

        await booking.update({
            sch_id: req.body.slot_id,
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

exports.confirm_reschedule_booking = async(req, res, next)=>{

    const schema = joi.object({
        re_schedule_id : joi.number().required(),
        slot_id : joi.number().allow(null),
        doctor_id : joi.number().allow(null),
        status : joi.string().required().valid('1','2')
    });

    try {

        await schema.validateAsync(req.body);

        const check = await re_schedule.findOne({
            where : { id : req.body.re_schedule_id}
        });

        const data = await  booking.findOne({ where: { id: check.booking_id  } });

        if(req.body.status == '1')
        {
            let st_time = data.start_time;
            let ed_time = data.end_time;
            let cal_id = data.calender_id;


            data.start_time = check.old_start_time;
            data.end_time = check.old_end_time;
            data.calender_id = check.calender_id;
            data.sch_id = req.body.slot_id;
            data.doctor_id = req.body.doctor_id;

            await data.save();

            check.old_start_time = st_time;
            check.old_end_time = ed_time;
            check.calender_id = cal_id;

        }

        check.is_reschedule = req.body.status;
        await check.save();

        return res.status(200).json({
            data: [],
            status: true,
            message: "Re-schedule Successfull"
        });

    } catch (err) {
        console.log(err);
        err.status =400;
        next(err);
    }

}

exports.cancel_booking = async(req, res, next)=>{
    
    const schema = joi.object({
        reason : joi.string().required(),
        booking_id : joi.number().required()
    });

    try {
        await schema.validateAsync(req.body);

        await booking.update({
            status : 'cancel',
            reason : req.body.reason
        },{
            where : { id:req.body.booking_id }
        });

        return res.status(200).json({
            data: [],
            status: true,
            message: "Re-schedule Successfull"
        });

    } catch (err) {
        err.status= 400;
        next(err);
    }

}

