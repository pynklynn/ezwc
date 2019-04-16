#!/usr/bin/env node

const meow = require('meow');
const Logger = require('./lib/utils/logger');
const EzwcCore = require('./lib/ezwc');

const cli = meow(`
Usage
  $ ezwc -i <in file/directory> -o <out file/directory>

Options
  --in, -i Input file or directory
  --out, -o Output file or directoy

Examples
  $ ezwc -i my-component.ezwc -o my-component.js
  $ ezwc -i path/to/process -o dist
`,{
  flags: {
    in: {
      type: 'string',
      alias: 'i'
    },
    out: {
      type: 'string',
      alias: 'o'
    }
  }
});

// make sure there is an input file
if (!cli.flags.in) {
  Logger.error('An input file or directory must be specified.');
  process.exit(1);
}

const inFilePath = cli.flags.in;

EzwcCore.process(inFilePath, cli.flags.out);
