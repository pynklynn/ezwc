const EzwcTemplates = require('./templates');
const Logger = require('./utils/logger');
const Importer = require('./utils/importer');

jest.mock('./utils/logger');
jest.mock('./utils/importer');

describe('template processing tests', () => {
  describe('parseTemplate', () => {
    test('should output an error message when there is no template', () => {
      jest.spyOn(process, 'exit').mockImplementation(() => {});

      EzwcTemplates.parseTemplate(false, '');

      expect(Logger.info).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalled();
    });

    test('should output a template string', () => {
      const mockDom = {
        attr() {
          return 'importFile';
        }
      };
      Importer.resolveImport.mockReturnValue('TEST');

      const templateString = EzwcTemplates.parseTemplate(mockDom, 'STYLES');

      expect(Logger.info).toHaveBeenCalled();
      expect(templateString).toBe(`
STYLES
TEST
    `);
    });
  });

  describe('create render function', () => {
    test('should create the render function for html', () => {
      const createRenderFunction = EzwcTemplates.createRenderFunction('TEST');
      expect(createRenderFunction).toBe(`render(data) {
    const template = \`TEST\`;
    const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
    this.shadowRoot.appendChild(templateNode.cloneNode(true));
  }`
      );
    });

    test('should create the render function for lit', () => {
      const createRenderFunction = EzwcTemplates.createRenderFunction('TEST', 'lit');
      expect(createRenderFunction).toBe(`render(data) {
    const template = html\`TEST\`;
    render(template(this), this.shadowRoot);
  }`
      );
    });

    test('should create the render function for lit-html', () => {
      const createRenderFunction = EzwcTemplates.createRenderFunction('TEST', 'lit-html');
      expect(createRenderFunction).toBe(`render(data) {
    const template = html\`TEST\`;
    render(template(this), this.shadowRoot);
  }`
      );
    });
  });

  describe('create import line', () => {
    test('should create the import line for html', () => {
      const createImportLine = EzwcTemplates.createImport();
      expect(createImportLine).toBe('');
    });

    test('should create the import line for lit', () => {
      const createImportLine = EzwcTemplates.createImport('lit');
      expect(createImportLine).toBe(`import { html, render } from 'lit-html';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });

    test('should create the import line for lit-html', () => {
      const createImportLine = EzwcTemplates.createImport('lit-html');
      expect(createImportLine).toBe(`import { html, render } from 'lit-html';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });
  });
});
