const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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'); // vadhwanimish20@gmail.com

var FCM = require('fcm-node');
var serverKey = 'AAAAaNeHzGw:APA91bEhukPXs603HZEdyHzdgOARQKnlEHPu4toh2Yns6vPL2WbE3g582jN16lpCWKEOwt0zpu64dUD1BijMGhUZNHIQNZh6tDdzdNFhiDvOkITqGgRvkh73L4UuTZkIwHM8BAYx6Ph_'; 

var fcm = new FCM(serverKey);
const notification = require('./models/NotificationModel');

exports.sendEmail = async (to, subject, data) => {

    const msg = {
        to: to, // Change to your recipient
        from: 'vadhwanimish20@gmail.com',
        subject: subject,
        html: data,
    }

    console.log(to);

    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent');
        })
        .catch((err) => {
            err.status = 404;
            console.log(
                'Emailerror=================' + err
            );
            // next(err);
        });

}

exports.send_notification = async(token,title,body,user_id)=>{

    var message = { 
        to: token, 
        // collapse_key: 'your_collapse_key',
        
        notification: {
            title: title, 
            body: body 
        }
        
    };
    
    await notification.create({
        title : title,
        message : body,
        user_id : user_id
    });
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}