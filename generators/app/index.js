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

    this._write = function(path, content) {
      return this.write(this.destinationPath(path), content);
    };

    this.writeJSON = function(path, content) {
      return this._write(path, JSON.stringify(content, null, 2));
    };
    this.remote('vandeurenglenn', 'io-app', 'master', function(e, remote) {
      this.bowerPath = `${remote.cachePath}/bower.json`;
      this.packagePath = `${remote.cachePath}/package.json`;
      var match;
      var bower = this.read(this.bowerPath);
      if (!bower.toString().includes('includeRagin')) {
        bower = JSON.parse(bower);
        delete bower.authors;
        delete bower.description;
        delete bower.keywords;
        delete bower.homepage;

        bower = JSON.stringify(bower, null, null);
        match = bower.match(/(\W)(\W)devDependencies(.*)/gm);
        match = String(match).replace('}', '');
        bower = bower.replace(match, `<% if (includeRagin) { %>${match}<% } %>`);
        bower = bower.replace('io-app', '<%= appname %>');
        this.write(`${remote.cachePath}/bower.json`, bower);
      }
      // iorc.include.forEach(plugin => {
      //   if (plugin.name === 'es6' || plugin.name === 'eslint' || plugin.name === 'ragin') {
      //     console.log(plugin);
      //   }
      // });
      var npm = this.read(this.packagePath);
      if (!npm.toString().includes('includeRagin')) {
        var es6Plugs = [];
        npm = JSON.parse(npm);
        npm.name = '<%= appname %>';
        console.log(npm.devDependencies['gulp-babel']);
        npm = JSON.stringify(npm, null, null);
        match = npm.match(/(\W)gulp-babel(.*)6.1.2(\W)/g);
        console.log(match);
      }
      done();
    }.bind(this));
  },

  prompting: function() {
    var done = this.async();
    var _this = this;

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the first-class ' + chalk.red('generator-io') + ' generator!'
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
      name: 'io-elements',
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
        this.templatePath('src/scripts/app.js'),
        this.destinationPath('src/scripts/app.js')
      );

      this.fs.copy(
        this.templatePath('src/LICENSE.txt'),
        this.destinationPath('src/LICENSE.txt')
      );

      this.fs.copy(
        this.templatePath('../app-shell.html'),
        this.destinationPath('src/elements/app-shell.html')
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

    this.fs.copyTpl(
      this.templatePath(this.bowerPath),
      this.destinationPath('bower.json'), {
        includeRagin: this.props.includeRagin,
        appname: this.props.appname
      }
    );

    this.fs.copyTpl(
      this.templatePath('../_package.json'),
      this.destinationPath('package.json'), {
        es6: this.props.es6,
        includeRagin: this.props.includeRagin,
        appname: this.props.appname
      }
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
    var read = function(src) {
      return this.fs.read(this.destinationPath(src));
    }.bind(this);

    /**
     * writes content to destinationPath
     *
     * @param {string} src the path to write to
     * @param {string} content the content to write
     */
    var write = function(src, content) {
      this.fs.write(this.destinationPath(src), content);
    }.bind(this);

    /**
     * Stringify, parse & write JSON
     *
     * @param {string} src the path to write to
     * @param {string} content the content to write
     */
    var writeJSON = function(src, content) {
      write(src, JSON.stringify(JSON.parse(content), null, 2));
    };

    var script = read('src/scripts/app.js');
    write(
      'src/scripts/app.js',
      script.replace(/appName = (.*);/g, `appName = '${this.appname}';`)
    );
    // parse bowerfile
    var bowerFile = read('bower.json');
    writeJSON('bower.json', bowerFile);
  },

  install: function() {
    this.installDependencies();
  }
});

module.exports = io;
