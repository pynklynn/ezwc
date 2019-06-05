/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const path = require('path');
const fs = require('fs');
const Logger = require('./logger');

class Importer {
  importFile(inFile, importFile) {
    const importFilePath = path.resolve(
      path.dirname(inFile),
      importFile
    );
    try {
      return fs.readFileSync(importFilePath, 'utf8');
    } catch(err) {
      Logger.error('Imported file %s could not be read', importFile);
      process.exit(1);
    }
  }

  resolveImport(inFile, importFile, tag) {
    if (importFile) {
      return this.importFile(inFile, importFile);
    } else {
      return tag.html().trim();
    }
  }
}

module.exports = new Importer();
