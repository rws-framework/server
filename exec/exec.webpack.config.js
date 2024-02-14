const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpackFilters = require('../webpackFilters');
const rootDir = process.cwd();
const nodeExternals = require('webpack-node-externals');
const UtilsService = require('../_tools');
const rootPackageNodeModules = path.resolve(UtilsService.findRootWorkspacePath(process.cwd()), 'node_modules')
const modules_setup = [rootPackageNodeModules];

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
      //  'rws-js-server': '../src'
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
    externals: ({context, request}, callback) => {
      const inc_list_context = [
        process.cwd(),    
        rootPackageNodeModules + '/rws-js-server',
      ];

      const inc_list = [
        'rws-js-server'    
      ];

      const not_inc_list_context = [        
        'node_modules' 
      ];

      const not_inc_list = [
         
      ];

      const exceptions_context = [ 
        rootPackageNodeModules + '/rws-js-server',     
      ];

      const exceptions = [
         path.resolve(__dirname),
         
      ];

      const regexList = (list) => {           
        // Create the RegExp object
        const regex = new RegExp(list.map(ext => ext.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'));

        // console.log(regex);

        return regex;
      }

     const includedCondition = (regexList(inc_list).test(request) || (regexList(inc_list_context).test(context) && request[0] === '.'));
     const excludedCondition = (regexList(not_inc_list_context).test(context));
     const contextExceptionCondition = regexList(exceptions_context).test(context) && request[0] === '.';
     const requestExceptionCondition = (regexList(exceptions).test(request));

      // console.error('GOT', request, context)
      if ( 
        (includedCondition
        && !excludedCondition)
        || (requestExceptionCondition || contextExceptionCondition)
      ) {
        //include in cli.js
        // console.log('YEA', request, context ,includedCondition, excludedCondition, requestExceptionCondition);
        return callback();
      }

      //use require()

      // console.log('NEY', request, context, includedCondition, excludedCondition, requestExceptionCondition, contextExceptionCondition);
      return callback(null, 'commonjs ' + request);
    },
};
