const fs = require('fs');
const Logger = require('./utils/logger');
const EzwcStyles = require('./styles');
const EzwcTemplates = require('./templates');
const EzwcScripts = require('./scripts');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async function(inFile, outFile) {
  Logger.process(`🐱  Transpiling %s...`, 'Start', inFile);
  Logger.emptyLine();

  const source = fs.readFileSync(inFile, 'utf8');
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
