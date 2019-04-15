const Importer = require('./importer');
const Logger = require('./logger');
const fs = require('fs');
const path = require('path');

jest.mock('./logger');
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
      const mockTag = {
        innerHTML: {
          trim: jest.fn()
        }
      };
      Importer.resolveImport(false, false, mockTag);
    });
  });
});
