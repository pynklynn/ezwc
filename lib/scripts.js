/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const EzwcTemplates = require('./templates');
const ts = require('typescript');
const prettier = require('prettier');

class EzwcScripts {
  parseScript(template, inFile) {
    Logger.info('Processing script...');

    if (!global.Parser.scriptCode) {
      Logger.error('No script tag found!');
      process.exit(1);
    } else {
      let scriptString;
      if (global.Parser.scriptSrc) {
        scriptString = Importer.importFile(inFile, global.Parser.scriptSrc);
      } else {
        scriptString = global.Parser.scriptContent;
      }

      /* istanbul ignore else */
      if (global.Parser.scriptLang) {
        switch(global.Parser.scriptLang) {
          case 'ts':
          case 'typescript':
            scriptString = this.processTs(scriptString, inFile);
            break;
        }
      }

      scriptString = prettier.format(scriptString, {
        singleQuote: true,
        trailingComma: 'es5',
        parser: 'babel'
      });
      scriptString = this.injectRenderCall(scriptString);
      scriptString = this.updateConstructorContent(scriptString);
      scriptString = this.updateRenderContent(scriptString, template);

      let script = EzwcTemplates.createImport();
      script += scriptString;
      script += this.createDefinition(script);

      return script;
    }
  }

  updateConstructorContent(script) {
    if (global.Parser.useShadow) {
      return script.replace(/super\(\);?/, `super();\nthis.attachShadow({ mode: 'open' });`);
    }
    return script;
  }

  updateRenderContent(script, template) {
    const updatedRenderContent = EzwcTemplates.createRenderFunctionContent(template);

    /* istanbul ignore else */
    if (script.indexOf('render(data)') > -1) {
      const indexOfEndOfRenderMethod = script.indexOf('\n  }\n', script.indexOf('render(data)'));
      return script.slice(0, indexOfEndOfRenderMethod) + updatedRenderContent + script.slice(indexOfEndOfRenderMethod);
    }

    const indexOfEndOfClassLine = script.indexOf('\n', script.indexOf('class'));
    const renderFunction = `render(data) {\n${updatedRenderContent}\n}\n`;
    return script.slice(0, indexOfEndOfClassLine) + renderFunction + script.slice(indexOfEndOfClassLine);
  }

  injectRenderCall(script) {
    if (script.indexOf('connectedCallback') > -1) {
      const indexOfConnectedCallback = script.indexOf('{', script.indexOf('connectedCallback')) + 1;
      return `${script.slice(0, indexOfConnectedCallback)}\n    this.render(this);${script.slice(indexOfConnectedCallback)}`;
    } else {
      const connectedCallback = `
  connectedCallback() {
    this.render(this);
  }`;
      const indexOfEndOfConstructor = script.indexOf('\n  }', script.indexOf('constructor')) + 4;
      return `${script.slice(0, indexOfEndOfConstructor)}\n${connectedCallback}${script.slice(indexOfEndOfConstructor)}`;
    }
  }

  createDefinition(script) {
    const className = this.parseClassName(script);
    const selector = global.Parser.componentSelector;

    if (!selector) {
      Logger.error('Selector not found. Please be sure to include the %s attribute on the script tag.', 'selector');
      process.exit(1);
    } else {
      return `\n\nwindow.customElements.define('${selector}', ${className});`;
    }
  }

  parseClassName(script) {
    try {
      const { className } = /(.*)(class\s)(?<className>.*)(\sextends)/.exec(script).groups;
      return className;
    } catch(err) {
      Logger.error('Class name for the component could not be found. Please be sure the script section is written in ES2015+ class syntax.');
      process.exit(1);
    }
  }

  processTs(scriptString, inFile) {
    try {
      let result = ts.transpileModule(scriptString, {
        compilerOptions: {
          module: ts.ModuleKind.ES2015,
          target: ts.ScriptTarget.ES2015
        }
      });
      return result.outputText;
    } catch(err) {
      Logger.error('Error processing %s code', 'Typescript');
    }
  }

  generateScriptTag(selector, className, flags) {
    const lang = flags.ts ? 'lang="ts" ' : '';
    const importAttr = (flags.importScript || flags.importAll) ? `src="./${selector}.ezwc.${flags.ts ? 'ts' : 'js'}" ` : '';
    const noShadowAttr = flags.shadowRoot ? '' : 'no-shadow ';
    const code = (flags.importScript || flags.importAll) ? '' : `
class ${className} extends HTMLElement {
  constructor() {
    super();
  }
}
`;

    return `
<script ${lang}${noShadowAttr}${importAttr}selector="${selector}">
${code}
</script>
`;
  }
}

module.exports = new EzwcScripts();
