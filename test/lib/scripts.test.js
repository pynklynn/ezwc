const EzwcScripts = require('@lib/scripts');
const EzwcTemplates = require('@lib/templates');
const Logger = require('@lib/utils/logger');
const Importer = require('@lib/utils/importer');
const ts = require('typescript');
const prettier = require('prettier');

jest.mock('@lib/utils/logger');
jest.mock('@lib/templates');
jest.mock('@lib/utils/importer');
jest.mock('typescript');
jest.mock('prettier');

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
      Importer.resolveImport.mockReturnValue('SCRIPT');
      jest.spyOn(EzwcScripts, 'updateConstructorContent');
      jest.spyOn(EzwcScripts, 'createDefinition').mockReturnValue('SCRIPT');
      EzwcTemplates.createImport.mockReturnValue('HTML');
      jest.spyOn(EzwcScripts, 'injectRenderCall').mockReturnValue('RENDER')
      jest.spyOn(EzwcScripts, 'updateRenderContent').mockReturnValue('RENDER');
      prettier.format.mockReturnValue('PRETTY');
      const script = EzwcScripts.parseScript(mockDom, 'TEMPLATE', { template: 'html' });

      expect(script).toBe('HTMLRENDERSCRIPT');
      expect(prettier.format).toHaveBeenCalledWith('SCRIPT', {
        singleQuote: true,
        trailingComma: 'es5',
        parser: 'babel'
      });
      expect(EzwcScripts.injectRenderCall).toHaveBeenCalledWith('PRETTY');
      expect(EzwcTemplates.createImport).toHaveBeenCalledWith('html');
      expect(EzwcScripts.updateConstructorContent).toHaveBeenCalled();
      expect(EzwcScripts.updateRenderContent).toHaveBeenCalled();
      expect(EzwcScripts.createDefinition).toHaveBeenCalled();
    });

    test('should return a script string for ts', () => {
      const mockDom = {
        attr(attr) {
          if (attr === 'src') {
            return 'importFile';
          } else {
            return 'ts';
          }
        }
      };
      jest.spyOn(EzwcScripts, 'processTs').mockReturnValue('TEST');
      Importer.resolveImport.mockReturnValue('TS');
      jest.spyOn(EzwcScripts, 'updateConstructorContent');
      jest.spyOn(EzwcScripts, 'createDefinition').mockReturnValue('SCRIPT');
      EzwcTemplates.createImport.mockReturnValue('HTML');
      jest.spyOn(EzwcScripts, 'updateRenderContent').mockReturnValue('RENDER');
      const script = EzwcScripts.parseScript(mockDom, 'TEMPLATE', { template: 'html' });
      expect(script).toBe('HTMLRENDERSCRIPT');
      expect(Logger.info).toHaveBeenCalled();
      expect(EzwcScripts.processTs).toHaveBeenCalled();
      expect(EzwcTemplates.createImport).toHaveBeenCalledWith('html');
      expect(EzwcScripts.updateConstructorContent).toHaveBeenCalled();
      expect(EzwcScripts.updateRenderContent).toHaveBeenCalled();
      expect(EzwcScripts.createDefinition).toHaveBeenCalled();
    });

    test('should return a script string for typescript', () => {
      const mockDom = {
        attr(attr) {
          if (attr === 'src') {
            return 'importFile';
          } else {
            return 'typescript';
          }
        }
      };
      jest.spyOn(EzwcScripts, 'processTs').mockReturnValue('TEST');
      Importer.resolveImport.mockReturnValue('TS');
      jest.spyOn(EzwcScripts, 'updateConstructorContent');
      jest.spyOn(EzwcScripts, 'createDefinition').mockReturnValue('SCRIPT');
      jest.spyOn(EzwcScripts, 'updateRenderContent').mockReturnValue('RENDER');
      EzwcTemplates.createImport.mockReturnValue('HTML');
      const script = EzwcScripts.parseScript(mockDom, 'TEMPLATE', { template: 'html' });
      expect(script).toBe('HTMLRENDERSCRIPT');
      expect(Logger.info).toHaveBeenCalled();
      expect(EzwcScripts.processTs).toHaveBeenCalled();
      expect(EzwcTemplates.createImport).toHaveBeenCalledWith('html');
      expect(EzwcScripts.updateConstructorContent).toHaveBeenCalled();
      expect(EzwcScripts.updateRenderContent).toHaveBeenCalled();
      expect(EzwcScripts.createDefinition).toHaveBeenCalled();
    });
  });

  describe('update constructor content', () => {
    test('should update the constructor content with shadow dom', () => {
      const shadowDom = EzwcScripts.updateConstructorContent('\nsuper();', { shadowRoot: true });
      expect(shadowDom).toBe(`
super();
this.attachShadow({ mode: 'open' });`
      );
    });

    test('should update the constructor content without shadow dom', () => {
      const shadowDom = EzwcScripts.updateConstructorContent('\nsuper();', { shadowRoot: false });
      expect(shadowDom).toBe(`
super();`
      );
    });
  });

  describe('update the render content', () => {
    test('should update the render content for an existing render function', () => {
      EzwcTemplates.createRenderFunctionContent.mockReturnValue('\nRENDER');
      const renderContent = EzwcScripts.updateRenderContent('render(data) {\nEXISTING\n}');
      expect(renderContent).toBe(`render(data) {
RENDER
EXISTING
}`
      );
    });

    test('should create the render content for a new render function', () => {
      EzwcTemplates.createRenderFunctionContent.mockReturnValue('RENDER');
      const renderContent = EzwcScripts.updateRenderContent('');
      expect(renderContent).toBe(`render(data) {
RENDER
}
`
      );
    });
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
      expect(definitionString).toBe(`\n\nwindow.customElements.define('test-component', TestComponent);`)
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

  describe('process Typescript', () => {
    test('should transpile Typescript', () => {
      ts.transpileModule.mockReturnValue({ outputText: 'TEST' });
      const renderedTs = EzwcScripts.processTs('');
      expect(ts.transpileModule).toHaveBeenCalled();
      expect(renderedTs).toBe('TEST');
    });

    test('should fail to transpile Typescript', () => {
      ts.transpileModule.mockImplementation(() => {
        throw new Error();
      });
      EzwcScripts.processTs();
      expect(ts.transpileModule).toThrow(Error);
    });
  });

  describe('generate script tag', () => {
    test('should generate script tag for JavaScript component', () => {
      const generatedTag = EzwcScripts.generateScriptTag('hello-world', 'HelloWorld', { shadowRoot: true });
      expect(generatedTag).toBe(`
<script selector="hello-world">

class HelloWorld extends HTMLElement {
  constructor() {
    super();
  }
}

</script>
`
      );
    });

    test('should generate script tag for Typescript component', () => {
      const generatedTag = EzwcScripts.generateScriptTag('hello-world', 'HelloWorld', { ts: true, shadowRoot: true });
      expect(generatedTag).toBe(`
<script lang="ts" selector="hello-world">

class HelloWorld extends HTMLElement {
  constructor() {
    super();
  }
}

</script>
`
      );
    });

    test('should generate script tag with import for JavaScript component', () => {
      const generatedTag = EzwcScripts.generateScriptTag('hello-world', 'HelloWorld', { importScript: true, shadowRoot: true });
      expect(generatedTag).toBe(`
<script src="./hello-world.ezwc.js" selector="hello-world">

</script>
`
      );
    });

    test('should generate script tag with import for Typescript component', () => {
      const generatedTag = EzwcScripts.generateScriptTag('hello-world', 'HelloWorld', { ts: true, importAll: true, shadowRoot: true });
      expect(generatedTag).toBe(`
<script lang="ts" src="./hello-world.ezwc.ts" selector="hello-world">

</script>
`
      );
    });

    test('should generate script tag for JavaScript component with noshadow attribute', () => {
      const generatedTag = EzwcScripts.generateScriptTag('hello-world', 'HelloWorld', { shadowRoot: false });
      expect(generatedTag).toBe(`
<script no-shadow selector="hello-world">

class HelloWorld extends HTMLElement {
  constructor() {
    super();
  }
}

</script>
`
      );
    });
  });

  describe('injectRenderCall tests', () => {
    test('should update an existing connectedCallback', () => {
      const updatedConnectedCallback = EzwcScripts.injectRenderCall('connectedCallback() {\n}');
      expect(updatedConnectedCallback).toBe('connectedCallback() {\n    this.render(this);\n}');
    });

    test('should create a new connectedCallback', () => {
      const updatedConnectedCallback = EzwcScripts.injectRenderCall('  constructor() {\n  }');
      expect(updatedConnectedCallback).toBe('  constructor() {\n  }\n\n  connectedCallback() {\n    this.render(this);\n  }');
    });
  });
});