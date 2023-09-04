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
       '@App':  path.resolve(rootDir, 'src'),
       '@rws-js/server': path.resolve(__dirname, '..', 'dist', 'src')
      },
      extensions: ['.ts', '.js', '.node'],
      plugins: [       
        // new TsconfigPathsPlugin({configFile: path.resolve(rootDir, 'tsconfig.json')}) 
      ]    
    },
    module: {
      rules: [
          {
            test: /\.(js|ts)$/,
            exclude: /node_modules/,
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(rootDir, 'tsconfig.json'),
              // make sure not to set `transpileOnly: true` here, otherwise it will not work
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
