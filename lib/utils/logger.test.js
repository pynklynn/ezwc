const Logger = require('./logger');
const chalk = require('chalk');

describe('Logger tests', () => {
  beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    process.env.SILENT_MODE = false;
    jest.spyOn(console, 'log');
    jest.spyOn(console.log, 'apply');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('error messages', () => {
    test('should output an error message without a highlight', () => {
      Logger.error('TEST');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [chalk`{bold.bgRed  ERROR } {red TEST}`]
      );
    });

    test('should output an error message with a highlight', () => {
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
      Logger.info('TEST');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [chalk`{bold.bgCyan  INFO } {cyan TEST}`]
      );
    });

    test('should output an info message with a highlight', () => {
      Logger.info('TEST', 'highlight');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [
          chalk`{bold.bgCyan  INFO } {cyan TEST}`,
          chalk`{bold highlight}`
        ]
      );
    });

    test('should bypass info message', () => {
      process.env.SILENT_MODE = true;
      Logger.info('TEST');
      expect(console.log.apply).not.toHaveBeenCalled();
    });
  });

  describe('warn messages', () => {
    test('should output an warn message without any highlights', () => {
      Logger.warn('warn');
      expect(console.log.apply).toHaveBeenCalledWith(
        null,
        [chalk`{bold.bgYellow.black  WARNING } {yellow warn}`]
      );
    });

    test('should output an warn message with highlights', () => {
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

  describe('success messages', () => {
    test('should output an success message', () => {
      Logger.success('success %s', 'TEST', 'success');
      expect(console.log).toHaveBeenCalledWith(
        chalk`{bold.bgMagenta  TEST } {magenta success %s}`,
        chalk`{bold success}`
      );
    });

    test('should bypass success message', () => {
      process.env.SILENT_MODE = true;
      Logger.success('TEST', 'TEST', 'TEST');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('process message tests', () => {
    test('should output an process message', () => {
      Logger.process('process %s', 'TEST', 'process');
      expect(console.log).toHaveBeenCalled();
    });

    test('should bypass the process message', () => {
      process.env.SILENT_MODE = true;
      Logger.process('process %s', 'TEST', 'process');
      expect(console.log).not.toHaveBeenCalled();
    })
  });

  describe('empty line tests', () => {
    test('should output an empty line', () => {
      Logger.emptyLine();
      expect(console.log).toHaveBeenCalledWith('');
    });

    test('should bypass outputting an empty line', () => {
      process.env.SILENT_MODE = true;
      Logger.emptyLine();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('app message tests', () => {
    test('should output an app message', () => {
      Logger.app('process %s', 'process');
      expect(console.log).toHaveBeenCalledWith(
        chalk`{bgGreen.black.bold  EZWC } {green process %s}`,
        chalk`{bold process}`
      );
    });

    test('should bypass the app message output', () => {
      process.env.SILENT_MODE = true;
      Logger.app('process %s', 'process');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  test('should output the help for compile', () => {
    Logger.compileHelpText();
    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test('should output the help for generate command', () => {
    Logger.generateHelpText();
    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test('should output the help for new command', () => {
    Logger.newHelpText();
    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
