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

const verboseLog = console.log;



// console.log = (...x) => {
//   if(process.env.RWS_VERBOSE){
//     verboseLog(...x);
//   }
// }

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
  
  const modules_setup =  config.nodeModules || [rootPackageNodeModules];
  const aliases = config.aliases = {}

  
  const overridePlugins = config.plugins || []
  const overrideResolvePlugins = config.resolvePlugins || []

  let WEBPACK_PLUGINS = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'global.GENTLY': false //FFS I have no idea why only with this the reflect-metadata works. Please do consult any god devised by mankind for explanation.
    })
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

  console.log('Aliases:', cfgExport.resolve.alias);

  console.log('Include paths:', cfgExport.module.rules[0].include);

  const rwsExternalsOverride = config.externalsOverride || [];

  cfgExport.externals = [
    function({ request }, callback) {
      const includePackages = [
        '@rws-framework',
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

  return cfgExport;
}

module.exports = RWSWebpackWrapper;