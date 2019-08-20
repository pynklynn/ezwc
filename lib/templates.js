/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const Logger = require('./utils/logger');
const Importer = require('./utils/importer');

class EzwcTemplates {
  parseTemplate(styles, inFile) {
    Logger.info('Processing template...');

    if (!global.Parser.templateCode) {
      Logger.error('No template tag found!');
      process.exit(1);
    } else {
      let templateString;
      if (global.Parser.templateSrc) {
        templateString = Importer.importFile(inFile, global.Parser.templateSrc);
      } else {
        templateString = global.Parser.templateContent;
      }

      return `
${styles}
${templateString}
    `;
    }
  };

  createRenderFunctionContent(templateContent) {
    let renderFunctionStringContent = '';
    let attachTo = global.Parser.useShadow ? 'this.shadowRoot' : 'this';

    switch(global.Parser.templateLang) {
      case 'lit':
      case 'lit-html':
        renderFunctionStringContent += `
          const template = html\`${templateContent}\`;
          render(template, ${attachTo});
`;
        break;
      case 'hbs':
      case 'handlebars':
        renderFunctionStringContent += `
          if (!this.compiledTemplate) {
            this.compiledTemplate = Handlebars.compile(\`${templateContent}\`);
          }
          ${attachTo}.innerHTML = this.compiledTemplate(data);
`;
        break;
      case 'ejs':
        renderFunctionStringContent += `
          const template = \`${templateContent}\`;
          ${attachTo}.innerHTML = ejs.render(template, data);
`;
        break;
      case 'html':
      default:
        renderFunctionStringContent += `
          const template = \`${templateContent}\`;
          const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
          ${attachTo}.innerHTML = '';
          ${attachTo}.appendChild(templateNode.cloneNode(true));
`;
        break;
    }

    return renderFunctionStringContent;
  }

  createImport() {
    let importString = '';
    switch(global.Parser.templateLang) {
      case 'lit':
      case 'lit-html':
        Logger.warn('Be sure to add %s to your package.json file!', 'lit-html');
        importString = `import { html, render } from 'lit-html';\n\n`;
        break;
      case 'hbs':
      case 'handlebars':
        Logger.warn('Be sure to add %s to your package.json file!', 'handlebars');
        importString = `import Handlebars from 'handlebars/dist/handlebars';\n\n`;
        break;
      case 'ejs':
        Logger.warn('Be sure to add %s to your package.json file!', 'ejs');
        importString = `import ejs from 'ejs/ejs';\n\n`;
        break;
      default:
        importString = '';
        break;
    }

    return importString;
  }

  generateTemplateTag(templateEngine = '', selector, createImport) {
    let lang = '';
    let ext = 'html';
    let importAttr = '';
    switch(templateEngine.toLowerCase()) {
      case 'lit':
      case 'lit-html':
        lang = ' lang="lit"';
        break;
      case 'hbs':
      case 'handlebars':
        lang = ' lang="hbs"';
        ext = 'hbs';
        break;
      case 'ejs':
        lang = ' lang="ejs"';
        ext = 'ejs';
        break;
    }

    /* istanbul ignore else */
    if (createImport) {
      importAttr = ` src="./${selector}.ezwc.${ext}"`;
    }

    return `
<template${lang}${importAttr}>
</template>
`;
  }
}

module.exports = new EzwcTemplates();
