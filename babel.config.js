/* eslint-disable func-names */
module.exports = function(api) {
  const isTesting = process.env.NODE_ENV === 'test';
  api.cache.using(() => isTesting);
  return {
    presets: [
      ['@babel/env', { modules: isTesting ? 'commonjs' : false }],
      '@babel/react',
    ],
    plugins: [
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties',
    ],
  };
};
