var assert = require('assert');
var cleanup = require('./cleanup');
var request = require('request');
var app = require('../app').app;

function testRegister(name, email, pass1, pass2, callback) {
    app.testCallback = callback;
    request({
        url: "http://localhost:" + app.get('port') + "/register",
        method: "POST",
        json: true,
        body: {
            'name': name,
            'email': email,
            'password': pass1,
            'password2': pass2
        }
    });
}

module.exports = function (suite) {
    suite.addBatch({
        'When a new user signs up': {
            topic: function () {
                testRegister("a", "a@b.com", "pass", "pass", this.callback);
            },
            'account created and success message': function (resMsg, flashMsg) {
                cleanup.tryCleanup();
                cleanup.cleanCallback(app);
                assert.isString(resMsg);
                assert.equal(resMsg, '/login');
                assert.isString(flashMsg);
                assert.equal(flashMsg, 'success_msg: A verification e-mail has been sent to you');
            }
        }
    }).addBatch({
        'When a user tries to sign up with an existing e-mail': {
            topic: function () {
                testRegister("a", "a@b.com", "pass", "pass", this.callback);
            },
            'no new account created, error message': function (resMsg, flashMsg) {
                cleanup.tryCleanup();
                cleanup.cleanCallback(app);
                assert.isString(resMsg);
                assert.equal(resMsg, '/login');
                assert.isString(flashMsg);
                assert.equal(flashMsg, 'error_msg: Email address is already in use');
            }
        }
    });
};
