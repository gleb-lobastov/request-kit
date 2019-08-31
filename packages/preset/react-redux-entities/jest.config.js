const rootConfig = require('../../../jest.config');

module.exports = {
  ...rootConfig,
  setupFilesAfterEnv: ['jest-enzyme/lib/index.js'],
  setupFiles: [
    ...rootConfig.setupFiles,
    './test/setupEnzyme.js',
    './test/promiseShim.js',
  ],
};
