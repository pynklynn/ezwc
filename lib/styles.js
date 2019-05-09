const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const sass = require('node-sass');
const path = require('path');

class EzwcStyles {
  parseStyles($style, templateLang, inFile) {
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

      switch(templateLang) {
        case 'pug':
          styles = `
style.
  ${stylesString}
      `;
          break;
        default:
          styles = `
<style>
  ${stylesString}
</style>
      `;
          break;
      }
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
      console.log(err);
      Logger.error('Error processing %s styles', 'Sass');
    }
  }

  generateStyleTag(stylePreprocessor = '', selector, createImport) {
    let lang = '';
    let ext = 'css';
    let importAttr = '';
    switch(stylePreprocessor.toLowerCase()) {
      case 'sass':
      case 'scss':
        lang = ' lang="scss"';
        ext = 'scss';
        break;
    }

    /* istanbul ignore else */
    if (createImport) {
      importAttr = ` src="./${selector}.ezwc.${ext}"`;
    }

    return `
<style${lang}${importAttr}>
</style>
`;
  }
}

module.exports = new EzwcStyles();
