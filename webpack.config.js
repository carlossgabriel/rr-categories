const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const { DefinePlugin } = require('webpack');
const dotenv = require('dotenv');

// Configure environment variables for the 'dev' stage
const localPlugins = [];
if (slsw.lib.options.stage === 'dev') {
  const envVars = dotenv.config({ path: `.env.${slsw.lib.options.stage}` });
  const env = Object.entries(envVars.parsed || {}).reduce(
    (acc, [key, value]) => {
      acc[`process.env.${key}`] = JSON.stringify(value);
      return acc;
    },
    {},
  );
  localPlugins.push(new DefinePlugin(env));
}

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal
    ? 'eval-cheap-module-source-map'
    : 'source-map',
  resolve: {
    alias: {
      '@functions': path.resolve(__dirname, 'src/functions/'),
      '@libs': path.resolve(__dirname, 'src/libs/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@handlers': path.resolve(__dirname, 'src/handlers/'),
      '@services': path.resolve(__dirname, 'src/services/'),
      '@models': path.resolve(__dirname, 'src/models/'),
    },
    extensions: ['.ts', '.js', '.json'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  optimization: {
    concatenateModules: false,
    minimize: false,
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
  plugins: [...localPlugins],
};
