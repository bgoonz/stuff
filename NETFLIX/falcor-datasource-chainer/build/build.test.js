var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

require('./build.style');

// Before running coverage, fix the linting issues.
gulp.task('test-coverage', ['jscs', 'lint'], function testCoverage(cb) {
    gulp.src(['./src/**/*.js']).
        pipe(istanbul()).
        pipe(istanbul.hookRequire()).
        on('finish', function onFinish() {
            gulp.src(['./test/index.js']).
                pipe(mocha()).
                pipe(istanbul.writeReports()).
                on('end', cb);
        });
});

