# Realtime Web Suit server setup and configuration guide

Realtime Web Suit is a flexible fullstack-server for seting up web servers, WebSocket servers and more while keeping it in sync with your frontend. 


*(TBA: RWS Prisma models + RWS Custom CLI Engine + Nest + Nest-RWS front routing mapper)*

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setting Up](#setting-up)
   - [Install Package](#install-package)
      - [Package File](#package-file)
      - [TS Config File](#tsconfig-file)
   - [Initialize Server Setup](#initialize-server-setup)
   - [Server Configuration](#server-configuration)
3. [Creating Server Configuration](#creating-server-configuration)
   - [Example Webpack Config](#example-webpack-config)
   - [RWS Webpack Config](#rws-webpack-config)
   - [RWS App Configuration](#rws-app-configuration)
4. [Commands](#commands)
   - [Sample Command](#sample-command)
   - [New Command](#new-command)
   - [Database Models](#database-models)
5. [Route Configuration](#route-configuration)
   - [Request Route Configuration](#request-route-configuration)   
   - [Websocket Route Configuration](#websocket-route-configuration)
6. [Running the Server](#running-the-server)
   - [Server Initialization](#server-initialization)
   - [DB Service](#db-service)
   - [Implementation](#implementation)
7. [BASH Installs for Node Libraries](#bash-installs-for-node-libraries)


## Prerequisites

Make sure you have Node.js and yarn installed on your local machine. If not, you can download it from the [official Node.js website](https://nodejs.org).

## Setting Up

### Install yarn

```bash
npm install -g yarn
```

### Install package

```bash
yarn add @rws-framework/server
```

### Package file

**To use serve you need this packages in your package.json:**

```json
{
   "dependencies": {,        
        "@types/archiver": "^6.0.2",
        "@types/body-parser": "^1.19.5",
        "@types/express": "^4.17.21",
        "compression": "^1.7.4",
        "dotenv": "^16.3.1",
        "jsonwebtoken": "9.0.2",
        "nodemon": "^1.12.1",
        "npm-run-all": "^4.1.1",
        "puppeteer": "^21.0.3",
        "readable-stream": "^4.5.2",
        "reflect-metadata": "^0.2.1",
        "@rws-framework/server": "*",
        "ts-transformer-keys": "^0.4.4",
        "tsconfig-paths-webpack-plugin": "^4.1.0",
        "typescript": "^5.3.3",
        "webpack-node-externals": "^3.0.0"        
    },
    "devDependencies": {
        "@types/chai": "^4.3.5",
        "@types/chai-like": "^1.1.1",
        "@types/chai-things": "^0.0.35",
        "@types/compression": "^1.7.5",
        "@types/jsonwebtoken": "9.0.2",
        "@types/lodash": "^4.14.202",
        "@types/mocha": "^10.0.1",        
        "chai": "^4.3.7",
        "chai-like": "^1.1.1",
        "chai-things": "^0.2.0",
        "mocha": "^10.2.0",
        "ts-node": "^10.9.1",
        "webpack": "^5.75.0",
        "webpack-bundle-analyzer": "^4.10.1",
        "webpack-cli": "^5.1.4"
    }
}
```

### Tsconfig file

**tsconfig.json:**

```json
{
    "compilerOptions": {
      "baseUrl": ".",
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true,
      "target": "ES2018",
      "module": "commonjs",
      "moduleResolution": "node",
      "strict": true,
      "esModuleInterop": true,
      "sourceMap": true,
      "resolveJsonModule": true,
      "outDir": "dist",
      "strictNullChecks": false,    
      "allowSyntheticDefaultImports": true,
      "paths": {                 
      }
    },
    "include": ["./src"],  
    "exclude": []
  }
```

### Initialzie server setup (by default uses src/config/config.ts)

```bash

yarn rws init
```

### OR with specifig config path

```bash

yarn rws init path/to/cfg.ts/from/src
```

## Creating Server Configuration

Create a new file named `config.ts` in the root of your project. This file will export a function that returns a configuration object.

### Example webpack config

```Js
const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const  RWSWebPackSettings  = require('@rws-framework/server/rws.webpack.config');

RWSWebPackSettings.resolve.plugins = [
  new TsconfigPathsPlugin({configFile: './tsconfig.json'})
]

RWSWebPackSettings.output.path = path.resolve(__dirname, 'build');
RWSWebPackSettings.output.filename = 'jtrainer.server.js',


RWSWebPackSettings.devtool = 'source-map';
RWSWebPackSettings.mode = 'development';

// console.log(RWSWebPackSettings);

module.exports = RWSWebPackSettings;
```

### RWS webpack config


**rws.webpack.config.js:**
```Js
const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const webpackFilters = require('./webpackFilters');
const nodeExternals = require('webpack-node-externals');
const UtilsService = require('./_tools');

const rootPackageNodeModules = path.resolve(UtilsService.findRootWorkspacePath(process.cwd()), 'node_modules')

const modules_setup = [rootPackageNodeModules];

// console.log(modules_setup)s;

module.exports = {
  entry: `${process.cwd()}/src/index.ts`,
  mode: 'development',
  target: 'node',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'rws.server.js',
    sourceMapFilename: '[file].map',
  },
  resolve: {
    modules: modules_setup,
    extensions: ['.ts', '.js', '.node'],  
    alias: {
      
    },
    symlinks: false
  },
  context: process.cwd(),
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
        exclude: /node_modules\/(?!@rws-framework/server)/,
      },       
      {
          test: /\.node$/,
          use: 'node-loader',
      }        
    ],
  },
  plugins: [
  ],
  stats: {
    warningsFilter: webpackFilters,
  },
  externals: [nodeExternals({
    allowlist: ['@rws-framework/server'],
  })],
};
```

### RWS App Configuration

Define the connection details for your MongoDB instance and server configurations:

**src/config/config.ts**:

```typescript
import { ConsoleService, IAppConfig } from "@rws-framework/server";

import JWTUser from "../user/model";
import { getModels } from "../models";
import ControllerList from '../controllers/index';
import TimeTrackerSocket from "../sockets/ChatSocket";
import routes from '../routing/routes';
import ws_routes from '../routing/sockets';
import CommandList from '../commands';
import dotenv from 'dotenv';


export default (): IAppConfig => { 
    dotenv.config();
    const DB_NAME: string = process.env.MONGO_DB_NAME;
    const DB_HOST: string = process.env.MONGO_HOST;
    const DB_PORT: number = parseInt(process.env.MONGO_PORT);
    const DB_USER: string = process.env.MONGO_INITDB_ROOT_USERNAME;
    const DB_PASS: string = process.env.MONGO_INITDB_ROOT_PASSWORD;

    const AWS_ACCESS_KEY: string = process.env.AWS_ACCESS_KEY;
    const AWS_SECRET_KEY: string = process.env.AWS_SECRET_KEY;

    const APP_DOMAIN: string = process.env.APP_DOMAIN;
    const PUB_FOLDER: string = process.env.PUB_FOLDER;

    const APP_PORT: number = parseInt(process.env.APP_PORT);
    const APP_WS_PORT: number = parseInt(process.env.APP_WS_PORT);
    const TESTING_PORT: number = parseInt(process.env.TESTING_PORT);
    const APP_SSL: boolean = process.env.APP_SSL === 'True';
    const APP_CORS_ALLOW: string = process.env.APP_CORS_ALLOW ? process.env.APP_CORS_ALLOW : APP_DOMAIN;

    const dbString: string = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;        

    return {
        features: {
            ws_enabled: true,
            routing_enabled: true,
            ssl: APP_SSL
        },
        mongo_url: dbString,
        mongo_db: DB_NAME,
        port: APP_PORT,        
        ws_port: APP_WS_PORT,
        test_port: TESTING_PORT,
        domain: APP_DOMAIN,
        cors_domain: APP_CORS_ALLOW,
        ssl_cert: '',
        ssl_key: '',
        secret_key: '',
        user_class: JWTUser,
        user_models: getModels(),
        controller_list: ControllerList,
        ws_routes: ws_routes,
        http_routes: routes(),
        commands: CommandList,
        aws_lambda_region: null,        
        aws_access_key: AWS_ACCESS_KEY,
        aws_secret_key: AWS_SECRET_KEY,
        aws_lambda_role: null,
        aws_lambda_bucket: null,
        pub_dir: PUB_FOLDER,        
    }
}
```

### Commands

***A sample command***:

```typescript
import { ICmdParams, RWSCommand } from '@rws-framework/server';

class HelloCommand extends RWSCommand {
    constructor(){
        super('hello', module); // "module" in constructor is required
    }

    execute(params?: ICmdParams): void {
        console.log('<HELLO COMMAND>\n')
        console.log('    Thanks for installing RWS junction instance, ' + params.user + '\n\n');
        console.log('    This is output of example command for RWS JS server framework.');
        console.log('                                   (src/commands/HelloCommand.ts).');
        console.log('    Develop your server with "yarn dev"\n');
        console.log('    Or build and start with "yarn build" and "yarn server"');
        console.log('\n\n\n    Params passed to this command (those starting with "_" are autogenrated by console script)');
        console.log(params);
        console.log('\n</HELLO COMMAND>')
    }
}

export default new HelloCommand();
```

Command name is set in RWSCommand class constructor params

args are passed to execute() method

```typescript
class NewCommand extends RWSCommand {
    constructor(){
        super('newcommand');
    }

    execute(args){
      console.log('DATABASE NAME IS: ', args._rws_config.mongo_db)
    }
}
```

args are passed like this:

```bash
npx rws newcommand arg1=val1,arg2=val2 
```

### Database models

You need to create and export your models in a separate models.ts file. In this example, the getModels() function returns an array of RWS models:

```typescript
import TimeSeries from "./TimeSeries";
import TimeTracker from "./TimeTracker";

export function getModels(): any[] {
    return [
        TimeTracker,
        TimeSeries
    ]
}
```

RWSModel example: 

```typescript
import { RWSannotations, RWSModel } from "@rws-framework/server";

import ITimeTracker from "./interfaces/ITimeTracker";
import 'reflect-metadata';

import TimeSeries from "./TimeSeries";
const { InverseTimeSeries, TrackType } = RWSannotations.modelAnnotations;

class TimeTracker extends RWSModel<TimeTracker> implements ITimeTracker {
  @TrackType(String, { required: true }, ['unique'])
  asset_id: string;

  @TrackType(Number)
  elapsed_time: number = 0;

  @TrackType(String, { required: true })
  obj_id: string;

  @TrackType(String)
  asset_type: string;

  @TrackType(Date)
  trace_date: Date;

  @TrackType(String)
  user_id: string;

  @TrackType(Boolean)
  instructor: boolean;

  @TrackType(Object)
  params: any;

  @InverseTimeSeries('time_tracker_measurements', 'measurements')
  measurements_ids: string[] = [];
  measurements: TimeSeries[] = [];

  static _collection = 'time_tracker';
  // static _interface = ITimeTracker;

  constructor(data?: ITimeTracker) {   
    super(data);    

    this.trace_date = new Date();
  }


 addTime(series: TimeSeries){
    this.measurements_ids.push(series.id);
    this.measurements.push(series);

    let sum = 0;

    this.measurements.forEach(measurement => {
      sum += measurement.value;
    });  

    this.elapsed_time = sum;
 }

 getTimes(): TimeSeries[]{
  return this.measurements;
 }
}

export default TimeTracker;
```

### Relations in DB

**n:1**

The binding collection:

```typescript
  
class BookBind extends RWSModel<BookBind> {  
  static _collection = 'book_bind_collection_name';

  @Relation('book_collection_name')
  book: Book;
}
```


The bound collection:

```typescript
  
class Book extends RWSModel<BookBind> {  
  static _collection = 'book_collection_name';

  // without 2nd parameter the field would be named "book" (model classname to lowercase)
  @InverseRelation('book_bind_collection_name', 'inversed_field_name_or_null') 
  bookBinds: BookBind[]
}
```

**AFTER EVERY MODEL FIELD CHANGE RUN:**

```shell
yarn rws db:schema:reload -r=1
```

this will update prisma schema for async DB Calls with new fields and their types

## Route Configuration

### Request Route Configuration
Define your http routes in file that returns array IHTTPRoutes interfaces

```typescript
import routes from './routing/routes';
```

**routes.ts**:

*"name"* is annotation route name for controllers
*"path"* is request path

```typescript
import {IHTTPRoute} from "@rws-framework/server";

export default (): IHTTPRoute[] => {
    return [
        {
            prefix: '/prefix',
            routes: [
                {
                    name: 'prefix:controller:route',
                    path: '/prefix/route/path/with/:param'
                },                
            ]
        },        
        {
            name: 'home:route',
            path: '/*',
            noParams: true, // this route will not process parameters and put them to request object
        },             
    ]
}
```

Controller routing usage:

```typescript
import { 
    RWSannotations, 
    RWSController, 
    IRequestParams 
} from "@rws-framework/server";

const { Route } = RWSannotations.routingAnnotations;
class HomeController extends RWSController{
    @Route('home:index', 'GET')
    public indexAction(params: IRequestParams): Object 
    {
        
        return {
            'success': true
            'data': {
              //your response stuff
            }
        } // Send a response for the root route
    }
}

export default HomeController.getSingleton();
```

A controller action with route ":param" usage - this one is called ":bookId'

```typescript
  @Route('train:get:book', 'GET')
  public async getBookAction(params: IRequestParams<any>): Promise<IBook>
  {     
      return await Book.findOneBy({ id: params.req.params.bookId });
  }
```

A controller action that outputs "template_name" HTML file from "pub_dir" config setting.

default responseType for @Route is 'json'

```typescript
  @Route('home:index', 'GET', { responseType: 'html' })
    public indexAction(params: IRequestParams<any>): any
    {        
        return {
            template_name: 'index',
            template_params: {
                hello: 'world'
            }
        }
    }    
```

### Websocket Route Configuration

Define your websocket routes in file that returns object with key being event name to be handled and a socket class definition that extends RWSSocket

```typescript
import TimeTrackerSocket from "./sockets/TimeTrackerSocket";

const ws_routes = {
    'time': TimeTrackerSocket 
},
```

those routes goes to config file in "ws_routes" field

## Running the Server

Create a new index.ts file in the root of your project. This file will import the serverInit function from @rws-framework/server, and your configuration function from config.ts.

**serverInit() takes in IAppConfig interface:**

```typescript
import { RWSHTTPRoutingEntry, WsRoutes, RWSController, RWSCommand } from "../index"

export default interface IAppConfig {   
    features?: {
        ws_enabled?: boolean
        routing_enabled?: boolean
        test_routes?: boolean
        ssl?: boolean
    } 
    mongo_url: string
    mongo_db: string
    port: number
    ws_port?: number
    domain: string
    test_port?: number
    test_ws_port?: number
    ssl_cert: string
    ssl_key: string
    secret_key: string
    user_class: any
    user_models: any[]
    controller_list: RWSController[]
    ws_routes: WsRoutes
    http_routes: RWSHTTPRoutingEntry[] 
    front_routes?: Record<string, unknown>[],
    commands?: RWSCommand[]
    aws_lambda_region?: string
    aws_access_key?: string
    aws_secret_key?: string
    aws_lambda_role?: string
    aws_lambda_bucket?: string
    pub_dir?: string
    cors_domain?: string
}
```

The **serverInit()** cfg to AppConfigService singleton in @RWS module.
It reinstantiates if created empty and had passed config once.

Every service in @RWS uses AppConfigService

**serverInit()** from ***{packageDir}/init.ts***
```typescript
import IAppConfig from "./interfaces/IAppConfig";
import getConfigService, { AppConfigService } from "./services/AppConfigService";
import ServerService, { IInitOpts } from "./services/ServerService";
import ConsoleService from "./services/ConsoleService";
import UtilsService from "./services/UtilsService";

import fs from "fs";
import ProcessService from "./services/ProcessService";


async function init(cfg: IAppConfig, serverOptions: IInitOpts = {}, addToConfig: (configService: AppConfigService) => Promise<void> = null){    
    const AppConfigService = getConfigService(cfg);
    const port = await AppConfigService.get('port');
    const ws_port = await AppConfigService.get('ws_port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');
    const pub_dir = await AppConfigService.get('pub_dir');
    const cors_domain = await AppConfigService.get('cors_domain');

    const sslCert = AppConfigService.get('ssl_cert');
    const sslKey = AppConfigService.get('ssl_key');      

    if(addToConfig !== null){
        await addToConfig(AppConfigService);
    }

    let https = true;

    if(!sslCert || !sslKey){
        https = false;
    }

    const executeDir: string = process.cwd();
    const packageRootDir = UtilsService.findRootWorkspacePath(executeDir)
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    const moduleCfgFile = `${moduleCfgDir}/_rws_installed`;

    if(!fs.existsSync(moduleCfgFile)){        
        ConsoleService.log(ConsoleService.color().yellow('No config path generated for CLI. Trying to initialize with "yarn rws init config/config"'));
        await ProcessService.runShellCommand('yarn rws init config/config');
        UtilsService.setRWSVar('_rws_installed', 'OK');    
    }

    const theServer = await ServerService.initializeApp({...{        
        wsRoutes: wsRoutes,
        httpRoutes: httpRoutes,
        controllerList: controler_list,
        pub_dir: pub_dir,
        domain: `http${(await AppConfigService.get('features')?.ssl ? 's' : '')}://${await AppConfigService.get('domain')}`,
        cors_domain: cors_domain
    },...serverOptions});

    const wsStart = async () => {
        return (await theServer.websocket.starter());
    }

    const httpStart = async () => {
        return (await theServer.http.starter());
    }

    wsStart();
    await httpStart();    
}

export default init;


```

###

**DBService**

reading config from config singleton filled with cfg data passed to @RWS

```typescript
class DBService extends TheService {
  private client: PrismaClient;
  private opts:IDBClientCreate = null;
  private connected = false;

  constructor(opts: IDBClientCreate = null){
    super();   
  }

  private connectToDB(opts: IDBClientCreate = null) {
    if(opts){
      this.opts = opts;
    }else{
      this.opts = {
        dbUrl: getConfig().get('mongo_url'),        
        dbName: getConfig().get('mongo_db'),
      }
    }

    if(!this.opts.dbUrl){
      return;
    }    
  
    try{
      this.client = new PrismaClient({ 
        datasources: {
          db: {
            url: this.opts.dbUrl
          },
        },
      });     

      this.connected = true;
    } catch (e){
      ConsoleService.error('PRISMA CONNECTION ERROR');
    }
  }

  private async createBaseMongoClient(): Promise<MongoClient>
  {
    const dbUrl = this.opts?.dbUrl || getConfig().get('mongo_url');
    const client = new MongoClient(dbUrl);
    
    await client.connect();

    return client;

  }

  //(...)
```
## Implementation
### index.ts from your root/src directory##:

```typescript
import { serverInit, ConsoleService, getAppConfig } from "@rws-framework/server";
import config from './config/config'
import BedrockService from "./services/BedrockService";

// import path from 'path';

async function main(){            
    await serverInit(config());    

    getAppConfig().set('extra_param', 'value');    
}

main().then(() => {
    ConsoleService.log("Initialization complete");
}).catch((e) => {
    ConsoleService.error(e);
    console.error(e);
});

```

*The prisma client will have generated Prisma models called exactly like _collection variable in RWS models. You can dierectly act on it without traversing dynamic prisma collections array inside the started client import.*

```typescript
import { track_type } from "@prisma/client";
```

to start server in dev env:


**in root package.json:**
```Json
{
  "scripts": {
    "dev": "npm-run-all --parallel watch:transpile watch:run",
    "watch:run": "nodemon \"./build/rws.server.js\" --watch \"./build\"",
    "watch:transpile": "webpack --config webpack.config.js --watch",
    "build": "webpack --config webpack.config.js --output-path ./dist",
    "server": "node dist/rws.server.js",    
    "hello": "npx rws hello user=$USER",
    "postinstall": "npx rws init config=config/config && yarn hello",
    "test": "npx mocha"
  }
}

```

## Executing server


### build:

```bash
yarn build
```

### watch:

```bash
yarn dev
```
### run:

```bash
yarn server
```

### test:

```bash
yarn test
```

*("hello" is a sample command)*

## BASH installs for node libraries

for local servers - libs are in docker/ Dockerfiles

```bash
apt-get install -y \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    libnss3 \
    libxtst6 \
    gconf-service \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libappindicator1 \
    lsb-release \
    xdg-utils
```