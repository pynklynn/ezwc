const chalk = require('chalk');
const packageJson = require('../../package.json');

class Logger {
  error(message, highlight) {
    const args = [chalk`{bold.bgRed  Error } {red ${message}}`];
    if (highlight) {
      args.push(chalk`{bold ${highlight}}`);
    }
    console.log.apply(null, args);
  }

  info(message) {
    console.log(chalk`{bold.bgCyan  INFO } {cyan ${message}}`);
  }

  warn(message, highlight) {
    console.log(chalk`{bold.bgYellow.black  WARNING } {yellow ${message}}`, chalk`{bold ${highlight}}`);
  }

  success(message, flag, highlight) {
    console.log(chalk`{bold.bgMagenta  ${flag.toUpperCase()} } {magenta ${message}}`, chalk`{bold ${highlight}}`);
  }

  process(message, flag, highlight) {
    const flagText = chalk.bgKeyword('orange')(chalk`{bold.black  ${flag.toUpperCase()} }`);
    const messageText = chalk.keyword('orange')(message);
    console.log(`${flagText} ${messageText}`, chalk`{bold ${highlight}}`);
  }

  app(message, highlight) {
    console.log(chalk`{bgGreen.black.bold  EZWC } {green ${message}}`, chalk`{bold ${highlight}}`);
  }

  emptyLine() {
    console.log('');
  }

  compileHelpText() {
    console.log(`
${packageJson.description}

Available commands
  (none) - compile ezwc files based on the input options
  generate - generate a new ezwc file

Usage - compile
  $ ezwc -i <in file/directory> -o <out file/directory> -w -c <config file path>

Options
  --in, -i (required) Input file or directory
  --out, -o (optional) Output file or directoy
  --watch, -w (optional) Watch for changes to input file or directory
  --config, -c (optional) Path to config file if it is in a different directory and/or a different name

Examples
  $ ezwc -i my-component.ezwc -o my-component.js
  $ ezwc -i path/to/process -o dist
  $ ezwc -i path/to/process -w
  # using a config file at the default location
  $ ezwc
`
    );
    process.exit(0);
  }

  generateHelpText() {
    console.log(`
Generate a new ezwc component

Usage
  $ ezwc generate <selector> -d path/to/generate/file -s <style preprocessor> -t <template engine> -T

Notes
  - Selectors will be normalized to kebabcase (ex: HelloWorld becomes hello-world and hello---world becomes hello-world)
  - Selectors should contain a dash in the name after normalization

Options
  --styles, -s (optional) style preprocessor - will use CSS if not included
  --template, -t (optional) template engine - will use HTML if not included
  --ts, -T (optional) use Typescript for the script - will use JavaScript if not included
  --dir, -d (optional) directory to write the component in

Examples
  $ ezwc create my-component
  $ ezwc create src/sass-ejs-ts-component -s sass -t ejs --ts
  $ ezwc create hbs-component -d src/hbs/components -t handlebars
`
    );
    process.exit(0);
  }
}

module.exports = new Logger();
