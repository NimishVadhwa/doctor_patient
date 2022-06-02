const express = require('express');
const route = express.Router();
const auth = require('./middleware/auth');
const AuthController = require('./controller/AuthController');
const DoctorController = require('./controller/DoctorController');
const multer = require('multer');

let storage_user = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets/images/user');
    },
    filename: function (req, file, cb) {
        cb(null, Math.random() + file.originalname);
    }
});

let imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

let upload_user = multer({
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
    storage: storage_user
});

//auth 
route.post('/auth/login', AuthController.login);
route.post('/auth/admin-login', AuthController.admin_login); // Admin login 
route.post('/auth/register', AuthController.register);
route.post('/auth/forget-password', AuthController.forget_password);
route.post('/auth/change-password', AuthController.change_password);
route.get('/auth/logout', auth, AuthController.logout);

route.get('/user/detail', auth, AuthController.detail); // user detail

route.post('/user/all-list', auth, AuthController.all_list);
route.post('/user/block', auth, AuthController.block_user);

route.post('/doctor/add-schedule', auth, DoctorController.add_schedule);
route.get('/doctor/schedule-list/:id', auth, DoctorController.schedule_list_doctor);
route.post('/doctor/schedule-date', auth, DoctorController.schedule_by_date);

route.post('/user/edit-profile', auth, upload_user.single('image'), AuthController.edit_profile);



module.exports = route;