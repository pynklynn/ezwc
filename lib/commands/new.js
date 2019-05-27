const Logger = require('../utils/logger');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const createPackageJson = require('create-package-json');
const prettier = require('prettier');
const Handlebars = require('handlebars');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class EzwcNew {
  run() {
    Logger.process(`Let's create a new %s project!`, 'Start', 'EZWC');
    Logger.emptyLine();
    inquirer.prompt(this.questions()).then(async (answers) => {
      Logger.emptyLine();
      Logger.info(`Generating project...`);
      this.createProjectDirectory(answers.projectName);
      this.createProjectSubdirectories(answers);
      this.generateConfigFile(answers);
      /* istanbul ignore else */
      if (answers.router) {
        await this.generateProjectFiles(answers);
      }
      await this.initNpmProject(answers);
      /* istanbul ignore else */
      if (answers.router) {
        await this.transpileProject(answers);
      }
      Logger.success(`EZWC project %s has been initialized!`, 'Done!', answers.projectName);
    });
  }

  createProjectDirectory(projectName) {
    const projectDir = path.resolve(process.cwd(), projectName);
    /* istanbul ignore else */
    if (fs.existsSync(projectDir)) {
      Logger.error('Project directory %s already exists!', projectName);
      process.exit(1);
    }

    try {
      Logger.info('Creating project directory %s', projectName);
      fs.mkdirSync(projectDir, { recursive: true });
    } catch(e) {
      /* istanbul ignore next */
      this.handleErrorCase(e, 'Could not create project directory %s', projectName);
    }
  }

  async initNpmProject(answers) {
    const { projectName, router, s: styles, t: template, T: useTs } = answers;
    try {
      Logger.info('Initializing %s project and installing packages', 'NPM');
      const cwd = process.cwd();
      process.chdir(path.resolve(cwd, projectName));
      const devDependencies = [ 'ezwc-cli' ];
      const dependencies = [];
      const scripts = {};
      if (router) {
        devDependencies.push('webpack');
        devDependencies.push('webpack-cli');
        devDependencies.push('ezwc-loader');
        devDependencies.push('css-loader');
        devDependencies.push('style-loader');
        devDependencies.push('serve');
        /* istanbul ignore else */
        if (styles === 'sass') {
          devDependencies.push('sass-loader');
        }
        /* istanbul ignore else */
        if (template !== 'html') {
          switch(template) {
            case 'lit':
              devDependencies.push('lit-html');
              break;
            case 'ejs':
              devDependencies.push('ejs');
              break;
            case 'handlebars':
              devDependencies.push('handlebars');
              break;
          }
        }
        /* istanbul ignore else */
        if (useTs) {
          devDependencies.push('typescript');
        }

        dependencies.push('@vaadin/router');
        dependencies.push('@webcomponents/webcomponentsjs');

        scripts.start = 'serve -l 8080';
        scripts.build = 'webpack';
      }
      await createPackageJson({
        name: projectName,
        description: `${projectName} - an EZWC-based project`,
        version: '0.0.1',
        dependencies,
        devDependencies,
        keywords: [
          'ezwc',
          'webcomponents'
        ],
        scripts,
        noPrompt: true
      });
      process.chdir(cwd);
    } catch(e) {
      /* istanbul ignore next */
      this.handleErrorCase(e, 'Could not initialize %s project', 'NPM');
    }
  }

  createProjectSubdirectories(answers) {
    const { projectName, i: sourceDir, o: outputDir } = answers;
    let srcDirPath = path.resolve(process.cwd(), projectName, sourceDir);
    try {
      Logger.info('Creating %s directory', 'source');
      fs.mkdirSync(srcDirPath);
    } catch(e) {
      /* istanbul ignore next */
      this.handleErrorCase(e, 'Error creating %s directory', 'source');
    }
    /* istanbul ignore else */
    if (answers.router) {
      try {
        Logger.info('Creating %s directory', 'views source');
        fs.mkdirSync(path.resolve(srcDirPath, 'views'));
      } catch(e) {
        /* istanbul ignore next */
        this.handleErrorCase(e, 'Error creating %s directory', 'views source');
      }
      try {
        Logger.info('Creating %s directory', 'components source');
        fs.mkdirSync(path.resolve(srcDirPath, 'components'));
      } catch(e) {
        /* istanbul ignore next */
        this.handleErrorCase(e, 'Error creating %s directory', 'components source');
      }
      try {
        Logger.info('Creating %s directory', 'assets source');
        fs.mkdirSync(path.resolve(srcDirPath, 'assets/styles'), { recursive: true });
      } catch(e) {
        /* istanbul ignore next */
        this.handleErrorCase(e, 'Error creating %s directory', 'assets source');
      }
    }
    try {
      Logger.info('Creating %s directory', 'output');
      fs.mkdirSync(path.resolve(process.cwd(), projectName, outputDir));
    } catch(e) {
      /* istanbul ignore next */
      this.handleErrorCase(e, 'Error creating %s directory', 'output');
    }
  }

  generateConfigFile(settings) {
    let generateImportsConfig = '';
    if (settings.imports.length === 3) {
      generateImportsConfig = 'importAll: true';
    } else {
      const imports = settings.imports.map(importSetting => `import${importSetting[0].toUpperCase()}${importSetting.substring(1)}: true`);
      generateImportsConfig = imports.join(',\n');
    }
    const projectConfig = prettier.format(`module.exports = {
  in: '${settings.i}',
  out: '${settings.o}',
  watch: ${settings.w},
  generate: {
    styles: '${settings.s}',
    template: '${settings.t}',
    ts: ${settings.T},
    shadowRoot: ${settings.shadowRoot},
    force: ${settings.f},
    ${generateImportsConfig}
  }
};
    `, {
      singleQuote: true,
      trailingComma: 'es5',
      parser: 'babel'
    });

    try {
      Logger.info('Creating %s', '.ezwc.config.js');
      const configFilePath = path.resolve(process.cwd(), settings.projectName, '.ezwc.config.js');
      fs.writeFileSync(configFilePath, projectConfig, {
        encoding: 'utf8',
        flag: 'w+'
      });
    } catch(e) {
      /* istanbul ignore next */
      this.handleErrorCase(e, 'Could not write out %s', '.ezwc.config.js');
    }
  }

  async generateProjectFiles(answers) {
    const projectDir = path.resolve(process.cwd(), answers.projectName);
    const commandDir = path.resolve(__dirname, 'new/templates');

    try {
      Logger.info('Generating %s source files to the project directory', answers.projectName);
      this.copyBasicFiles(answers, commandDir, projectDir);
      this.generateStylesheet(projectDir, answers);
      this.generateMainFile(answers, commandDir, projectDir);
      await this.generateEzwcTemplates(answers, projectDir);
      this.copyIndexHtml(answers, commandDir, projectDir);
      this.copyWebpackConfig(answers, commandDir, projectDir);
    } catch(e) {
      /* istanbul ignore next */
      this.handleErrorCase(e, 'Could not write out %s', 'project files');
    }
  }

  copyBasicFiles(answers, commandDir, projectDir) {
    [ 'router', 'components' ].forEach(file => {
      fs.copyFileSync(
        path.resolve(commandDir, answers.i, `${file}.js`),
        path.resolve(projectDir, answers.i, `${file}.js`)
      );
    });
  }

  generateStylesheet(projectDir, answers) {
    fs.writeFileSync(
      path.resolve(projectDir, `src/assets/styles/styles.${answers.s === 'sass' ? 's': ''}css`),
      '',
      {
        encoding: 'utf8',
        flag: 'w+'
      }
    );
  }

  generateMainFile(answers, commandDir, projectDir) {
    const mainFileSource = fs.readFileSync(
      path.resolve(commandDir, 'src/main.js'),
      'utf8'
    );
    const mainFile = Handlebars.compile(mainFileSource);
    fs.writeFileSync(
      path.resolve(projectDir, 'src/main.js'),
      mainFile({ sass: answers.s === 'sass' }),
      {
        encoding: 'utf8',
        flag: 'w+'
      }
    );
  }

  async generateEzwcComponents(projectDir) {
    const cwd = process.cwd();
    process.chdir(projectDir);
    await exec('ezwc g src/views/app-home');
    await exec('ezwc g src/components/test-component');
    process.chdir(cwd);
  }

  deteremineEzwcTemplateExtension(answers) {
    /* istanbul ignore else */
    if (answers.imports.includes('template')) {
      switch(answers.t) {
        case 'ejs':
          return '.ejs';
        case 'handlebars':
          return '.hbs';
        default:
          return '.html';
      }
    }

    return '';
  }

  getEzwcViewFileTemplate(answers) {
    return `
  <h1>Welcome to ${answers.projectName}!</h1>
  <test-component></test-component>
`;
  }

  getEzwcComponentFileTemplate(answers) {
    return `
  <h2>${answers.projectName} component</h2>
`;
  }

  updateEzwcTemplateFile(type, answers, template, projectDir) {
    const templateExtension = this.deteremineEzwcTemplateExtension(answers);
    const fileName = type === 'view' ? 'views/app-home' : 'components/test-component';
    const filePath = path.resolve(projectDir, `src/${fileName}.ezwc${templateExtension}`);
    const generatedSource = fs.readFileSync(filePath, 'utf8');
    const inlineContent = generatedSource.replace('</template>', `${template}</template>`)
    fs.writeFileSync(
      filePath,
      answers.imports.includes('template') ? template : inlineContent,
      {
        encoding: 'utf8',
        flag: 'w+'
      }
    );
  }

  async generateEzwcTemplates(answers, projectDir) {
    await this.generateEzwcComponents(projectDir);
    const viewFileTemplate = this.getEzwcViewFileTemplate(answers);
    const componentFileTemplate = this.getEzwcComponentFileTemplate(answers);
    this.updateEzwcTemplateFile('view', answers, viewFileTemplate, projectDir);
    this.updateEzwcTemplateFile('component', answers, componentFileTemplate, projectDir);
  }

  copyIndexHtml(answers, commandDir, projectDir) {
    const indexHtmlSource = fs.readFileSync(path.resolve(commandDir, 'index.html'), 'utf8');
    const indexHtmlTemplate = Handlebars.compile(indexHtmlSource);
    const renderedIndexHtml = indexHtmlTemplate({ projectName: answers.projectName });
    fs.writeFileSync(
      path.resolve(projectDir, 'index.html'),
      renderedIndexHtml,
      {
        encoding: 'utf8',
        flag: 'w+'
      }
    );
  }

  copyWebpackConfig(answers, commandDir, projectDir) {
    const webpackConfigSource = fs.readFileSync(path.resolve(commandDir, 'webpack.config.js'), 'utf8');
    const webpackConfigTemplate = Handlebars.compile(webpackConfigSource);
    const renderedWebpackConfig = webpackConfigTemplate({
      useSass: answers.s === 'sass',
      src: answers.i,
      dist: answers.o
    });
    fs.writeFileSync(
      path.resolve(projectDir, 'webpack.config.js'),
      renderedWebpackConfig,
      {
        encoding: 'utf8',
        flag: 'w+'
      }
    );
  }

  async transpileProject(answers) {
    const { projectName } = answers;
    Logger.info('Building %s', projectName);
    const projectDir = path.resolve(process.cwd(), projectName);
    const cwd = process.cwd();
    process.chdir(projectDir);
    await exec('npm run build');
    process.chdir(cwd);
  }

  handleErrorCase(error, message, highlight) {
    Logger.error(message, highlight);
    console.log(error);
    process.exit(1);
  }

  /* istanbul ignore next */
  questions() {
    return [
      {
        type: 'input',
        name: 'projectName',
        message: "What's the name of the project (directory with package name will be created)?",
        validate(value) {
          return value.toString().trim().length > 0;
        }
      },
      {
        type: 'input',
        name: 'i',
        message: 'Source directory:',
        default: 'src'
      },
      {
        type: 'input',
        name: 'o',
        message: 'Output directory:',
        default: 'dist'
      },
      {
        type: 'confirm',
        name: 'w',
        message: 'Watch for changes?',
        default: true
      },
      {
        type: 'confirm',
        name: 'router',
        message: 'Add router and generate associated files?',
        default: true
      },
      {
        type: 'list',
        name: 's',
        message: 'Default style type:',
        choices: [ 'CSS', 'Sass' ],
        default: 'css',
        filter(val) {
          return val.toLowerCase();
        }
      },
      {
        type: 'list',
        name: 't',
        message: 'Default rendering engine:',
        choices: [ 'HTML', 'Lit HTML', 'EJS', 'Handlebars' ],
        default: 'html',
        filter(val) {
          return val.toLowerCase().split(' ')[0];
        }
      },
      {
        type: 'confirm',
        name: 'T',
        message: 'Use Typescript?',
        default: false
      },
      {
        type: 'confirm',
        name: 'shadowRoot',
        message: 'Use shadow root?',
        default: true
      },
      {
        type: 'confirm',
        name: 'f',
        message: 'Overwrite existing files when generating new components?',
        default: false
      },
      {
        type: 'checkbox',
        name: 'imports',
        message: 'Import any code?',
        choices: [
          {
            name: 'styles'
          },
          {
            name: 'template'
          },
          {
            name: 'script'
          }
        ]
      }
    ];
  }
}

module.exports = new EzwcNew();
