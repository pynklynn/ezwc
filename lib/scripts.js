const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const EzwcTemplates = require('./templates');

class EzwcScripts {
  parseScript($script, template, inFile) {
    Logger.info('Processing script...');

    if (!$script) {
      Logger.error('No script tag found!');
      process.exit(1);
    } else {
      const importScript = $script.attr('src');
      const scriptString = Importer.resolveImport(inFile, importScript, $script);
      let script = this.injectTemplate(scriptString, template)
      script += this.createDefinition(script, $script);

      return script;
    }
  }

  injectTemplate(script, template) {
    const templateFunction = EzwcTemplates.createTemplateFunction(template);
    const newSuper = this.createShadowDom();

    return script.replace('\n', `\n  ${templateFunction}\n\n`).replace('super();', newSuper);
  }

  createShadowDom() {
    return `super();
    this._buildTemplate();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.template.cloneNode(true));
    `;
  }

  createDefinition(script, $script) {
    const className = this.parseClassName(script);
    const selector = $script.attr('selector');

    if (!selector) {
      Logger.error('Selector not found. Please be sure to include the %s attribute on the script tag.', 'selector');
      process.exit(1);
    } else {
      return `

customElements.define('${selector}', ${className});
`;
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
}

module.exports = new EzwcScripts();
