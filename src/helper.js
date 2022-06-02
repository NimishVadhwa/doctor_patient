const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey('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');
sgMail.setApiKey('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');


exports.sendEmail = async (to, subject, data) => {

    const msg = {
        to: to, // Change to your recipient
        from: 'website@transform.vc',
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