var nodemailer = require('nodemailer');
var mailerhbs = require('nodemailer-express-handlebars');
var config = require('./config');

var transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
        user: config.username,
        pass: config.password
    }
});

transporter.use('compile', mailerhbs({
    viewPath: 'email-templates',
    extName: '.handlebars'
}));

module.exports = transporter;