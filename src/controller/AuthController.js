const user = require('../models/UserModel');
const joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const { sendEmail } = require('../helper');
const user_profile = require('../models/User_profileModel');
const fs = require('fs');

exports.login = async (req, res, next) => {

    const schema = joi.object({
        email: joi.string().required().email(),
        password: joi.string().required(),
        fcm_token: joi.string().required()
    });

    try {

        await schema.validateAsync(req.body);

        const check = await user.findOne({
            where: { email: req.body.email, type: { [Op.ne]: 'admin' } }
        });

        if (!check) throw new Error('Email not found');

        const passcheck = bcrypt.compareSync(req.body.password, check.password);

        if (!passcheck) throw new Error('password not matched');

    //     const data = `<strong> 1234 is your OTP for forget password </strong>`;
    //    await sendEmail(check.email, 'Forget password OTP', data);

        if (check.is_activated == '0') throw new Error('Please verify the email');


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
                user_id : u_id.id
        });

        if(req.body.type == 'doctor')
        {
            const alpha = Math.random().toString(36).substr(2, 5) ;
            
            u_id.ppassword = await bcrypt.hash(alpha, 12);
            await u_id.save();

        }

        // const data = `<strong>${otp} is your OTP for forget password </strong>`;
        // await sendEmail(emailcheck.email, 'Forget password OTP', data);

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
        where: { id: req.user_id },
        include:[{
            model:user_profile
        }]
    });

    return res.status(200).json({
        data: data,
        status: true,
        message: "Detail"
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

        // const data = `<strong>${otp} is your OTP for forget password </strong>`;
        // await sendEmail(emailcheck.email, 'Forget password OTP', data);


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

exports.all_list = async (req, res, next) => {

    const schema = joi.object({
        type: joi.string().required().valid('patient', 'doctor')
    });

    try {

        await schema.validateAsync(req.body);

        const data = await user.findAll({ where: { type: req.body.type } });

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
        age:joi.number().required(),
        address : joi.string().required(),
        specility : joi.string().allow(null),
        experience : joi.string().allow(null),
        education: joi.string().allow(null),
        qualification: joi.string().allow(null),
        gender : joi.string().required().valid('Male','Female','other')
    });

    try {

        await schema.validateAsync(req.body);

        const check = await user.findOne({
            where : { id : req.user_id }
        });

        if(!check) throw new Error('user not found');

        if(req.file)
        {
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
            where : {user_id : req.user_id}
        });

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
 
