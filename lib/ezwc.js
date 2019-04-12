const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function createTemplateFunction(templateContent) {
  return `_buildTemplate() {
    const template = '${templateContent}';
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

module.exports = function(source) {
  const dom = new JSDOM(`<!DOCTYPE html>${source}`);
  const style = `<style>${dom.window.document.querySelector('style').innerHTML.trim().replace(/\n/g, '')}</style>`;
  const template = `${style}${dom.window.document.querySelector('template').innerHTML.trim().replace(/\n/g, '')}`;
  const script = dom.window.document.querySelector('script').innerHTML.trim();
  const templateFunction = createTemplateFunction(template);
  const newSuper = createShadowDom();
  const newSource = script.replace('\n', `\n  ${templateFunction}\n\n`).replace('super();', newSuper);
  // console.log(newSource);

  // @TODO fix parse error
  // @TODO add error checking
  // @TODO refactor

  return `export default \`${newSource}\``;
}
