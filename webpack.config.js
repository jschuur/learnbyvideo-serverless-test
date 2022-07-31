const path = require('path');

const babelLoaderExcludeNodeModulesExcept = require('babel-loader-exclude-node-modules-except');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
const getPureESMDependencies = require('./util/pureESMDependencies.js');

const pureESMDependencies = getPureESMDependencies();

module.exports = {
  target: 'node',
  stats: 'normal',
  entry: slsw.lib.entries,
  // Regexp makes sure externals handles formdata-polyfill/esm.min.js, but doesn't conflate date-fns with da†e-fns-tz
  externals: [nodeExternals({ allowlist: pureESMDependencies.map((dep) => RegExp(`^${dep}(/.*)?$`)) })],
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: { concatenateModules: false },
  resolve: { extensions: ['.js'] },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: babelLoaderExcludeNodeModulesExcept(pureESMDependencies),
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
  },
};
