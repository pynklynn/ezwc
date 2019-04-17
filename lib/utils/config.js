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

    return processedFlags;
  }
}

module.exports = new Config;
