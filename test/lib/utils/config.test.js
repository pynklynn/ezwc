const Config = require('@lib/utils/config');
const fs = require('fs');
const path = require('path');

jest.mock('fs');
jest.mock('path');

describe('config tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('process', () => {
    beforeEach(() => {
      jest.spyOn(process, 'cwd');
    });

    test('should use the default config path and return and empty object', () => {
      fs.existsSync.mockReturnValue(false);
      path.resolve.mockReturnValue('TEST');
      const processedConfig = Config.process({});
      expect(fs.existsSync).toHaveBeenCalledWith('TEST');
      expect(processedConfig).toEqual({});
    });

    test('should use the passed in config path and return a proccessed config', () => {
      fs.existsSync.mockReturnValue(true);
      path.resolve.mockReturnValue('TEST');
      process.cwd.mockReturnValue('TEST');
      jest.spyOn(Config, 'collectFlags').mockImplementation(() => {});
      Config.process({ config: 'CONFIG' });
      expect(path.resolve).toHaveBeenCalledWith('TEST', 'CONFIG')
      expect(fs.existsSync).toHaveBeenCalledWith('TEST');
      expect(Config.collectFlags).toHaveBeenCalled();
    });
  });
});
