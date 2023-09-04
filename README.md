# Creating and Configuring RWS-JS Server Application

RWS-JS is a flexible server framework that you can use to set up web servers, WebSocket servers, and more. The application's configuration is crucial for its successful operation. In this guide, you'll learn how to create and configure an RWS-JS server application.

## Index

- [Prerequisites](#prerequisites)
- [Setting Up](#setting-up)
- [Creating Server Configuration](#creating-server-configuration)
  - [Example webpack config](#example-webpack-config)  
  - [RWS App Configuration](#database-and-server-configuration)
  - [Commands](#commands)
  - [Database models](#database-models)
  - [Route Configuration](#route-configuration)
- [Running the Server](#running-the-server)

## Prerequisites

Make sure you have Node.js installed on your local machine. If not, you can download it from the [official Node.js website](https://nodejs.org).

## Setting Up

```bash
npm install @rws-js/server --save
```

## Creating Server Configuration

Create a new file named `config.ts` in the root of your project. This file will export a function that returns a configuration object.

### Example webpack config

```Js
const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;


const  RWSWebPackSettings  = require('./@rws/@rws-js-server/rws.webpack.config');


RWSWebPackSettings.output = {
  path: path.resolve(__dirname, 'build'),
    filename: 'rws.server.js',
}

RWSWebPackSettings.devtool = 'inline-source-map';
RWSWebPackSettings.mode = 'development';


module.exports = RWSWebPackSettings;
```

### RWS webpack config


**rws.webpack.config.js:**
```Js
const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'rws.server.js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.node'],
  },
  module: {
    rules: [
        {
          test: /\.(js|ts)$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
          options: {
            // make sure not to set `transpileOnly: true` here, otherwise it will not work
            getCustomTransformers: program => ({
                before: [
                    keysTransformer(program)
                ]
            })
          }
        },
        {
            test: /\.node$/,
            use: 'node-loader',
          }        
      ],
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, 'node_modules')],
  },
  stats: {
    warningsFilter: [
      /aws-crt/,
      /express\/lib\/view/,
      /mongodb-client-encryption\/lib\/providers\/gcp/,
      /mongodb\/lib\/utils/,
      /snappy/,
      /mongodb-js\/zstd/
    ],
  }
};
```

### RWS App Configuration

Define the connection details for your MongoDB instance and server configurations:

**config.ts**:

```typescript
import { IAppConfig } from "@rws-js/server";
import ConfigService from "../services/ConfigService";
import { getModels } from "../models";
import ControllerList from "../controllers";
import CommandList from "../commands";
import TimeTrackerSocket from "../sockets/TimeTrackerSocket";
import routes from '../routing/routes';

export default (): IAppConfig => {
    return {
        mongo_url: ConfigService.get('mongo', 'mongoUrl'),
        mongo_db: ConfigService.get('mongo', 'mongoDbname'),
        port: ConfigService.get('websocket', 'port'),        
        test_port: ConfigService.get('websocket', 'test_port'),
        domain: ConfigService.get('nginx', 'domain'),
        ssl_cert: ConfigService.get('websocket', 'ssl_cert'),
        ssl_key: ConfigService.get('websocket', 'ssl_key'),
        secret_key: ConfigService.get('app', 'secretKey'),
        user_class: JWTUser,
        user_models: getModels(),
        controller_list: ControllerList,
        ws_routes: {
            'time': TimeTrackerSocket 
        },
        http_routes: routes(),
        commands: CommandList 
    }
}
```

### Commands

***A sample command***:

```typescript
import { ICmdParams, RWSCommand } from '@rws-js/server';

class HelloCommand extends RWSCommand {
    constructor(){
        super('hello', module); // "module" in constructor is required
    }

    execute(params?: ICmdParams): void {
        console.log('<HELLO COMMAND>\n')
        console.log('    Thanks for installing RWS junction instance, ' + params.user + '\n\n');
        console.log('    This is output of example command for RWS JS server framework.');
        console.log('                                   (src/commands/HelloCommand.ts).');
        console.log('    Develop your server with "npm run dev"\n');
        console.log('    Or build and start with "npm run build" and "npm run server"');
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
import { RWSannotations, RWSModel } from "@rws-js/server";

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

### Route Configuration
Define your http routes in file that returns array IHTTPRoutes interfaces

```typescript
import routes from './routing/routes';
```

**routes.ts**:

*"name"* is annotation route name for controllers
*"path"* is request path

```typescript
import {IHTTPRoute} from "@rws-js/server";

export default (): IHTTPRoute[] => {
    return [
        {
            name: 'home:index',
            path: '/'
        }
    ]
}
```

Controller routing usage:

```typescript
import { 
    RWSannotations, 
    RWSController, 
    IRequestParams 
} from "@rws-js/server";

const { Route } = RWSannotations.routingAnnotations;
class HomeController extends RWSController{
    @Route('home:index', 'GET')
    public indexAction(params: IRequestParams): Object 
    {
        // console.log(params);
        return {
            'success': true
        } // Send a response for the root route
    }
}

export default HomeController.getSingleton();
```

Define your websocket routes in file that returns object with key being event name to be handled and a socket class definition that extends RWSSocket

```typescript
import TimeTrackerSocket from "./sockets/TimeTrackerSocket";

const ws_routes = {
    'time': TimeTrackerSocket 
},
```

those routes goes to config file in "ws_routes" field

### Running the Server

Create a new index.ts file in the root of your project. This file will import the serverInit function from @rws-js/server, and your configuration function from config.ts.

**serverInit() takes in IAppConfig interface:**

```typescript
import { IHTTPRoute, WsRoutes, RWSController, RWSCommand } from "@rws-js/server"

export default interface IAppConfig {    
    mongo_url: string
    mongo_db: string
    port: number
    domain: string
    test_port: number
    ssl_cert: string
    ssl_key: string
    secret_key: string
    user_class: any
    user_models: any[]
    controller_list: RWSController[]
    ws_routes: WsRoutes
    http_routes: IHTTPRoute[] 
    commands?: RWSCommand[]
}
```

The **serverInit()** cfg to AppConfigService singleton in @RWS module.
It reinstantiates if created empty and had passed config once.

Every service in @RWS uses AppConfigService

**serverInit()**
```typescript
import IAppConfig from "./interfaces/IAppConfig";
import getConfigService from "./services/AppConfigService";
import ServerService from "./services/ServerService";


async function init(cfg: IAppConfig){    
    // App config data (cfg) is passed to AppConfigService export returning singleton - instantiated class
    const AppConfigService = getConfigService(cfg); 

    const port = await AppConfigService.get('port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');

    (await ServerService.initializeApp({
        port: port,
        wsRoutes: wsRoutes,
        httpRoutes: httpRoutes,
        controllerList: controler_list    
    })).webServer().listen(port, () => {    
        console.log('HTTPS' + ` is working in port ${port}`);
    });
}

export default init;

```

### or

**DBService**

reading config from config singleton filled with cfg data passed to @RWS

```typescript
import { PrismaClient } from "@prisma/client";
import { Collection, Db, MongoClient } from 'mongodb';
import ITimeSeries from "../models/interfaces/ITimeSeries";
import { IModel } from "../models/_model";
import getConfig from "./AppConfigService";
import TheService from "./_service";

interface IDBClientCreate {
  dbUrl?: string;
  dbName?: string;
}

class DBService extends TheService {
  private client: PrismaClient;
  private opts:IDBClientCreate = null;

  constructor(opts: IDBClientCreate = null){
    super();

   this.connectToDB(opts);
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

  }
}
```

**index.ts**:

```typescript
import { serverInit } from "@rws-js/server";

import path from 'path';
import ConfigService from "./services/ConfigService";
import config from './config/config';

async function main(){    
    await serverInit(config());
}

main().then(() => {
    console.log("Initialization complete");
}).catch((e) => {
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
    "postinstall": "npx rws init config=config/config && npm run hello",
    "test": "npx mocha"
  }
}

```

```bash
npm run dev
```

to start tests:

```bash
npm run test
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