const dashify = require('dashify');
const pascalcase = require('pascalcase');
const prettier = require('prettier');
const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');
const EzwcScripts = require('../scripts');
const EzwcStyles = require('../styles');
const EzwcTemplates = require('../templates');

class EzwcGenerate {
  process(inputSelector, flags) {
    const selector = dashify(inputSelector.replace(/\.ezwc$/i, '').replace(/_/g, '-'), { condense: true });
    /* istanbul ignore else */
    if (!selector.includes('-')) {
      Logger.error('%s must contain at least one dash', 'selector');
      process.exit(1);
    }
    const className = pascalcase(selector);
    const generatedCode = prettier.format(
      this.generateCode(selector, className, flags),
      { parser: 'html' }
    );
    this.writeFile(selector, generatedCode, flags.dir)
  }

  generateCode(selector, className, flags) {
    const templateTag = EzwcTemplates.generateTemplateTag(flags.template);
    const scriptTag = EzwcScripts.generateScriptTag(selector, className, flags.ts);
    const styleTag = EzwcStyles.generateStyleTag(flags.styles);

    return `
${templateTag}
${scriptTag}
${styleTag}
`;
  }

  writeFile(selector, generatedCode, dir = '') {
    const filename = `${selector}.ezwc`;
    const outputDir = path.resolve(process.cwd(), dir);
    const outputFile = path.resolve(outputDir, filename);
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(outputFile, generatedCode, {
        encoding: 'utf8',
        flag: 'w+'
      });
      Logger.success(`EZWC component file %s has been generated!`, 'Done!', filename);
      Logger.emptyLine();
    } catch(err) {
      Logger.error('Error writing out ezwc file.');
      throw err;
    }
  }
}

module.exports = new EzwcGenerate();
