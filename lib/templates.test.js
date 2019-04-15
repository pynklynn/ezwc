const EzwcTemplates = require('./templates');
const Logger = require('./utils/logger');
const Importer = require('./utils/importer');

jest.mock('./utils/logger');
jest.mock('./utils/importer');

describe('template processing tests', () => {
  describe('parseTemplate', () => {
    test('should output an error message when there is no template', () => {
      const querySelectorMock = {
        querySelector() {
          return false;
        }
      };
      jest.spyOn(process, 'exit').mockImplementation(() => {});

      EzwcTemplates.parseTemplate(querySelectorMock, '');

      expect(Logger.info).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalled();
    });

    test('should output a template string', () => {
      const querySelectorMock = {
        querySelector() {
          return {
            getAttribute() {
              return 'importFile';
            }
          };
        }
      };
      Importer.resolveImport.mockReturnValue('TEST');

      const templateString = EzwcTemplates.parseTemplate(querySelectorMock, 'STYLES');

      expect(Logger.info).toHaveBeenCalled();
      expect(templateString).toBe(`
STYLES
TEST
    `);
    });
  });

  test('should create the template function', () => {
    const createTemplateFunction = EzwcTemplates.createTemplateFunction('TEST');
    expect(createTemplateFunction).toBe(`_buildTemplate() {
      const template = \`TEST\`;
      this.template = new DOMParser().parseFromString(template, 'text/html').firstChild;
    }`);
  });
});
