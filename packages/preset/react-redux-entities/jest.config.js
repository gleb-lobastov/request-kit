const rootConfig = require('../../../jest.config');

module.exports = {
  ...rootConfig,
  setupFilesAfterEnv: ['jest-enzyme/lib/multipleRequest.js'],
  setupFiles: ['./test/setupEnzyme.js', './test/promiseShim.js'],
};
