const fs = require('fs');
const path = require('path');
const Logger = require('./utils/logger');
const EzwcStyles = require('./styles');
const EzwcTemplates = require('./templates');
const EzwcScripts = require('./scripts');
const glob = require('glob');
const watch = require('node-watch');
const cheerio = require('cheerio');
const prettier = require('prettier');

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
    const $ = cheerio.load(source);

    const $template = $('template');
    const styles = EzwcStyles.parseStyles($('style'), $template.attr('lang'), inFilePath);
    const template = EzwcTemplates.parseTemplate($template, styles, inFilePath);
    let script = EzwcScripts.parseScript($('script'), template, $template.attr('lang'), inFilePath);
    script = prettier.format(script, {
      singleQuote: true,
      trailingComma: 'es5',
      parser: 'babel'
    });

    this.writeOutput(outFile, script);
  }

  writeOutput(outFile, script) {
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

  process(inFilePath, outFilePath, watchForChanges) {
    Logger.app(`Starting up processing for input %s`, inFilePath);
    Logger.emptyLine();
    const processFiles = this.determineInputFileList(inFilePath);
    for (const inFile of processFiles) {
      this.processFile(inFile, outFilePath);
    }

    if (!watchForChanges) {
      Logger.app(`Finished processing %s!`, 'ezwc');
    } else {
      Logger.app(`Finished processing existing %s files. Watching for changes...`, 'ezwc');
      Logger.emptyLine();

      watch(
        inFilePath,
        {
          recursive: true,
          filter: /((\.ezwc)(\.(css|scss|html|pug|hbs|ejs|jsx?|tsx?))?)$/
        },
        (event, filename) => {
          const processFilename = filename.replace(/\.(css|scss|html|pug|hbs|ejs|jsx?|tsx?)$/i, '');
          Logger.app('Changes found for %s', processFilename);
          this.processFile(processFilename, outFilePath);
        }
      );
    }
  }
}

module.exports = new EzwcCore();
