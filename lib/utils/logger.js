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
    console.log(chalk`{bold.bgCyan  Info } {cyan ${message}}`);
  }

  warn(message) {
    console.log(chalk`{bold.bgYellow  Error } {yellow ${message}}`);
  }
}

module.exports = new Logger();
