'use strict';
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

gulp.task('test', ['pre-test'], function(cb) {
  tasks.test(() => {
    cb();
  });
});

gulp.task('watch', function() {
  gulp.watch(['generators/**/*.js', 'test/**'], ['test']);
});

gulp.task('coveralls', ['test'], function() {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('prepublish', ['nsp']);
gulp.task('default', ['eslint:io-app', 'static', 'test', 'coveralls']);

gulp.task('eslint:io-app', cb => {
  tasks.eslint('generators/app/templates/io-app', () => {
    cb();
  });
});
