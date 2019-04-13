const fs = require('fs');
const Logger = require('./utils/logger');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function createTemplateFunction(templateContent) {
  return `_buildTemplate() {
    const template = \`${templateContent}\`;
    this.template = new DOMParser().parseFromString(template, 'text/html').firstChild;
  }`
}

function createShadowDom() {
  return `super();
    this._buildTemplate();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.template.cloneNode(true));
  `;
}

function createDefinition(selector, className) {
  return `

customElements.define('${selector}', ${className});
  `;
}

// module.exports = function(source) {
module.exports = async function(inFile, outFile) {
  const source = fs.readFileSync(inFile, 'utf8');

  const dom = new JSDOM(`<!DOCTYPE html>${source}`);
  const style = `\n<style>${dom.window.document.querySelector('style').innerHTML.trim()}</style>\n`;
  const template = `${style}${dom.window.document.querySelector('template').innerHTML.trim()}\n`;
  const scriptTag = dom.window.document.querySelector('script');
  const script = scriptTag.innerHTML.trim();
  const templateFunction = createTemplateFunction(template);
  const newSuper = createShadowDom();
  let newSource = script.replace('\n', `\n  ${templateFunction}\n\n`).replace('super();', newSuper);
  const { className } = /(.*)(class\s)(?<className>.*)(\sextends)/.exec(script).groups;
  const createElement = createDefinition(scriptTag.getAttribute('selector'), className);
  newSource += createElement;

  // @TODO fix parse error
  // @TODO add error checking
  // @TODO refactor

  try {
    fs.writeFileSync(outFile, newSource, 'utf8');
  } catch (err) {
    Logger.error('Error writing output filed.');
    throw err;
  }
}
