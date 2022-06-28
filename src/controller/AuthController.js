const user = require('../models/UserModel');
const joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const { sendEmail,send_notification } = require('../helper');
const user_profile = require('../models/User_profileModel');
const fs = require('fs');
const clinic = require('../models/ClinicModel');
const media = require('../models/MediaModel');
const booking = require('../models/BookingModel');
const path = require('path')
const ejs = require('ejs');
const calender = require('../models/Calender_dateModel');
const user_anwser = require('../models/UserAnswerModel');
const question = require('../models/QuestionsModel');
const answer = require('../models/AnswerModel');
const re_schedule_patient = require('../models/Re_schedule_patientModel');
const re_schedule = require('../models/Re_scheduleModel');
const feedback = require('../models/feedbackModel');
const medicine = require('../models/MedicineModel');
const notification = require('../models/NotificationModel');

exports.login = async (req, res, next) => {

    const schema = joi.object({
        email: joi.string().required().email(),
        password: joi.string().required(),
        fcm_token: joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        const check = await user.findOne({
            where: { email: req.body.email, type: { [Op.ne]: 'admin' } },
            include:[{
                model : user_anwser,
                limit:1
            },{
                model: user_profile
            }]
        });

        if (!check) throw new Error('Email not found');

        const passcheck = bcrypt.compareSync(req.body.password, check.password);

        if (!passcheck) throw new Error('password not matched');

        // const data = `<strong> 1234 is your OTP for forget password </strong>`;
        // await sendEmail(check.email, 'Forget password OTP', data);

        if (check.is_activated == '0') throw new Error('Please verify the email');

        if (check.is_block == '1') throw new Error('You were blocked by admin');

        const token = jwt.sign(
            { email: check.email, userId: check.id, type: check.type },
            process.env.AUTH_KEY
        );

        check.token = token;
        check.fcm_token = req.body.fcm_token;
        check.save();

        return res.status(200).json({
            data: check,
            status: true,
            message: "login successfully"
        });

    } catch (err) {
        err.status = 404;
        next(err);
    }

}

exports.admin_login = async (req, res, next) => {

    const schema = joi.object({
        email: joi.string().required().email(),
        password: joi.string().required(),
        fcm_token: joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        const check = await user.findOne({
            where: { email: req.body.email , type:'admin' }
        });

        if (!check) throw new Error('Email not found');

        const passcheck = bcrypt.compareSync(req.body.password, check.password);

        if (!passcheck) throw new Error('password not matched');

        const token = jwt.sign(
            { email: check.email, userId: check.id, type : check.type },
            process.env.AUTH_KEY
        );

        check.token = token;
        check.fcm_token = req.body.fcm_token;
        check.save();

        return res.status(200).json({
            data: check,
            status: true,
            message: "Admin login successfully"
        });

    } catch (err) {
        err.status = 404;
        next(err);
    }

}

exports.register = async (req, res, next) => {

    const schema = joi.object({
        first_name: joi.string().required(),
        last_name: joi.string().required(),
        email: joi.string().required().email(),
        password: joi.string().allow(''),
        phone: joi.number().required(),
        gender: joi.string().required().valid('Male', 'Female', 'other'),
        type: joi.string().required().valid('patient','doctor')
    });

    try {
        await schema.validateAsync(req.body);

        const check = await user.findOne({ where: { email: req.body.email } });

        if (check) throw new Error('Email already exists');

        const u_id = await user.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            password: await bcrypt.hash(req.body.password, 12),
            type: req.body.type
        });

        await user_profile.create({
                user_id : u_id.id,
                gender : req.body.gender
        });

        let data = await ejs.renderFile(path.join(__dirname, "../views/verify.ejs"),{
            link: 'https://afrad.arabboard.org/api/verify/email/' + u_id.id
        });

        if(req.body.type == 'doctor')
        {
            const alpha = Math.random().toString(36).substr(2, 6) ;
            
            u_id.password = await bcrypt.hash(alpha, 12);
            await u_id.save();

            data = await ejs.renderFile(path.join(__dirname, "../views/doctor_register.ejs"), {
                email: req.body.email,
                pass: alpha,
                link:'https://afrad.arabboard.org/api/verify/email/'+u_id.id
            });

        }

        
        await sendEmail(req.body.email, 'verify email', data);

        return res.status(200).json({
            data: [],
            status: true,
            message: "Register successfully"
        });


    } catch (err) {
        err.status = 404;
        next(err);
    }

}

exports.detail = async (req, res, next) => {

    const data = await user.findOne({
        where: { id: req.params.id },
        include:[{
            model:user_profile
        },
        {
            model : re_schedule_patient,
            as : "patient_data",
            include:[{
                model :booking
            },{
                model :calender
            }]
        },
        {
            model : re_schedule,
            include:[{
                model :booking
            },{
                model  :calender
            }]
        },
        {
            model :booking,
            as : "patient",
            include:[{
                model :calender
            },{
                model : medicine
            },{
                model :feedback
            }]
        }
        ]
    });

    return res.status(200).json({
        data: data,
        status: true,
        message: "Detail"
    });

}

