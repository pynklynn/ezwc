const Logger = require('./utils/logger');
const path = require('path');
const Importer = require('./utils/importer');

class EzwcTemplates {
  parseTemplate($template, styles, inFile) {
    Logger.info('Processing template...');

    if (!$template) {
      Logger.error('No template tag found!');
      process.exit(1);
    } else {
      const importTemplate = $template.attr('src');
      const templateString = Importer.resolveImport(inFile, importTemplate, $template);
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
