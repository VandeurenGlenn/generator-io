'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('io:app', function() {
  describe('includes all features', () => {
    before(function(done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts({
          boilerplate: false,
          ioElements: false,
          skipInstall: true
        })
        .on('end', function() {
          done();
        });
    });

    it('checks if all features are included in package.json file', function() {
      assert.jsonFileContent('package.json', {
        devDependencies: {
          'ragin': '^0.1.0',
          'gulp-babel': '^6.1.2',
          'eslint': '^2.9.0'
        }
      });
    });

    it('checks files', function() {
      assert.file(['bower.json']);
    });
  });

  describe('install without boilerplate', () => {
    before(function(done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts({
          boilerplate: false,
          ioElements: false,
          skipInstall: true
        })
        .on('end', function() {
          done();
        });
    });

    it('searches for app-shell.html', function() {
      assert.file(['src/elements/app-shell.html']);
    });
  });
});
