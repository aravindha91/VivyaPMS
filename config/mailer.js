/*
* Author: Jayamrugan L
* Page: Third party email configuration and send email
* Description: Send any email
*/

var nodemailer = require('nodemailer');
var mail = function () { }
mail.Send = function (to, subject, msg) {
    // email configuration
    var transporter = nodemailer.createTransport({
        host: '',
        post: 465,
        secure: false,
        auth: {
            user: '',
            pass: ''
        }, tls: {
            rejectUnauthorized: false
        }
    });
    // dynamically modify the email option like to address, subject, messsage
    var mailOptions = {
        from: '"name" <mail@mail.com>',
        to: to,
        subject: subject,
        html: msg
    };
    // send email
    transporter.sendMail(mailOptions, function (error, info) {
        // return info;
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = mail;