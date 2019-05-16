const Logger = require('../utils/logger');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const createPackageJson = require('create-package-json');
const prettier = require('prettier');
const EzwcNew = require('./new');

jest.mock('../utils/logger');
jest.mock('inquirer');
jest.mock('fs');
jest.mock('path');
jest.mock('create-package-json');
jest.mock('prettier');

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

  test('should initialize NPM project', () => {
    path.resolve.mockReturnValue('cwd/test-project');
    createPackageJson.mockReturnValue(new Promise((resolve, reject) => resolve()));

    EzwcNew.initNpmProject('test-project');
    expect(Logger.info).toHaveBeenCalledWith('Initializing %s project and installing packages', 'NPM');
    expect(process.cwd).toHaveBeenCalled();
    expect(path.resolve).toHaveBeenCalledWith('cwd', 'test-project');
    expect(process.chdir).toHaveBeenCalledWith('cwd/test-project');
    expect(createPackageJson).toHaveBeenCalled();
    // expect(process.cwd).toHaveBeenCalledWith('cwd');
    // expect(Logger.success).toHaveBeenCalledWith(`EZWC project %s has been initialized!`, 'Done!', 'test-project');
  });

  test('should create project subdirectories', () => {
    path.resolve.mockReturnValue('TEST');
    fs.mkdirSync.mockImplementation(() => {});

    EzwcNew.createProjectSubdirectories('test-project', 'src', 'dist')
    expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'source');
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'src'));
    expect(Logger.info).toHaveBeenCalledWith('Creating %s directory', 'output');
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'test-project', 'dist'));
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
});
