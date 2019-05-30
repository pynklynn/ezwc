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
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST', { shadowRoot: true });
      expect(createRenderFunctionContent).toBe(`
          const template = \`TEST\`;
          const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
          this.shadowRoot.innerHTML = '';
          this.shadowRoot.appendChild(templateNode.cloneNode(true));
`
      );
    });

    test('should create the render function for html with no-shadow', () => {
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST', { shadowRoot: false });
      expect(createRenderFunctionContent).toBe(`
          const template = \`TEST\`;
          const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
          this.innerHTML = '';
          this.appendChild(templateNode.cloneNode(true));
`
      );
    });

    test('should create the render function for lit', () => {
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST', { template: 'lit', shadowRoot: true });
      expect(createRenderFunctionContent).toBe(`
          const template = html\`TEST\`;
          render(template(this), this.shadowRoot);
`
      );
    });

    test('should create the render function for lit-html', () => {
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST', { template: 'lit-html', shadowRoot: true });
      expect(createRenderFunctionContent).toBe(`
          const template = html\`TEST\`;
          render(template(this), this.shadowRoot);
`
      );
    });

    test('should create the render function for hbs', () => {
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST', { template: 'hbs', shadowRoot: true });
      expect(createRenderFunctionContent).toBe(`
          if (!this.compiledTemplate) {
            this.compiledTemplate = Handlebars.compile(\`TEST\`);
          }
          this.shadowRoot.innerHTML = this.compiledTemplate(data);
`
      );
    });

    test('should create the render function for handlebars', () => {
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST', { template: 'handlebars', shadowRoot: true });
      expect(createRenderFunctionContent).toBe(`
          if (!this.compiledTemplate) {
            this.compiledTemplate = Handlebars.compile(\`TEST\`);
          }
          this.shadowRoot.innerHTML = this.compiledTemplate(data);
`
      );
    });

    test('should create the render function for ejs', () => {
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST', { template: 'ejs', shadowRoot: true });
      expect(createRenderFunctionContent).toBe(`
          const template = \`TEST\`;
          this.shadowRoot.innerHTML = ejs.render(template, data);
`
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

    test('should create the import line for hbs', () => {
      const createImportLine = EzwcTemplates.createImport('hbs');
      expect(createImportLine).toBe(`import Handlebars from 'handlebars/dist/handlebars';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });

    test('should create the import line for handlebars', () => {
      const createImportLine = EzwcTemplates.createImport('handlebars');
      expect(createImportLine).toBe(`import Handlebars from 'handlebars/dist/handlebars';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });

    test('should create the import line for ejs', () => {
      const createImportLine = EzwcTemplates.createImport('ejs');
      expect(createImportLine).toBe(`import ejs from 'ejs/ejs';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });
  });

  describe('generate template tag', () => {
    test('should generate a template tag for HTML', () => {
      const templateTag = EzwcTemplates.generateTemplateTag();
      expect(templateTag).toBe(`
<template>
</template>
`
      );
    });

    test('should generate a template tag for lit', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('lit');
      expect(templateTag).toBe(`
<template lang="lit">
</template>
`
      );
    });

    test('should generate a template tag for lit-html', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('lit-html');
      expect(templateTag).toBe(`
<template lang="lit">
</template>
`
      );
    });

    test('should generate a template tag for hbs', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('hbs');
      expect(templateTag).toBe(`
<template lang="hbs">
</template>
`
      );
    });

    test('should generate a template tag for handlebars', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('handlebars');
      expect(templateTag).toBe(`
<template lang="hbs">
</template>
`
      );
    });

    test('should generate a template tag for ejs', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('ejs');
      expect(templateTag).toBe(`
<template lang="ejs">
</template>
`
      );
    });

    test('should generate a template tag with import for HTML', () => {
      const templateTag = EzwcTemplates.generateTemplateTag(undefined, 'hello-world', true);
      expect(templateTag).toBe(`
<template src="./hello-world.ezwc.html">
</template>
`
      );
    });

    test('should generate a template tag with import for lit', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('lit', 'hello-world', true);
      expect(templateTag).toBe(`
<template lang="lit" src="./hello-world.ezwc.html">
</template>
`
      );
    });

    test('should generate a template tag with import for lit-html', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('lit-html', 'hello-world', true);
      expect(templateTag).toBe(`
<template lang="lit" src="./hello-world.ezwc.html">
</template>
`
      );
    });

    test('should generate a template tag with import for hbs', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('hbs', 'hello-world', true);
      expect(templateTag).toBe(`
<template lang="hbs" src="./hello-world.ezwc.hbs">
</template>
`
      );
    });

    test('should generate a template tag with import for handlebars', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('handlebars', 'hello-world', true);
      expect(templateTag).toBe(`
<template lang="hbs" src="./hello-world.ezwc.hbs">
</template>
`
      );
    });

    test('should generate a template tag with import for ejs', () => {
      const templateTag = EzwcTemplates.generateTemplateTag('ejs', 'hello-world', true);
      expect(templateTag).toBe(`
<template lang="ejs" src="./hello-world.ezwc.ejs">
</template>
`
      );
    });
  });
});
