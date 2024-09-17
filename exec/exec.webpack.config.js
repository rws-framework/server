const path = require('path');
// const keysTransformer = require('ts-transformer-keys/transformer').default;
const webpackFilters = require('../webpackFilters');
const { rwsPath } = require('@rws-framework/console');
const rootWorkspace = rwsPath.findRootWorkspacePath(process.cwd());
const rootPackageNodeModules = path.resolve(rootWorkspace, 'node_modules');
const modules_setup = [rootPackageNodeModules];
const { rwsExternals } = require('../_rws_externals');
const { findRWSWorkDir } = require('./_helpers');
const fs = require('fs');
const buildDir = path.resolve(__dirname, 'dist', 'vendors', 'build', 'cli');

module.exports = {
    entry: path.resolve(__dirname) + '/src/rws.ts',
    mode: 'production',
    target: 'node',
    devtool: false,
    // context: process.cwd(),
    output: {
      path: buildDir,
      filename: 'rws.cli.js',
    },
    resolve: {
      symlinks: false,
      modules: modules_setup,
      alias: {                 
        '@clientWorkDir' : findRWSWorkDir()
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
    externals: rwsExternals(process.cwd(), rootPackageNodeModules),
    optimization: {      
      minimize: false
    }    
};
