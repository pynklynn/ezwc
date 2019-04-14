const Logger = require('./utils/logger');
const EzwcTemplates = require('./templates');

class EzwcScripts {
  parseScript(document, template) {
    Logger.info('💻  Processing script...');

    const scriptTag = document.querySelector('script');
    if (!scriptTag) {
      Logger.error('No script tag found!');
      process.exit(1);
    }

    let script = this.injectTemplate(scriptTag.innerHTML.trim(), template)
    script += this.createDefinition(script, scriptTag);

    return script;
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

  createDefinition(script, scriptTag) {
    const className = this.parseClassName(script);
    const selector = scriptTag.getAttribute('selector');

    if (!selector) {
      Logger.error('Selector not found. Please be sure to include the %s attribute on the script tag.', 'selector');
      process.exit(1);
    }

    return `

customElements.define('${selector}', ${className});
`;
  }

  parseClassName(script) {
    const errorMessage = 'Class name for the component could not be found. Please be sure the script section is written in ES2015+ class syntax.';
    try {
      const { className } = /(.*)(class\s)(?<className>.*)(\sextends)/.exec(script).groups;

      if (!className) {
        Logger.error(errorMessage);
        process.exit(1);
      }

      return className;
    } catch(err) {
      Logger.error(errorMessage);
      process.exit(1);
    }
  }
}

module.exports = new EzwcScripts();
