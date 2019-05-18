const Logger = require('../utils/logger');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const createPackageJson = require('create-package-json');
const prettier = require('prettier');

class EzwcNew {
  run() {
    Logger.process(`Let's create a new %s project!`, 'Start', 'EZWC');
    Logger.emptyLine();
    inquirer.prompt(this.questions()).then((answers) => {
      Logger.emptyLine();
      Logger.info(`Generating project...`);
      this.createProjectDirectory(answers.projectName);
      this.createProjectSubdirectories(answers.projectName, answers.i, answers.o);
      this.generateConfigFile(answers);
      this.initNpmProject(answers.projectName);
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
      Logger.error('Could not create project directory %s', projectName);
      console.log(e);
      process.exit(1);
    }
  }

  async initNpmProject(projectName) {
    try {
      Logger.info('Initializing %s project and installing packages', 'NPM');
      const cwd = process.cwd();
      process.chdir(path.resolve(cwd, projectName));
      await createPackageJson({
        name: projectName,
        description: `${projectName} - an EZWC-based project`,
        version: '0.0.1',
        devDependencies: [
          'ezwc-cli'
        ],
        keywords: [
          'ezwc',
          'webcomponents'
        ],
        noPrompt: true
      });
      process.chdir(cwd);
      Logger.success(`EZWC project %s has been initialized!`, 'Done!', projectName);
    } catch(e) {
      Logger.error('Could not initialize %s project', 'NPM');
      console.log(e);
      process.exit(1);
    }
  }

  createProjectSubdirectories(projectName, sourceDir, outputDir) {
    try {
      Logger.info('Creating %s directory', 'source');
      fs.mkdirSync(path.resolve(process.cwd(), projectName, sourceDir));
    } catch(e) {
      Logger.info('Error creating %s directory', 'source');
      console.log(e);
      process.exit();
    }
    try {
      Logger.info('Creating %s directory', 'output');
      fs.mkdirSync(path.resolve(process.cwd(), projectName, outputDir));
    } catch(e) {
      Logger.info('Error creating %s directory', 'output');
      console.log(e);
      process.exit();
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
      Logger.error('Could not write out %s', '.ezwc.config.js');
      console.log(e);
      process.exit(1);
    }
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
        choices: [ 'HTML', 'Lit HTML', 'Pug', 'EJS', 'Handlebars' ],
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
