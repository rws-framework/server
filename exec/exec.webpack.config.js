const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const webpackFilters = require('../webpackFilters');
const rootDir = process.cwd();
const { rwsPath } = require('@rws-framework/console');
const rootPackageNodeModules = path.resolve(rwsPath.findRootWorkspacePath(process.cwd()), 'node_modules')
const modules_setup = [rootPackageNodeModules];
const {rwsExternals} = require('../_rws_externals');
const buildDir = path.resolve(__dirname, 'dist', 'vendors', 'build', 'cli');

// console.log('WHERE', path.resolve(__dirname) + '/src/rws.ts');

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
        '@cwd' : process.cwd()      
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
              //   baseUrl: rwsPath..findRootWorkspacePath(process.cwd())
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
    externals: rwsExternals(process.cwd(), rootPackageNodeModules),
    optimization: {      
      minimize: false
    }    
};
