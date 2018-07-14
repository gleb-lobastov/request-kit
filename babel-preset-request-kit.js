const isTesting = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    ['env', { modules: isTesting ? 'commonjs' : false }],
    'react'
  ],
  plugins: [
    'transform-object-rest-spread',
    'transform-class-properties',
  ],
};