exports.detail_by_token = async (req, res, next) => {

    const data = await user.findOne({
        where: { id: req.user_id },
        include: [{
            model: user_profile
        },{
            model : user_anwser,
            include:[{
                model : question
            },{
                model : answer
            }]
        }]
    });

    return res.status(200).json({
        data: data,
        status: true,
        message: "User Detail"
    });

}

exports.forget_password = async (req, res, next) => {

    const schema = joi.object({
        email: joi.string().required().email()
    })

    try {

        await schema.validateAsync(req.body);

        const emailcheck = await user.findOne({
            where: { email: req.body.email }
        });

        if (!emailcheck) throw new Error('Email not found');

        const otp = Math.floor(Math.random() * (9999 - 999) + 999);

        let data = await ejs.renderFile(path.join(__dirname, "../views/forget.ejs"), {
            otp: otp
        });


        await sendEmail(emailcheck.email, 'Forget password OTP', data);
        
        return res.status(200).json({
            data: otp,
            status: true,
            message: "Otp for the user"
        });

    } catch (err) {
        err.status = 404;
        next(err);
    }

}

exports.change_password = async (req, res, next) => {

    const schema = joi.object({
        email: joi.string().required().email(),
        password: joi.string().required()
    });

    try {
        await schema.validateAsync(req.body);

        const emailcheck = await user.findOne({
            where: { email: req.body.email }
        });

        if (!emailcheck) throw new Error('Email not found');

        emailcheck.password = await bcrypt.hash(req.body.password, 12)
        emailcheck.save();

        return res.status(200).json({
            data: [],
            status: true,
            message: "Password change successfully"
        });

    } catch (err) {
        err.status = 404;
        next(err);
    }

}

exports.logout = async (req, res, next) => {

    await user.update({ token: null}, {
        where: {
            id: req.user_id
        }
    });

    return res.status(200).json({
        data: [],
        status: true,
        message: "Logout successfully"
    });

}

