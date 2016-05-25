'use strict';
var yeoman = require('yeoman-generator');
var path = require('path');
var chalk = require('chalk');
var yosay = require('yosay');
/**
 * @module app
 */
 /**
  * Scaffolds out an io-app
  *
  * @alias module:app
  * @extends yeoman.Base.extend
  *
  * @param {string} appname prompts the user for an custom-appname
  */
var io = yeoman.Base.extend({
  initializing() {
    var done = this.async();
    // Yeoman replaces dashes with spaces. We want dashes.
    this.appname = this.appname.replace(/\s+/g, '-');
    this.sourceRoot(path.join(path.dirname(this.resolved), 'templates/io-app'));
    this.rootDir = path => {
      return `${__dirname.match(/(.*)generator-io/g)}/${path}`;
    };

    /**
     * writes content to destinationPath
     *
     * @param {string} src the path to write to
     * @param {string} content the content to write
     */
    this._write = function(src, content) {
      this.fs.write(this.destinationPath(src), content);
    }.bind(this);

    /**
     * Stringify, parse & write JSON
     *
     * @param {string} src the path to write to
     * @param {string} content the content to write
     */
    this.writeJSON = function(src, content) {
      this._write(src, JSON.stringify(JSON.parse(content), null, 2));
    };
    done();
  },

  prompting: function() {
    var done = this.async();
    var _this = this;

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the first-class ' + chalk.red('io') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'appname',
      message: 'How would you like to call your io-app?',
      default() {
        return _this.appname;
      }
    }, {
      type: 'confirm',
      name: 'boilerplate',
      message: 'Would you like to have the full app?',
      default: true
    }, {
      when(answers) {
        return answers.boilerplate === false;
      },
      type: 'confirm',
      name: 'ioElements',
      message: 'Install io-elements?',
      default: true
    }, {
      when(answers) {
        return answers.boilerplate === false;
      },
      type: 'confirm',
      name: 'includeRagin',
      message: 'Install [Ragin](https://github.com/DeveloperRagin/ragin)?',
      default: true
    }, {
      when(answers) {
        return answers.boilerplate === false;
      },
      type: 'confirm',
      name: 'es6',
      message: 'Include ES6',
      default: true
    }, {
      when(answers) {
        return answers.boilerplate === false;
      },
      type: 'confirm',
      name: 'eslint',
      message: 'Include eslint',
      default: true
    }, {
      type: 'input',
      name: 'devName',
      message: 'Whats your name?'
    }];

    this.prompt(prompts, function(props) {
      if (props.boilerplate) {
        props.includeRagin = true;
        props.es6 = true;
      }
      this.props = props;
      done();
    }.bind(this));
  },

  copy: function() {
    var done = this.async();
    if (this.props.boilerplate) {
      this.fs.copy(
        this.templatePath('src'),
        this.destinationPath('src')
      );
    } else {
      if (this.props.ioElements) {
        this.fs.copy(
          this.templatePath('src/elements'),
          this.destinationPath('src/elements')
        );

        this.fs.copy(
          this.templatePath('src/index.html'),
          this.destinationPath('src/index.html')
        );
      } else {
        this.fs.copy(
          this.templatePath('src/index.html'),
          this.destinationPath('src/index.html'), {
            process: function(file) {
              file = file.toString().replace(/io-app/g, 'app-shell');
              return new Buffer(file);
            }
          }
        );

        this.fs.copy(
          this.templatePath('../app-shell.html'),
          this.destinationPath('src/elements/app-shell.html')
        );
      }

      this.fs.copy(
        this.templatePath('src/scripts/app.js'),
        this.destinationPath('src/scripts/app.js')
      );

      this.fs.copy(
        this.templatePath('src/styles'),
        this.destinationPath('src/styles')
      );

      this.fs.copy(
        this.templatePath('src/images'),
        this.destinationPath('src/images')
      );

      this.fs.copy(
        this.templatePath('src/LICENSE.txt'),
        this.destinationPath('src/LICENSE.txt')
      );
    }

    this.fs.copy(
      this.templatePath('tasks'),
      this.destinationPath('tasks')
    );

    this.fs.copy(
      this.templatePath('.eslintrc'),
      this.destinationPath('.eslintrc')
    );

    this.fs.copy(
      this.templatePath('.gitignore'),
      this.destinationPath('.gitignore')
    );

    this.fs.copy(
      this.templatePath('.ioconfig'),
      this.destinationPath('.ioconfig')
    );

    this.fs.copy(
      this.templatePath('.server-config'),
      this.destinationPath('.server-config')
    );

    this.fs.copy(
      this.templatePath('../.editorconfig'),
      this.destinationPath('.editorconfig')
    );

    this.fs.copy(
      this.templatePath('bower.json'),
      this.destinationPath('bower.json')
    );

    this.fs.copy(
      this.templatePath('package.json'),
      this.destinationPath('package.json')
    );

    this.fs.copyTpl(
      this.templatePath('../_gulpfile.js'),
      this.destinationPath('gulpfile.js'), {
        es6: this.props.es6,
        includeRagin: this.props.includeRagin
      }
    );
    done();
  },
  /**
 * @mixin
 * @alias actions/actions
 */

  writing: function() {
    this._write(
      'src/scripts/app.js',
      this.read(this.destinationPath('src/scripts/app.js'))
      .replace(/appName = (.*);/g, `appName = '${this.appname}';`)
    );

    // read & parse include.json
    var iorc = JSON.parse(this.read(this.rootDir('config/include.json')));
    // read & parse bowerfile
    var bowerFile = JSON.parse(this.read(this.destinationPath('bower.json')));
    bowerFile.name = this.props.appname;
    if (!this.props.includeRagin) {
      var raginBundle = iorc.includeRagin.bower;
      var devDepsLength = Object.keys(bowerFile.devDependencies).length;
      // delete the whole obj when same length
      if (raginBundle.length === devDepsLength) {
        delete bowerFile.devDependencies;
      } else {
        raginBundle.forEach(i => {
          delete bowerFile.devDependencies[i];
        });
      }
    }
    this.writeJSON('bower.json', JSON.stringify(bowerFile, null, 2));

    var npmFile = JSON.parse(this.read(this.destinationPath('package.json')));
    npmFile.name = this.props.appname;
    if (!this.props.includeRagin) {
      iorc.includeRagin.npm.forEach(dep => {
        delete npmFile.devDependencies[dep];
      });
    }
    if (!this.props.es6) {
      iorc.es6.npm.forEach(dep => {
        delete npmFile.devDependencies[dep];
      });
    }
    if (!this.props.eslint) {
      iorc.eslint.npm.forEach(dep => {
        delete npmFile.devDependencies[dep];
      });
    }
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = io;
