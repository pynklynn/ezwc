const EzwcCore = require('./ezwc');
const Logger = require('./utils/logger');
const fs = require('fs');

jest.mock('./utils/logger');
jest.mock('fs');

describe('core tests', () => {
  beforeEach(() => {
    // fs.existsSync.mockReturnValue(true);
    // fs.statSync.mockImplementation(() => {
    //   return {
    //     isDirectory() {
    //       return true;
    //     }
    //   }
    // });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('determine output file', () => {
    test('should use the input file to determine output path when none is defined', () => {
      const outputFile = EzwcCore.determineOutfile('path/to/test-file.ezwc');
      expect(outputFile).toBe('path/to/test-file.js');
    });

    test('should use the given path when a file is designated for output', () => {
      const outputFile = EzwcCore.determineOutfile('path/to/input-test-file.ezwc', 'path/to/output-test-file.js');
      expect(outputFile).toBe('path/to/output-test-file.js');
    });

    test('should generate output file path when given a directory', () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockImplementation(() => {
        return {
          isDirectory() {
            return true;
          }
        }
      });

      const outputFile = EzwcCore.determineOutfile('path/to/test-file.ezwc', 'dist');
      expect(outputFile).toBe('dist/test-file.js');
    });
  });
});
