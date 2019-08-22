/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const sass = require('node-sass');
const path = require('path');

class EzwcStyles {
  parseStyles(inFile) {
    Logger.info('Processing styles...');

    let styles = '';
    if (global.Parser.styleCode) {
      let stylesString = '';
      if (global.Parser.styleSrc) {
        stylesString = Importer.importFile(inFile, global.Parser.styleSrc);
      } else {
        stylesString = global.Parser.styleContent;
      }

      /* istanbul ignore else */
      if (global.Parser.styleLang) {
        switch(global.Parser.styleLang) {
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
      console.log(err);
      Logger.error('Error processing %s styles', 'Sass');
    }
  }

  generateStyleTag(selector, flags) {
    const { s: stylePreprocessor, importStyles, importAll, shadowRoot} = flags;
    const createImport = importStyles || importAll;
    let lang = '';
    let ext = 'css';
    let importAttr = '';
    let content = shadowRoot ? ':host {}' : `${selector} {}`;
    switch((stylePreprocessor || '').toLowerCase()) {
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
<style${lang}${importAttr}>${createImport ? '' : '\n  ' + content + '\n'}</style>
`;
  }
}

module.exports = new EzwcStyles();
