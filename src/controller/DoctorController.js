const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const calender = require('../models/Calender_dateModel');
const user_profile = require('../models/User_profileModel');
const booking = require('../models/BookingModel')

exports.add_schedule = async (req, res, next) => {

    const schema = joi.object({
        doctor_id : joi.number().required(),
        schedule_date: joi.string().required(),
        column : joi.array().required()
    });

    try {
        
        await schema.validateAsync(req.body);

        const check = await user.findOne({ where: { id: req.body.doctor_id, type:"doctor"}})

        if(!check) throw new Error('Doctor not found');

        let dta = new Date(req.body.schedule_date);

        const [row, created] = await calender.findOrCreate({
            where : { date: dta.toISOString().split('T')[0] },
            defaults : {
                date: dta.toISOString().split('T')[0],
                year : dta.getFullYear(),
                month : dta.getMonth() + 1
            }
        });

        req.body.column.forEach(async(element) => {
            
            await schedule.create({
                start_time : element.start,
                end_time: element.end,
                s_date_id: row.id,
                doctor_id: req.body.doctor_id
            });

        });

        return res.status(200).json({
            data: [],
            status: true,
            message: "Schedule added successfully"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.schedule_list_doctor = async (req, res, next) => {

    const schema = joi.object({
        doctor_id : joi.number().required(),
        month : joi.number().required(),
        year: joi.number().required()
    });

    try {
        
        await schema.validateAsync(req.body);

        const data = await calender.findAll({
            where : { year : req.body.year, month : req.body.month },
            include:[{
                model : schedule,
                where : { doctor_id : req.body.doctor_id },
                include: [{
                    model: booking,
                    include: [{
                        model: user
                    }]
                }]
            }]
        });

    
        return res.status(200).json({
            data: data,
            status: true,
            message: "Schedule list"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.calender = async(req, res, next)=>{

    const schema = joi.object({
        month:joi.number().required(),
        year:joi.number().required()
    });

    try {

        await schema.validateAsync(req.body);

        const data = await calender.findAll({
            where: { year: req.body.year, month: req.body.month },
            include: [{
                model: schedule,
                // required:false,
                // include:[{
                //     model:user
                // }],
                // group: ['schedules.doctor_id','schedules.s_date_id'],
            }],
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "Schedule list by date"
        });
        
    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.get_doctor_list = async(req, res, next)=>{

    const schema = joi.object({
        date : joi.string().required()
    });

    try {
        
        await schema.validateAsync(req.body);

        let dta = new Date(req.body.date);

        const cal = await calender.findOne({
            where: { date: dta.toISOString().split('T')[0] },
        });

        if(!cal)
        {
            return res.status(200).json({
                data: [],
                status: true,
                message: "Schedule not found"
            });
        }

        const data = await schedule.findAll({
            where : { s_date_id : cal.id },
            attributes:['doctor_id'],
            group:['doctor_id'],
            include: [{
                model:user
            }]
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "Doctor list by date"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.schedule_by_single_date= async (req, res, next) => {

    const schema = joi.object({
        doctor_id : joi.number().required(),
        date:joi.string().required()
    });

    try {
        
        await schema.validateAsync(req.body);

        const cal = await calender.findOne({
            where : { date: req.body.date}
        });

        if(!cal) 
        {
            return res.status(200).json({
                data: [],
                status: true,
                message: "Schedule not found"
            });
        }

        const data = await schedule.findAll({
            where : { doctor_id : req.body.doctor_id, s_date_id : cal.id },
            include:[{
                model:booking,
                include:[{
                    model:user
                }]
            }]
        });
        
        return res.status(200).json({
            data: data,
            status: true,
            message: "Schedule list by doctor id and single date"
        });

    } catch (err) {
        err.status= 400;
        next(err);
    }

}

exports.add_holiday = async (req, res, next) => {

    const schema = joi.object({
        date : joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        let dta = new Date(req.body.date);

        const [row, created] = await calender.findOrCreate({
            where: { date: dta.toISOString().split('T')[0] },
            defaults: {
                date: dta.toISOString().split('T')[0],
                year: dta.getFullYear(),
                month: dta.getMonth() + 1,
                is_holiday : '1'
            }
        });

        if(!created)
        {
            const check = await schedule.findOne({
                where: { s_date_id: row.id }
            });

            if(check) throw new Error('Schedule is added');

            await calender.update({ is_holiday:'1' },{
                where: { id:row.id }
            })
        }

        return res.status(200).json({
            data: [],
            status: true,
            message: "Holiday added successfully"
        });
        
    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.remove_holiday = async(req,res,next)=>{

    const schema = joi.object({
        holiday_id : joi.number().required()
    });

    try {
        await schema.validateAsync(req.body);

        await calender.update({ is_holiday:'0' },{
            where: { id: req.body.holiday_id }
        });

        return res.status(200).json({
            data: [],
            status: true,
            message: "Holiday remove successfully"
        });
       
    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.holiday_list = async(req, res, next)=>{

    try {
        
        const data = await calender.findAll({
            where : { is_holiday : '1'}
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "Holiday list"
        });

    } catch (err) {
        err.status = 500;
        next(err);
    }

}