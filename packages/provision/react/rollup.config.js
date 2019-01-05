import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

export default {
  LA_la: 1,
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'lib/index.js',
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx'],
    }),
    babel({
      rootMode: 'upward',
      exclude: 'node_modules/**',
    }),
    replace({
      IS_PRODUCTION_ENV: !process.env.ROLLUP_WATCH,
    }),
    commonjs({
      namedExports: {
        'node_modules/prop-types/index.js': ['PropTypes'],
      },
    }),
  ],
  external: ['react'],
};
