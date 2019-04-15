const EzwcStyles = require('./styles');
const Logger = require('./utils/logger');
const Importer = require('./utils/importer');

jest.mock('./utils/logger');
jest.mock('./utils/importer');

describe('styles processing tests', () => {
  test('should return an empty string', () => {
    const querySelectorMock = {
      querySelector() {
        return false;
      }
    };
    const styles = EzwcStyles.parseStyles(querySelectorMock);
    expect(styles).toBe('');
    expect(Logger.info).toHaveBeenCalled();
  });

  test('should return a styles string', () => {
    const querySelectorMock = {
      querySelector() {
        return {
          getAttribute() {
            return 'importFile';
          }
        };
      }
    };
    Importer.resolveImport.mockReturnValue('TEST');
    const styles = EzwcStyles.parseStyles(querySelectorMock);
    expect(styles).toBe(`
<style>
  TEST
</style>
      `);
    expect(Logger.info).toHaveBeenCalled();
  });
});
