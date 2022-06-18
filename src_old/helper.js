const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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'); // vadhwanimish20@gmail.com

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