const chalk = require('chalk');

class Logger {
  error(message, highlight) {
    const args = [chalk`{bold.bgRed  Error } {red ${message}}`];
    if (highlight) {
      args.push(chalk`{bold ${highlight}}`);
    }
    console.log.apply(this, args);
  }

  info(message) {
    console.log(chalk`{bold.bgCyan  INFO } {cyan ${message}}`);
  }

  warn(message) {
    console.log(chalk`{bold.bgYellow  ERROR } {yellow ${message}}`);
  }

  success(message, flag, highlight) {
    console.log(chalk`{bold.bgMagenta  ${flag.toUpperCase()} } {magenta ${message}}`, chalk`{bold ${highlight}}`);
  }

  process(message, flag, highlight) {
    console.log(chalk`{bold.bgGreen  ${flag.toUpperCase()} } {green ${message}}`, chalk`{bold ${highlight}}`);
  }

  emptyLine() {
    console.log('\n');
  }
}

module.exports = new Logger();
