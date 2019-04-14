const Logger = require('./utils/logger');

class EzwcStyles {
  parseStyles(document) {
    Logger.info('💅  Processing styles...');

    const styleTag = document.querySelector('style');
    let styles = '';
    if (styleTag) {
      styles = `
<style>
  ${document.querySelector('style').innerHTML.trim()}
</style>
      `;
    }

    return styles;
  }
}

module.exports = new EzwcStyles();
