const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const schedule_date = require('../models/Schedule_dateModel');
const user_profile = require('../models/User_profileModel');

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

        const sch_date= await schedule_date.create({
            date: req.body.schedule_date,
            doctor_id: req.body.doctor_id

        });

        req.body.column.forEach(async(element) => {
            
            await schedule.create({
                start_time : element.start,
                end_time: element.end,
                s_date_id: sch_date.id
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
        id : joi.number().required()
    });

    try {
        
        await schema.validateAsync(req.params);

        const data = await schedule_date.findAll({
            where: { doctor_id: req.params.id },
            attributes:['id','date'],
            include:[{
                model:schedule,
                attributes: ['id', 'start_time', 'end_time','status','s_date_id']
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

exports.schedule_by_date = async(req, res, next)=>{

    const schema = joi.object({
        date:joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        const data = await schedule_date.findAll({
            where: { date : req.body.date },
            include:[{
                model:user
            }]
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