exports.all_notification = async(req,res,next)=>{
    
    const schema = joi.object({
        id: joi.string().required()
    });
    
    try{
        
        await schema.validateAsync(req.params);
        
        await notification.update({
            status : 'read'
        },{
            where :{ user_id : req.params.id }
        })
        
        const data = await notification.findAll({
            where :{ user_id : req.params.id },
            order:[ ['id','DESC'] ]
        });
        
         return res.status(200).json({
            data: data,
            status: true,
            message: "All notification"
        });
        
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

exports.send_notification = async(req,res,next)=>{
    
    const schema = joi.object({
        title : joi.string().required(),
        message : joi.string().required(),
        type : joi.string().required().valid('patient','doctor','all')
    });
    
    try{
        await schema.validateAsync(req.body);
        
        let where = {
           type : req.body.type
        }
        
        if( req.body.type == 'all' ){  where = { type : { [Op.ne]: 'admin' } } }
       
        
        const data = await user.findAll({
            where,
        });
        
        
        data.forEach( async(element)=>{
            if(element.fcm_token)
            {
                await send_notification(element.fcm_token,req.body.title,req.body.message,element.id)    
            }
        })
        
        return res.status(200).json({
            data: [],
            status: true,
            message: "notification send successfully"
        });
        
        
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

exports.all_list = async (req, res, next) => {

    const schema = joi.object({
        type: joi.string().required().valid('patient', 'doctor')
    });

    try {

        await schema.validateAsync(req.body);

        const data = await user.findAll({ 
            where: { type: req.body.type },
            include:[{
                model : user_profile
            }]
            
        });

        return res.status(200).json({
            data: data,
            status: true,
            message: "List"
        });

    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.block_user = async (req, res, next) => {

    const schema = joi.object({
        user_id : joi.number().required(),
        block : joi.string().required().valid('1','0')
    })

    try {

        await schema.validateAsync(req.body);

        const data = await user.findOne({ where : { id : req.body.user_id } });

        if(!data) throw new Error('User not found');

        data.is_block = req.body.block;
        await data.save();
        
        if(req.body.block == '1')
        {
            await send_notification(data.fcm_token,'Blocked','Admin blocked you',data.id)
        }
        else{
            await send_notification(data.fcm_token,'Un-blocked','Admin unblocked you',data.id)
        }

        return res.status(200).json({
            data: data,
            status: true,
            message: "successfull"
        });
        
    } catch (err) {
        err.status = 400;
        next(err);
    }

}

exports.edit_profile = async(req,res,next)=>{

    const schema = joi.object({
        age: joi.string().allow(null),
        address: joi.string().allow(null),
        first_name: joi.string().required(),
        last_name: joi.string().required(),
        specility : joi.string().allow(null),
        experience : joi.string().allow(null),
        education: joi.string().allow(null),
        qualification: joi.string().allow(null),
        gender : joi.string().required().valid('Male','Female','other'),
        user_id : joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        const check = await user.findOne({
            where : { id : req.body.user_id }
        });

        if(!check) throw new Error('user not found');

        check.first_name = req.body.first_name;
        check.last_name = req.body.last_name;

        if(req.file)
        {
            if(check.image){
              fs.unlinkSync(check.image);  
            } 
            check.image = req.file.path;
            await check.save();
        }

        await user_profile.update({
            age:req.body.age,
            address : req.body.address,
            gender : req.body.gender,
            specility : req.body.specility,
            experience : req.body.experience,
            education : req.body.education,
            qualification: req.body.qualification
        },{
            where : {user_id : req.body.user_id}
        });

        await send_notification(check.fcm_token,'Profile update','Your profile has been updated',check.id)

        return res.status(200).json({
            data: [],
            status: true,
            message: "User profile updated"
        });

    } catch (err) {

        if(req.file)
        {
            fs.unlinkSync(req.file.path);

        }

        err.status = 400;
        next(err);
    }

}
 
exports.verify_email = async (req, res, next) => {

    const data = await user.update({
        is_activated : '1'
    },{ where : { id :req.params.id  } })

     return res.render( path.join(__dirname, "../views/successfull.ejs") );
    
    // return res.send('Verify successfully');

}

exports.dashboard = async(req,res,next)=>{
    
    try{
        
        //patient
        const new_patient = await user.findAll({
            where :{ type : "patient" },
            order:[
                ['id','DESC']
                ],
            limit : 5
        });
        const total_patient = await user.count({ where :{  type : "patient"  } });
        
        //doctor
        const new_doctor = await user.findAll({
            where :{ type : "doctor" },
            order:[
                ['id','DESC']
                ],
            limit : 5
        });
        const total_doctor = await user.count({ where :{  type : "doctor"  } });
        
        //booking
        const total_booking = await booking.count();
        const total_accepted_booking = await booking.count({ where : { status : ["accepted"] } });
        const total_cancel_booking = await booking.count({ where : { status : "cancel" } });
        const total_reject_booking = await booking.count({ where : { status : "reject" } });
        const total_pending_booking = await booking.count({ where : { status : "pending" } });
        const total_re_schedule_pending_booking = await booking.count({
            where : { status : "re_schedule_pending" },
        });
        const assign_booking = await booking.findAll({
            where : { status : ["accepted"], doctor_id: {[Op.ne]: null } },
            order:[
                ['id','DESC']
                ],
            limit : 5,
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
                model : calender
            }]
        })
        
        // const booking_chart = await booking.findAll({
        //      group: [sequelize.fn('date_trunc', 'month', sequelize.col('created_at'))]
        // })
        
        const noti = await notification.findAll({
            where :{ user_id : '1',status :'un_read' },
            order:[ ['id','DESC'] ],
            limit : 5
        })
        
        const data = {};
        
        data.new_patient = new_patient;
        data.new_doctor = new_doctor;
        data.assign_booking = assign_booking;
        data.total_patient = total_patient;
        data.total_doctor = total_doctor;
         
        //booking
        data.total_booking = total_booking;
        data.total_accepted_booking = total_accepted_booking;
        data.total_cancel_booking = total_cancel_booking;
        data.total_re_schedule_pending_booking = total_re_schedule_pending_booking;
        data.total_reject_booking = total_reject_booking;
        data.total_pending_booking = total_pending_booking;
        // data.booking_chart = booking_chart;
        
        
        data.notification = noti;
        
        return res.status(200).json({
            data: data,
            status: true,
            message: "Admin dashboard"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

exports.all_booking = async(req,res,next)=>{
    
    const schema = joi.object({
        status : joi.string().required().valid('all','accepted','reject','pending','cancel')
    })
    
    try{
    
        await schema.validateAsync(req.body)
        
        let where = {
           status : req.body.status
        }
        
        if( req.body.status == 'all' ){  where = ''; }
       
        const data = await booking.findAll({
            where,
            order:[['id','DESC']],
            include: [{
                    model: user,
                    as:"patient"
                },
                {
                    model: user,
                    as:"doctor"
                },
                {
                    model : calender
                }]
        });
        
        return res.status(200).json({
            data: data,
            status: true,
            message: "All booking list"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

exports.add_banner = async(req,res,next)=>{
    
    req.files.forEach( async(element)=>{
        
        await media.create({
            path : element.path ,
            type:"banner"
        })
        
    })
    
    
    return res.status(200).json({
            data: [],
            status: true,
            message: "Banner add successfully"
    });
    
}

exports.all_banner = async(req,res,next)=>{
    
    try{
        
        const data = await media.findAll({
            where :{ type : "banner" }
        })
        
        return res.status(200).json({
            data: data,
            status: true,
            message: "All banners"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}

exports.delete_banner = async(req,res,next)=>{
    
    const schema = joi.object({
        id : joi.string().required()
    });
    
    try{
        await schema.validateAsync(req.params);
        
        const check = await media.count({
            where :{ type:"banner" }
        });
        
        if(check == '1') throw new Error('Cannot delete the banner');
        
        const data = await media.findOne({
            where :{ id : req.params.id }
        });
        
        if(!data) throw new Error('Banner not found');
        
        fs.unlinkSync(data.path);
        
        await data.destroy();
        
        return res.status(200).json({
            data: [],
            status: true,
            message: "banner deleted successfully"
        });
        
    }catch(err){
        err.status = 400;
        next(err);
    }
    
}
