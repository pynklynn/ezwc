const Logger = require('./utils/logger');
const Importer = require('./utils/importer');

class EzwcStyles {
  parseStyles(document, inFile) {
    Logger.info('Processing styles...');

    const styleTag = document.querySelector('style');
    let styles = '';
    if (styleTag) {
      const importStyles = styleTag.getAttribute('src');
      const stylesString = Importer.resolveImport(inFile, importStyles, styleTag);
      styles = `
<style>
  ${stylesString}
</style>
      `;
    }

    return styles;
  }
}

module.exports = new EzwcStyles();
