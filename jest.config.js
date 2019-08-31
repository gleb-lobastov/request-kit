module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!**/__tests__/**'],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  globals: {
    IS_PRODUCTION_ENV: false,
  },
  setupFiles: ['<rootDir>/test/jest.setup.js'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  projects: ['<rootDir>/packages/*/*'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
};
