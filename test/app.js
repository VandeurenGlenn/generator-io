'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-io:app', function() {
  before(function(done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        appname: 'some-app-name',
        includeRagin: false,
        es6: false,
        eslint: false,
        boilerplate: false,
        ioElements: false
      })
      .on('end', done);
  });

  it('creates files', function() {
    assert.file([
      'src',
      'src/elements/app-shell.html'
    ]);
  });
});
