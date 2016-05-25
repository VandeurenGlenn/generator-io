'use strict';
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var istanbul = require('gulp-istanbul');

/**
 * @class Tasks
 */
class Tasks {

  /**
   * lints generator-io using eslint
   *
   * @param {function} cb performs an callback on end
   * @return {function} eslint task
   */
  static() {
    return gulp.src(['**/*.js'])
      .pipe(excludeGitignore())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }

  preTest() {
    return gulp.src(['generators/**/*.js', '!generators/**/_gulpfile.js'])
      .pipe(excludeGitignore())
      .pipe(istanbul({
        includeUntested: true
      }))
      .pipe(istanbul.hookRequire());
  }

  test(cb) {
    var mochaErr;

    gulp.src(['test/**/*.js'])
      .pipe(plumber())
      .pipe(mocha({reporter: 'spec'}))
      .on('error', function(err) {
        mochaErr = err;
      })
      .pipe(istanbul.writeReports())
      .on('end', function() {
        cb(mochaErr);
      });
  }

  /**
   * lints code using eslint
   *
   * @param {string} src path to files
   * @param {function} cb preforms callback on end
   */
  eslint(src, cb) {
    gulp.src(`[${src}]`)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .on('end', () => {
        cb();
      });
  }
}

module.exports = new Tasks();
