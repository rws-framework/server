# RWS (Realtime Web Suite) Server Framework

RWS is a comprehensive Node.js framework built on top of NestJS that provides a robust foundation for building real-time web applications. It integrates WebSocket support, MongoDB/Prisma ORM, authentication, and routing in a cohesive package.

## Features

- Built on NestJS for robust server-side architecture
- WebSocket support for real-time communication
- MongoDB integration with Prisma ORM
- Automatic model schema generation
- Built-in authentication system
- Configurable routing system for HTTP and WebSocket endpoints
- Command-line interface for project management
- TypeScript support with decorators for clean code structure

## Installation

```bash
npm install @rws-framework/server
# or
yarn add @rws-framework/server
```

## Project Setup

1. Initialize a new RWS project:

```bash
yarn rws-server init
```

2. Create a configuration file (e.g., `src/config/config.ts`):

```typescript
import { IAppConfig } from "@rws-framework/server";
import dotenv from 'dotenv';

export default (): IAppConfig => { 
    dotenv.config();
    
    return {
        features: {
            ws_enabled: true,
            routing_enabled: true,
            ssl: false
        },
        mongo_url: process.env.MONGO_URL,
        mongo_db: process.env.DB_NAME,
        port: parseInt(process.env.APP_PORT),
        domain: process.env.APP_DOMAIN,
        user_models: [], // Your models here
        controller_list: [], // Your controllers here
        ws_routes: {}, // Your WebSocket routes here
        http_routes: [], // Your HTTP routes here
        commands: [], // Your custom commands here
        pub_dir: 'public' // Public assets directory
    }
}
```

## Core Components

### Models

Models in RWS use decorators to define schema and relationships:

```typescript
import { RWSannotations, RWSModel } from "@rws-framework/server";

const { TrackType } = RWSannotations.modelAnnotations;

class User extends RWSModel<User> {
    @TrackType(String, { required: true }, ['unique'])
    username: string;

    @TrackType(String, { required: true })
    email: string;

    static _collection = 'users';

    constructor(data?: any) {   
        super(data);    
    }
}

export default User;
```

### Controllers

RWS Nest Controllers **(handmade)**:

```typescript
import { RWSAutoApiController } from "@rws-framework/server";
import { RWSRoute, RWSController } from "@rws-framework/server/nest";
import User from '../models/User';

@RWSController('user')
export class UserController {
    @RWSRoute('user:get')
    public async getUser(params: IRequestParams): Promise<any> {
        return {
            success: true,
            data: {
                // Your response data
            }
        }
    }
}

```

RWS Nest Controllers **(AutoApi)**

```typescript
import { RWSAutoApiController } from "@rws-framework/server";
import { RWSRoute, RWSController } from "@rws-framework/server/nest";
import User from '../models/User';

@RWSController('user', () => User)
export class UserController extends RWSAutoApiController {
    @RWSRoute('user:get')
    public async getUser(params: IRequestParams): Promise<any> {
        return {
            success: true,
            data: {
                // Your response data
            }
        }
    }
}

```

### WebSocket Gateways

WebSocket routes are defined using gateway classes:

```typescript
import { RWSGateway, JSONMessage } from "@rws-framework/server";

class ChatGateway extends RWSGateway {
    async handleMessage(message: JSONMessage): Promise<void> {
        // Handle incoming WebSocket message
    }
}

export default ChatGateway;
```

### Commands

Custom CLI commands can be created:

```typescript
import { Injectable } from '@nestjs/common';
import { setupRWS, setupPrisma } from '../install';

import {RWSBaseCommand, RWSCommand} from './_command';
import { ParsedOptions } from '../../exec/src/application/cli.module';


@Injectable()
@RWSCommand({name: 'setup', description: 'Systems init command.'})
    export class SetupCommand extends RWSBaseCommand {
        async run(
        passedParams: string[],
        options?: ParsedOptions
    ): Promise<void> {
        console.log({passedParams, passedOptions})
    }
}

export default new SetupCommand();
```

Default services in CLI command class:

```typescript
import { ConsoleService } from "../../services/ConsoleService";
import { DBService } from "../../services/DBService";
import { ProcessService } from "../../services/ProcessService";
import { UtilsService } from "../../services/UtilsService";
import { RWSConfigService } from "../../services/RWSConfigService";

export interface ICommandBaseServices {
    utilsService: UtilsService;
    consoleService: ConsoleService;
    configService: RWSConfigService;
    processService: ProcessService;
    dbService: DBService;
}
```

## Server Initialization

Create an entry point file (e.g., `src/index.ts`):

```typescript
import { RWSConfigInjector, RWSBootstrap } from "@rws-framework/server/nest";
import { config } from './config/config';
import { AppModule } from "./app/app.module";

@RWSConfigInjector(config())
class Bootstrap extends RWSBootstrap {}

await Bootstrap.run(AppModule, { 
    authorization: false, 
    transport: 'websocket'
});
```

## Development

1. Start in development mode:
```bash
yarn dev
```

2. Build for production:
```bash
yarn build
```

3. Run production server:
```bash
yarn server
```

## Project Structure

```
src/
├── app/              # Main application module
├── commands/         # CLI commands
├── config/          # Configuration files
├── controllers/     # HTTP controllers
├── gateways/        # WebSocket gateways
├── models/          # Data models
├── routing/         # Route definitions
├── services/        # Business logic services
└── types/           # TypeScript type definitions
```

## Configuration Options

The `IAppConfig` interface supports the following options:

- `features`: Enable/disable framework features
  - `ws_enabled`: Enable WebSocket support
  - `routing_enabled`: Enable HTTP routing
  - `ssl`: Enable SSL/TLS
- `mongo_url`: MongoDB connection string
- `mongo_db`: Database name
- `port`: HTTP server port
- `ws_port`: WebSocket server port
- `domain`: Application domain
- `user_class`: User model class
- `user_models`: Array of model classes
- `controller_list`: Array of controllers
- `ws_routes`: WebSocket route definitions
- `http_routes`: HTTP route definitions
- `commands`: Custom CLI commands
- `pub_dir`: Public assets directory

## Best Practices

1. Always run `yarn rws-server init` after modifying model schemas
2. Use decorators for clean and maintainable code
3. Implement proper error handling in controllers and gateways
4. Keep configuration in environment variables
5. Follow the provided project structure for consistency

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
