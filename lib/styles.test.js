const EzwcStyles = require('./styles');
const Logger = require('./utils/logger');
const Importer = require('./utils/importer');
const sass = require('node-sass');
const path = require('path');

jest.mock('./utils/logger');
jest.mock('./utils/importer');
jest.mock('node-sass');
jest.mock('path');

describe('styles processing tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parse styles', () => {
    test('should return an empty string', () => {
      const styles = EzwcStyles.parseStyles(null);
      expect(styles).toBe('');
      expect(Logger.info).toHaveBeenCalled();
    });

    test('should return a default styles string', () => {
      const mockDom = {
        attr() {
          return 'importFile';
        }
      };
      Importer.resolveImport.mockReturnValue('TEST');
      const styles = EzwcStyles.parseStyles(mockDom);
      expect(styles).toBe(`
<style>
  TEST
</style>
      `);
      expect(Logger.info).toHaveBeenCalled();
    });

    test('should return a styles string for sass', () => {
      const mockDom = {
        attr(attr) {
          if (attr === 'src') {
            return 'importFile';
          } else {
            return 'scss';
          }
        }
      };
      jest.spyOn(EzwcStyles, 'processSass').mockReturnValue('TEST');
      Importer.resolveImport.mockReturnValue('SASS');
      const styles = EzwcStyles.parseStyles(mockDom);
      expect(styles).toBe(`
<style>
  TEST
</style>
      `);
      expect(Logger.info).toHaveBeenCalled();
      expect(EzwcStyles.processSass).toHaveBeenCalled();
    });
  });

  describe('process sass', () => {
    test('should render sass', () => {
      sass.renderSync.mockReturnValue({ css: 'TEST' });
      const renderedSass = EzwcStyles.processSass('');
      expect(sass.renderSync).toHaveBeenCalled();
      expect(renderedSass).toBe('TEST');
    });

    test('should fail to render sass', () => {
      sass.renderSync.mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(console, 'log').mockImplementation(() => {});
      EzwcStyles.processSass();
      expect(sass.renderSync).toThrow(Error);
    });

    test('should handle sass @imports', () => {
      sass.renderSync.mockImplementation((options) => {
        options.importer('path/to/file', '', undefined);
        return { css: '' };
      });
      EzwcStyles.processSass();
      expect(path.resolve).toHaveBeenCalled();
      expect(path.dirname).toHaveBeenCalled();
    });
  });

  describe('generate style tag', () => {
    test('should generate a style tag for CSS with shadow root', () => {
      const styleTag = EzwcStyles.generateStyleTag('my-component', { shadowRoot: true });
      expect(styleTag).toBe(`
<style>
  :host {}
</style>
`
      );
    });

    test('should generate a style tag for CSS without shadow root', () => {
      const styleTag = EzwcStyles.generateStyleTag('my-component', { shadowRoot: false });
      expect(styleTag).toBe(`
<style>
  my-component {}
</style>
`
      );
    });

    test('should generate a style tag for Scss entered as sass', () => {
      const styleTag = EzwcStyles.generateStyleTag('my-component', { s: 'sass', shadowRoot: true });
      expect(styleTag).toBe(`
<style lang="scss">
  :host {}
</style>
`
      );
    });

    test('should generate a style tag for Scss entered as scss', () => {
      const styleTag = EzwcStyles.generateStyleTag('my-component', { s: 'scss', shadowRoot: false });
      expect(styleTag).toBe(`
<style lang="scss">
  my-component {}
</style>
`
      );
    });

    test('should generate a style tag with import for CSS when importAll is true', () => {
      const styleTag = EzwcStyles.generateStyleTag('hello-world', { importAll: true });
      expect(styleTag).toBe(`
<style src="./hello-world.ezwc.css"></style>
`
      );
    });

    test('should generate a style tag with import for CSS when importStyles is true', () => {
      const styleTag = EzwcStyles.generateStyleTag('hello-world', { importStyles: true });
      expect(styleTag).toBe(`
<style src="./hello-world.ezwc.css"></style>
`
      );
    });

    test('should generate a style tag with import for Scss entered as sass', () => {
      const styleTag = EzwcStyles.generateStyleTag('hello-world', { s: 'sass', importAll: true});
      expect(styleTag).toBe(`
<style lang="scss" src="./hello-world.ezwc.scss"></style>
`
      );
    });

    test('should generate a style tag with import for Scss entered as scss', () => {
      const styleTag = EzwcStyles.generateStyleTag('hello-world', { s: 'scss', importAll: true});
      expect(styleTag).toBe(`
<style lang="scss" src="./hello-world.ezwc.scss"></style>
`
      );
    });
  });
});
