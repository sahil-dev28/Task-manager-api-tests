// Only used by Jest. uuid@14 ships ESM only, so it has to be transpiled to
// CommonJS before Jest's CJS runtime can require it (see transformIgnorePatterns
// in jest.config.js). The app itself runs untranspiled under Node.
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
