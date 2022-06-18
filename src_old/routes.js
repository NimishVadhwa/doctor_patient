const express = require('express');
const route = express.Router();
const auth = require('./middleware/auth');
const AuthController = require('./controller/AuthController');
const DoctorController = require('./controller/DoctorController');
const PatientController = require('./controller/PatientController');

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
route.get('/verify/email/:id', AuthController.verify_email);

route.post('/auth/login', AuthController.login);
route.post('/auth/admin-login', AuthController.admin_login); // Admin login 
route.post('/auth/register', AuthController.register);
route.post('/auth/forget-password', AuthController.forget_password);
route.post('/auth/change-password', AuthController.change_password);
route.get('/auth/logout', auth, AuthController.logout);

route.get('/user/detail/:id', AuthController.detail); // user detail by id
route.get('/user/user-detail', auth, AuthController.detail_by_token); // user detail by token


route.post('/user/all-list', auth, AuthController.all_list);
route.post('/user/block', auth, AuthController.block_user);
route.post('/user/edit-profile', auth, upload_user.single('image'), AuthController.edit_profile);

//schedule list
route.post('/doctor/add-schedule', auth, DoctorController.add_schedule);

route.post('/doctor/schedule-list', auth, DoctorController.schedule_list_doctor);
route.post('/doctor/schedule-single-date', auth, DoctorController.schedule_by_single_date);

route.post('/doctor/calender', auth, DoctorController.calender);
route.post('/doctor/doctor-list', auth, DoctorController.get_doctor_list);


//holiday
route.post('/doctor/add-holiday', auth, DoctorController.add_holiday);
route.post('/doctor/remove-holiday', auth, DoctorController.remove_holiday);
route.get('/doctor/holiday-list', auth, DoctorController.holiday_list);


// Booking slot
route.post('/booking/time-list', auth, PatientController.time_list);
route.post('/booking/booking', auth, PatientController.booking);
route.post('/booking/cancel', auth, PatientController.cancel_booking);

route.get('/admin/request-list', auth, PatientController.request_list);
route.post('/doctor/doctor-slot-list', auth, DoctorController.get_doctor_slot_list);
route.post('/admin/assign-doctor', auth, PatientController.assign_doctor);

route.post('/doctor/feedback', auth, DoctorController.feedback_booking);

//Re-schedule
route.post('/doctor/apply-re_schedule', auth, DoctorController.apply_reschedule);
route.get('/admin/re_schedule-list', auth, DoctorController.re_schedule_list);
route.post('/admin/re_schedule-confirm', auth, DoctorController.re_schedule_confirm);
route.post('/admin/confirm-re_schedule-booking', auth, PatientController.confirm_reschedule_booking);




module.exports = route;