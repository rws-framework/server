const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpackFilters = require('../webpackFilters');
const rootDir = process.cwd();
const nodeExternals = require('webpack-node-externals');
const UtilsService = require('../_tools');
const rootPackageNodeModules = path.resolve(UtilsService.findRootWorkspacePath(process.cwd()), 'node_modules')
const modules_setup = [rootPackageNodeModules];

module.exports = {
    entry: process.cwd() + '/src/config/config.ts',
    mode: 'development',
    target: 'node',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'cfg.js',
    },
    resolve: {
      modules: modules_setup,
      alias: {                 
      //  'rws-js-server': '../../src/'
      },
      extensions: ['.ts', '.js', '.node'],      
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
                  configFile: path.resolve(__dirname + '/cfg.tsconfig.json'),
                  // compilerOptions: {
                  //   paths: {
                  //     '*': [rootPackageNodeModules + '/*']
                  //   }
                  // }
                }
              }
            ],
            exclude: /\.d\.ts$/,//node_modules\/(?!rws-js-server)|
          },       
          {
              test: /\.node$/,
              use: 'node-loader',
            }        
        ],
    },  
    stats: {
      warningsFilter: webpackFilters,
    }    
};