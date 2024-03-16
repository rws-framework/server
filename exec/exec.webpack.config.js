const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpackFilters = require('../webpackFilters');
const rootDir = process.cwd();
const nodeExternals = require('webpack-node-externals');
const UtilsService = require('../_tools');
const rootPackageNodeModules = path.resolve(UtilsService.findRootWorkspacePath(process.cwd()), 'node_modules')
const modules_setup = [rootPackageNodeModules];
const {rwsExternals} = require('../_rws_externals');
const buildDir = path.resolve(process.cwd(), 'build');

const relFromBuild = path.relative(buildDir, __dirname);

// console.log('WHERE', path.resolve(__dirname) + '/src/rws.ts');

module.exports = {
    entry: path.resolve(__dirname) + '/src/rws.ts',
    mode: 'development',
    target: 'node',
    devtool: 'source-map',
    // context: process.cwd(),
    output: {
      path: buildDir,
      filename: 'rws.cli.js',
    },
    resolve: {
      symlinks: false,
      modules: modules_setup,
      alias: {                 
        '@cwd' : process.cwd()
      //  '@rws-framework/server': '../src'
      },
      extensions: ['.ts', '.js', '.node'],      
    },
    module: {
      rules: [
          {
            test: /\.(ts)$/,
            loader: 'ts-loader',
            options: {              
              allowTsInNodeModules: true,
              configFile: path.resolve(__dirname, 'exec.tsconfig.json'), 
              // compilerOptions: {
              //   baseUrl: UtilsService.findRootWorkspacePath(process.cwd())
              // },             
              getCustomTransformers: program => ({
                  before: [
                      keysTransformer(program)
                  ]
              })
            },
            exclude: /node_modules\/(?!\@rws-framework\/server)|\.d\.ts$/,
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
    externals: rwsExternals(process.cwd(), rootPackageNodeModules)
};
