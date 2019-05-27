const path = require('path');

module.exports = {
  entry: './{{ src }}/main.js',
  output: {
    path: path.resolve(__dirname, '{{ dist }}'),
    filename: 'bundle.js'
  },
  node: {
    fs: 'empty'
  },
  mode: 'production',
  module: {
    rules: [{
      test: /(!\.ezwc)\.{{#if useSass}}s{{/if}}css$/,
      use: [
        "style-loader", // creates style nodes from JS strings
        "css-loader", // translates CSS into CommonJS{{#if useSass}}
        "sass-loader" // compiles Sass to CSS, using Node Sass by default{{/if}}
      ]
    }, {
      test: /\.ezwc$/,
      use: [
        "ezwc-loader"
      ]
    }]
  }
};
