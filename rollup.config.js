import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';

// use process.env.PACKAGE_NAME to make package-specific configuration

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    replace({
      IS_PRODUCTION_ENV: !process.env.ROLLUP_WATCH,
    }),
  ],
};
