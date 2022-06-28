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

let storage_banner = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets/images/banner');
    },
    filename: function (req, file, cb) {
        cb(null, Math.random() + file.originalname);
    }
});

let storage_report = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets/images/report');
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

let upload_banner = multer({
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
    storage: storage_banner
});

let upload_report = multer({
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
    storage: storage_report
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

route.post('/user/all-list', AuthController.all_list);
route.post('/user/block', auth, AuthController.block_user);
route.post('/user/edit-profile', auth, upload_user.single('image'), AuthController.edit_profile);

route.get('/patient/all-doctor-list', auth, PatientController.doctor_list);
route.get('/dotor/all-patient-list', auth, DoctorController.patient_list);

//dashboards
route.get('/auth/dashboard', auth, AuthController.dashboard);
route.get('/auth/all-notification/:id', AuthController.all_notification);
route.post('/auth/send-notification',auth, AuthController.send_notification);

//banner
route.post('/banner/add-banner', auth, upload_banner.array('image',5), AuthController.add_banner);
route.get('/banner/all-banner',  AuthController.all_banner);
route.get('/banner/delete-banner/:id', auth,  AuthController.delete_banner);

//schedule list
route.post('/doctor/check-schedule', auth, DoctorController.check_schedule);
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
route.post('/admin/all-booking', auth, AuthController.all_booking);
route.post('/booking/time-list', auth, PatientController.time_list);
route.post('/booking/booking', auth, PatientController.booking);
route.post('/booking/cancel', auth, PatientController.cancel_booking);
route.get('/admin/request-list', auth, PatientController.request_list);
route.post('/doctor/doctor-slot-list', auth, DoctorController.get_doctor_slot_list);
route.post('/admin/assign-doctor', auth, PatientController.assign_doctor);
route.post('/doctor/feedback', auth, DoctorController.feedback_booking);
route.post('/booking/all-booking', auth, DoctorController.all_booking);
route.get('/patient/all-appointment', auth, PatientController.all_booking);
route.post('/patient/appointment-by-date', auth, PatientController.booking_by_date);
route.get('/admin/booking-detail/:id', auth, DoctorController.booking_detail);
route.post('/booking/patient-feedback', auth, PatientController.patient_feedback);

// Patient Reports 
route.post('/reports/add-report', auth, upload_report.array('image',50), DoctorController.add_report);
route.get('/reports/all-report/:id',  DoctorController.all_report);
route.get('/reports/delete-report/:id', auth,  DoctorController.delete_report);

//question
route.get('/patient/question-list', PatientController.all_questions);
route.post('/patient/add-answer',auth, PatientController.add_user_answer);
route.post('/patient/get-answer',auth, PatientController.get_answer);
route.get('/patient/get-answer/:id', PatientController.get_answer_by_id);

//Re-schedule
route.get('/admin/re_schedule-list-doctor', auth, DoctorController.re_schedule_list_by_doctor);
route.get('/admin/re_schedule-list-patient', auth, PatientController.re_schedule_list_by_patient);

route.post('/doctor/apply-re_schedule-by-slot', auth, DoctorController.apply_reschedule_slot);
route.post('/admin/confirm-re_schedule-doctor', auth, DoctorController.confirm_re_schedule_apply_by_doctor);

route.post('/patient/apply-re_schedule-by-patient', auth, PatientController.apply_re_schedule_patient);
route.post('/admin/confirm-re_schedule-patient', auth, PatientController.confirm_reschedule_apply_by_patient);

route.post('/admin/cancel-re_schedule-patient', auth, PatientController.cancel_re_schedule_patient);
route.post('/admin/cancel-re_schedule-doctor', auth, DoctorController.cancel_re_schedule_doctor);

module.exports = route;