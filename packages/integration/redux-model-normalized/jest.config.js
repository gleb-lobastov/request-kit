const rootConfig = require('../../../jest.config');

module.exports = {
  ...rootConfig,
  setupFilesAfterEnv: ['jest-enzyme/lib/index.js'],
};
