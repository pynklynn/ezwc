/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const EzwcTemplates = require('@lib/templates');
const Logger = require('@lib/utils/logger');
const Importer = require('@lib/utils/importer');

jest.mock('@lib/utils/logger');
jest.mock('@lib/utils/importer');

describe('template processing tests', () => {
  describe('parseTemplate', () => {
    test('should output an error message when there is no template', () => {
      global.Parser = {};
      jest.spyOn(process, 'exit').mockImplementation(() => {});

      EzwcTemplates.parseTemplate(false, '');

      expect(Logger.info).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalled();
    });

    test('should output a template string', () => {
      global.Parser = {
        templateCode: '<template></template>',
        templateContent: 'TEST'
      };

      const templateString = EzwcTemplates.parseTemplate('STYLES');

      expect(Logger.info).toHaveBeenCalled();
      expect(templateString).toBe(`
STYLES
TEST
    `);
    });

    test('should output a template string for an import', () => {
      global.Parser = {
        templateCode: '<template></template>',
        templateSrc: 'path/to/file.html'
      };
      jest.spyOn(Importer, 'importFile').mockReturnValue('TEST');

      const templateString = EzwcTemplates.parseTemplate('STYLES', 'inFile');

      expect(Importer.importFile).toHaveBeenCalledWith('inFile', 'path/to/file.html');
      expect(Logger.info).toHaveBeenCalled();
      expect(templateString).toBe(`
STYLES
TEST
    `);
    });
  });

  describe('create render function', () => {
    test('should create the render function for default', () => {
      global.Parser = {
        useShadow: true
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          const template = \`TEST\`;
          const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
          this.shadowRoot.innerHTML = '';
          this.shadowRoot.appendChild(templateNode.cloneNode(true));
`
      );
    });

    test('should create the render function for html', () => {
      global.Parser = {
        useShadow: true,
        templateLang: 'html'
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          const template = \`TEST\`;
          const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
          this.shadowRoot.innerHTML = '';
          this.shadowRoot.appendChild(templateNode.cloneNode(true));
`
      );
    });

    test('should create the render function for html with no-shadow', () => {
      global.Parser = {
        useShadow: false
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          const template = \`TEST\`;
          const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
          this.innerHTML = '';
          this.appendChild(templateNode.cloneNode(true));
`
      );
    });

    test('should create the render function for lit', () => {
      global.Parser = {
        useShadow: true,
        templateLang: 'lit'
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          const template = html\`TEST\`;
          render(template, this.shadowRoot);
`
      );
    });

    test('should create the render function for lit-html', () => {
      global.Parser = {
        useShadow: true,
        templateLang: 'lit-html'
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          const template = html\`TEST\`;
          render(template, this.shadowRoot);
`
      );
    });

    test('should create the render function for hbs', () => {
      global.Parser = {
        useShadow: true,
        templateLang: 'hbs'
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          if (!this.compiledTemplate) {
            this.compiledTemplate = Handlebars.compile(\`TEST\`);
          }
          this.shadowRoot.innerHTML = this.compiledTemplate(data);
`
      );
    });

    test('should create the render function for handlebars', () => {
      global.Parser = {
        useShadow: true,
        templateLang: 'handlebars'
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          if (!this.compiledTemplate) {
            this.compiledTemplate = Handlebars.compile(\`TEST\`);
          }
          this.shadowRoot.innerHTML = this.compiledTemplate(data);
`
      );
    });

    test('should create the render function for ejs', () => {
      global.Parser = {
        useShadow: true,
        templateLang: 'ejs'
      };
      const createRenderFunctionContent = EzwcTemplates.createRenderFunctionContent('TEST');
      expect(createRenderFunctionContent).toBe(`
          const template = \`TEST\`;
          this.shadowRoot.innerHTML = ejs.render(template, data);
`
      );
    });
  });

  describe('create import line', () => {
    test('should create the import line for html', () => {
      global.Parser = {
        templateLang: 'html'
      };
      const createImportLine = EzwcTemplates.createImport();
      expect(createImportLine).toBe('');
    });

    test('should create the import line for lit', () => {
      global.Parser = {
        templateLang: 'lit'
      };
      const createImportLine = EzwcTemplates.createImport('lit');
      expect(createImportLine).toBe(`import { html, render } from 'lit-html';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });

    test('should create the import line for lit-html', () => {
      global.Parser = {
        templateLang: 'lit-html'
      };
      const createImportLine = EzwcTemplates.createImport('lit-html');
      expect(createImportLine).toBe(`import { html, render } from 'lit-html';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });

    test('should create the import line for hbs', () => {
      global.Parser = {
        templateLang: 'hbs'
      };
      const createImportLine = EzwcTemplates.createImport('hbs');
      expect(createImportLine).toBe(`import Handlebars from 'handlebars/dist/handlebars';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });

    test('should create the import line for handlebars', () => {
      global.Parser = {
        templateLang: 'handlebars'
      };
      const createImportLine = EzwcTemplates.createImport('handlebars');
      expect(createImportLine).toBe(`import Handlebars from 'handlebars/dist/handlebars';\n\n`);
      expect(Logger.warn).toHaveBeenCalled();
    });

    test('should create the import line for ejs', () => {
      global.Parser = {
        templateLang: 'ejs'
      };
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
