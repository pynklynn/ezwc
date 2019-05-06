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
    const selectorSearch = /(?<selector>[a-zA-Z0-9_\-\s]*){1}(\.ezwc)?$/gi.exec(inputSelector);
    const selector = dashify(
      selectorSearch.groups.selector.replace(/\.ezwc$/i, '').replace(/_/g, '-'),
      { condense: true }
    );
    /* istanbul ignore else */
    if (!selector.includes('-')) {
      Logger.error('%s must contain at least one dash', 'selector');
      process.exit(1);
    }

    flags.dir = this.buildOutputDir(inputSelector, selectorSearch.groups.selector, flags.dir);

    const className = pascalcase(selector);
    const generatedCode = prettier.format(
      this.generateCode(selector, className, flags),
      { parser: 'html' }
    );
    this.writeFile(selector, generatedCode, flags.dir);
  }

  buildOutputDir(inputSelector, rawSelector, inputDir = '') {
    const inputSelectorRegex = new RegExp(`${rawSelector}$`);
    return `${inputDir}/${inputSelector}`
      .replace(/\.ezwc$/i, '')
      .replace(inputSelectorRegex, '')
      .replace(/^\//, '');
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

  writeFile(selector, generatedCode, dir) {
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
