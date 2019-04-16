const Logger = require('./utils/logger');
const path = require('path');
const Importer = require('./utils/importer');

class EzwcTemplates {
  parseTemplate(document, styles, inFile) {
    Logger.info('Processing template...');

    const templateTag = document.querySelector('template');
    if (!templateTag) {
      Logger.error('No template tag found!');
      process.exit(1);
    } else {
      const importTemplate = templateTag.getAttribute('src');
      const templateString = Importer.resolveImport(inFile, importTemplate, templateTag);
      return `
${styles}
${templateString}
    `;
    }
  };

  createTemplateFunction(templateContent) {
    return `_buildTemplate() {
      const template = \`${templateContent}\`;
      this.template = new DOMParser().parseFromString(template, 'text/html').firstChild;
    }`;
  }
}

module.exports = new EzwcTemplates();
