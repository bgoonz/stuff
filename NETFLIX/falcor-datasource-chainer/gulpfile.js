var gulp = require('gulp');

// Gulp build step require
require('./build/build.style');
require('./build/build.test');
require('./build/build.dist');

gulp.task('build', ['jscs', 'lint', 'lint-test']);
gulp.task('dist', ['jscs', 'lint', 'lint-test', 'test-coverage']);
gulp.task('default', ['build']);

