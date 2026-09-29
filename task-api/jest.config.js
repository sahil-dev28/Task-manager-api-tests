module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
  testMatch: ['**/tests/**/*.test.js'],
  // uuid@14 is ESM only; everything else in node_modules stays untransformed.
  transformIgnorePatterns: ['/node_modules/(?!uuid/)'],
};
