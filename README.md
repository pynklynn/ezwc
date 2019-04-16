# ezwc

[![Build Status](https://travis-ci.org/pynklynn/ezwc.svg?branch=master)](https://travis-ci.org/pynklynn/ezwc)

Easily convert web components written similar to Vue single file components into native web components.

**Note: This project is still in very early stages so use it with caution. If you find a problem, please report it._**

## Getting started

Node 10 or higher is required.

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

`--in, -i` - Path to input .ezwc file or directory to search for .ezwc files in and it's subdirectories

`--out, -o` - Path to output .js file - If this isn't supplied, the output will be the same path and filename as the input file with a .js extension. This also takes a path which will generate a file with a generated name in the specified path.

## Example file structures

### Example of inline code

The code can be either inlined in the file or imported through adding an `src` attribute pointing to the source file. If using the `src` attribute, the imported code will be transpiled into the final `.js` output file.

Every component must have at least a template tag defining the layout and a script tag defining the code. The style tag is optional.

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

### Example of imports

```html
<template src="path/to/template.html"></template>
<script src="path/to/script.js" selector="my-component"></script>
<style src="path/to/styles.css"></style>
```

### .ezwc file notes

* The script tag has a required attribute `selector` which defines the selector used when creating the element in the browser (must follow the HTML web component spec naming requirements)
* The `customElement.define()` code is automatically generated for you - it uses the `selector` attribute mentioned above and parses the classname from the code
* The JavaScript code should be ES2015+ class format so that the transpiler can determine the class use when generating the `customElement.define()` code.

### Using the transpiled web component in your code

Include the output JavaScript file in your code using your build tool chain or directly. Then reference your new component just like any other web component (because now it is!):

```html
<my-component greeting="Yassss queen!"></my-component>
```

## Future plans

* Template engine support
* JavaScript transpiled language support (TypeScript)
* Style pre-processor support
* .ezwc.config.js file for easy project configuration
* Watch option for file changes

## Footnotes

‡ At the moment (q2 2019) some browsers do still need a polyfill but those browsers are becoming less and less used.
