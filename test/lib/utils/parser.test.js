/**
 * @license
 * Copyright (c) 2019 Pynk Lynn, LLC
 * This code may only be used under the MIT style license found at
 * https://github.com/pynklynn/ezwc/blob/master/LICENSE
 */

require('@lib/utils/parser');

describe('Parser tests', () => {
  it('should parse the code', () => {
    const template = `
      <template>
        <h1>Template</h1>
      </template>
    `;
    const script = `
      <script>
        // script
      </script>
    `;
    const styles = `
      <style>
      /* styles */
      </style>
    `;
    const code = `
      ${template}
      ${script}
      ${styles}
    `;

    global.Parser.parse(code);
    expect(global.Parser.sourceCode).toBe(code);
    expect(global.Parser.templateCode).toBe(template.trim());
    expect(global.Parser.scriptCode).toBe(script.trim());
    expect(global.Parser.styleCode).toBe(styles.trim());
  });

  describe('templateLang', () => {
    it('should return lit', () => {
      const template = `
        <template lang="lit">
          <h1>Template</h1>
        </template>
      `;
      global.Parser.parse(template);
      expect(global.Parser.templateLang).toBe('lit');
    });

    it('should return html', () => {
      const template = `
        <template>
          <h1>Template</h1>
        </template>
      `;
      global.Parser.parse(template);
      expect(global.Parser.templateLang).toBe('html');
    });
  });

  describe('templateSrc', () => {
    it('should return path/to/file.html', () => {
      const template = `
        <template src="path/to/file.html">
          <h1>Template</h1>
        </template>
      `;
      global.Parser.parse(template);
      expect(global.Parser.templateSrc).toBe('path/to/file.html');
    });

    it('should return undefined', () => {
      const template = `
        <template>
          <h1>Template</h1>
        </template>
      `;
      global.Parser.parse(template);
      expect(global.Parser.templateSrc).toBe(undefined);
    });
  });

  it('should return the template content', () => {
    const template = `
      <template>
        <h1>Hello, world!</h1>
        <p>Here is some content.</p>
      </template>
    `;
    global.Parser.parse(template);
    expect(global.Parser.templateContent).toBe(`<h1>Hello, world!</h1>
        <p>Here is some content.</p>`
    );
  });

  describe('scriptLang', () => {
    it('should return ts', () => {
      const script = `
        <script lang="ts">
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.scriptLang).toBe('ts');
    });

    it('should return js', () => {
      const script = `
        <script>
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.scriptLang).toBe('js');
    });
  });

  describe('scriptSrc', () => {
    it('should return path/to/file.js', () => {
      const script = `
        <script src="path/to/file.js">
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.scriptSrc).toBe('path/to/file.js');
    });

    it('should return undefined', () => {
      const script = `
        <script>
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.scriptSrc).toBe(undefined);
    });
  });

  describe('componentSelector', () => {
    it('should return my-component', () => {
      const script =`
        <script selector="my-component">
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.componentSelector).toBe('my-component');
    });

    it('should throw an error when a selector is not present', () => {
      try {
        const script =`
          <script>
            // script
          </script>
        `;
        global.Parser.parse(script);
        expect(global.Parser.componentSelector).toThrow(Error);
      } catch(e) {}
    });
  });

  describe('useShadow', () => {
    it('should return false when no-shadow attribute is there', () => {
      const script =`
        <script no-shadow>
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.useShadow).toBe(false);
    });

    it('should return false when no-shadow attribute is set to true', () => {
      const script =`
        <script no-shadow="true">
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.useShadow).toBe(false);
    });

    it('should return true when no-shadow attribute is set to false', () => {
      const script =`
        <script no-shadow="false">
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.useShadow).toBe(true);
    });

    it('should return true when no-shadow attribute is not there', () => {
      const script =`
        <script>
          // script
        </script>
      `;
      global.Parser.parse(script);
      expect(global.Parser.useShadow).toBe(true);
    });
  });

  it('should return the script content', () => {
    const script = `
      <script>
        class MyComponent extends HTMLElement {
          constructor() {
            this.title = 'hello';
          }
        }
      </script>
    `;
    global.Parser.parse(script);
    expect(global.Parser.scriptContent).toBe(`class MyComponent extends HTMLElement {
          constructor() {
            this.title = 'hello';
          }
        }`
    );
  });

  describe('styleLang', () => {
    it('should return scss', () => {
      const style = `
        <style lang="scss">
          /* styles */
        </style>
      `;
      global.Parser.parse(style);
      expect(global.Parser.styleLang).toBe('scss');
    });

    it('should return css', () => {
      const style = `
        <style>
          /* styles */
        </style>
      `;
      global.Parser.parse(style);
      expect(global.Parser.styleLang).toBe('css');
    });
  });

  describe('styleSrc', () => {
    it('should return path/to/file.css', () => {
      const style = `
        <style src="path/to/file.css">
          /* styles */
        </style>
      `;
      global.Parser.parse(style);
      expect(global.Parser.styleSrc).toBe('path/to/file.css');
    });

    it('should return undefined', () => {
      const style = `
        <style>
          /* styles */
        </style>
      `;
      global.Parser.parse(style);
      expect(global.Parser.styleSrc).toBe(undefined);
    });
  });

  it('should return the style content', () => {
    const styles = `
      <style>
        :host {
          display: block;
        }
      </style>
    `;
    global.Parser.parse(styles);
    expect(global.Parser.styleContent).toBe(`:host {
          display: block;
        }`
    );
  });
});
