const EzwcCore = require('./ezwc');
const Logger = require('./utils/logger');
const fs = require('fs');
const glob = require('glob');

jest.mock('./utils/logger');
jest.mock('fs');
jest.mock('glob');

describe('core tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('determine output file', () => {
    test('should use the input file to determine output path when none is defined', () => {
      const outputFile = EzwcCore.determineOutfile('path/to/test-file.ezwc');
      expect(outputFile).toBe('path/to/test-file.js');
    });

    test('should use the given path when a file is designated for output', () => {
      const outputFile = EzwcCore.determineOutfile('input-test-file.ezwc', 'output-test-file.js');
      expect(outputFile).toBe('output-test-file.js');
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
      expect(outputFile).toBe('dist/path/to/test-file.js');
    });
  });

  describe('determine input file list', () => {
    test('should find files in a directory', () => {
      jest.spyOn(fs, 'statSync').mockReturnValue({
        isDirectory() {
          return true;
        }
      });
      jest.spyOn(glob, 'sync').mockReturnValue(['file1', 'file2']);
      const testInputFiles = EzwcCore.determineInputFileList('path');
      expect(fs.statSync).toHaveBeenCalled();
      expect(glob.sync).toHaveBeenCalled();
      expect(testInputFiles.length).toBe(2);
    });

    test('should find one file', () => {
      jest.spyOn(fs, 'statSync').mockReturnValue({
        isDirectory() {
          return false;
        }
      });
      const testInputFiles = EzwcCore.determineInputFileList('path');
      expect(fs.statSync).toHaveBeenCalled();
      expect(testInputFiles.length).toBe(1);
    });
  });

  test('should process input files', () => {
    jest.spyOn(EzwcCore, 'processFile').mockImplementation(() => {});
    jest.spyOn(EzwcCore, 'determineInputFileList').mockReturnValue(['fileOne']);

    EzwcCore.process('test', 'test2');
    expect(Logger.app).toHaveBeenCalledWith(`Starting up processing for input %s`, 'test');
    expect(Logger.emptyLine).toHaveBeenCalled();
    expect(EzwcCore.determineInputFileList).toHaveBeenCalled()
    expect(EzwcCore.processFile).toHaveBeenCalledWith('fileOne', 'test2');
    expect(Logger.app).toHaveBeenCalledWith(`Finished processing %s!`, 'ezwc');
  });
});
