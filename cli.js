#!/usr/bin/env node

const meow = require('meow');
const Logger = require('./lib/utils/logger');
const Config = require('./lib/utils/config');
const EzwcCore = require('./lib/ezwc');
const EzwcGenerate = require('./lib/commands/generate');

const cli = meow('', {
  flags: {
    in: {
      type: 'string',
      alias: 'i'
    },
    out: {
      type: 'string',
      alias: 'o'
    },
    watch: {
      type: 'boolean',
      alias: 'w'
    },
    config: {
      type: 'string',
      alias: 'c'
    },
    styles: {
      type: 'string',
      alias: 's'
    },
    template: {
      type: 'string',
      alias: 't'
    },
    ts: {
      type: 'boolean',
      alias: 'T'
    },
    dir: {
      type: 'string',
      alias: 'd'
    },
  },
  autoHelp: false
});

const processedFlags = Config.process(cli.flags);
Object.assign(cli.flags, processedFlags);

if (cli.input && cli.input.length) {
  switch (cli.input[0]) {
    case 'generate':
    case 'g':
      if (cli.flags.help) {
        Logger.generateHelpText();
      } else if (cli.input.length !== 2) {
        Logger.error('%s command requires a selector to be input', 'generate');
        process.exit(1);
      } else {
        EzwcGenerate.process(cli.input[1], cli.flags);
      }
      break;
  }
} else {
  if (cli.flags.help) {
    Logger.compileHelpText();
  }

  // make sure there is an input file
  if (!cli.flags.in) {
    Logger.error('An input file or directory must be specified.');
    process.exit(1);
  }

  const inFilePath = cli.flags.in;

  EzwcCore.process(inFilePath, cli.flags.out, cli.flags.watch);
}
