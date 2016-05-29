'use strict';
require('es6-promise-polyfill');
var path = require('path');
var gulp = require('gulp');
var nsp = require('gulp-nsp');
var coveralls = require('gulp-coveralls');

var tasks = require('./tasks');

gulp.task('static', function() {
  return tasks.static();
});

gulp.task('nsp', function(cb) {
  nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('pre-test', function() {
  return tasks.preTest();
});

gulp.task('run-test', function(cb) {
  tasks.test(cb);
});

gulp.task('test', gulp.series('pre-test', 'run-test'));

gulp.task('watch', function() {
  gulp.watch(['generators/**/*.js', 'test/**'], ['test']);
});

gulp.task('coveralls', gulp.series('test'), function() {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('sync', () => {
  return tasks.ghPush({version: true});
});

gulp.task('prepublish', gulp.series('nsp'));
gulp.task('default',
  gulp.series(
    'static',
    'coveralls'
  ));
