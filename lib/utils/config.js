/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const fs = require('fs');
const path = require('path');

class Config {
  process(flags) {
    let configFilePath = path.resolve(process.cwd(), '.ezwc.config.js');
    if (flags.config) {
      configFilePath = path.resolve(process.cwd(), flags.config);
    }

    if (fs.existsSync(configFilePath)) {
      return this.collectFlags(configFilePath, flags);
    } else {
      return {};
    }
  }

  /* istanbul ignore next */
  collectFlags(configFilePath, flags) {
    const configFile = require(configFilePath);
    const processedFlags = {}

    // compile options
    if ((configFile.i || configFile.in) && !flags.in) {
      processedFlags.in = configFile.i || configFile.in;
      processedFlags.i = processedFlags.in;
    }
    if ((configFile.o || configFile.out) && !flags.out) {
      processedFlags.out = configFile.o || configFile.out;
      processedFlags.o = processedFlags.out;
    }
    if ((configFile.w || configFile.watch) && !flags.watch) {
      processedFlags.watch = configFile.w || configFile.watch;
      processedFlags.w = processedFlags.watch;
    }

    // generate options
    if (configFile.generate || configFile.g) {
      const generateConfig = configFile.generate || configFile.g;
      if ((generateConfig.d || generateConfig.dir) && !flags.dir) {
        processedFlags.dir = generateConfig.d || generateConfig.dir;
        processedFlags.d = processedFlags.dir;
      }
      if ((generateConfig.s || generateConfig.styles) && !flags.styles) {
        processedFlags.styles = generateConfig.s || generateConfig.styles;
        processedFlags.s = processedFlags.styles;
      }
      if ((generateConfig.t || generateConfig.template) && !flags.template) {
        processedFlags.template = generateConfig.t || generateConfig.template;
        processedFlags.t = processedFlags.template;
      }
      if ((generateConfig.T || generateConfig.ts) && !flags.ts) {
        processedFlags.ts = generateConfig.T || generateConfig.ts;
        processedFlags.T = processedFlags.ts;
      }
      if (generateConfig.importStyles && !flags.importStyles) {
        processedFlags.importStyles = generateConfig.importStyles;
      }
      if (generateConfig.importTemplate && !flags.importTemplate) {
        processedFlags.importTemplate = generateConfig.importTemplate;
      }
      if (generateConfig.importScript && !flags.importScript) {
        processedFlags.importScript = generateConfig.importScript;
      }
      if (generateConfig.importAll && !flags.importAll) {
        processedFlags.importAll = generateConfig.importAll;
      }
      if ((generateConfig.f || generateConfig.force) && !flags.force) {
        processedFlags.force = generateConfig.f || generateConfig.force;
        processedFlags.f = processedFlags.force;
      }
    }

    return processedFlags;
  }
}

module.exports = new Config;
