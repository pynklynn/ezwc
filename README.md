# ezwc

[![Build Status](https://travis-ci.org/pynklynn/ezwc.svg?branch=master)](https://travis-ci.org/pynklynn/ezwc)
[![NPM Version](https://img.shields.io/npm/v/ezwc-cli.svg)](https://img.shields.io/npm/v/ezwc-cli.svg)

Easily convert web components written similar to Vue single file components into native web components.

**_Note: This project is still in development so use it with caution. If you find a problem or want to see a new feature request not in the issues or future plans list, please open a new issue or pull request._**

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

## Features

* Syntax similar to Vue's single file components for easy code organization
* Ability to abstract source code into separate files that are imported
* Style preprocessors, Typescript, and template engine support
* Syntactic sugar
* Watch feature - including imported files!
* Generate command to easily create a new component - including imported source file stubs
* New command to generate an EZWC-based project
* Config file support for easier project development

## Documentation

Full documentation is available in the [wiki](https://github.com/pynklynn/ezwc/wiki).

## Using the transpiled web component in your code

Include the output JavaScript file in your code using your build tool chain or directly. Then reference your new component just like any other web component (because now it is!):

```html
<my-component greeting="Yassss queen!"></my-component>
```

## Future plans

- Style pre-processor support for LESS and Stylus

## Contributing

Contributions are welcome! When contributing, please ensure that:

- All existing unit tests still run successfully and are updated
- That new code is covered as thoroughly and accurately as possible

Any issues tagged with `help wanted` are up for grabs for various reasons (usually a lack of my knowledge on something that I know will be useful for others).

## Footnotes

‡ As of q2 2019, some browsers do still need a polyfill but those browsers are becoming less and less used.
