#!/usr/bin/env node

const meow = require('meow');
const chalk = require('chalk');
const ezwcCore = require('./lib/ezwc');

const cli = meow(`
Usage
  $ ezwc <in file> --out=<out file>

Options
  --out, -o Output file

Examples
  $ ezwc my-component.ezwc -o=my-component.js
`,{
  input: ['inFile'],
  flags: {
    out: {
      type: 'string',
      alias: 'o'
    }
  }
});

// make sure there is a file
if (cli.input.length < 1) {
  console.log(chalk`{bold.bgRed  Error } {red An input file must be specified.}`);
  process.exit(1);
}

// make sure it's a .ezwc file
const inFilePath = cli.input[0];
const inFileMatches = /(?<inFile>.*)\.ezwc$/gi.exec(inFilePath);
if (!inFileMatches) {
  console.log(chalk`{bold.bgRed  Error } {red An input file must be specified.}`);
  process.exit(1);
}

const outFilePath = cli.flags.out || inFilePath.replace(/\.ezwc$/i, '.js');
ezwcCore(inFilePath, outFilePath);
