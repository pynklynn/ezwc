const Logger = require('./utils/logger');

class EzwcTemplates {
  parseTemplate(document, styles) {
    Logger.info('📝  Processing template...');

    const templateTag = document.querySelector('template');
    if (!templateTag) {
      Logger.error('No template tag found!');
      process.exit(1);
    }
    return `
${styles}
${templateTag.innerHTML.trim()}
    `;
  };

  createTemplateFunction(templateContent) {
    return `_buildTemplate() {
      const template = \`${templateContent}\`;
      this.template = new DOMParser().parseFromString(template, 'text/html').firstChild;
    }`
  }
}

module.exports = new EzwcTemplates();
