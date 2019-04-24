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
      case 'html':
      default:
        renderFunctionString += `    const template = \`${templateContent}\`;
    const templateNode = new DOMParser().parseFromString(template, 'text/html').firstChild;
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
      default:
        importString = '';
        break;
    }

    return importString;
  }
}

module.exports = new EzwcTemplates();
