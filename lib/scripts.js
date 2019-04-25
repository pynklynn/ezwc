const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const EzwcTemplates = require('./templates');
const ts = require('typescript');

class EzwcScripts {
  parseScript($script, template, templateLang, inFile) {
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

      let script = EzwcTemplates.createImport(templateLang);
      script += this.injectTemplate(scriptString, template, templateLang);
      script += this.createDefinition(script, $script);

      return script;
    }
  }

  injectTemplate(script, template, lang) {
    const renderFunction = EzwcTemplates.createRenderFunction(template, lang);
    const newSuper = this.createShadowDom();

    return script.replace('\n', `\n  ${renderFunction}\n\n`).replace('super();', newSuper);
  }

  createShadowDom() {
    return `
      super();
      this.attachShadow({ mode: 'open' });
      this.render(this);
    `;
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
}

module.exports = new EzwcScripts();
