/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const Logger = require('@lib/utils/logger');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const createPackageJson = require('create-package-json');
const prettier = require('prettier');
const EzwcNew = require('@lib/commands/new');
const Handlebars = require('handlebars');

jest.mock('@lib/utils/logger');
jest.mock('inquirer');
jest.mock('fs');
jest.mock('path');
jest.mock('create-package-json');
jest.mock('prettier');
jest.mock('util', () => {
  return {
    promisify: jest.fn().mockReturnValue(jest.fn()),
    inherits: jest.fn()
  }
});
jest.mock('child_process');
jest.mock('handlebars');

describe('New command tests', () => {
  beforeEach(() => {
    fs.mkdirSync.mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    jest.spyOn(process, 'cwd').mockReturnValue('cwd');
    jest.spyOn(process, 'chdir').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should run the new command', () => {
    jest.spyOn(EzwcNew, 'createProjectDirectory').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'createProjectSubdirectories').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'generateConfigFile').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'initNpmProject').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'questions').mockReturnValue({});
    inquirer.prompt.mockImplementation(() => {
      return {
        then(callback) {
          callback({});
        }
      }
    });

    EzwcNew.run();
    expect(Logger.process).toHaveBeenCalledWith(`Let's create a new %s project!`, 'Start', 'EZWC');
    expect(Logger.emptyLine).toHaveBeenCalled();
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(Logger.info).toHaveBeenCalledWith('Generating project...');
    expect(EzwcNew.createProjectDirectory).toHaveBeenCalled();
    expect(EzwcNew.createProjectSubdirectories).toHaveBeenCalled();
    expect(EzwcNew.generateConfigFile).toHaveBeenCalled();
    expect(EzwcNew.initNpmProject).toHaveBeenCalled();
  });

  describe('createProjectDirectory tests', () => {
    beforeEach(() => {
      path.resolve.mockReturnValue('cwd/dir');
    });

    test('should fail creating the project directory because it already exists', () => {
      fs.existsSync.mockReturnValue(true);

      EzwcNew.createProjectDirectory('test-project');
      expect(process.cwd).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith('cwd', 'test-project');
      expect(Logger.error).toHaveBeenCalledWith('Project directory %s already exists!', 'test-project');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should successfully create the project directory', () => {
      fs.existsSync.mockReturnValue(false);

      EzwcNew.createProjectDirectory('test-project');
      expect(Logger.info).toHaveBeenCalledWith('Creating project directory %s', 'test-project');
      expect(fs.mkdirSync).toHaveBeenCalledWith('cwd/dir', { recursive: true });
    });
  });

  describe('initNpmProject tests', () => {
    const basePackageInit = {
      name: 'test-project',
      version: '0.0.1',
      description: `test-project - an EZWC-based project`,
      keywords: [
        'ezwc',
        'webcomponents'
      ],
      noPrompt: true,
      scripts: {
        start: 'serve -l 8080',
        build: 'webpack'
      },
      dependencies: [ '@vaadin/router', '@webcomponents/webcomponentsjs' ],
      devDependencies: []
    };

    beforeEach(() => {
      path.resolve.mockReturnValue('cwd/test-project');
      createPackageJson.mockReturnValue(new Promise((resolve, reject) => resolve()));
      basePackageInit.devDependencies = [
        'ezwc-cli',
        'webpack',
        'webpack-cli',
        'ezwc-loader',
        'css-loader',
        'style-loader',
        'serve'
      ];
    });

    test('should initialize NPM project', () => {
      EzwcNew.initNpmProject({ projectName: 'test-project' });
      expect(Logger.info).toHaveBeenCalledWith('Initializing %s project and installing packages', 'NPM');
      expect(process.cwd).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith('cwd', 'test-project');
      expect(process.chdir).toHaveBeenCalledWith('cwd/test-project');
      expect(createPackageJson).toHaveBeenCalled();
      // expect(process.cwd).toHaveBeenCalledWith('cwd');
      // expect(Logger.success).toHaveBeenCalledWith(`EZWC project %s has been initialized!`, 'Done!', 'test-project');
    });

    test('should initialize NPM project with router', () => {
      EzwcNew.initNpmProject({ projectName: 'test-project', router: true });
      expect(createPackageJson).toHaveBeenCalledWith(basePackageInit);
    });

    test('should initialize NPM project with router and sass', () => {
      const sassBasePackageInit = Object.assign({}, basePackageInit);
      sassBasePackageInit.devDependencies .push('sass-loader');
      EzwcNew.initNpmProject({ projectName: 'test-project', router: true, s: 'sass' });
      expect(createPackageJson).toHaveBeenCalledWith(sassBasePackageInit);
    });

    test('should initialize NPM project with router and typescript', () => {
      const tsBasePackageInit = Object.assign({}, basePackageInit);
      tsBasePackageInit.devDependencies.push('typescript');
      EzwcNew.initNpmProject({ projectName: 'test-project', router: true, T: true });
      expect(createPackageJson).toHaveBeenCalledWith(tsBasePackageInit);
    });

    test('should initialize NPM project with router and lit-html', () => {
      const tsBasePackageInit = Object.assign({}, basePackageInit);
      tsBasePackageInit.devDependencies.push('lit-html');
      EzwcNew.initNpmProject({ projectName: 'test-project', router: true, t: 'lit' });
      expect(createPackageJson).toHaveBeenCalledWith(tsBasePackageInit);
    });

    test('should initialize NPM project with router and ejs', () => {
      const tsBasePackageInit = Object.assign({}, basePackageInit);
      tsBasePackageInit.devDependencies.push('ejs');
      EzwcNew.initNpmProject({ projectName: 'test-project', router: true, t: 'ejs' });
      expect(createPackageJson).toHaveBeenCalledWith(tsBasePackageInit);
    });

    test('should initialize NPM project with router and handlebars', () => {
      const tsBasePackageInit = Object.assign({}, basePackageInit);
      tsBasePackageInit.devDependencies.push('handlebars');
      EzwcNew.initNpmProject({ projectName: 'test-project', router: true, t: 'handlebars' });
      expect(createPackageJson).toHaveBeenCalledWith(tsBasePackageInit);
    });
  });

  describe('createProjectSubdirectories', () => {
    test('should create project subdirectories', () => {
      path.resolve.mockReturnValue('TEST');
      fs.mkdirSync.mockImplementation(() => {});

      EzwcNew.createProjectSubdirectories({
        projectName: 'test-project',
        i: 'src',
        o: 'dist'
      });
      expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'source');
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'src'));
      expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'output');
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'dist'));
    });

    test('should create project subdirectories for a router project', () => {
      path.resolve.mockReturnValue('TEST');
      fs.mkdirSync.mockImplementation(() => {});

      EzwcNew.createProjectSubdirectories({
        projectName: 'test-project',
        i: 'src',
        o: 'dist',
        router: true
      });
      expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'source');
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'src'));
      expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'views source');
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'src', 'views'));
      expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'components source');
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'src', 'components'));
      expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'assets source');
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'src', 'assets/styles'));
      expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'output');
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'dist'));
    });
  });

  describe('generateConfigFile tests', () => {
    let mockSettings;

    beforeEach(() => {
      mockSettings = {
        projectName: 'test-project',
        i: 'src',
        o: 'dist',
        w: true,
        s: 'scss',
        t: 'lit',
        T: true,
        shadowRoot: true,
        f: false
      };
      path.resolve.mockReturnValue('path/to/config');
    });

    test('should generate config for importAll', () => {
      prettier.format.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      EzwcNew.generateConfigFile({ imports: [ 1, 2, 3 ], ...mockSettings });
      expect(prettier.format).toHaveBeenCalledWith(`module.exports = {
  in: 'src',
  out: 'dist',
  watch: true,
  generate: {
    styles: 'scss',
    template: 'lit',
    ts: true,
    shadowRoot: true,
    force: false,
    importAll: true
  }
};
    `, {
        singleQuote: true,
        trailingComma: 'es5',
        parser: 'babel'
      });
      expect(Logger.info).toHaveBeenCalledWith('Creating %s', '.ezwc.config.js');
      expect(process.cwd).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith('cwd', 'test-project', '.ezwc.config.js');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should generate config for specific imports', () => {
      prettier.format.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      EzwcNew.generateConfigFile({ imports: [ 'styles', 'script' ], ...mockSettings });
      expect(prettier.format).toHaveBeenCalledWith(`module.exports = {
  in: 'src',
  out: 'dist',
  watch: true,
  generate: {
    styles: 'scss',
    template: 'lit',
    ts: true,
    shadowRoot: true,
    force: false,
    importStyles: true,
importScript: true
  }
};
    `, {
        singleQuote: true,
        trailingComma: 'es5',
        parser: 'babel'
      });
      expect(Logger.info).toHaveBeenCalledWith('Creating %s', '.ezwc.config.js');
      expect(process.cwd).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith('cwd', 'test-project', '.ezwc.config.js');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  test('should copy basic files', () => {
    fs.copyFileSync.mockImplementation(() => {});
    path.resolve.mockReturnValueOnce('cmd/src/router.js');
    path.resolve.mockReturnValueOnce('project/src/router.js');
    path.resolve.mockReturnValueOnce('cmd/src/components.js');
    path.resolve.mockReturnValueOnce('project/src/components.js');

    EzwcNew.copyBasicFiles({ i: 'src' }, 'cmd', 'project');
    expect(path.resolve).toHaveBeenCalledWith('cmd', 'src', 'router.js');
    expect(path.resolve).toHaveBeenCalledWith('project', 'src', 'router.js');
    expect(fs.copyFileSync).toHaveBeenCalledWith('cmd/src/router.js', 'project/src/router.js');
    expect(path.resolve).toHaveBeenCalledWith('cmd', 'src', 'components.js');
    expect(path.resolve).toHaveBeenCalledWith('project', 'src', 'components.js');
    expect(fs.copyFileSync).toHaveBeenCalledWith('cmd/src/components.js', 'project/src/components.js');
  });

  test('should transpile the project', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('cwd');
    path.resolve.mockReturnValue('project/dir');
    jest.spyOn(process, 'chdir').mockImplementation(() => {});

    await EzwcNew.transpileProject({ projectName: 'project' });
    expect(Logger.info).toHaveBeenCalledWith('Building %s', 'project');
    expect(process.cwd).toHaveBeenCalled();
    expect(path.resolve).toHaveBeenCalledWith('cwd', 'project');
    expect(process.cwd).toHaveBeenCalled();
    expect(process.chdir).toHaveBeenCalledWith('project/dir');
    expect(process.chdir).toHaveBeenCalledWith('cwd');
  });

  test('should handle an error', () => {
    jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    EzwcNew.handleErrorCase('error', 'ERROR', 'HIGHLIGHT');
    expect(Logger.error).toHaveBeenCalledWith('ERROR', 'HIGHLIGHT');
    expect(console.log).toHaveBeenCalledWith('error');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  test('should copy the webpack config', () => {
    const handlebarsCompileMock = jest.fn();
    path.resolve.mockReturnValue('cmd/webpack.config.js');
    fs.readFileSync.mockReturnValue('src');
    Handlebars.compile.mockReturnValue(handlebarsCompileMock);

    EzwcNew.copyWebpackConfig(
      {
        s: 'sass',
        i: 'src',
        o: 'dist'
      },
      'cmd',
      'project'
    );
    expect(path.resolve).toHaveBeenCalledWith('cmd', 'webpack.config.js');
    expect(fs.readFileSync).toHaveBeenCalledWith('cmd/webpack.config.js', 'utf8');
    expect(Handlebars.compile).toHaveBeenCalledWith('src');
    expect(handlebarsCompileMock).toHaveBeenCalledWith({
      useSass: true,
      src: 'src',
      dist: 'dist'
    });
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  test('should copy index.html file', () => {
    const handlebarsCompileMock = jest.fn();
    path.resolve.mockReturnValue('cmd/index.html');
    fs.readFileSync.mockReturnValue('src');
    Handlebars.compile.mockReturnValue(handlebarsCompileMock);

    EzwcNew.copyIndexHtml({ projectName: 'project' }, 'cmd', 'project');
    expect(path.resolve).toHaveBeenCalledWith('cmd', 'index.html');
    expect(fs.readFileSync).toHaveBeenCalledWith('cmd/index.html', 'utf8');
    expect(Handlebars.compile).toHaveBeenCalledWith('src');
    expect(handlebarsCompileMock).toHaveBeenCalledWith({ projectName: 'project' });
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  test('should generate main.js file', () => {
    const handlebarsCompileMock = jest.fn();
    path.resolve.mockReturnValue('cmd/src/main.js');
    fs.readFileSync.mockReturnValue('src');
    Handlebars.compile.mockReturnValue(handlebarsCompileMock);

    EzwcNew.generateMainFile({ s: 'sass' }, 'cmd', 'project');
    expect(path.resolve).toHaveBeenCalledWith('cmd', 'src/main.js');
    expect(fs.readFileSync).toHaveBeenCalledWith('cmd/src/main.js', 'utf8');
    expect(Handlebars.compile).toHaveBeenCalledWith('src');
    expect(handlebarsCompileMock).toHaveBeenCalledWith({ sass: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  describe('generateStylesheet tests', () => {
    test('should generate a css stylesheet', () => {
      path.resolve.mockReturnValue('project/styles.css');
      EzwcNew.generateStylesheet('project', { s: 'css' });
      expect(path.resolve).toHaveBeenCalledWith('project', 'src/assets/styles/styles.css');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'project/styles.css',
        '',
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      )
    });

    test('should generate a scss stylesheet', () => {
      path.resolve.mockReturnValue('project/styles.scss');
      EzwcNew.generateStylesheet('project', { s: 'sass' });
      expect(path.resolve).toHaveBeenCalledWith('project', 'src/assets/styles/styles.scss');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'project/styles.scss',
        '',
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      )
    });
  });

  test('should generate project files', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('cwd');
    const commandDir = `${__dirname}/project`;
    const projectDir = 'project/project';
    const answers = { projectName: 'project' }
    path.resolve.mockReturnValueOnce(projectDir);
    path.resolve.mockReturnValueOnce(commandDir);
    jest.spyOn(EzwcNew, 'copyBasicFiles').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'generateStylesheet').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'generateMainFile').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'generateEzwcTemplates').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'copyIndexHtml').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'copyWebpackConfig').mockImplementation(() => {});

    await EzwcNew.generateProjectFiles(answers);
    expect(path.resolve).toHaveBeenCalledWith('cwd', 'project');
    expect(path.resolve).toHaveBeenCalledWith(__dirname.replace('/test', ''), 'new/templates');
    expect(Logger.info).toHaveBeenCalledWith('Generating %s source files to the project directory', 'project');
    expect(EzwcNew.copyBasicFiles).toHaveBeenCalledWith(answers, commandDir, projectDir);
    expect(EzwcNew.generateStylesheet).toHaveBeenCalledWith(projectDir, answers);
    expect(EzwcNew.generateMainFile).toHaveBeenCalledWith(answers, commandDir, projectDir);
    expect(EzwcNew.generateEzwcTemplates).toHaveBeenCalledWith(answers, projectDir);
    expect(EzwcNew.copyIndexHtml).toHaveBeenCalledWith(answers, commandDir, projectDir);
    expect(EzwcNew.copyWebpackConfig).toHaveBeenCalledWith(answers, commandDir, projectDir);
  });

  test('should generate ezwc components', async () => {
    process.cwd.mockReturnValue('cwd');
    jest.spyOn(process, 'chdir').mockImplementation(() => {});

    await EzwcNew.generateEzwcComponents('project/dir');
    expect(process.cwd).toHaveBeenCalled();
    expect(process.chdir).toHaveBeenCalledWith('project/dir');
    expect(process.chdir).toHaveBeenCalledWith('cwd');
  });

  describe('deteremineEzwcTemplateExtension tests', () => {
    test('should determine the extension for non-import', () => {
      const ext = EzwcNew.deteremineEzwcTemplateExtension({ imports: [] });
      expect(ext).toBe('');
    });

    test('should determine the default extension', () => {
      const ext = EzwcNew.deteremineEzwcTemplateExtension({ imports: [ 'template' ] });
      expect(ext).toBe('.html');
    });

    test('should determine the extension for ejs', () => {
      const ext = EzwcNew.deteremineEzwcTemplateExtension({ t: 'ejs', imports: [ 'template' ] });
      expect(ext).toBe('.ejs');
    });

    test('should determine the extension for handlebars', () => {
      const ext = EzwcNew.deteremineEzwcTemplateExtension({ t: 'handlebars', imports: [ 'template' ] });
      expect(ext).toBe('.hbs');
    });
  });

  test('should generate the view template for', () => {
    const generatedTemplate = EzwcNew.getEzwcViewFileTemplate({ t: 'html', projectName: 'test-project' });
    expect(generatedTemplate).toBe(
      `
  <h1>Welcome to test-project!</h1>
  <test-component></test-component>
`
    );
  });

  test('should generate the component template', () => {
    const generatedTemplate = EzwcNew.getEzwcComponentFileTemplate({ t: 'html', projectName: 'test-projct' });
    expect(generatedTemplate).toBe(
      `
  <h2>test-projct component</h2>
`
    );
  });

  test('should generate EZWC templates', async () => {
    jest.spyOn(EzwcNew, 'generateEzwcComponents').mockImplementation(() => {});
    jest.spyOn(EzwcNew, 'getEzwcViewFileTemplate').mockReturnValue('view');
    jest.spyOn(EzwcNew, 'getEzwcComponentFileTemplate').mockReturnValue('component');
    jest.spyOn(EzwcNew, 'updateEzwcTemplateFile').mockImplementation(() => {});

    await EzwcNew.generateEzwcTemplates({}, 'project/dir');
    expect(EzwcNew.generateEzwcComponents).toHaveBeenCalledWith('project/dir');
    expect(EzwcNew.getEzwcViewFileTemplate).toHaveBeenCalledWith({});
    expect(EzwcNew.getEzwcComponentFileTemplate).toHaveBeenCalledWith({});
    expect(EzwcNew.updateEzwcTemplateFile).toHaveBeenCalledWith('view', {}, 'view', 'project/dir');
    expect(EzwcNew.updateEzwcTemplateFile).toHaveBeenCalledWith('component', {}, 'component', 'project/dir');
  });

  describe('updateEzwcTemplateFile tests', () => {
    test('should update the template for a view', () => {
      jest.spyOn(EzwcNew, 'deteremineEzwcTemplateExtension').mockReturnValue('.html');
      path.resolve.mockReturnValue('project/file.ezwc.html');
      const replaceMock = jest.fn().mockReturnValue('template');
      fs.readFileSync.mockReturnValue({ replace: replaceMock });
      const answers = { imports: [] };

      EzwcNew.updateEzwcTemplateFile('view', answers, 'template', 'project/dir');
      expect(EzwcNew.deteremineEzwcTemplateExtension).toHaveBeenCalledWith(answers);
      expect(path.resolve).toHaveBeenCalledWith('project/dir', 'src/views/app-home.ezwc.html');
      expect(fs.readFileSync).toHaveBeenCalledWith('project/file.ezwc.html', 'utf8');
      expect(replaceMock).toHaveBeenCalledWith('</template>', 'template</template>');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'project/file.ezwc.html',
        'template',
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      );
    });

    test('should update the template for a component', () => {
      jest.spyOn(EzwcNew, 'deteremineEzwcTemplateExtension').mockReturnValue('.html');
      path.resolve.mockReturnValue('project/file.ezwc.html');
      const replaceMock = jest.fn().mockReturnValue('template');
      fs.readFileSync.mockReturnValue({ replace: replaceMock });
      const answers = { imports: [ 'template' ] };

      EzwcNew.updateEzwcTemplateFile('component', answers, 'template', 'project/dir');
      expect(EzwcNew.deteremineEzwcTemplateExtension).toHaveBeenCalledWith(answers);
      expect(path.resolve).toHaveBeenCalledWith('project/dir', 'src/components/test-component.ezwc.html');
      expect(fs.readFileSync).toHaveBeenCalledWith('project/file.ezwc.html', 'utf8');
      expect(replaceMock).toHaveBeenCalledWith('</template>', 'template</template>');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'project/file.ezwc.html',
        'template',
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      );
    });
  });
});
