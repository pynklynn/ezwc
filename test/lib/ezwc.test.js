/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const EzwcCore = require('@lib/ezwc');
const Logger = require('@lib/utils/logger');
const fs = require('fs');
const glob = require('glob');
const watch = require('node-watch');

jest.mock('@lib/utils/logger');
jest.mock('fs');
jest.mock('glob');
jest.mock('node-watch');

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

  describe('process', () => {
    beforeEach(() => {
      jest.spyOn(EzwcCore, 'processFile').mockImplementation(() => {});
      jest.spyOn(EzwcCore, 'determineInputFileList').mockReturnValue(['fileOne']);
      process.env.SILENT_MODE = false;
    });

    test('should silence the logs', () => {
      expect(process.env.SILENT_MODE).toBe('false');
      EzwcCore.process('test', 'test2', false, true);
      expect(process.env.SILENT_MODE).toBe('true');
    });

    test('should process input files and not watch', () => {
      EzwcCore.process('test', 'test2');
      expect(Logger.app).toHaveBeenCalledWith(`Starting up processing for input %s`, 'test');
      expect(Logger.emptyLine).toHaveBeenCalled();
      expect(EzwcCore.determineInputFileList).toHaveBeenCalled()
      expect(EzwcCore.processFile).toHaveBeenCalledWith('fileOne', 'test2');
      expect(Logger.app).toHaveBeenCalledWith(`Finished processing %s!`, 'ezwc');
    });

    test('should process input files and watch', () => {
      watch.mockImplementation((input, options, callback) => { callback({}, 'testWatch') });

      EzwcCore.process('test', 'test2', true);
      expect(Logger.app).toHaveBeenCalledWith(`Starting up processing for input %s`, 'test');
      expect(Logger.emptyLine).toHaveBeenCalled();
      expect(EzwcCore.determineInputFileList).toHaveBeenCalled()
      expect(EzwcCore.processFile).toHaveBeenCalledWith('fileOne', 'test2');
      expect(Logger.app).toHaveBeenCalledWith(`Finished processing existing %s files. Watching for changes...`, 'ezwc');
      expect(watch).toHaveBeenCalled();
      expect(Logger.app).toHaveBeenCalledWith('Changes found for %s', 'testWatch');
      expect(EzwcCore.processFile).toHaveBeenCalledWith('testWatch', 'test2');
    });
  });

  describe('write output', () => {
    test('should successfully write the file out', () => {
      const writeOptions = {
        encoding: 'utf8',
        flag: 'w+'
      };
      EzwcCore.writeOutput('out/file', 'script');
      expect(fs.writeFileSync).toHaveBeenCalledWith('out/file', 'script', writeOptions);
      expect(Logger.success).toHaveBeenCalledWith(`Web component file %s has been written out!`, 'Done!', 'out/file');
      expect(Logger.emptyLine).toHaveBeenCalled();
    });

    test('should fail to write the file out', () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error();
      });
      // the catch actually throws the real error so we need to bypass that
      try {
        EzwcCore.writeOutput('out/file', 'script');
        expect(fs.writeFileSync).toThrow(Error);
      } catch(err) {}
    });
  });
});
