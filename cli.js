#!/usr/bin/env node

const meow = require('meow');
const Logger = require('./lib/utils/logger');
const ezwcCore = require('./lib/ezwc');

const cli = meow(`
Usage
  $ ezwc --in=<in file> --out=<out file>

Options
  --in, -i Input file
  --out, -o Output file

Examples
  $ ezwc my-component.ezwc -o=my-component.js
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
  Logger.error('An input file must be specified.');
  process.exit(1);
}

// make sure it's a .ezwc file
const inFilePath = cli.flags.in;
const inFileMatches = /(?<inFile>.*)\.ezwc$/gi.exec(inFilePath);
if (!inFileMatches) {
  Logger.error('Input file should be a %s file.', '.ezwc')
  process.exit(1);
}

const outFilePath = cli.flags.out || inFilePath.replace(/\.ezwc$/i, '.js');
ezwcCore(inFilePath, outFilePath);
