module.exports = function doneOrErrorOnThrow(fn, done) {
    return function() {
        try {
            fn();
        } catch (e) {
            return done(e);
        }
        return done();
    };
};
