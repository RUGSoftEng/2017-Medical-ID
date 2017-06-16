var vows = require('vows');
var mongoose = require('mongoose');
var serverSettings = require('../serverSettings.js');
var cleanup = require('./cleanup');

serverSettings.parameters.db = 'mongodb://localhost/loginapp';

// middleware for testing res and req objects
serverSettings.parameters.test = function (req, res, next) {
    req.flashMsg = '';
    req.flash = function (type, msg) {
        this.flashMsg = type + ": " + msg;
    };
    res.req = req;
    res.oldRender = res.render;
    res.oldRedirect = res.redirect;
    res.render = function (msg, obj) {
        app.testCallback(msg, this.req.flashMsg, obj);
        this.oldRender(msg, obj);
    }
    res.redirect = function (msg) {
        app.testCallback(msg, this.req.flashMsg);
        this.oldRedirect(msg);
    };
    next();
};

var serverApp = require('../app');
var app = serverApp.app;
var server = serverApp.server;
var address = "http://localhost:" + app.get('port');

var register_tests = require('./register_test');
var login_tests = require('./login_test');
var edit_fields_tests = require('./edit_fields_test');
var change_code_tests = require('./change_code_test');
var delete_tests = require('./delete_test');

/* prepare cleanup, pass the exact number of tests (callbacks to wait on) as the first argument;
 * require cleanup.js in the test files and call tryCleanup on it in every test before asserting */
cleanup.init(13, function () {
    console.log('Cleaning up...');
    server.close();
    mongoose.disconnect();
});

var suite = vows.describe('Testing');

/* testing modules add batches to the suite object (order is important):
 * note: batches are executed sequancially, tests within the same batch are executed asynchronously
 * warning: tests that use app.testCallback must be in different batches */
register_tests(suite);
login_tests(suite);
edit_fields_tests(suite);
change_code_tests(suite);
delete_tests(suite);

suite.export(module);
