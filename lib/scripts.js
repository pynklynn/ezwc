const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const EzwcTemplates = require('./templates');
const ts = require('typescript');
const prettier = require('prettier');

class EzwcScripts {
  parseScript($script, template, flags, inFile) {
    Logger.info('Processing script...');

    if (!$script) {
      Logger.error('No script tag found!');
      process.exit(1);
    } else {
      const importScript = $script.attr('src');
      let scriptString = Importer.resolveImport(inFile, importScript, $script);

      /* istanbul ignore else */
      if ($script.attr('lang')) {
        switch($script.attr('lang')) {
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

      let script = EzwcTemplates.createImport(flags.template);
      script += this.injectTemplate(scriptString, template, flags);
      script += this.createDefinition(script, $script);

      return script;
    }
  }

  injectTemplate(script, template, flags) {
    const renderFunction = EzwcTemplates.createRenderFunction(template, flags);
    const newSuper = this.createNewConstructorContent(flags);

    return script.replace('\n', `\n  ${renderFunction}\n\n`).replace('super();', newSuper);
  }

  createNewConstructorContent(flags) {
    const attachShadow = flags.shadowRoot ? `\nthis.attachShadow({ mode: 'open' });`: '';
    return `
      super();${attachShadow}
    `;
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

  createDefinition(script, $script) {
    const className = this.parseClassName(script);
    const selector = $script.attr('selector');

    if (!selector) {
      Logger.error('Selector not found. Please be sure to include the %s attribute on the script tag.', 'selector');
      process.exit(1);
    } else {
      return `\n\ncustomElements.define('${selector}', ${className});`;
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
