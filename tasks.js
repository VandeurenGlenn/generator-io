'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var fs = require('fs');
var _if = require('gulp-if');
var ghPages = require('gulp-gh-pages');

var _package = JSON.parse(fs.readFileSync('package.json'));
/**
 * @class Tasks
 */
class Tasks {

  get version() {
    return _package.version;
  }

  /**
   * lints generator-io using eslint
   *
   * @param {function} cb performs an callback on end
   * @return {function} eslint task
   */
  static() {
    return gulp.src('**/*.js')
      .pipe($.excludeGitignore())
      .pipe(_if(!'_*' || !'.*', $.eslint())) // ignore files starting with an underscore or point
      .pipe($.eslint.format())
      .pipe($.eslint.failAfterError());
  }

  preTest() {
    return gulp.src(['generators/**/index.js'])
      .pipe($.istanbul({
        includeUntested: true
      }))
      .pipe($.istanbul.hookRequire());
  }

  test(cb) {
    var mochaErr;

    gulp.src(['test/*.js'])
      .pipe($.plumber())
      .pipe($.mocha({
        reporter: 'spec',
        timeout: 50000
      }))
      .on('error', function(err) {
        mochaErr = err;
      })
      .pipe($.istanbul.writeReports())
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
    return gulp.src(src)
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.eslint.failAfterError())
      .on('end', () => {
        cb();
      });
  }

  /**
   * Pushes commits by version or branch, defaults to 'master' branch
   *
   * @param {object} opt {branch: 'branch'} or {version: true} else 'master' branch will be used
   * @return {function} Pushes commits to Github
   */
  ghPush(opt) {
    return gulp.src(['**/*'])
    .pipe(_if(process.env.TRAVIS === 'true', ghPages({
      remoteUrl: 'https://$GH_TOKEN@github.com/$GH_REPO.git',
      silent: true,
      branch: function() {
        if (opt) {
          return opt.version ? this.version : opt.branch;
        }
        return 'master';
      }
    }), ghPages({
      branch: function() {
        if (opt.version) {
          return opt.version ? this.version : opt.branch;
        }
        return 'master';
      }
    })));
  }
}

module.exports = new Tasks();
