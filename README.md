# ezwc

[![Build Status](https://travis-ci.org/pynklynn/ezwc.svg?branch=master)](https://travis-ci.org/pynklynn/ezwc)
[![NPM Version](https://img.shields.io/npm/v/ezwc-cli.svg)](https://img.shields.io/npm/v/ezwc-cli.svg)

Easily convert web components written similar to Vue single file components into native web components.

**_Note: This project is still in the early stages of development so use it with caution. If you find a problem or want to see a feature request not in the list below, please open an issue._**

## Getting started

**Node 10 or higher is required.**

To get started, install the CLI globally:

```shell
$ npm install -g ezwc-cli
```

To transpile a .ezwc file to a web component (with output name specified), run:

```shell
$ ezwc -i path/to/component.ezwc -o path/to/output.js
```

To transpile all .ezwc files in a directory and all subdirectories to web components (with output directory specified), run:

```shell
$ ezwc -i ./ -o dist
```

It's also possible to omit the output option to output in the same directories as source files:

```shell
$ ezwc -i ./
```

## About ezwc

Web components are the future of front-end web development. Luckily, the future is (mostly) now!

Web components are a great technology to have built into standards. They enable easy creation of a single, re-usable unit of code that doesn't require any libraries to run‡.

That being said, they may not always be the prettiest to write. [Vue](https://vuejs.org/) offers the ability to create a [single file component](https://vuejs.org/v2/guide/single-file-components.html) split into three, easy to read and write sections. The ezwc (short for easy web components) format is inspired by the Vue single file component design and tailored for native web components.

Essentially, a .ezwc file goes in and a usable ES2015+ .js file containing your web component comes out!

## CLI Options

`--in, -i` - (required) Path to input .ezwc file or directory to search for .ezwc files in and it's subdirectories

`--out, -o` - (optional) Path to output .js file - If this isn't supplied, the output will be the same path and filename as the input file with a .js extension. This also takes a path which will generate a file with a generated name in the specified path.

`--watch, -w` - (optional) Watch for file changes from the input file/directory

`--config, -c` - (optional) Path to config file (if not using the standard file and location)

## Generate Command

`generate` or `g` - Generate a new ezwc component

* Selectors will be normalized to kebabcase (ex: HelloWorld becomes hello-world and hello---world becomes hello-world)
* Selectors should contain a dash in the name after normalization
* If creating the selector in a sub-directory under the directory, it can be passed as part of the selector name (ex: `ezwc g navigation/nav-link -d src` will create component `nav-link.ezwc` in `src/navigation/`)

### Generate Options

`--styles, -s` - (optional) style preprocessor - will use CSS if not included

`--template, -t` - (optional) template engine - will use HTML if not included

`--ts, -T` - (optional) use Typescript for the script - will use JavaScript if not included

`--dir, -d` - (optional) directory to write the component in

`--import-styles` - (optional) create the styles as an import, will use input style type to generate appropriate file

`--import-template` - (optional) create the template as an import, will use input template type to generate appropriate file

`--import-script` - (optional) create the script as an import, will use input script type to generate appropriate file

`--import-all` - (optional) create the all files as an import - overrides the other import flags, will use inputs to generate appropriate files

`--force, -f` - (optional) overwrite existing files when generating new component files

## Config file

If the `--config` flag is not passed in, the tool will look for the file `.ezwc.config.js` in the directory that the command is being run from. All of the above flags (both long and short form without dashes) except for config are available in the config file. If a flag is present in the config file and passed in at run time, the flag passed in at run time will be used.

Command defaults can be stored in the config file as a child object of the main definition.

Example config file:

```js
module.exports = {
  in: './path/to/input',
  out: 'dist',
  watch: true,
  generate: {
    styles: 'scss',
    template: 'lit',
    ts: true,
    dir: 'src'
  }
};
```

## Example file structures

The code can be either inlined in the file or imported through adding an `src` attribute pointing to the source file. If using the `src` attribute, the imported code will be transpiled into the final `.js` output file. Both ways can be mixed and matched.

Every component must have at least a template tag defining the layout and a script tag defining the code. The style tag is optional.

### Example of inline code

```html
<template>
  <h1>I'm an ezwc web component file!</h1>
  <p>Look at my content!</p>
  <p>
    My greeting is:
    <span class="greeting"></span>
  </p>
</template>

<script selector="my-component">
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this._greeting = this.shadowRoot.querySelector('.greeting');
  }

  static get observedAttributes() {
    return [ 'greeting' ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'greeting':
        this._greeting.innerText = newValue;
      break;
    }
  }

  set greeting(newValue) {
    this.setAttribute('greeting', newValue);
  }

  get greeting() {
    return this.getAttribute('greeting');
  }
}
</script>

<style>
:host {
  background-color: #F2F2F2;
  display: block;
}

.greeting {
  font-weight: bold;
}
</style>
```

### Example using imports

```html
<!-- my-component.ezwc -->
<template src="my-component.ezwc.html"></template>
<script src="my-component.ezwc.js" selector="my-component"></script>
<style src="my-component.ezwc.css"></style>
```

When using the watch option with imports, name the imported file the exact same as the .ezwc file with the imported file's extension (see example above).

### .ezwc file notes

* The script tag has a required attribute `selector` which defines the selector used when creating the element in the browser (must follow the HTML web component spec naming requirements)
* The `customElement.define()` code is automatically generated for you - it uses the `selector` attribute mentioned above and parses the classname from the code
* The JavaScript code should be ES2015+ class format so that the transpiler can determine the class use when generating the `customElement.define()` code.

### Prprocessor support

EZWC support some proprocessors for the templates (coming soon), script, and styles.

#### Style preprocessor support

EZWC supports some style preprocessors. In order to use the preprocessor (both for inline and imported files), add the `lang` attribute to your style tag:

```html
<!-- inline --->
<style lang="scss">
  ...
</style>

<!-- imported -->
<style lang="scss" src="path/to/styles.css"></style>
```

Currently supported preprocessors:

* Sass (scss format only due to node-sass support) - `lang="scss"`

#### Script preprocessor support

EZWC supports writing the script code in Typescript. In order to use the proprocessor (both for inline and imported files), add the `lang` attribute to your script tag with the value of either `ts` or `typescript`.

```html
<!-- inline -->
<script lang="ts">
  // TS Code
</script>

<!-- imported -->
<script lang="typescript" src="path/to/script.ts"></script>
```

#### Template engine support

EZWC supports some template engines. In order to use the preprocessor (both for inline and imported files), add the `lang` attribute to your template tag:

```html
<!-- inline -->
<template lang="pug">
  <!-- template code -->
</template>

<!-- imported -->
<template lang="pug" src="path/to/template.pug"></template>
```

Currently supported template engines:

* Lit HTML - `lang="lit"` or `lang="lit-html"`
* Pug - `lang="pug"`
* Handlebars - `lang="hbs"` or `lang="handlebars"`
* EJS - `lang="ejs"`

When using a template engine, the engine import statement will be put at the top of the output component script. Ensure that the consuming application has the appropriate engine added to its `package.json` file and that the build tool chain is capable of supporting the engine.

## Using the transpiled web component in your code

Include the output JavaScript file in your code using your build tool chain or directly. Then reference your new component just like any other web component (because now it is!):

```html
<my-component greeting="Yassss queen!"></my-component>
```

## Future plans

* Style pre-processor support for LESS and Stylus
* `create` action for the CLI to create a new ezwc file

## Footnotes

‡ At the moment (q2 2019) some browsers do still need a polyfill but those browsers are becoming less and less used.
