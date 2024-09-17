const path = require('path');
const chalk = require('chalk');

const webpackFilters = require('./webpackFilters');
const webpack = require('webpack');
const {rwsExternals} = require('./_rws_externals');
const { rwsPath, RWSConfigBuilder } = require('@rws-framework/console');

const rootPackageNodeModules = path.resolve(rwsPath.findRootWorkspacePath(process.cwd()), 'node_modules')

const RWSWebpackWrapper = (config) => {
  const executionDir = config.executionDir || process.cwd();

  const BuildConfigurator = new RWSConfigBuilder(executionDir + '/.rws.json', {
    dev: false,  
    tsConfigPath: executionDir + '/tsconfig.json',
    entry: `${executionDir}/src/index.ts`,
    executionDir: executionDir,  
    outputDir:  path.resolve(executionDir, 'build'),
    outputFileName: 'rws.server.js'
  });

  const isDev = BuildConfigurator.get('dev') || config.dev;
  const cfgEntry = BuildConfigurator.get('entry') || config.entry;
  const cfgOutputDir = BuildConfigurator.get('outputDir') || config.outputDir;
  const outputFileName = BuildConfigurator.get('outputFileName') || config.outputFileName;

  console.log('Build mode:', chalk.red(isDev ? 'development' : 'production'));
  
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
      main_rws: cfgEntry
    },
    mode: isDev ? 'development' : 'production',
    target: 'node',
    devtool: isDev ? (config.devtool || 'inline-source-map') : false,
    output: {
      path: cfgOutputDir,
      filename: outputFileName,
      sourceMapFilename: '[file].map' ,
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
          exclude: /node_modules\/(?!\@rws-framework\/.*)|\.d\.ts$/,
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
    optimization: {      
      minimize: false
  }    
  }
  cfgExport.externals = rwsExternals(executionDir, rootPackageNodeModules, mergeCodeBaseOptions);
  if(isDev){
    
  }

  return cfgExport;
}

module.exports = RWSWebpackWrapper;