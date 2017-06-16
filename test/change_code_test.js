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

function getCode(callback) {
    request({
        url: "http://localhost:" + app.get('port') + "/save/code",
        jar: cookieJar,
        method: "GET",
        json: true
    }, function (error, response, body) {
        callback(body);
    });
}

function changeCode(callback) {
    request({
        url: "http://localhost:" + app.get('port') + "/newcode",
        jar: cookieJar,
        method: "GET",
        json: true
    }, callback);
}

module.exports = function (suite) {
    suite.addBatch({
        'When a user requests a new code': {
            topic: function () {
                var callback = this.callback;
                login("a@b.com", "pass", function () {
                    getCode(function (codes1) {
                        changeCode(function () {
                            getCode(function (codes2) {
                                callback(codes1, codes2);
                            });
                        });
                    });
                });
            },
            'they receive a different code': function (codes1, codes2) {
                cleanup.tryCleanup();
                assert.notEqual(codes1.code, codes2.code);
                assert.notEqual(codes1.qr, codes2.qr);
            }
        }
    });
};
