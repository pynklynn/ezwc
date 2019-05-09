const fs = require('fs');
const path = require('path');
const dashify = require('dashify');
const pascalcase = require('pascalcase');
const prettier = require('prettier');
const EzwcGenerate = require('./generate');
const Logger = require('../utils/logger');
const EzwcScripts = require('../scripts');
const EzwcStyles = require('../styles');
const EzwcTemplates = require('../templates');

jest.mock('fs');
jest.mock('path');
jest.mock('dashify');
jest.mock('pascalcase');
jest.mock('prettier');
jest.mock('../utils/logger');
jest.mock('../scripts');
jest.mock('../styles');
jest.mock('../templates');

describe('generate command tests', () => {
  beforeEach(() => {
    fs.writeFileSync.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('process tests', () => {
    test('should fail when there is no dash in the selector', () => {
      jest.spyOn(process, 'exit').mockImplementation(() => {});
      dashify.mockReturnValue('test');

      EzwcGenerate.process('test', {});
      expect(dashify).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalledWith('%s must contain at least one dash', 'selector');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should succeed when processing', () => {
      dashify.mockReturnValue('test-component');
      pascalcase.mockReturnValue('TestComponent');
      prettier.format.mockReturnValue('TEST');
      jest.spyOn(EzwcGenerate, 'generateCode').mockImplementation(() => {});
      jest.spyOn(EzwcGenerate, 'writeFiles').mockImplementation(() => {});
      jest.spyOn(EzwcGenerate, 'buildOutputDir').mockImplementation(() => {});

      EzwcGenerate.process('test', {});
      expect(dashify).toHaveBeenCalled();
      expect(pascalcase).toHaveBeenCalled();
      expect(EzwcGenerate.buildOutputDir).toHaveBeenCalled();
      expect(EzwcGenerate.generateCode).toHaveBeenCalled();
      expect(prettier.format).toHaveBeenCalled();
      expect(EzwcGenerate.writeFiles).toHaveBeenCalled();
    });
  });

  describe('build output dir', () => {
    test('should build the output dir for selector only', () => {
      const outputPath = EzwcGenerate.buildOutputDir('my-selector', 'my-selector', undefined);
      expect(outputPath).toBe('');
    });

    test('should build the output dir for selector only with extension', () => {
      const outputPath = EzwcGenerate.buildOutputDir('my-selector.ezwc', 'my-selector', undefined);
      expect(outputPath).toBe('');
    });

    test('should build the output dir for selector with path', () => {
      const outputPath = EzwcGenerate.buildOutputDir('path/to/my-selector', 'my-selector', undefined);
      expect(outputPath).toBe('path/to/');
    });

    test('should build the output dir for selector with path and extension', () => {
      const outputPath = EzwcGenerate.buildOutputDir('path/to/my-selector.ezwc', 'my-selector', undefined);
      expect(outputPath).toBe('path/to/');
    });

    test('should build the output dir for selector with path as well as dir', () => {
      const outputPath = EzwcGenerate.buildOutputDir('path/to/my-selector', 'my-selector', 'src');
      expect(outputPath).toBe('src/path/to/');
    });

    test('should build the output dir for selector with path and extension as well as dir', () => {
      const outputPath = EzwcGenerate.buildOutputDir('path/to/my-selector.ezwc', 'my-selector', 'src');
      expect(outputPath).toBe('src/path/to/');
    });
  });

  test('should generate the code', () => {
    EzwcTemplates.generateTemplateTag.mockReturnValue('TEMPLATE');
    EzwcScripts.generateScriptTag.mockReturnValue('SCRIPT');
    EzwcStyles.generateStyleTag.mockReturnValue('STYLE');

    const generatedCode = EzwcGenerate.generateCode('test-component', 'TestComponent', {
      template: 'hbs',
      ts: true,
      styles: 'scss',
      importAll: true
    });
    expect(EzwcTemplates.generateTemplateTag).toHaveBeenCalledWith('hbs', 'test-component', true);
    expect(EzwcScripts.generateScriptTag).toHaveBeenCalledWith('test-component', 'TestComponent', true, true);
    expect(EzwcStyles.generateStyleTag).toHaveBeenCalledWith('scss', 'test-component', true);
    expect(generatedCode).toBe(`
TEMPLATE
SCRIPT
STYLE
`
    );
  });

  test('should write out the ezwc file', () => {
    fs.mkdirSync.mockImplementation(() => {});
    jest.spyOn(process, 'cwd').mockReturnValue('DIR');
    jest.spyOn(EzwcGenerate, 'writeStylesheet').mockImplementation(() => {});
    jest.spyOn(EzwcGenerate, 'writeTemplate').mockImplementation(() => {});
    jest.spyOn(EzwcGenerate, 'writeScript').mockImplementation(() => {});
    path.resolve.mockImplementation((path1, path2) => `${path1}/${path2}`);

    EzwcGenerate.writeFiles('test-component', 'CODE', { dir: 'path' }, 'TestComponent');
    expect(path.resolve).toHaveBeenCalledWith('DIR', 'path');
    expect(path.resolve).toHaveBeenCalledWith('DIR/path', 'test-component.ezwc');
    expect(Logger.info).toHaveBeenCalledWith(`Making sure directory "%s" exists...`, 'DIR/path');
    expect(fs.mkdirSync).toHaveBeenCalledWith('DIR/path', { recursive: true });
    expect(Logger.info).toHaveBeenCalledWith(`Writing component file %s...`, 'test-component.ezwc');
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(EzwcGenerate.writeStylesheet).toHaveBeenCalledWith('test-component.ezwc', 'DIR/path/test-component.ezwc', { dir: 'path' });
    expect(EzwcGenerate.writeTemplate).toHaveBeenCalledWith('test-component.ezwc', 'DIR/path/test-component.ezwc', { dir: 'path' });
    expect(EzwcGenerate.writeScript).toHaveBeenCalledWith('test-component.ezwc', 'DIR/path/test-component.ezwc', { dir: 'path' }, 'TestComponent');
    expect(Logger.success).toHaveBeenCalledWith(`EZWC component file %s has been generated!`, 'Done!', 'test-component.ezwc');
    expect(Logger.emptyLine).toHaveBeenCalled();
  });

  describe('write stylessheet tests', () => {
    test('should write stylesheet for CSS', () => {
      EzwcGenerate.writeStylesheet('hello-world.ezwc', 'path/to/hello-world.ezwc', { importStyles: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing stylesheet file %s...`, `hello-world.ezwc.css`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should write stylesheet for Scss', () => {
      EzwcGenerate.writeStylesheet('hello-world.ezwc', 'path/to/hello-world.ezwc', { styles: 'scss', importAll: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing stylesheet file %s...`, `hello-world.ezwc.scss`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('write template tests', () => {
    test('should write template for HTML', () => {
      EzwcGenerate.writeTemplate('hello-world.ezwc', 'path/to/hello-world.ezwc', { importTemplate: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing template file %s...`, `hello-world.ezwc.html`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should write template for Pug', () => {
      EzwcGenerate.writeTemplate('hello-world.ezwc', 'path/to/hello-world.ezwc', { template: 'pug', importAll: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing template file %s...`, `hello-world.ezwc.pug`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should write template for EJS', () => {
      EzwcGenerate.writeTemplate('hello-world.ezwc', 'path/to/hello-world.ezwc', { template: 'ejs', importAll: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing template file %s...`, `hello-world.ezwc.ejs`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should write template for HBS', () => {
      EzwcGenerate.writeTemplate('hello-world.ezwc', 'path/to/hello-world.ezwc', { template: 'hbs', importAll: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing template file %s...`, `hello-world.ezwc.hbs`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should write template for Handlebars', () => {
      EzwcGenerate.writeTemplate('hello-world.ezwc', 'path/to/hello-world.ezwc', { template: 'handlebars', importAll: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing template file %s...`, `hello-world.ezwc.hbs`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('write script tests', () => {
    test('should write script for JavaScript', () => {
      EzwcGenerate.writeScript('hello-world.ezwc', 'path/to/hello-world.ezwc', { importScript: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing script file %s...`, `hello-world.ezwc.js`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should write script for Typescript', () => {
      EzwcGenerate.writeScript('hello-world.ezwc', 'path/to/hello-world.ezwc', { ts: true, importAll: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing script file %s...`, `hello-world.ezwc.ts`);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
});
