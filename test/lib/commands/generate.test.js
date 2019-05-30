const fs = require('fs');
const path = require('path');
const dashify = require('dashify');
const pascalcase = require('pascalcase');
const prettier = require('prettier');
const EzwcGenerate = require('@lib/commands/generate');
const Logger = require('@lib/utils/logger');
const EzwcScripts = require('@lib/scripts');
const EzwcStyles = require('@lib/styles');
const EzwcTemplates = require('@lib/templates');

jest.mock('fs');
jest.mock('path');
jest.mock('dashify');
jest.mock('pascalcase');
jest.mock('prettier');
jest.mock('@lib/utils/logger');
jest.mock('@lib/scripts');
jest.mock('@lib/styles');
jest.mock('@lib/templates');

describe('generate command tests', () => {
  beforeEach(() => {
    fs.writeFileSync.mockImplementation(() => {});
    fs.existsSync.mockReturnValue(false);
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

    const flags = {
      template: 'hbs',
      ts: true,
      styles: 'scss',
      importAll: true
    };
    const generatedCode = EzwcGenerate.generateCode('test-component', 'TestComponent', flags);
    expect(EzwcTemplates.generateTemplateTag).toHaveBeenCalledWith('hbs', 'test-component', true);
    expect(EzwcScripts.generateScriptTag).toHaveBeenCalledWith('test-component', 'TestComponent', flags);
    expect(EzwcStyles.generateStyleTag).toHaveBeenCalledWith('test-component', flags);
    expect(generatedCode).toBe(`
TEMPLATE
SCRIPT
STYLE
`
    );
  });

  describe('writeFiles tests', () => {
    beforeEach(() => {
      fs.mkdirSync.mockImplementation(() => {});
      jest.spyOn(process, 'cwd').mockReturnValue('DIR');
      path.resolve.mockImplementation((path1, path2) => `${path1}/${path2}`);
      fs.writeFileSync.mockClear();
    });

    test('should write out the ezwc file', () => {
      jest.spyOn(EzwcGenerate, 'writeStylesheet').mockImplementation(() => {});
      jest.spyOn(EzwcGenerate, 'writeTemplate').mockImplementation(() => {});
      jest.spyOn(EzwcGenerate, 'writeScript').mockImplementation(() => {});

      EzwcGenerate.writeFiles('test-component', 'CODE', { dir: 'path' }, 'TestComponent');
      expect(path.resolve).toHaveBeenCalledWith('DIR', 'path');
      expect(path.resolve).toHaveBeenCalledWith('DIR/path', 'test-component.ezwc');
      expect(Logger.info).toHaveBeenCalledWith(`Making sure directory "%s" exists...`, 'DIR/path');
      expect(fs.mkdirSync).toHaveBeenCalledWith('DIR/path', { recursive: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing component file %s...`, 'test-component.ezwc');
      expect(fs.existsSync).toHaveBeenCalledWith('DIR/path/test-component.ezwc');
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(EzwcGenerate.writeStylesheet).toHaveBeenCalledWith('test-component.ezwc', 'DIR/path/test-component.ezwc', { dir: 'path' });
      expect(EzwcGenerate.writeTemplate).toHaveBeenCalledWith('test-component.ezwc', 'DIR/path/test-component.ezwc', { dir: 'path' });
      expect(EzwcGenerate.writeScript).toHaveBeenCalledWith('test-component.ezwc', 'DIR/path/test-component.ezwc', { dir: 'path' }, 'TestComponent');
      expect(Logger.success).toHaveBeenCalledWith(`EZWC component file %s has been generated!`, 'Done!', 'test-component.ezwc');
      expect(Logger.emptyLine).toHaveBeenCalled();
    });

    test(`should fail to write out file because it already exists and isn't using force`, () => {
      fs.existsSync.mockReturnValue(true);
      EzwcGenerate.writeFiles('test-component', 'CODE', { dir: 'path', force: false }, 'TestComponent');
      expect(path.resolve).toHaveBeenCalledWith('DIR', 'path');
      expect(path.resolve).toHaveBeenCalledWith('DIR/path', 'test-component.ezwc');
      expect(Logger.info).toHaveBeenCalledWith(`Making sure directory "%s" exists...`, 'DIR/path');
      expect(fs.mkdirSync).toHaveBeenCalledWith('DIR/path', { recursive: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing component file %s...`, 'test-component.ezwc');
      expect(fs.existsSync).toHaveBeenCalledWith('DIR/path/test-component.ezwc');
      expect(Logger.warn).toHaveBeenCalledWith('%s already exists! Use the %s option to overwrite it. Not writing stylesheet file.', 'DIR/path/test-component.ezwc', 'force');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('write stylessheet tests', () => {
    test('should write stylesheet for CSS', () => {
      EzwcGenerate.writeStylesheet('hello-world.ezwc', 'path/to/hello-world.ezwc', { importStyles: true, shadowRoot: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing stylesheet file %s...`, `hello-world.ezwc.css`);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'path/to/hello-world.ezwc.css',
        ':host {}\n',
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      );
    });

    test('should write stylesheet for Scss', () => {
      EzwcGenerate.writeStylesheet('hello-world.ezwc', 'path/to/hello-world.ezwc', { styles: 'scss', importAll: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing stylesheet file %s...`, `hello-world.ezwc.scss`);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'path/to/hello-world.ezwc.scss',
        'hello-world {}\n',
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      );
    });

    test(`should skip writing the stylesheet file if it already exists and force isn't set`, () => {
      fs.existsSync.mockReturnValue(true);
      EzwcGenerate.writeStylesheet('hello-world.ezwc', 'path/to/hello-world.ezwc', { importStyles: true });
      expect(Logger.warn).toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalledWith(
        'path/to/hello-world.ezwc.css',
        `/* replace with styles to this file for hello-world.ezwc.css */\n`,
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      );
    });
  });

  describe('write template tests', () => {
    test('should write template for HTML', () => {
      EzwcGenerate.writeTemplate('hello-world.ezwc', 'path/to/hello-world.ezwc', { importTemplate: true });
      expect(Logger.info).toHaveBeenCalledWith(`Writing template file %s...`, `hello-world.ezwc.html`);
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

    test(`should skip writing the template file if it already exists and force isn't set`, () => {
      fs.existsSync.mockReturnValue(true);
      EzwcGenerate.writeTemplate('hello-world.ezwc', 'path/to/hello-world.ezwc', { importTemplate: true });
      expect(Logger.warn).toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalledWith(
        'path/to/hello-world.ezwc.html',
        `<!-- replace with template code for hello-world.ezwc.html -->\n`,
        {
          encoding: 'utf8',
          flag: 'w+'
        }
      );
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

    test(`should skip writing the script file if it already exists and force isn't set`, () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockClear();
      EzwcGenerate.writeScript('hello-world.ezwc', 'path/to/hello-world.ezwc', { importScript: true }, 'HelloWorld');
      expect(Logger.warn).toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  test('should show an error message for writing a file', () => {
    try {
      EzwcGenerate.errorWritingFile(new Error, 'ERROR')
      expect(Logger.error).toHaveBeenCalledWith('ERROR');
      expect(EzwcGenerate.errorWritingFile).toThrow(Error);
    } catch(err) {}
  });
});
