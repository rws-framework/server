const path = require('path');
const chalk = require('chalk');
const webpackFilters = require('./webpackFilters');
const webpack = require('webpack');
const {rwsExternals} = require('./_rws_externals');
const { rwsPath, RWSConfigBuilder } = require('@rws-framework/console');
const { fileURLToPath } = require('url');
const { dirname } = require('path');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RWSWebpackWrapper = (appRoot, config, packageDir) => {
  const rootPackageNodeModules = path.resolve(rwsPath.findRootWorkspacePath(appRoot), 'node_modules')

  const executionDir = config.executionDir;

  const cfgEntry = `./src/index.ts`;
  const cfgOutputDir = path.resolve(executionDir, config.outputDir);
  const outputFileName = config.outputFileName;
  const tsConfig = config.tsConfig;
  const isDev = config.dev;

  console.log('Build mode:', chalk.red(isDev ? 'development' : 'production'));
  
  const modules_setup =  config.nodeModules || [rootPackageNodeModules];
  const aliases = config.aliases = {}

  
  const overridePlugins = config.plugins || []
  const overrideResolvePlugins = config.resolvePlugins || []

  let WEBPACK_PLUGINS = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ProvidePlugin({
      'Reflect': ['reflect-metadata', 'Reflect']
    })
  ]

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, ...overridePlugins];  
  
  let WEBPACK_RESOLVE_PLUGINS = [];

  WEBPACK_RESOLVE_PLUGINS = [...WEBPACK_RESOLVE_PLUGINS, ...overridePlugins];

  const tsConfigData = tsConfig(__dirname, true, false);
  const tsConfigPath = tsConfigData.path;

  console.log('TypeScript config path:', tsConfigPath);
  if (!require('fs').existsSync(tsConfigPath)) {
      console.error('TypeScript config file not found at:', tsConfigPath);
  }

  const tsLoaderOptions = {        
    configFile: tsConfigPath, 
    compilerOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        target: "ES2018",
        module: "commonjs"
    }, 
    transpileOnly: false,  
    logLevel: "info",
    logInfoToStdOut: true,
    context: executionDir,
    errorFormatter: (message, colors) => {
      const messageText = message.message || message;
      return `\nTS Error: ${messageText}\n`;
    }                
  }

  console.log('TS CONFIG: ', tsConfigData.config);
  console.log('TS LINKS: ', tsConfigData.includes.map(item => item.rel()), tsConfigData.excludes.map(item => item.rel()));

  const cfgExport = {
    context: executionDir,
    entry: [require.resolve('reflect-metadata'), cfgEntry],
    mode: isDev ? 'development' : 'production',
    target: 'node',
    devtool: isDev ? 'source-map' : false,
    output: {
      path: cfgOutputDir,
      filename: outputFileName,
      sourceMapFilename: '[file].map' ,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: modules_setup,
      alias: aliases,
      plugins: WEBPACK_RESOLVE_PLUGINS,
      fallback: {
        "kerberos": false,
        "mongodb-client-encryption": false
      }
    },
    module: {
      rules: [
        {
          test: /\.(ts)$/,
          use: [                       
            {
              loader: 'ts-loader',
              options: tsLoaderOptions
            }
          ],
          include: [
            ...tsConfigData.includes.map(item => item.abs())            
          ],
          exclude: [
            ...tsConfigData.excludes.map(item => item.abs()),
            /node_modules\/(?!\@rws-framework\/[A-Z0-9a-z])/,            
            /\.d\.ts$/        
          ],
        },       
        {
            test: /\.node$/,
            use: 'node-loader',
        }        
      ],
    },
    plugins: WEBPACK_PLUGINS ,
    // stats: {
    //   warningsFilter: webpackFilters,
    // },
    ignoreWarnings: webpackFilters,
    optimization: {      
      minimize: false
    }    
  }

  console.log('Include paths:', cfgExport.module.rules[0].include);

  cfgExport.externals = [
    function({ request }, callback) {
      const includePackages = [
        '@rws-framework',
        'ts-loader',
        'tslib',
        'reflect-metadata',
        '@nestjs'
      ];
  
      // Jeśli pakiet jest na liście includePackages, nie externalizuj go
      if (includePackages.some(pkg => request.startsWith(pkg))) {
        return callback();
      }
  
      // Externalizuj wszystkie pozostałe node_modules
      if (/^[a-z\-0-9@]/.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
  
      callback();
    }
  ];

  if(isDev){
    
  }

  console.log({})

  return cfgExport;
}

module.exports = RWSWebpackWrapper;