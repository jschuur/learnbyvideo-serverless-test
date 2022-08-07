const path = require('path');

// eslint-disable-next-line import/no-extraneous-dependencies
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  stats: 'normal',
  entry: ['src/cli/channelTest.js'],
  // Regexp makes sure externals handles formdata-polyfill/esm.min.js, but doesn't conflate date-fns with da†e-fns-tz
  externals: [nodeExternals()],
  // mode:
  optimization: { concatenateModules: false },
  resolve: { extensions: ['.js'] },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
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
