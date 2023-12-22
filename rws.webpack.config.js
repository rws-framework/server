const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const webpackFilters = require('./webpackFilters');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: `${process.cwd()}/src/index.ts`,
  mode: 'development',
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'rws.server.js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.node'],  
    alias: {
      
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        use: [                       
          {
            loader: 'ts-loader',
            options: {
              allowTsInNodeModules: true,
              configFile: path.resolve(config.tsConfigPath)
            }
          }
        ],
        exclude: /node_modules\/(?!rws-js-server)/,
      },       
      {
          test: /\.node$/,
          use: 'node-loader',
      }        
    ],
  },
  plugins: [
  ],
  stats: {
    warningsFilter: webpackFilters,
  },
  externals: [nodeExternals()],
};