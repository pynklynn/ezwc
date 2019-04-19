const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const sass = require('node-sass');
const path = require('path');

class EzwcStyles {
  parseStyles($style, inFile) {
    Logger.info('Processing styles...');

    let styles = '';
    if ($style) {
      const importStyles = $style.attr('src');
      let stylesString = Importer.resolveImport(inFile, importStyles, $style);

      /* istanbul ignore else */
      if ($style.attr('lang')) {
        switch($style.attr('lang')) {
          case 'scss':
            stylesString = this.processSass(stylesString, inFile);
            break;
        }
      }

      styles = `
<style>
  ${stylesString}
</style>
      `;
    }

    return styles;
  }

  processSass(sassString, inFile) {
    try {
      const renderedSass = sass.renderSync({
        data: sassString,
        importer(url, prev, done) {
          const importFilePath = path.resolve(
            path.dirname(inFile),
            url
          );

          return {
            file: importFilePath
          };
        }
      });
      return renderedSass.css.toString();
    } catch(err) {
      Logger.error('Error processing %s styles', 'Sass');
    }
  }
}

module.exports = new EzwcStyles();
