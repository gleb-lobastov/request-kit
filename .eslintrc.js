const path = require('path');
const glob = require('glob');
const lernaConfig = require('./lerna');

const getPackageJsonPathsList = () =>
  []
    .concat(
      ...lernaConfig.packages.map(packagePath =>
        glob.sync(path.join(packagePath, 'package.json')),
      ),
    )
    .map(packageConfigPath => packageConfigPath.replace('package.json', ''));

const devDependenciesGlobs = [
  '**/__tests__/**/test*.js',
  '**/test/**/*.js',
  '**/rollup.config.js',
];

module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'],
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
    'jest/globals': true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'react', 'jest'],
  root: true,
  overrides: getPackageJsonPathsList().map(packageJsonPath => ({
    files: [path.join(packageJsonPath, '..', '**/*.{js,jsx,ts,tsx}')],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: `./${path.join(packageJsonPath, '.')}/`,
          devDependencies: devDependenciesGlobs,
        },
      ],
    },
  })),
  rules: {
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: './',
        devDependencies: devDependenciesGlobs,
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
