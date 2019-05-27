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
    this.writeFiles(selector, generatedCode, flags, className);
  }

  buildOutputDir(inputSelector, rawSelector, inputDir = '') {
    const inputSelectorRegex = new RegExp(`${rawSelector}$`);
    return `${inputDir}/${inputSelector}`
      .replace(/\.ezwc$/i, '')
      .replace(inputSelectorRegex, '')
      .replace(/^\//, '');
  }

  generateCode(selector, className, flags) {
    const templateTag = EzwcTemplates.generateTemplateTag(
      flags.template,
      selector,
      flags.importAll || flags.importTemplate
    );
    const scriptTag = EzwcScripts.generateScriptTag(
      selector,
      className,
      flags
    );
    const styleTag = EzwcStyles.generateStyleTag(
      selector,
      flags
    );

    return `
${templateTag}
${scriptTag}
${styleTag}
`;
  }

  writeFiles(selector, generatedCode, flags, className) {
    const filename = `${selector}.ezwc`;
    const outputDir = path.resolve(process.cwd(), flags.dir);
    const outputFile = path.resolve(outputDir, filename);
    try {
      Logger.info(`Making sure directory "%s" exists...`, outputDir);
      fs.mkdirSync(outputDir, { recursive: true });
      Logger.info(`Writing component file %s...`, filename);
      /* istanbul ignore else */
      if (fs.existsSync(outputFile) && !flags.force) {
        Logger.warn('%s already exists! Use the %s option to overwrite it. Not writing stylesheet file.', outputFile, 'force');
        return;
      }
      fs.writeFileSync(outputFile, generatedCode, {
        encoding: 'utf8',
        flag: 'w+'
      });
      this.writeStylesheet(filename, outputFile, flags);
      this.writeTemplate(filename, outputFile, flags);
      this.writeScript(filename, outputFile, flags, className);
      Logger.success(`EZWC component file %s has been generated!`, 'Done!', filename);
      Logger.emptyLine();
    } catch(err) {
      /* istanbul ignore next */
      this.errorWritingFile(err, 'Error writing out ezwc file.');
    }
  }

  writeStylesheet(filename, outputFile, flags) {
    /* istanbul ignore else */
    if (flags.importAll || flags.importStyles) {
      try {
        const ext = flags.styles ? '.scss' : '.css';
        const stylesFile = `${outputFile}${ext}`;
        const stylesFileName = `${filename}${ext}`;
        const content = flags.shadowRoot ? ':host {}' : `${filename.replace(/\.ezwc$/, '')} {}`;
        Logger.info(`Writing stylesheet file %s...`, stylesFileName);
        /* istanbul ignore else */
        if (fs.existsSync(stylesFile) && !flags.force) {
          Logger.warn('%s already exists! Use the %s option to overwrite it. Not writing stylesheet file.', stylesFileName, 'force');
          return;
        }
        fs.writeFileSync(stylesFile, `${content}\n`, {
          encoding: 'utf8',
          flag: 'w+'
        });
      } catch(err) {
        /* istanbul ignore next */
        this.errorWritingFile(err, 'Error writing out stylesheet file.');
      }
    }
  }

  writeTemplate(filename, outputFile, flags) {
    /* istanbul ignore else */
    if (flags.importAll || flags.importTemplate) {
      try {
        const templateEngine = flags.template || '';
        let ext = '.html';
        switch(templateEngine.toLowerCase()) {
          case 'hbs':
          case 'handlebars':
            ext = '.hbs';
            break;
          case 'ejs':
            ext = '.ejs';
            break;
        }
        const templateFile = `${outputFile}${ext}`;
        const templateFileName = `${filename}${ext}`;
        Logger.info(`Writing template file %s...`, templateFileName);
        /* istanbul ignore else */
        if (fs.existsSync(templateFile) && !flags.force) {
          Logger.warn('%s already exists! Use the %s option to overwrite it. Not writing template file.', templateFileName, 'force');
          return;
        }
        fs.writeFileSync(templateFile, `<!-- replace with template code for ${filename} -->\n`, {
          encoding: 'utf8',
          flag: 'w+'
        });
      } catch(err) {
        /* istanbul ignore next */
        this.errorWritingFile(err, 'Error writing out template file.');
      }
    }
  }

  writeScript(filename, outputFile, flags, className) {
    /* istanbul ignore else */
    if (flags.importAll || flags.importScript) {
      try {
        const ext = flags.ts ? '.ts' : '.js';
        const componentScript = prettier.format(`
class ${className} extends HTMLElement {
  constructor() {
    super();
  }
}
`,
          { parser: 'babel' }
        );
        const scriptFile = `${outputFile}${ext}`;
        const scriptFileName = `${filename}${ext}`;
        Logger.info(`Writing script file %s...`, scriptFileName);
        /* istanbul ignore else */
        if (fs.existsSync(scriptFile) && !flags.force) {
          Logger.warn('%s already exists! Use the %s option to overwrite it. Not writing script file.', scriptFileName, 'force');
          return;
        }
        fs.writeFileSync(scriptFile, componentScript, {
          encoding: 'utf8',
          flag: 'w+'
        });
      } catch(err) {
        /* istanbul ignore next */
        this.errorWritingFile(err, 'Error writing out script file.');
      }
    }
  }

  errorWritingFile(err, message) {
    Logger.error(message);
    throw err;
  }
}

module.exports = new EzwcGenerate();
