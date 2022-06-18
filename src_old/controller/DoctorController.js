const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const calender = require('../models/Calender_dateModel');
const user_profile = require('../models/User_profileModel');
const booking = require('../models/BookingModel');
const re_schedule = require('../models/Re_scheduleModel');

exports.add_schedule = async (req, res, next) => {
   
    const schema = joi.object({
        doctor_id: joi.array().required(),
        schedule_date: joi.array().required(),
        column: joi.array().required(),
        different: joi.array().allow(null)
    });

    try {

        await schema.validateAsync(req.body);

        for (let i = 0; i < req.body.doctor_id.length; i++) {
                        
            for (let j = 0; j < req.body.schedule_date.length; j++) {
                
                let dta = new Date(req.body.schedule_date[j]);

                let row = await calender.findOne({ where: { date: dta.toISOString().split('T')[0] } });

                let date_id;

                if(!row)
                {
                    let dt = await calender.create({
                            date: dta.toISOString().split('T')[0],
                            year : dta.getFullYear(),
                            month : dta.getMonth() + 1
                        });
                    
                    date_id = dt.id;
                }
                else
                {
                    date_id = row.id;
                }

                req.body.column.forEach(async(element) => {

                    await schedule.findOrCreate({
                        where: {
                            start_time: element.start,
                            end_time: element.end,
                            calender_id: date_id,
                            doctor_id: req.body.doctor_id[i]
                        },
                        defaults:{
                            start_time : element.start,
                            end_time: element.end,
                            calender_id : date_id,
                            doctor_id: req.body.doctor_id[i]
                        }
                    });

                });

                
            }

            if(req.body.different)
            {
                req.body.different.forEach( async(element)=>{
                    
                    let dta = new Date(element.date);
    
                    let [row, created] = await calender.findOrCreate({ 
                        where: { date: dta.toISOString().split('T')[0] },
                        defaults:{
                            date: dta.toISOString().split('T')[0],
                            year: dta.getFullYear(),
                            month: dta.getMonth() + 1
                        }
                    });

                    element.column.forEach(async(val) => {

                        await schedule.findOrCreate({
                            where: {
                                start_time: val.start,
                                end_time: val.end,
                                calender_id: row.id,
                                doctor_id: req.body.doctor_id[i]
                            },
                            defaults: {
                                start_time: val.start,
                                end_time: val.end,
                                calender_id: row.id,
                                doctor_id: req.body.doctor_id[i]
                            }
                        });

                    });

                });




            }

        }

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
        doctor_id: joi.number().required(),
        month: joi.number().required(),
        year: joi.number().required()
    });

    try {

        await schema.validateAsync(req.body);

        const data = await calender.findAll({
            where: { year: req.body.year, month: req.body.month },
            include: [{
                model: schedule,
                where: { doctor_id: req.body.doctor_id },
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

exports.calender = async (req, res, next) => {

    const schema = joi.object({
        month: joi.number().required(),
        year: joi.number().required()
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
                // group: ['schedules.doctor_id','schedules.calender_id'],
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

exports.get_doctor_list = async (req, res, next) => {

    const schema = joi.object({
        date: joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        let dta = new Date(req.body.date);

        const cal = await calender.findOne({
            where: { date: dta.toISOString().split('T')[0] },
        });

        if (!cal) {
            return res.status(200).json({
                data: [],
                status: true,
                message: "Schedule not found"
            });
        }

        const data = await schedule.findAll({
            where: { calender_id: cal.id },
            attributes: ['doctor_id'],
            group: ['doctor_id'],
            include: [{
                model: user
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

exports.get_doctor_slot_list = async (req, res, next) => {

    const schema = joi.object({
        start_time: joi.string().required(),
        end_time: joi.string().required(),
        cal_id: joi.number().required(),
    });

    try {

        await schema.validateAsync(req.body);

        const data = await schedule.findAll({
            where: { calender_id: req.body.cal_id, start_time: req.body.start_time, end_time: req.body.end_time },
            include: [{
                model: user
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

exports.schedule_by_single_date = async (req, res, next) => {

    const schema = joi.object({
        doctor_id: joi.number().required(),
        date: joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        const cal = await calender.findOne({
            where: { date: req.body.date }
        });

        if (!cal) {
            return res.status(200).json({
                data: [],
                status: true,
                message: "Schedule not found"
            });
        }

        const data = await schedule.findAll({
            where: { doctor_id: req.body.doctor_id, calender_id: cal.id },
            include: [{
                model: booking,
                include: [{
                    model: user
                }]
            }]
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "Schedule list by doctor id and single date"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.add_holiday = async (req, res, next) => {

    const schema = joi.object({
        date: joi.string().required()
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
                is_holiday: '1'
            }
        });

        if (!created) {
            const check = await schedule.findOne({
                where: { calender_id: row.id }
            });

            if (check) throw new Error('Schedule is added');

            await calender.update({ is_holiday: '1' }, {
                where: { id: row.id }
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

exports.remove_holiday = async (req, res, next) => {

    const schema = joi.object({
        holiday_id: joi.number().required()
    });

    try {
        await schema.validateAsync(req.body);

        await calender.update({ is_holiday: '0' }, {
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

exports.holiday_list = async (req, res, next) => {

    try {

        const data = await calender.findAll({
            where: { is_holiday: '1' }
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

exports.apply_reschedule = async (req, res, next) => {

    const schema = joi.object({
        start_time: joi.string().required(),
        end_time: joi.string().required(),
        user_id: joi.number().required(),
        slot_id: joi.number().allow(null),
        re_schedule_date: joi.string().required(),
        booking_id: joi.number().allow(null)
    });

    try {

        await schema.validateAsync(req.body);

        let dta = new Date(req.body.re_schedule_date);

        const [row, created] = await calender.findOrCreate({
            where: { date: dta.toISOString().split('T')[0] },
            defaults: {
                date: dta.toISOString().split('T')[0],
                year: dta.getFullYear(),
                month: dta.getMonth() + 1
            }
        });

        await re_schedule.create({
            old_start_time: req.body.start_time,
            old_end_time: req.body.end_time,
            calender_id: row.id,
            schedule_id: req.body.slot_id,
            user_id: req.body.user_id,
            booking_id: req.body.booking_id
        });

        return res.status(200).json({
            data: [],
            status: true,
            message: "Re-schedule apply successfully"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }


}

exports.re_schedule_list = async (req, res, next) => {

    try {

        const data = await re_schedule.findAll({
            where: { is_reschedule: '0' },
            include: [{
                model: booking
            }, {
                model: user
            }]
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "Re-schdule apply list"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.re_schedule_confirm = async (req, res, next) => {

    const schema = joi.object({
        re_schedule_id: joi.number().required(),
        status: joi.string().required().valid('1', '2')
    });

    try {

        await schema.validateAsync(req.body);

        const check = await re_schedule.findOne({ where: { id: req.body.re_schedule_id } });

        const data = await schedule.findOne({ where: { id: check.schedule_id } });

        if (req.body.statsu == '1') {
            let st_time = data.start_time;
            let ed_time = data.end_time;
            let cal_id = data.calender_id;

            data.start_time = check.old_start_time;
            data.end_time = check.old_end_time;
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
            message: "Successfull"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.feedback_booking = async (req, res, next) => {

    const schema = joi.object({
        feedback: joi.string().required(),
        booking_id: joi.number().required()
    });

    try {
        await schema.validateAsync(req.body);

        await booking.update({
            feedback: req.body.feedback,
            is_come: '1'
        }, {
            where: { id: req.body.booking_id }
        });

        return res.status(200).json({
            data: [],
            status: true,
            message: "Feedback add Successfull"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

