var gulp = require('gulp');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');
var src = [
    './src/**/*.js'
];
var build = [
    './build/**/*.js',
    './gulpfile.js'
];
var test = [
    './test/**/*.js'
];

gulp.task('jscs', function _jscs() {
    // style does not apply to test files, but lint does.
    return gulp.src(
            src.
                concat(build)).
        pipe(jscs()).
        pipe(jscs.reporter()).
        pipe(jscs.reporter('fail'));
});

gulp.task('lint', function _lint() {
    return gulp.src(src).
        pipe(eslint()).
        pipe(eslint.format()).
        pipe(eslint.failAfterError());
});

gulp.task('lint-test', function _lint() {
    return gulp.src(test).
        pipe(eslint({
            globals: {
                describe: false,
                it: true
            },
            rules: {
                'no-unused-expressions': [ 0 ]
            }
        })).
        pipe(eslint.format()).
        pipe(eslint.failAfterError());
});
