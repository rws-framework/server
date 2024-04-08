const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const webpackFilters = require('./webpackFilters');
const webpack = require('webpack');
const {rwsExternals} = require('./_rws_externals');
const { rwsPath } = require('@rws-framework/console');

const rootPackageNodeModules = path.resolve(rwsPath.findRootWorkspacePath(process.cwd()), 'node_modules')

// console.log(modules_setup)s;
/**
 *  The RWS webpack configurator.
 * 
 *  Example usage in importing file:
 * 
 *  RWSWebpackWrapper({
    dev: true,    
    tsConfigPath: executionDir + '/tsconfig.json',
    entry: `${executionDir}/src/index.ts`,
    executionDir: executionDir,
    publicDir:  path.resolve(executionDir, 'public'),
    outputDir:  path.resolve(executionDir, 'build'),
    outputFileName: 'rws.server.js',
    plugins: [],
    resolvePlugins: [],
    nodeModules: [__dirname + '/node_modules'],
    mergedCodeBaseOptions: {
      mode: 'backend',
      conditions: {
        request_based: {
          include: [],
          exclude: [],
          exceptions: []
        },
        context_based: {
          include: [],
          exclude: [],
          exceptions: []
        }
      }
    }
  });
 */
const RWSWebpackWrapper = (config) => {
  const executionDir = config.executionDir || process.cwd();

  const isDev = config.dev;
  
  const aliases = config.aliases = {};

  const modules_setup =  config.nodeModules || [rootPackageNodeModules];

  const overridePlugins = config.plugins || []
  const overrideResolvePlugins = config.resolvePlugins || []

  let WEBPACK_PLUGINS = [new webpack.optimize.ModuleConcatenationPlugin()]

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, ...overridePlugins];  
  
  let WEBPACK_RESOLVE_PLUGINS = [];

  WEBPACK_RESOLVE_PLUGINS = [...WEBPACK_RESOLVE_PLUGINS, ...overridePlugins];

  const mergeCodeBaseOptions = config.mergedCodeBaseOptions || null;

  const cfgExport = {
    context: executionDir,
    entry: {      
      main_rws: config.entry
    },
    mode: isDev ? 'development' : 'production',
    target: 'node',
    devtool: config.devtool || 'inline-source-map',
    output: {
      path: config.outputDir,
      filename: config.outputFileName,
      sourceMapFilename: '[file].map',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: modules_setup,
      alias: {              
        ...aliases
      },      
      plugins: WEBPACK_RESOLVE_PLUGINS
    },
    module: {
      rules: [
        {
          test: /\.(ts)$/,
          use: [                       
            {
              loader: 'ts-loader',
              options: {
                allowTsInNodeModules: true,
                configFile: path.resolve(process.cwd() + '/tsconfig.json'),
                // compilerOptions: {
                //   paths: {
                //     '*': [rootPackageNodeModules + '/*']
                //   }
                // }
              }
            }
          ],
          exclude: /node_modules\/(?!\@rws-framework\/server)|\.d\.ts$/,
        },       
        {
            test: /\.node$/,
            use: 'node-loader',
        }        
      ],
    },
    plugins: WEBPACK_PLUGINS ,
    stats: {
      warningsFilter: webpackFilters,
    },
    externals: rwsExternals(executionDir, rootPackageNodeModules, mergeCodeBaseOptions)   
  }

  return cfgExport;
}

module.exports = RWSWebpackWrapper;