const Logger = require('./logger');
const chalk = require('chalk');

describe('Logger tests', () => {
  describe('error messages', () => {
    test('should output an error message without a highlight', () => {
      jest.spyOn(console.log, 'apply');
      Logger.error('Error');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [chalk`{bold.bgRed  Error } {red Error}`]
      );
    });

    test('should output an error message with a highlight', () => {
      jest.spyOn(console.log, 'apply');
      Logger.error('Error', 'highlight');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [
          chalk`{bold.bgRed  Error } {red Error}`,
          chalk`{bold highlight}`
        ]
      );
    });
  });

  test('should output an info message', () => {
    jest.spyOn(console, 'log');
    Logger.info('info');
    expect(console.log).toHaveBeenCalledWith(chalk`{bold.bgCyan  INFO } {cyan info}`);
  });

  test('should output an warn message', () => {
    jest.spyOn(console, 'log');
    Logger.warn('warn');
    expect(console.log).toHaveBeenCalledWith(chalk`{bold.bgYellow  WARNING } {yellow warn}`);
  });

  test('should output an success message', () => {
    jest.spyOn(console, 'log');
    Logger.success('success %s', 'TEST', 'success');
    expect(console.log).toHaveBeenCalledWith(
      chalk`{bold.bgMagenta  TEST } {magenta success %s}`,
      chalk`{bold success}`
    );
  });

  test('should output an process message', () => {
    jest.spyOn(console, 'log');
    Logger.process('process %s', 'TEST', 'process');
    expect(console.log).toHaveBeenCalled();
  });

  test('should output an empty line', () => {
    jest.spyOn(console, 'log');
    Logger.emptyLine();
    expect(console.log).toHaveBeenCalledWith('');
  });

  test('should output an app message', () => {
    jest.spyOn(console, 'log');
    Logger.app('process %s', 'process');
    expect(console.log).toHaveBeenCalledWith(
      chalk`{bgGreen.black.bold  EZWC } {green process %s}`,
      chalk`{bold process}`
    );
  });
});
