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
      jest.spyOn(EzwcGenerate, 'writeFile').mockImplementation(() => {});

      EzwcGenerate.process('test', {});
      expect(dashify).toHaveBeenCalled();
      expect(pascalcase).toHaveBeenCalled();
      expect(EzwcGenerate.generateCode).toHaveBeenCalled();
      expect(prettier.format).toHaveBeenCalled();
      expect(EzwcGenerate.writeFile).toHaveBeenCalled();
    });
  });

  test('should generate the code', () => {
    EzwcTemplates.generateTemplateTag.mockReturnValue('TEMPLATE');
    EzwcScripts.generateScriptTag.mockReturnValue('SCRIPT');
    EzwcStyles.generateStyleTag.mockReturnValue('STYLE');

    const generatedCode = EzwcGenerate.generateCode('test-component', 'TestComponent', {
      template: 'hbs',
      ts: true,
      styles: 'scss'
    });
    expect(EzwcTemplates.generateTemplateTag).toHaveBeenCalledWith('hbs');
    expect(EzwcScripts.generateScriptTag).toHaveBeenCalledWith('test-component', 'TestComponent', true);
    expect(EzwcStyles.generateStyleTag).toHaveBeenCalledWith('scss');
    expect(generatedCode).toBe(`
TEMPLATE
SCRIPT
STYLE
`
    );
  });

  test('should write out the ezwc file', () => {
    fs.writeFileSync.mockImplementation(() => {});
    fs.mkdirSync.mockImplementation(() => {});
    jest.spyOn(process, 'cwd').mockReturnValue('DIR');
    path.resolve.mockImplementation((path1, path2) => `${path1}/${path2}`);

    EzwcGenerate.writeFile('test-component', 'CODE', 'path');
    expect(path.resolve).toHaveBeenCalledWith('DIR', 'path');
    expect(path.resolve).toHaveBeenCalledWith('DIR/path', 'test-component.ezwc');
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(Logger.success).toHaveBeenCalledWith(`EZWC component file %s has been generated!`, 'Done!', 'test-component.ezwc');
    expect(Logger.emptyLine).toHaveBeenCalled();
  });
});
