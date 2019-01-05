/* eslint-disable func-names */
module.exports = function(api) {
  const isTesting = process.env.NODE_ENV === 'test';
  api.cache.using(() => isTesting);
  return {
    presets: [
      '@babel/preset-react',
      '@babel/preset-typescript',
      ['@babel/preset-env', { modules: isTesting ? 'commonjs' : false }],
    ],
    plugins: [
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties',
    ],
  };
};
