const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const calender = require('../models/Calender_dateModel');
const user_profile = require('../models/User_profileModel');
const booking = require('../models/BookingModel');
const re_schedule = require('../models/Re_scheduleModel');
const { Op } = require("sequelize");
const re_schedule_patient = require('../models/Re_schedule_patientModel');
const user_anwser = require('../models/UserAnswerModel');
const question = require('../models/QuestionsModel');
const answer = require('../models/AnswerModel');
const feedback = require('../models/feedbackModel');
const medicine = require('../models/MedicineModel');
const fs = require('fs');
const media = require('../models/MediaModel');
const { send_notification } = require('../helper');

exports.add_schedule = async (req, res, next) => {

    const schema = joi.object({
        doctor_id: joi.array().required(),
        schedule_date: joi.array().required(),
        column: joi.array().required(),
        different: joi.array().allow(null),
        notification_start : joi.string().required(),
        notification_end : joi.string().required(),
    });

    try {

        await schema.validateAsync(req.body);
        
        for (let i = 0; i < req.body.doctor_id.length; i++) {

            for (let j = 0; j < req.body.schedule_date.length; j++) {

                let dta = new Date(req.body.schedule_date[j]);

                let row = await calender.findOne({ where: { date: dta.toISOString().split('T')[0] } });

                let date_id, check_holiday;

                if (!row) {
                    let dt = await calender.create({
                        date: dta.toISOString().split('T')[0],
                        year: dta.getFullYear(),
                        month: dta.getMonth() + 1
                    });

                    date_id = dt.id;
                    check_holiday = dt.is_holiday;
                }
                else {
                    date_id = row.id;
                    check_holiday = row.is_holiday;
                }

                if(check_holiday == '0')
                {
                    req.body.column.forEach(async (element) => {
    
                        await schedule.findOrCreate({
                            where: {
                                start_time: element.start,
                                end_time: element.end,
                                calender_id: date_id,
                                doctor_id: req.body.doctor_id[i]
                            },
                            defaults: {
                                start_time: element.start,
                                end_time: element.end,
                                calender_id: date_id,
                                doctor_id: req.body.doctor_id[i]
                            }
                        });
    
                    });
                }

            }

            if (req.body.different) {
                req.body.different.forEach(async (element) => {

                    let dta = new Date(element.date);

                    let [row, created] = await calender.findOrCreate({
                        where: { date: dta.toISOString().split('T')[0] },
                        defaults: {
                            date: dta.toISOString().split('T')[0],
                            year: dta.getFullYear(),
                            month: dta.getMonth() + 1
                        }
                    });

                    element.column.forEach(async (val) => {

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

exports.check_schedule = async (req, res, next) => {

    const schema = joi.object({
        doctor_id: joi.array().required(),
        schedule_date: joi.array().required(),
        column: joi.array().required(),
        different: joi.array().allow(null)
    });

    try {

        await schema.validateAsync(req.body);
        
        let ch = 0, st, et;
        
        for (let i = 0; i < req.body.doctor_id.length; i++) {

            for (let j = 0; j < req.body.schedule_date.length; j++) {

                let dta = new Date(req.body.schedule_date[j]);

                let row = await calender.findOne({ where: { date: dta.toISOString().split('T')[0] } });

                let date_id, check_holiday;

                if (!row) {
                    let dt = await calender.create({
                        date: dta.toISOString().split('T')[0],
                        year: dta.getFullYear(),
                        month: dta.getMonth() + 1
                    });

                    date_id = dt.id;
                    check_holiday = dt.is_holiday;
                }
                else {
                    date_id = row.id;
                    check_holiday = row.is_holiday;
                }

                if(check_holiday == '0')
                {
                    req.body.column.forEach(async (element) => {
    
                        let dta = await schedule.findOne({
                            where : { 
                                start_time:{ [Op.between] : [ element.start,element.start ] },
                                end_time:{ [Op.between] : [ element.end,element.end ] },
                                calender_id: date_id,
                                doctor_id: req.body.doctor_id[i]
                            }
                        });
                        
                        if(dta)
                        {
                            ch = 1;
                            st = element.start;
                            et = element.end;
                            return;
                        }

                    });
                }

            }

            if(ch = 1){
                
                const dd = await user.findOne({ where :{ id : req.body.doctor_id[i] } });
                
                let msg = st +' - '+ et + '  Schedule already exists in dr '+ dd.first_name +' '+dd.last_name;
                throw new Error(msg)
            } 

            // if (req.body.different) {
            //     req.body.different.forEach(async (element) => {

            //         let dta = new Date(element.date);

            //         let [row, created] = await calender.findOrCreate({
            //             where: { date: dta.toISOString().split('T')[0] },
            //             defaults: {
            //                 date: dta.toISOString().split('T')[0],
            //                 year: dta.getFullYear(),
            //                 month: dta.getMonth() + 1
            //             }
            //         });

            //         element.column.forEach(async (val) => {

                       

            //         });

            //     });

            // }

        }

        return res.status(200).json({
            data: [],
            status: true,
            message: "Schedule check successfully"
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
                        model: user,
                        as:"patient",
                        include:[{
                            model : user_profile
                        }]
                        // include:[{
                        //     model : user_anwser,
                        //     include:[{
                        //             model : question
                        //         },
                        //         {
                        //             model : answer
                        //         }]
                        // }]
                    },{
                        model:calender,
                        attributes:['date']
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
            order:[ ['start_time','ASC'] ],
            include: [{
                model: booking,
                include: [{
                    model: user,
                    as:"patient",
                    include:[{
                        model : user_profile
                    }]
                    // include:[{
                    //     model : user_anwser,
                    //     include:[{
                    //         model : question
                    //     },
                    //     {
                    //         model : answer
                    //     }]
                    // }]
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

exports.patient_list = async(req,res,next)=>{
    
      try{
        
        const data = await booking.findAll({
            where : { 
                doctor_id : req.user_id
            }
        });
        
        let arr= [];
        
        data.forEach(element=>{
            if(arr.indexOf(element.user_id))
            {
                arr.push( element.user_id )
            }
        });
        
        const dta = await user.findAll({
            where : { id : arr }
        })
        
         return res.status(200).json({
            data: dta,
            status: true,
            message: "All patient list of the doctor"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
    
}


//Re-schedule
exports.apply_reschedule_slot = async (req, res, next) => {

    const schema = joi.object({
        booking_id: joi.array().required()
    });

    try {

        await schema.validateAsync(req.body);

        req.body.booking_id.forEach(async (element) => {
            
            let dta = await booking.findOne({
                where: { id: element }
            });
            
            await re_schedule.create({
                status : 'pending',
                calender_id : dta.calender_id,
                doctor_id : dta.doctor_id,
                booking_id : dta.id,
                schedule_id : dta.sch_id
            })
            
            dta.status = 're_schedule_pending';
            dta.is_doctor_apply = '1';
            await dta.save();

        })

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

exports.confirm_re_schedule_apply_by_doctor = async (req, res, next) => {

    const schema = joi.object({
        re_schedule_id: joi.array().required(),
        doctor_id: joi.number().required(),
    });

    try {
        await schema.validateAsync(req.body);

        const left_data = await booking.findAll({
            where : { doctor_id : req.body.doctor_id }
        });

        let arr = [];
        
        left_data.forEach( async(element)=>{
            arr.push(element.sch_id);

            await schedule.update({ status: "1" }, {
                where: { id: element.sch_id }
            })

        });

        const todayDate = new Date();

        const left_sch = await schedule.findAndCountAll({
            where: {
                id: {
                    [Op.ne]: arr
                },
                doctor_id : req.body.doctor_id,
                status:"0"
            },
            order:['id'],
            include:[{
                model:calender,
                required:true,
                where :{ 
                    date :{ 
                        [Op.gt]: todayDate.toISOString().split('T')[0]
                    }
                 }
            }]
        });

        if( parseInt(left_sch.count) < parseInt(req.body.re_schedule_id.length) )
        {
            throw new Error('Please allot more schedules to doctor');
        }

        left_sch.rows.forEach(async (element,i) => {
            
            if (req.body.re_schedule_id[i])
            {
                let dd = await re_schedule.findOne({
                    where :{ id : req.body.re_schedule_id[i] }
                });
                
                await booking.update({
                    sch_id : element.id,
                    calender_id: element.calender_id,
                    status:'accepted'
                },{
                    where: { id: dd.booking_id }
                });
                
                dd.status = 'accept';
                await dd.save();
                
                await schedule.update({
                    status:"1"
                },{
                    where: { id: element.id }
                })


            }

        });

        return res.status(200).json({
            data: [],
            status: true,
            message: "successfull"
        });

    } catch (err) {
        console.log(err);
        err.status = 404;
        next(err);
    }

}

exports.cancel_re_schedule_doctor = async(req,res,next)=>{
    
    const schema = joi.object({
        re_schedule_id: joi.array().required(),
        doctor_id: joi.number().required(),
        reason : joi.string().required()
    });

    try {
        await schema.validateAsync(req.body);
        
        req.body.re_schedule_id.forEach( async(element)=>{
         
            
            let dd = await re_schedule.findOne({
                where :{ id : element}
            });
            
             await booking.update({
                status : "accepted"
            },{
                where :{ id : dd.booking_id }
            }) 
            
            dd.status = 'cancel';
            dd.reason = req.body.reason;
            await dd.save();
         
        })


        return res.status(200).json({
            data: [],
            status: true,
            message: "Cancel doctor re-schdule successfully"
        });

    } catch (err) {
        console.log(err);
        err.status = 400;
        next(err);
    }
    
}

exports.re_schedule_list_by_doctor = async (req, res, next) => {

    try {

        const data = await user.findAll({
            where : { type:"doctor" },
            include: [{
                model: booking,
                as:"doctor",
                where: { status : "re_schedule_pending", is_doctor_apply :'1' },
                include:[{
                    model :calender
                },{
                    model :user,
                    as:"patient"
                },{
                    model : re_schedule,
                    where :{ status:"pending" }
                }]
            }]
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "Re-schdule apply list of doctor"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}


//holidays
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
        holiday: joi.string().required()
    });

    try {
        await schema.validateAsync(req.body);

        let dta = new Date(req.body.holiday);

        await calender.update({ is_holiday: '0' }, {
            where: { date: dta.toISOString().split('T')[0] }
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

//booking
exports.feedback_booking = async (req, res, next) => {

    const schema = joi.object({
        booking_id: joi.number().required(),
        days: joi.number().allow(null),
        start_date: joi.string().allow(null),
        end_date: joi.string().allow(null),
        disease: joi.string().allow(null),
        medicine: joi.array().allow(null),
        is_come:joi.string().required().valid('0','1')
    });

    try {
        await schema.validateAsync(req.body);
// feedback
        
        if(req.body.is_come == '0')
        {
            await booking.update({
                status: 'completed',
                is_come: '0'
            }, {
                where: { id: req.body.booking_id }
            });
    
            return res.status(200).json({
                data: [],
                status: true,
                message: "Successfull"
            });

        }
        
        await feedback.create({
            no_of_days : req.body.days,
            start_date : req.body.start_date,
            end_date : req.body.end_date,
            disease : req.body.disease,
            booking_id  : req.body.booking_id ,
        });
        
        req.body.medicine.forEach( async(element)=>{
            
            await medicine.create({
                total_no_of_med_days : element.med_days,
                start_date : element.start_date,
                end_date : element.end_date,
                med_name : element.med_name,
                med_type : element.med_type,
                med_desc : element.med_desc,
                med_time : element.med_time,
                booking_id  : req.body.booking_id ,
            })
            
        } )
        

        await booking.update({
            status: 'completed',
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

exports.all_booking = async(req,res,next)=>{

    const schema = joi.object({
        doctor_id : joi.number().required(),
        date : joi.string().required()
    });

    try {
        await schema.validateAsync(req.body);

        let dta = new Date(req.body.date);

        let row = await calender.findOne({ where: { date: dta.toISOString().split('T')[0] } });

        const data  = await booking.findAll({
            where : { doctor_id : req.body.doctor_id, calender_id : row.id },
             include: [{
                    model: user,
                    as:"patient",
                    include:[{
                        model : user_anwser,
                        include:[{
                            model : question
                        },
                        {
                            model : answer
                        }]
                    }]
                },
                {
                    model: user,
                    as:"doctor"
                },
                {
                    model : calender
                }]
        })

        return res.status(200).json({
            data: data,
            status: true,
            message: "All bookings by single date"
        });

        
    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.booking_detail = async(req,res,next)=>{
 
    const schema = joi.object({
        id : joi.string().required()
    }); 
 
    try{
        
        await schema.validateAsync(req.params);
        
        const data = await booking.findOne({
            where :{ id : req.params.id },
            include: [{
                    model: user,
                    as:"patient",
                    include:[{
                        model : user_profile
                    }]
                },
                {
                    model: user,
                    as:"doctor",
                    include:[{
                        model : user_profile
                    }]
                },
                {
                    model : calender,
                    attributes:['date']
                },
                {
                    model : re_schedule,
                    include:[{
                        model : calender
                    },
                    {
                        model : schedule
                    }]
                },
                {
                    model : re_schedule_patient,
                    include:[{
                        model : calender
                    }]
                },
                {
                    model : medicine
                },
                {
                    model : feedback
                }
            ]
        });
        
         return res.status(200).json({
            data: data,
            status: true,
            message: "booking detail"
        });
        
    }catch(err)
    {
        err.status = 400;
        next(err);
    }
    
}

//reports
exports.add_report = async(req,res,next)=>{
    
    req.files.forEach( async(element)=>{
        
        await media.create({
            path : element.path ,
            type:"report",
            booking_id : req.body.booking_id
        })
        
    })
    
    
    return res.status(200).json({
            data: [],
            status: true,
            message: "Reports add successfully"
    });
    
}

exports.all_report = async(req,res,next)=>{
    
    try{
        
        const data = await media.findAll({
            where :{ type : "report", booking_id : req.params.id }
        })
        
        return res.status(200).json({
            data: data,
            status: true,
            message: "All reports"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

exports.delete_report = async(req,res,next)=>{
    
    const schema = joi.object({
        id : joi.string().required()
    });
    
    try{
        await schema.validateAsync(req.params);
        
        const data = await media.findOne({
            where :{ id : req.params.id }
        });
        
        if(!data) throw new Error('report not found');
        
        fs.unlinkSync(data.path);
        
        await data.destroy();
        
        return res.status(200).json({
            data: [],
            status: true,
            message: "report deleted successfully"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}
