const joi = require('joi');
const user = require('../models/UserModel');
const schedule = require('../models/SchdeuleModel');
const calender = require('../models/Calender_dateModel');
const booking = require('../models/BookingModel');
const user_profile = require('../models/User_profileModel');
const re_schedule = require('../models/Re_scheduleModel');
const question = require('../models/QuestionsModel');
const answer = require('../models/AnswerModel');
const user_anwser = require('../models/UserAnswerModel');
const re_schedule_patient = require('../models/Re_schedule_patientModel');
const { Op } = require("sequelize");
const { send_notification } = require('../helper');

//booking
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

exports.all_booking = async(req,res,next)=>{
    
    try{
        
        const data = await booking.findAll({
            where :{ user_id : req.user_id },
            include:[{
                model : user,
                as: "doctor",
                include :[{
                    model : user_profile
                }]
            },
            {
                model : user,
                as: "patient"
            },
            {
                model : schedule
            },
            {
                model : calender
            },{
                model : re_schedule_patient
            }]
        });
        
        return res.status(200).json({
            data: data,
            status: true,
            message: "All appoitment of patient"
        });
        
    }
    catch(err){
        err.status = 400;
        next(err);
    }
    
}

exports.booking_by_date = async(req,res,next)=>{
    
     const schema = joi.object({
        patient_id: joi.number().required(),
        date: joi.string().required(),
    });

    try {
        await schema.validateAsync(req.body);

        let dta = new Date(req.body.date);

        let row = await calender.findOne({ where: { date: dta.toISOString().split('T')[0] } });

        const data = await booking.findAll({
            where :{ user_id : req.body.patient_id, calender_id : row.id },
            include:[{
                model : user,
                as: "doctor",
                include :[{
                    model : user_profile
                }]
            },
            {
                model : user,
                as: "patient"
            },
            {
                model : schedule
            },
            {
                model : calender
            }]
        });


        return res.status(200).json({
            data: data,
            status: true,
            message: "appoitment list by date successfully"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }
    
}

exports.booking = async (req, res, next) => {

    const schema = joi.object({
        date : joi.string().required(),
        start_time : joi.string().required(),
        end_time : joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        let dta = new Date(req.body.date);
        
        const [row, created] = await calender.findOrCreate({
            where: { date: dta.toISOString().split('T')[0] },
            defaults: {
                date: dta.toISOString().split('T')[0],
                year: dta.getFullYear(),
                month: dta.getMonth() + 1
            }
        });

        await booking.create({
            start_time : req.body.start_time,
            end_time : req.body.end_time,
            status : 'pending',
            calender_id :row.id,
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

exports.cancel_booking = async(req, res, next)=>{
    
    const schema = joi.object({
        reason : joi.string().required(),
        booking_id : joi.number().required()
    });

    try {
        await schema.validateAsync(req.body);

        const data = await booking.findOne({
            where : { id:req.body.booking_id }
        });
        
        await schedule.update({
            status : "0"
        },{
            where :{ id : data.sch_id }
        })

        data.status = 'cancel';
        data.reason = req.body.reason;
        
        await data.save();

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

exports.request_list = async (req, res, next) => {

    try {

        const data = await booking.findAll({
            where :{ status :'pending' },
            include:[{
                model:user,
                as:"patient"
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
        doctor_id : joi.number().allow(null),
        status : joi.string().required(),
        slot_id : joi.number().allow(null),
        booking_id : joi.number().required(),
        reason:joi.string().allow(null)
    });

    try {
        await schema.validateAsync(req.body);

        if(req.body.reason)
        {
            await booking.update({
                status : req.body.status,
                reason:req.body.reason,
            },{where : { id : req.body.booking_id } })
            
            return res.status(200).json({
                data: [],
                status: true,
                message: "Reject Successfull"
            });
        }

        const check = await schedule.findOne({
            where :{ id: req.body.slot_id },
            include:[{
                model : booking
            }]
        })

        if(!check) throw new Error('Schedule/ slot not found');
        
        if(req.body.slot_id)
        {
            await schedule.update({
                status : "1"
            },{
                where : { id: req.body.slot_id }
            })
        }

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

exports.patient_feedback = async(req,res,next)=>{
    
    const schema = joi.object({
        booking_id : joi.number().required(),
        feedback : joi.string().required(),
        rating : joi.number().required(),
        doctor_id : joi.number().required()
    });
    
    try{
        await schema.validateAsync(req.body);
        
        await booking.update({
            rating : req.body.rating,
            feedback : req.body.feedback
        },{
            where : { id : req.body.booking_id }
        });
        
        const data = await booking.findAll({
            where : { doctor_id : req.body.doctor_id }
        });
        
        let i = 0;
        let r = 0;
        data.forEach( async(element)=>{
            
            if(element.rating){
                i += 1;
                r += element.rating
            }   
            
        })
        
        let avg = r/i;
        
        await user.update({ rating : avg },{
            where : {id : req.body.doctor_id }
        })
        
        
        return res.status(200).json({
            data: [],
            status: true,
            message: "feedback given Successfull"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

//Re-schdule
exports.re_schedule_list_by_patient = async (req, res, next) => {

    try {
        
        const data = await booking.findAll({
            where: { status : "re_schedule_pending", is_doctor_apply :'0' },
             include:[{
                    model :calender
                },{
                    model :user,
                    as:"patient"
                },
                {
                    model : re_schedule_patient,
                    where : { status : "pending" },
                    include:[{
                        model : calender
                    }]
                }]
        })

        return res.status(200).json({
            data: data,
            status: true,
            message: "Re-schdule apply list of patient"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.apply_re_schedule_patient = async (req, res, next) => {

    const schema = joi.object({
        date : joi.string().required(),
        start_time : joi.string().required(),
        end_time : joi.string().required(),
        booking_id : joi.number().required()
    });

    try {

        await schema.validateAsync(req.body);

        let dta = new Date(req.body.date);
        
        const [row, created] = await calender.findOrCreate({
            where: { date: dta.toISOString().split('T')[0] },
            defaults: {
                date: dta.toISOString().split('T')[0],
                year: dta.getFullYear(),
                month: dta.getMonth() + 1
            }
        });

        const check = await booking.findOne({
            where :{ id: req.body.booking_id }
        });
        
        if(!check) throw new Error('Booking not found');
        
        await re_schedule_patient.create({
            start_time : req.body.start_time,
            end_time : req.body.end_time,
            status : 'pending',
            calender_id : row.id,
            user_id : req.user_id,
            booking_id : req.body.booking_id,
            doctor_id : check.doctor_id,
            schedule_id : check.sch_id
        });

        await booking.update({ status : "re_schedule_pending", is_doctor_apply:'0' },{
            where : { id: req.body.booking_id }
        })
        
        return res.status(200).json({
            data: [],
            status: true,
            message: "Re-schedule apply successfully"
        });

    } catch (err) {
        err.status= 400;
        next(err);
    }

}

exports.confirm_reschedule_apply_by_patient = async(req, res, next)=>{

    const schema = joi.object({
        booking_id : joi.number().required(),
        rs_schdule_id : joi.number().required(),
        doctor_id : joi.number().required(),
        sch_id : joi.number().required(),
    });

    try {

        await schema.validateAsync(req.body);

        const check = await booking.findOne({
            where : { id : req.body.booking_id }
        });
        
        if(!check) throw new Error('Booking is not found');
        
        let st = check.start_time;
        let et = check.end_time;
        let cal = check.calender_id;
        
        const re_data = await re_schedule_patient.findOne({
            where :{ id : req.body.rs_schdule_id }
        });
        
        check.start_time = re_data.start_time;
        check.end_time = re_data.end_time;
        check.calender_id = re_data.calender_id;
        check.sch_id  = req.body.sch_id ;
        check.doctor_id  = req.body.doctor_id ;
        check.status = "accepted";
        await check.save();
        
        re_data.start_time = st;
        re_data.end_time = et;
        re_data.calender_id = cal;
        re_data.status = "accept"
        await re_data.save();

        return res.status(200).json({
            data: [],
            status: true,
            message: "Re-schedule accept Successfully of patient"
        });

    } catch (err) {
        console.log(err);
        err.status =400;
        next(err);
    }

}

exports.cancel_re_schedule_patient = async(req,res,next)=>{
    
    const schema = joi.object({
        re_schedule_id : joi.number().required(),
        booking_id : joi.number().required(),
        reason: joi.string().required()
    });
    
    try{
        await schema.validateAsync(req.body);
       
        const dt = await re_schedule_patient.update({
            reason : req.body.reason,
            status :"cancel"
        },{
            where :{ id : req.body.re_schedule_id }
        });
       
        await booking.update({
            status : "accepted"
        },{
            where : { id : req.body.booking_id }
        });
       
        return res.status(200).json({
            data: [],
            status: true,
            message: "Re-schedule cancel Successfully of patient"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

// questions
exports.all_questions = async(req,res,next)=>{
    
    try{
        
        const data = await question.findAll({
            include:[{
                model : answer
            }]
        });
        
        return res.status(200).json({
            data: data,
            status: true,
            message: "Questions with all options"
        });
        
    }
    catch(err){
        err.status = 500;
        next(err);
    }
    
}

exports.add_user_answer = async(req,res,next)=>{
    
    const schema = joi.object({
        column: joi.array().required()
    })

    try {
        
        await schema.validateAsync(req.body);

        req.body.column.forEach( async(element)=>{
            await user_anwser.create({
                user_id : req.user_id,
                answer_id : element.answer_id,
                question_id : element.question_id
            });
        });

        

        return res.status(200).json({
            data: [],
            status: true,
            message: "Answer add successfully"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

    
}

exports.get_answer = async(req,res,next)=>{

    try {

        const data = await user_anwser.findAll({
            where : { user_id  : req.user_id },
            include:[{
                model : question
            },
            {
                model : answer
            }]
        })

        return res.status(200).json({
            data: data,
            status: true,
            message: "All answers of the patient"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

    
}

exports.get_answer_by_id = async(req,res,next)=>{

    try {

        const data = await user_anwser.findAll({
            where : { user_id  : req.params.id },
            include:[{
                model : question
            },
            {
                model : answer
            }]
        })

        return res.status(200).json({
            data: data,
            status: true,
            message: "All answers of the patient"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

    
}


exports.doctor_list = async(req,res,next)=>{
    
    try{
        
        const data = await booking.findAll({
            where : { 
                user_id : req.user_id, 
                doctor_id: {
                    [Op.ne]: null 
                }
            }
        });
        
        let arr= [];
        
        data.forEach(element=>{
            
            if(arr.indexOf(element.doctor_id))
            {
                arr.push( element.doctor_id )
            }
            
        });
        
        const dta = await user.findAll({
            where : { id : arr },
            include:[{
                model :user_profile
            }]
        })
        
         return res.status(200).json({
            data: dta,
            status: true,
            message: "All doctor list of the patient"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}
