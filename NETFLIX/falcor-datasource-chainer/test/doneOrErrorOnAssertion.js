var AssertionError = require('chai').AssertionError;
module.exports = function doneOrErrorOnAssertion(done) {
    return function(err) {
        if (err instanceof AssertionError) {
            return done(err);
        }
        return done();
    };
};
