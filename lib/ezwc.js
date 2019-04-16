const fs = require('fs');
const path = require('path');
const Logger = require('./utils/logger');
const EzwcStyles = require('./styles');
const EzwcTemplates = require('./templates');
const EzwcScripts = require('./scripts');
const jsdom = require('jsdom');
const glob = require('glob');
const { JSDOM } = jsdom;

class EzwcCore {
  determineOutfile(inFilePath, outFilePath) {
    let outFile = inFilePath.replace(/\.ezwc$/i, '.js');
    if (outFilePath) {
      const checkForJs = /(.*)(\.)(?<extension>m?jsx?)$/.exec(outFilePath);
      if (checkForJs && checkForJs.groups && checkForJs.groups.extension) {
        outFile = outFilePath;
      } else {
        let {
          filepath: inputFilePath,
          filename: inputFileName
        } = /(?<filepath>.*\/)?(?<filename>.*\.ezwc)$/.exec(inFilePath).groups;
        inputFilePath = inputFilePath || './';
        const resolvedFilePath = path.resolve(process.cwd(), inputFilePath).replace(process.cwd(), outFilePath);
        fs.mkdirSync(resolvedFilePath, { recursive: true });
        outFile = `${resolvedFilePath}/${inputFileName.replace(/\.ezwc$/i, '.js')}`;
      }
    }

    return outFile;
  }

  determineInputFileList(inFilePath) {
    if (fs.statSync(inFilePath).isDirectory()) {
      return glob.sync(`${inFilePath}/**/*.ezwc`);
    } else {
      return [inFilePath];
    }
  }

  // not covering this in tests because everything is either a library or already covered
  /* istanbul ignore next */
  processFile(inFilePath, outFilePath) {
    Logger.process(`Transpiling %s...`, 'Start', inFilePath);

    const outFile = this.determineOutfile(inFilePath, outFilePath);
    const source = fs.readFileSync(inFilePath, 'utf8');
    const dom = new JSDOM(`<!DOCTYPE html>${source}`);
    const document = dom.window.document;

    const styles = EzwcStyles.parseStyles(document, inFilePath);
    const template = EzwcTemplates.parseTemplate(document, styles, inFilePath);
    const script = EzwcScripts.parseScript(document, template, inFilePath);

    try {
      fs.writeFileSync(outFile, script, {
        encoding: 'utf8',
        flag: 'w+'
      });
      Logger.success(`Web component file %s has been written out!`, 'Done!', outFile);
      Logger.emptyLine();
    } catch (err) {
      Logger.error('Error writing output file.');
      throw err;
    }
  }

  process(inFilePath, outFilePath) {
    Logger.app(`Starting up processing for input %s`, inFilePath);
    Logger.emptyLine();
    const processFiles = this.determineInputFileList(inFilePath);
    for (const inFile of processFiles) {
      this.processFile(inFile, outFilePath);
    }
    Logger.app(`Finished processing %s!`, 'ezwc');
  }
}

module.exports = new EzwcCore();
