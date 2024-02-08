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
    entry: './src/rws.ts',
    mode: 'development',
    target: 'node',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'rws.js',
    },
    resolve: {
      modules: modules_setup,
      alias: {                 
       'rws-js-server': 'vendors/rws',
       '@rws_cwd': process.cwd()
      },
      extensions: ['.ts', '.js', '.node'],      
    },
    module: {
      rules: [
          // {
          //   test: /\.(js|ts)$/,            
          //   loader: 'ts-loader',
          //   options: {              
          //     allowTsInNodeModules: true,
          //     configFile: path.resolve(__dirname, 'execconfig.json'), 
          //     // compilerOptions: {
          //     //   baseUrl: UtilsService.findRootWorkspacePath(process.cwd())
          //     // },             
          //     getCustomTransformers: program => ({
          //         before: [
          //             keysTransformer(program)
          //         ]
          //     })
          //   }
          // },
          {
            test: /\.(ts)$/,
            use: [                       
              {
                loader: 'ts-loader',
                options: {
                  allowTsInNodeModules: true,
                  configFile: path.resolve(__dirname + '/execconfig.json'),
                  // compilerOptions: {
                  //   paths: {
                  //     '*': [rootPackageNodeModules + '/*']
                  //   }
                  // }
                }
              }
            ],
            exclude: /node_modules\/(?!rws-js-server)|\.d\.ts$/,
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
