const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpackFilters = require('../webpackFilters');
const rootDir = process.cwd();
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: path.resolve(__dirname) + '/src/rws.ts',
    mode: 'development',
    target: 'node',
    devtool: 'inline-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'rws.js',
    },
    resolve: {
      alias: {                 
       'rws-js-server': path.resolve(__dirname, '..', 'dist', 'src'),
       '@cwd': path.resolve(process.cwd(), 'src')
      },
      extensions: ['.ts', '.js', '.node'],      
    },
    module: {
      rules: [
          {
            test: /\.(js|ts)$/,            
            loader: 'ts-loader',
            options: {              
              configFile: path.resolve(__dirname, 'tsconfig.json'),              
              getCustomTransformers: program => ({
                  before: [
                      keysTransformer(program)
                  ]
              })
            }
          },
          {
              test: /\.node$/,
              use: 'node-loader',
            }        
        ],
    },  
    stats: {
      warningsFilter: webpackFilters,
    },
    externals: [nodeExternals()],
};
