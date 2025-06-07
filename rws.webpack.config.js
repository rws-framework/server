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

const isVerbose = process.argv.includes('--verbose');

const verboseLog = console.log;


console.log = (...x) => {
  if(isVerbose){
    verboseLog(...x);
  }
}

const RWSWebpackWrapper = async (appRoot, config, packageDir) => {
  const rootPackageNodeModules = path.resolve(rwsPath.findRootWorkspacePath(appRoot), 'node_modules')

  console.log('START')

  const executionDir = config.executionDir;

  const cfgEntry = `./src/index.ts`;
  const cfgOutputDir = path.resolve(executionDir, config.outputDir);
  const outputFileName = config.outputFileName;
  const tsConfig = config.tsConfig;
  const isDev = config.dev;

  console.log('Build mode:', chalk.red(isDev ? 'development' : 'production'));
  
  let modules_setup =  config.nodeModules || [rootPackageNodeModules];

  modules_setup = [...modules_setup, ...(config.extraNodeModules || [])]

  console.log('Node modules locations:', modules_setup);

  const aliases = config.aliases = {}

  aliases['entities/escape'] = path.resolve(rootPackageNodeModules, 'entities/lib/escape.js'),
  aliases['entities/decode'] = path.resolve(rootPackageNodeModules, 'entities/lib/decode.js')
  aliases['@nestjs/microservices'] = path.resolve(rootPackageNodeModules, '@nestjs/microservices')
  aliases['reflect-metadata'] = path.resolve(rootPackageNodeModules, 'reflect-metadata');
  aliases['mongodb'] = path.resolve(rootPackageNodeModules, 'mongodb');

  
  const overridePlugins = config.plugins || []
  const overrideResolvePlugins = config.resolvePlugins || []

  let WEBPACK_PLUGINS = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'global.GENTLY': false //FFS I have no idea why only with this the reflect-metadata works. Please do consult any god devised by mankind for explanation.
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /(kerberos|.*\.node)/
    }), 
    new webpack.NormalModuleReplacementPlugin(
      /reflect-metadata/,
      function(resource) {
        resource.request = path.resolve(rootPackageNodeModules, 'reflect-metadata');
      }
    )
  ];

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, ...overridePlugins];  
  
  let WEBPACK_RESOLVE_PLUGINS = [];

  WEBPACK_RESOLVE_PLUGINS = [...WEBPACK_RESOLVE_PLUGINS, ...overridePlugins];

  const tsConfigData = await tsConfig(__dirname, true, false);

  const tsConfigPath = tsConfigData.path;


  for(const aliasKey of Object.keys(tsConfigData.config.compilerOptions.paths)){
    const alias = tsConfigData.config.compilerOptions.paths[aliasKey];
    aliases[aliasKey] = path.resolve(executionDir, alias[0]);
  }


  if (!require('fs').existsSync(tsConfigPath)) {
      console.error('TypeScript config file not found at:', tsConfigPath);
  }

  console.log('TypeScript config path:', tsConfigPath);

  const tsLoaderOptions = {        
    configFile: tsConfigPath, 
    compilerOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        target: "ES2018",
        module: "commonjs"
    }, 
    transpileOnly: true,  
    logLevel: "info",
    logInfoToStdOut: true,
    context: executionDir,
    errorFormatter: (message, colors) => {
      const messageText = message.message || message;
      return `\nTS Error: ${messageText}\n`;
    }                
  }

  console.log('TS CONFIG: ', tsConfigData.config);

  const allowedModules = ['@rws-framework\\/[A-Z0-9a-z]'];

  if(config.loaderIgnoreExceptions){
    for(const ignoreException of config.loaderIgnoreExceptions){
      allowedModules.push(ignoreException);
    }
  }

  const modulePattern = `node_modules\\/(?!(${allowedModules.join('|')}))`;

  const cfgExport = {
    context: executionDir,
    entry: ['reflect-metadata', cfgEntry],
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
            new RegExp(modulePattern),            
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

  console.log('Aliases:', cfgExport.resolve.alias);

  console.log('Include paths:', cfgExport.module.rules[0].include);
      cfgExport.externals = [
        'kafkajs',
        'mqtt',
        'nats',
        'ioredis',
        'amqplib',
        'amqp-connection-manager',      
        /\.node$/
      ]

  return cfgExport;
}

module.exports = RWSWebpackWrapper;