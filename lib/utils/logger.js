const chalk = require('chalk');
const packageJson = require('../../package.json');

class Logger {
  error(message, highlight) {
    const args = [chalk`{bold.bgRed  ERROR } {red ${message}}`];
    if (highlight) {
      args.push(chalk`{bold ${highlight}}`);
    }
    console.log.apply(null, args);
  }

  info(message, highlight) {
    const args = [chalk`{bold.bgCyan  INFO } {cyan ${message}}`];
    if (highlight) {
      args.push(chalk`{bold ${highlight}}`);
    }
    console.log.apply(null, args);
  }

  warn(message, ...highlights) {
    const args = [chalk`{bold.bgYellow.black  WARNING } {yellow ${message}}`];
    highlights.forEach(highlight => args.push(chalk`{bold ${highlight}}`));
    console.log.apply(null, args);
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
  - If creating the selector in a sub-directory under the directory, it can be passed as part of the selector name (ex: "ezwc g navigation/nav-link -d src" will create component "nav-link.ezwc" in "src/navigation/")

Options
  --styles, -s (optional) style preprocessor - will use CSS if not included
  --template, -t (optional) template engine - will use HTML if not included
  --ts, -T (optional) use Typescript for the script - will use JavaScript if not included
  --dir, -d (optional) directory to write the component in
  --import-styles - (optional) create the styles as an import, will use input style type to generate appropriate file
  --import-template - (optional) create the template as an import, will use input template type to generate appropriate file
  --import-script - (optional) create the script as an import, will use input script type to generate appropriate file
  --import-all - (optional) create the all files as an import - overrides the other import flags, will use inputs to generate appropriate files
  --force, -f - (optional) overwrite existing files when generating new component files
  --no-shadow-root - (optional) don't include the shadow DOM

Examples
  $ ezwc create my-component
  $ ezwc create src/sass-ejs-ts-component -s sass -t ejs --ts
  $ ezwc create hbs-component -d src/hbs/components -t handlebars
`
    );
    process.exit(0);
  }

  newHelpText() {
    console.log(`
Generate a new EZWC-based project. The new command will run a wizard asking questions to set up the new project.

Usage
  $ ezwc new
`
    );
    process.exit(0);
  }
}

module.exports = new Logger();
