const chalk = require('chalk');

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
}

module.exports = new Logger();
