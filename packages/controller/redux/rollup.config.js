import babel from 'rollup-plugin-babel';

// noinspection JSUnusedGlobalSymbols
export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
  ],
};
