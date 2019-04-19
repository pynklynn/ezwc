const EzwcScripts = require('./scripts');
const EzwcTemplates = require('./templates');
const Logger = require('./utils/logger');
const Importer = require('./utils/importer');

jest.mock('./utils/logger');
jest.mock('./templates');
jest.mock('./utils/importer');

describe('script processing tests', () => {
  beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parse script', () => {
    test('should return an error when there is no script tag', () => {
      EzwcScripts.parseScript(null);

      expect(Logger.info).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalled();
    });

    test('should return the script', () => {
      const mockDom = {
        attr: jest.fn()
      };
      jest.spyOn(EzwcScripts, 'injectTemplate').mockReturnValue('TEMPLATE');
      jest.spyOn(EzwcScripts, 'createDefinition').mockReturnValue('SCRIPT')
      const script = EzwcScripts.parseScript(mockDom, 'TEMPLATE');

      expect(script).toBe('TEMPLATESCRIPT');
    });
  });

  test('should inject the template', () => {
    jest.spyOn(EzwcScripts, 'createShadowDom').mockReturnValue('super();');
    EzwcTemplates.createTemplateFunction.mockReturnValue('TEMPLATE')

    const injectedSuper = EzwcScripts.injectTemplate('\nsuper();', 'TEMPLATE');
    expect(injectedSuper).toBe(`\n  TEMPLATE\n\nsuper();`);
  });

  test('should create shadow dom', () => {
    const shadowDom = EzwcScripts.createShadowDom();
    expect(shadowDom).toBe(`super();
    this._buildTemplate();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.template.cloneNode(true));
    `);
  });

  describe('create the definition', () => {
    test('should throw an error when selector is not found', () => {
      jest.spyOn(EzwcScripts, 'parseClassName');
      const mockDom = {
        attr() {
          return false;
        }
      };

      EzwcScripts.createDefinition('', mockDom);

      expect(EzwcScripts.parseClassName).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalledWith('Selector not found. Please be sure to include the %s attribute on the script tag.', 'selector');
      expect(process.exit).toHaveBeenCalled();
    });

    test('should return the create element part of the script', () => {
      jest.spyOn(EzwcScripts, 'parseClassName').mockReturnValue('TestComponent');
      const mockDom = {
        attr() {
          return 'test-component';
        }
      };

      const definitionString = EzwcScripts.createDefinition('', mockDom);

      expect(EzwcScripts.parseClassName).toHaveBeenCalled();
      expect(definitionString).toBe(`

customElements.define('test-component', TestComponent);
`)
    });
  });

  describe('class name parsing', () => {
    test('should fail to parse the class name', () => {
      EzwcScripts.parseClassName('foobar');

      expect(Logger.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalled();
    });

    test('should parse and return the class name', () => {
      const className = EzwcScripts.parseClassName('class TestComponent extends HtmlElement {');
      expect(className).toBe('TestComponent');
    });
  });
});
