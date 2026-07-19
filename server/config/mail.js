const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify(function(error){
    if(error){
        console.log(error);
    }else{
        console.log("SMTP Ready");
    }
});

module.exports = transporter;