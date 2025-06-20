const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const webpackFilters = require('./webpackFilters');
const webpack = require('webpack');
const {rwsExternals} = require('./_rws_externals');
const { rwsPath, RWSConfigBuilder, RWSWebpackPlugins } = require('@rws-framework/console');

const verboseLog = console.log;



console.log = (...x) => {
  if(process.argv.find(a => a.includes('--verbose'))){
      verboseLog(...x);
  }
}

const RWSWebpackWrapper = async (appRoot, config, packageDir) => {
  console.log('START')
  const rootPackageNodeModules = path.resolve(rwsPath.findRootWorkspacePath(appRoot), 'node_modules')
  const currentDir = path.join(rootPackageNodeModules, '@rws-framework', 'server');
  const executionDir = config.executionDir;

  const cfgEntry = `./src/index.ts`;
  const cfgOutputDir = path.resolve(executionDir, config.outputDir);
  const outputFileName = config.outputFileName;
  const tsConfig = config.tsConfig;
  const isDev = config.dev;

  console.log('Build mode:', chalk.red(isDev ? 'development' : 'production'));
  console.log('Build cfg:', config);

  let modules_setup =  config.nodeModules || [rootPackageNodeModules];

  modules_setup = [...modules_setup, ...(config.extraNodeModules || []), path.join(currentDir, 'node_modules')]

  console.log('Node modules locations:', modules_setup);

  const aliases = config.aliases = {}

  // aliases['entities/*'] = [path.join(rootPackageNodeModules, 'entities', 'lib')];
  
  const overridePlugins = config.plugins || []
  const overrideResolvePlugins = config.resolvePlugins || []

  let WEBPACK_PLUGINS = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'global.GENTLY': false //FFS I have no idea why only with this the reflect-metadata works. Please do consult any god devised by mankind for explanation.
    })
  ];

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, ...overridePlugins];  
  
  WEBPACK_PLUGINS.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /kerberos\.node$/,
      contextRegExp: /node_modules[\\/]kerberos[\\/]lib/,
    }),    
    new RWSWebpackPlugins.CheckNestedModulesPlugin(config.nestedNodePackages ? config.nestedNodePackages : [])
  )

  let WEBPACK_RESOLVE_PLUGINS = [];

  WEBPACK_RESOLVE_PLUGINS = [...WEBPACK_RESOLVE_PLUGINS, ...overridePlugins];

  let tsConfigData = null;
  let tsConfigPath = null;

  let wpIncludes = []
  let wpExcludes = [];

  if(tsConfig){
    tsConfigData = await tsConfig(currentDir, true, false);
    tsConfigPath = tsConfigData.path;  
    wpIncludes = (tsConfigData ? tsConfigData.includes.map(item => item.abs()) : []) 
    wpExcludes = (tsConfigData ? tsConfigData.excludes.map(item => item.abs()) : []) 
  }else{
    tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    tsConfigData = { config: JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'))};

      if(tsConfigData.config.include){
        for(const incl of tsConfigData.config.include){
          wpIncludes.push(path.resolve(executionDir, incl.replace('/*', '')))
        }
      }  
      
      if(tsConfigData.config.exclude){
        for(const excl of tsConfigData.config.exclude){
          wpIncludes.push(path.resolve(executionDir, excl.replace('/*', '')))
        }
      } 
  }

  if(tsConfigData.config.compilerOptions.paths){
    for(const aliasKey of Object.keys(tsConfigData.config.compilerOptions.paths)){
        const alias = tsConfigData.config.compilerOptions.paths[aliasKey];
        aliases[aliasKey] = path.resolve(executionDir, alias[0]);
    }
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

  if(tsConfigData){
    console.log('TS CONFIG: ', tsConfigData.config);
  }

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
            ...wpIncludes            
          ],
          exclude: [
            ...wpExcludes,
            new RegExp(modulePattern),            
            /\.d\.ts$/        
          ],
        },       
        {
          test: /\.node$/,
          loader: 'ignore-loader'
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

  const rwsExternalsOverride = config.externalsOverride || [];

  if(config.selfContained){
    cfgExport.externals = {
        '@ngrok/ngrok': 'commonjs @ngrok/ngrok',
        'kafkajs': 'commonjs kafkajs',
        'mqtt': 'commonjs mqtt',
        'nats': 'commonjs nats',
        'ioredis': 'commonjs ioredis',
        'amqplib': 'commonjs amqplib',
        'amqp-connection-manager': 'commonjs amqp-connection-manager',
        'electron': 'commonjs electron',
        '@rws-framework/console': 'commonjs @rws-framework/console',
    }
  }else{
    cfgExport.externals = [
    function({ request }, callback) {
      const includePackages = [
        '@rws-framework',
        '@nestjs',
        ...rwsExternalsOverride
      ];      
  
      if (includePackages.some(pkg => request.startsWith(pkg))) {
        return callback();
      }
  
      // Externalize others
      if (/^[a-z\-0-9@]/.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
  
      callback();
    }
  ];
  }

  return cfgExport;
}

module.exports = RWSWebpackWrapper;