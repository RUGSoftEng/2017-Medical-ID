var assert = require('assert');
var cleanup = require('./cleanup');
var request = require('request');
var app = require('../app').app;

function testLogin(email, pass, callback) {
    app.testCallback = callback;
    request({
        url: "http://localhost:" + app.get('port') + "/login",
        method: "POST",
        json: true,
        body: {
            'username': email,
            'password': pass
        }
    });
}

module.exports = function (suite) {
    suite.addBatch({
        'When a user tries to log in with correct credentials': {
            topic: function () {
                testLogin("a@b.com", "pass", this.callback);
            },
            'logged in, redirected to /create': function (resMsg, flashMsg) {
                cleanup.tryCleanup();
                cleanup.cleanCallback(app);
                assert.isString(resMsg);
                assert.equal(resMsg, '/create');
                assert.isString(flashMsg);
                assert.equal(flashMsg, '');
            }
        }
    }).addBatch({
        'When a user tries to log in with non-existent e-mail': {
            topic: function () {
                testLogin("b@b.com", "pass", this.callback);
            },
            'not logged in, error message': function (resMsg, flashMsg) {
                cleanup.tryCleanup();
                cleanup.cleanCallback(app);
                assert.isString(resMsg);
                assert.equal(resMsg, '/login');
                assert.isString(flashMsg);
                assert.equal(flashMsg, 'error_msg: Login failed: invalid username/password.');
            }
        }
    }).addBatch({
        'When a user tries to log in with wrong password': {
            topic: function () {
                testLogin("a@b.com", "pass2", this.callback);
            },
            'not logged in, error message': function (resMsg, flashMsg) {
                cleanup.tryCleanup();
                cleanup.cleanCallback(app);
                assert.isString(resMsg);
                assert.equal(resMsg, '/login');
                assert.isString(flashMsg);
                assert.equal(flashMsg, 'error_msg: Login failed: invalid username/password.');
            }
        }
    });
};
