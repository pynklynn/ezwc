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

  createRenderFunction(templateContent, lang = 'html') {
    let renderFunctionString = 'render(data) {\n';

    switch(lang) {
      case 'lit':
      case 'lit-html':
        renderFunctionString += `    const template = html\`${templateContent}\`;
    render(template(this), this.shadowRoot);`;
        break;
      case 'pug':
        renderFunctionString += `    if (!this.compiledTemplate) {
      this.compiledTemplate = pug.compile(\`${templateContent}\`);
    }
    this.shadowRoot.innerHTML = this.compiledTemplate(data);`;
        break;
      case 'hbs':
      case 'handlebars':
        renderFunctionString += `    if (!this.compiledTemplate) {
      this.compiledTemplate = Handlebars.compile(\`${templateContent}\`);
    }
    this.shadowRoot.innerHTML = this.compiledTemplate(data);`;
        break;
      case 'ejs':
        renderFunctionString += `    const template = \`${templateContent}\`;
    this.shadowRoot.innerHTML = ejs.render(template, data);`;
        break;
      case 'html':
      default:
        renderFunctionString += `    const template = \`${templateContent}\`;
    const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(templateNode.cloneNode(true));`;
        break;
    }

    renderFunctionString += `\n  }`;

    return renderFunctionString;
  }

  createImport(lang) {
    let importString = '';
    switch(lang) {
      case 'lit':
      case 'lit-html':
        Logger.warn('Be sure to add %s to your package.json file!', 'lit-html');
        importString = `import { html, render } from 'lit-html';\n\n`;
        break;
      case 'pug':
        Logger.warn('Be sure to add %s to your package.json file!', 'pug');
        importString = `import pug from 'pug';\n\n`;
        break;
      case 'hbs':
      case 'handlebars':
        Logger.warn('Be sure to add %s to your package.json file!', 'handlebars');
        importString = `import Handlebars from 'handlebars';\n\n`;
        break;
      case 'ejs':
        Logger.warn('Be sure to add %s to your package.json file!', 'ejs');
        importString = `import ejs from 'ejs';\n\n`;
        break;
      default:
        importString = '';
        break;
    }

    return importString;
  }
}

module.exports = new EzwcTemplates();
