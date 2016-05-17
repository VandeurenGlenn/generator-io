'use strict';
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
/**
 * @class Tasks
 */
class Tasks {
  constructor() {
    this.static = this.static();
    this.buildApp = this.build('app/templates/io-app');
  }

  /**
   * lints generator-io using eslint
   *
   * @alias class:Tasks
   */
  static() {
    return gulp.src('**/*.js')
      .pipe(excludeGitignore())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }
  /**
   * lints the code using eslint, sets up src files
   *
   * @param {string} src path to files
   * @return {function} eslint -> edit-files
   */
  build(src) {
    return gulp.src(`[${src}]`)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }
}

module.exports = new Tasks();
