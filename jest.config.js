module.exports = {
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover", "html"],
  moduleNameMapper: {
    '@lib(.*)$': '<rootDir>/lib/$1'
  }
};
