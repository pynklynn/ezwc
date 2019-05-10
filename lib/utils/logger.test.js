const Logger = require('./logger');
const chalk = require('chalk');

describe('Logger tests', () => {
  beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('error messages', () => {
    test('should output an error message without a highlight', () => {
      jest.spyOn(console.log, 'apply');
      Logger.error('TEST');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [chalk`{bold.bgRed  ERROR } {red TEST}`]
      );
    });

    test('should output an error message with a highlight', () => {
      jest.spyOn(console.log, 'apply');
      Logger.error('TEST', 'highlight');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [
          chalk`{bold.bgRed  ERROR } {red TEST}`,
          chalk`{bold highlight}`
        ]
      );
    });
  });

  describe('info messages', () => {
    test('should output an info message without a highlight', () => {
      jest.spyOn(console.log, 'apply');
      Logger.info('TEST');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [chalk`{bold.bgCyan  INFO } {cyan TEST}`]
      );
    });

    test('should output an info message with a highlight', () => {
      jest.spyOn(console.log, 'apply');
      Logger.info('TEST', 'highlight');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [
          chalk`{bold.bgCyan  INFO } {cyan TEST}`,
          chalk`{bold highlight}`
        ]
      );
    });
  });

  describe('warn messages', () => {
    test('should output an warn message without any highlights', () => {
      jest.spyOn(console.log, 'apply');
      Logger.warn('warn');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [chalk`{bold.bgYellow.black  WARNING } {yellow warn}`]
      );
    });

    test('should output an warn message with highlights', () => {
      jest.spyOn(console.log, 'apply');
      Logger.warn('warn', 'TEST1', 'TEST2');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [
          chalk`{bold.bgYellow.black  WARNING } {yellow warn}`,
          chalk`{bold TEST1}`,
          chalk`{bold TEST2}`
        ]
      );
    });
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

  test('should output the help for compile', () => {
    jest.spyOn(console, 'log');
    Logger.compileHelpText();
    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test('should output the help for generate', () => {
    jest.spyOn(console, 'log');
    Logger.generateHelpText();
    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
