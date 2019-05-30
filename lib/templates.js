const Logger = require('./utils/logger');
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

  createRenderFunctionContent(templateContent, flags) {
    let renderFunctionStringContent = '';
    let attachTo = flags.shadowRoot ? 'this.shadowRoot' : 'this';

    switch(flags.template) {
      case 'lit':
      case 'lit-html':
        renderFunctionStringContent += `
          const template = html\`${templateContent}\`;
          render(template(this), ${attachTo});
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

  createImport(lang) {
    let importString = '';
    switch(lang) {
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
