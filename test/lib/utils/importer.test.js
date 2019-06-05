/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

const Importer = require('@lib/utils/importer');
const fs = require('fs');
const path = require('path');

jest.mock('@lib/utils/logger');
jest.mock('fs');
jest.mock('path');

describe('importer tests', () => {
  beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('import file', () => {
    test('should successfully import a file', () => {
      path.resolve.mockReturnValue('TEST');
      path.dirname.mockReturnValue('TEST');
      Importer.importFile('in-file', 'import-file');
      expect(path.resolve).toHaveBeenCalledWith('TEST', 'import-file');
      expect(path.dirname).toHaveBeenCalledWith('in-file');
      expect(fs.readFileSync).toHaveBeenCalledWith('TEST', 'utf8');
    });

    test('should fail reading the import file', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error();
      });
      Importer.importFile('in-file', 'import-file');
      expect(fs.readFileSync).toThrow(Error);
    });
  });

  describe('resolve import', () => {
    test('should import a file', () => {
      jest.spyOn(Importer, 'importFile');
      Importer.resolveImport('in-file', 'import-file');
      expect(Importer.importFile).toHaveBeenCalledWith('in-file', 'import-file');
    });

    test('should parse the content of the tag', () => {
      const trimMock = jest.fn();
      const mockDom = {
        html() {
          return {
            trim: trimMock
          };
        }
      };
      Importer.resolveImport(false, false, mockDom);
      expect(trimMock).toHaveBeenCalled();
    });
  });
});
