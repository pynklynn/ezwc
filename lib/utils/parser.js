class Parser {
  static parse(code) {
    this.sourceCode = code;
    this.templateCode = code.substring(code.indexOf('<template'), code.lastIndexOf('</template>') + 11) || '';
    this.scriptCode = code.substring(code.lastIndexOf('<script'), code.lastIndexOf('</script>') + 9) || '';
    this.styleCode = code.substring(code.lastIndexOf('<style'), code.lastIndexOf('</style>') + 8) || '';
  }

  static get templateLang() {
    const result = /<template.*(?:\s*lang="(?<lang>[^"]*)")/i.exec(this.templateCode);
    if (result && result.groups && result.groups.lang) {
      return result.groups.lang;
    }

    return 'html';
  }

  static get templateSrc() {
    const result = /<template.*(?:\s*src="(?<src>[^"]*)")/i.exec(this.templateCode);
    if (result && result.groups && result.groups.src) {
      return result.groups.src;
    }

    return undefined;
  }

  static get templateContent() {
    // @TODO handle empty content
    return this.templateCode.substring(this.templateCode.indexOf('>') + 1, this.templateCode.lastIndexOf('</template>') - 1).trim();
  }

  static get scriptLang() {
    const result = /<script.*(?:\s*lang="(?<lang>[^"]*)")/i.exec(this.scriptCode);
    if (result && result.groups && result.groups.lang) {
      return result.groups.lang;
    }

    return 'js';
  }

  static get scriptSrc() {
    const result = /<script.*(?:\s*src="(?<src>[^"]*)")/i.exec(this.scriptCode);
    if (result && result.groups && result.groups.src) {
      return result.groups.src;
    }

    return undefined;
  }

  static get scriptContent() {
    // @TODO handle empty content
    return this.scriptCode.substring(this.scriptCode.indexOf('>') + 1, this.scriptCode.indexOf('</script>') - 1).trim();
  }

  static get componentSelector() {
    const result = /<script.*(?:\s*selector="(?<selector>[^"]*)")/i.exec(this.scriptCode);
    if (result && result.groups && result.groups.selector) {
      return result.groups.selector;
    }

    throw new Error('Selector must be defined on the script tag');
  }

  static get useShadow() {
    const resultPositive = /<script.*(\s*no-shadow(?:="true")?)/i.exec(this.scriptCode);
    const resultNegative = /<script.*(\s*no-shadow="false")/i.exec(this.scriptCode);
    if (resultPositive && !resultNegative) {
      return false;
    }

    return true;
  }

  static get styleLang() {
    const result = /<style.*(?:\s*lang="(?<lang>[^"]*)")/i.exec(this.styleCode);
    if (result && result.groups && result.groups.lang) {
      return result.groups.lang;
    }

    return 'css';
  }

  static get styleSrc() {
    const result = /<style.*(?:\s*src="(?<src>[^"]*)")/i.exec(this.styleCode);
    if (result && result.groups && result.groups.src) {
      return result.groups.src;
    }

    return undefined;
  }

  static get styleContent() {
    // @TODO handle empty content
    return this.styleCode.substring(this.styleCode.indexOf('>') + 1, this.styleCode.indexOf('</style>') - 1).trim();
  }
}

global.Parser = Parser;
