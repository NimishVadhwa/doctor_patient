const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const schedule_date = require('../models/Schedule_dateModel');
const calender = require('../models/Calender_dateModel');

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
            // group: ['schedule.start_time', 'schedule.end_time']
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