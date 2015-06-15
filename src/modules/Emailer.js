var Emailer = function() {
    "use strict";
    /* eslint-env node */

    var nodemailer = require("nodemailer");

    function sendEmail(params, success) {
        var transporter = nodemailer.createTransport();
        transporter.sendMail({
            from: params.from,
            to: params.to,
            subject: params.subject,
            text: params.text,
            attachments: params.attachments
        }, success);
    }

    return {
        sendEmail: sendEmail
    };

};

module.exports = Emailer;
