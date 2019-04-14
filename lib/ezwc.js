const fs = require('fs');
const Logger = require('./utils/logger');
const EzwcStyles = require('./styles');
const EzwcTemplates = require('./templates');
const EzwcScripts = require('./scripts');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class EzwcCore {
  determineOutfile(inFilePath, outFilePath) {
    let outFile = inFilePath.replace(/\.ezwc$/i, '.js');
    if (outFilePath) {
      if (fs.existsSync(outFilePath) && fs.statSync(outFilePath).isDirectory()) {
        const inputFileName = /(.*\/)?(?<filename>.*\.ezwc)$/.exec(inFilePath).groups.filename;
        outFile = `${outFilePath}/${inputFileName.replace(/\.ezwc$/i, '.js')}`;
      } else {
        outFile = outFilePath;
      }
    }

    return outFile;
  }

  // not covering this in tests because everything is either a library or already covered
  /* istanbul ignore next */
  process(inFilePath, outFilePath) {
    Logger.process(`🐱  Transpiling %s...`, 'Start', inFilePath);
    Logger.emptyLine();

    const outFile = this.determineOutfile(inFilePath, outFilePath);
    const source = fs.readFileSync(inFilePath, 'utf8');
    const dom = new JSDOM(`<!DOCTYPE html>${source}`);
    const document = dom.window.document;

    const styles = EzwcStyles.parseStyles(document);
    const template = EzwcTemplates.parseTemplate(document, styles);
    const script = EzwcScripts.parseScript(document, template);

    try {
      fs.writeFileSync(outFile, script, 'utf8');
      Logger.emptyLine();
      Logger.success(`🍹  Web component file %s has been written out!`, 'Done!', outFile);
    } catch (err) {
      Logger.error('Error writing output file.');
      throw err;
    }
  }
}

module.exports = new EzwcCore();
