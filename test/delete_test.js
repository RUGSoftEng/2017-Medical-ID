var assert = require('assert');
var cleanup = require('./cleanup');
var request = require('request');
var app = require('../app').app;

var cookieJar = request.jar();

function login(email, pass, callback) {
    request({
        url: "http://localhost:" + app.get('port') + "/login",
        jar: cookieJar,
        method: "POST",
        json: true,
        body: {
            'username': email,
            'password': pass
        }
    }, callback);
}

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

function testDelete(pass, callback) {
    app.testCallback = callback;
    request({
        url: "http://localhost:" + app.get('port') + "/delete",
        jar: cookieJar,
        method: "POST",
        json: true,
        body: {
            'password': pass
        }
    });
}

module.exports = function (suite) {
    suite.addBatch({
        'When a user tries to delete their account, but uses a wrong password': {
            topic: function () {
                var callback = this.callback;
                login("a@b.com", "pass", function () {
                    testDelete("pass2", callback);
                });
            },
            'account is not deleted, error message': function (resMsg, flashMsg) {
                cleanup.tryCleanup();
                cleanup.cleanCallback(app);
                assert.isString(resMsg);
                assert.equal(resMsg, '/create');
                assert.isString(flashMsg);
                assert.equal(flashMsg, 'error_msg: Wrong password, try again.');
            }
        }
    }).addBatch({
        'When a user tries to delete their account and inputs the correct password': {
            topic: function () {
                testDelete("pass", this.callback);
            },
            'logged out, success message': function (resMsg, flashMsg) {
                cleanup.tryCleanup();
                cleanup.cleanCallback(app);
                assert.isString(resMsg);
                assert.equal(resMsg, '/login');
                assert.isString(flashMsg);
                assert.equal(flashMsg, 'success_msg: Your account has been deleted.');
            }
        }
    }).addBatch({
        'When a user tries to log in into their deleted account': {
            topic: function () {
                testLogin("a@b.com", "pass", this.callback);
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
