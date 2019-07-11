/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

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
  determineOutfile(inFile, inFilePath, outFilePath) {
    const outFilePathIsAFile = outFilePath.match(/.m?jsx?$/i);
    /* istanbul ignore else */
    if (outFilePathIsAFile && outFilePathIsAFile.length) {
      return outFilePath;
    }
    let outFile = inFile.replace(/\.ezwc$/i, '.js');
    if (outFilePath) {
      let normalizedInFilePath = `${inFilePath}`;
      let {
        filepath: inputFilePath,
        filename: inputFileName
      } = /(?<filepath>.*\/)?(?<filename>.*\.ezwc)$/.exec(inFile).groups;
      if (inFile !== inFilePath) {
        inputFilePath = inputFilePath.replace(normalizedInFilePath, '');
      }
      /* istanbul ignore next */
      if (inputFilePath[0] === '/') {
        inputFilePath = inputFilePath.substring(1);
      }
      let resolvedFilePath = path.resolve(process.cwd(), outFilePath);
      /* istanbul ignore else */
      if (inputFilePath) {
        resolvedFilePath = path.resolve(resolvedFilePath, inputFilePath);
      }
      fs.mkdirSync(resolvedFilePath, { recursive: true });
      outFile = `${resolvedFilePath}/${inputFileName.replace(/\.ezwc$/i, '.js')}`;
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
  processFile(inFile, inFilePath, outFilePath, writeFile = true) {
    Logger.process(`Transpiling %s...`, 'Start', inFile);

    let outFile;
    /* istanbul ignore else */
    if (writeFile) {
      outFile = this.determineOutfile(inFile, inFilePath, outFilePath);
    }
    const source = fs.readFileSync(inFile, 'utf8');
    const $ = cheerio.load(source);
    const $t = cheerio.load(source, {
      xml: {
        withDomLvl1: true
      }
    });

    const $template = $t('template');
    const $script = $('script');
    const styles = EzwcStyles.parseStyles($('style'), $template.attr('lang'), inFile);
    const template = EzwcTemplates.parseTemplate($template, styles, inFile);
    const flags = {
      template: $template.attr('lang'),
      shadowRoot: $script.attr('no-shadow') === undefined
    };
    let script = EzwcScripts.parseScript($script, template, flags, inFile);
    script = prettier.format(script, {
      singleQuote: true,
      trailingComma: 'es5',
      parser: 'babel'
    });

    if (writeFile) {
      this.writeOutput(outFile, script);
    } else {
      return script;
    }
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

  process(inFilePath, outFilePath, watchForChanges, silenceLogger = false, writeFile = true) {
    if (silenceLogger) {
      process.env.SILENT_MODE = true;
    }
    Logger.app(`Starting up processing for input %s`, inFilePath);
    Logger.emptyLine();
    const processFiles = this.determineInputFileList(inFilePath);
    if (writeFile) {
      for (const inFile of processFiles) {
        this.processFile(inFile, inFilePath, outFilePath);
      }
    } else {
      return this.processFile(processFiles[0], inFilePath, outFilePath, false);
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
          filter: /((\.ezwc)(\.(css|scss|html|hbs|ejs|jsx?|tsx?))?)$/
        },
        (event, filename) => {
          const processFilename = filename.replace(/\.(css|scss|html|hbs|ejs|jsx?|tsx?)$/i, '');
          Logger.app('Changes found for %s', processFilename);
          this.processFile(processFilename, inFilePath, outFilePath);
        }
      );
    }
  }
}

module.exports = new EzwcCore();
