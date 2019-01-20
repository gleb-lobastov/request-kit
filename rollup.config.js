import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';

// use process.env.PACKAGE_NAME to make package-specific configuration
const PACKAGES = {
  ENGINE_REST: '@request-kit/engine-rest',
  CONTROLLER_REDUX: '@request-kit/controller-redux',
  PROVIDER_REACT: '@request-kit/provider-react',
  INTEGRATION_REACT_REDUX: '@request-kit/react-redux',
  UTIL_DISTRIBUTE_REDUCER: '@request-kit/distribute-reducer',
};

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  },
  plugins: [
    babel({
      extensions,
      rootMode: 'upward',
      exclude: 'node_modules/**',
    }),
    replace({
      IS_PRODUCTION_ENV: !process.env.ROLLUP_WATCH,
    }),
    commonjs({
      extensions,
      namedExports: {
        [PACKAGES.PROVIDER_REACT]: {
          'node_modules/prop-types/index.js': ['PropTypes'],
        },
      }[process.env.PACKAGE_NAME],
    }),
  ],
};
