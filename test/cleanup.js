module.exports = {
    'callNum': 1, // calls of tryCleanup until cleanupFunc is called
    'cleanupFunc': null,
    'init': function (callNum, cleanupFunc) {
        this.callNum = callNum;
        this.cleanupFunc = cleanupFunc;
    },
    'tryCleanup': function () {
        --this.callNum;
        if (this.callNum == 0)
            this.cleanupFunc();
    },
    'cleanCallback': function (app) {
        app.testCallback = function () {};
    }
};
