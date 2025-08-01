# RWS (Realtime Web Suite) Server Framework

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Core Components](#core-components)
  - [Models](#models)
  - [Controllers](#controllers)
    - [Handmade Controllers](#handmade-controllers)
    - [AutoApi Controllers](#autoapi-controllers)
  - [WebSocket Gateways](#websocket-gateways)
  - [CLI Commands](#cli-commands)
- [Server Initialization](#server-initialization)
- [Development](#development)
- [Project Structure](#project-structure)
- [Configuration Options](#configuration-options)
- [Best Practices](#best-practices)
- [License](#license)
- [Contributing](#contributing)
- [Database Integration (RWS DB)](#database-integration-rws-db)
- [Manager & Build Configuration](#manager--build-configuration)

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

---

## Quick Start

1. **Install RWS Framework:**

```bash
npm install @rws-framework/server
# or
yarn add @rws-framework/server
```

2. **Initialize a new RWS project:**

```bash
yarn rws-server init
```

3. **Create a configuration file (e.g., `src/config/config.ts`):**

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
        db_type: 'mongodb',
        db_url: process.env.MONGO_URL,
        db_name: process.env.DB_NAME, // Use db_name for consistency
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

---

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

#### Handmade Controllers

```typescript
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

#### AutoApi Controllers

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

### WebSocket Gateways & Real-time Features

RWS provides a powerful gateway system for real-time communication, enabling WebSocket APIs, pub/sub messaging, and event-driven features. Gateways are classes that handle incoming and outgoing messages, manage client connections, and can broadcast events to connected clients.

**Typical use cases:**
- Real-time chat and notifications
- Live data updates (dashboards, feeds)
- Pub/sub event distribution
- Custom WebSocket APIs

#### Defining a Gateway

```typescript
import { RWSGateway, JSONMessage } from "@rws-framework/server";

class ChatGateway extends RWSGateway {
    async handleMessage(message: JSONMessage): Promise<void> {
        // Handle incoming WebSocket message
        // Example: broadcast to all clients
        this.broadcast({ type: 'chat', data: message.data });
    }

    // Optionally handle connection events
    async onConnect(client) {
        // Custom logic for new connections
    }
    async onDisconnect(client) {
        // Custom logic for disconnects
    }
}

export default ChatGateway;
```

#### Registering a Gateway

To enable your gateway, add it to the `ws_routes` in your config:

```typescript
// ...existing code...
ws_routes: {
    chat: ChatGateway,
    // ...other gateways
},
// ...existing code...
```

- Each key in `ws_routes` is the route name (e.g. `/ws/chat`), and the value is the gateway class.
- Gateways can emit/broadcast messages, handle custom events, and manage client state.

**Tip:** You can define multiple gateways for different real-time features. Gateways can also be used for pub/sub patterns, not just raw WebSocket APIs.

### CLI Commands

Custom CLI commands can be created:

```typescript
import { Injectable } from '@nestjs/common';
import {RWSBaseCommand, RWSCommand} from './_command';
import { ParsedOptions } from '../../exec/src/application/cli.module';

@Injectable()
@RWSCommand({name: 'setup', description: 'Systems init command.'})
export class SetupCommand extends RWSBaseCommand {
    async run(
        passedParams: string[],
        options?: ParsedOptions
    ): Promise<void> {
        console.log({passedParams, options})
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

---

## Server Initialization

Create an entry point file (e.g., `src/index.ts`):

```typescript
import { RWSConfigInjector, RWSBootstrap } from "@rws-framework/server/nest";
import config from './config/config';
import { AppModule } from "./app/app.module";

@RWSConfigInjector(config())
class Bootstrap extends RWSBootstrap {}

await Bootstrap.run(AppModule, { 
    authorization: false, 
    transport: 'websocket'
});
```

---
## WebSocket Gateways

RWS WebSocket gateways are an extension of NestJS gateways that provide a structured approach to real-time communication. They enable you to create WebSocket servers with organized routing through realtime points.

### Basic Gateway Structure

A WebSocket gateway extends `RWSGateway` and serves as the entry point for WebSocket connections:

```typescript
import { RWSGateway } from "@rws-framework/server";
import { SubscribeMessage } from '@nestjs/websockets';

class XXXGateway extends RWSGateway {   
    // Optional port source setup
    protected setPortHandler(){
        const port = this.appConfigService.get<number>('second_port');
        if(port){
            this.server.listen(port);
            
            console.log(`WebSocket server is running on port ${port}`);
        }   
    }
}

export default MarathonChatGateway;
```
By default gateway uses port from **ws_port** RWSConfigService setting.

### Message Structure

All WebSocket messages follow a standardized JSON structure:

```typescript
interface JSONMessage<T = unknown> {
    method: string;      // The method/route to call
    msg: T;             // The message payload
    user_id: string;    // User identifier
}
```

### Realtime Points

Realtime points are the core routing mechanism for WebSocket messages. They extend the `RealtimePoint` abstract class and handle specific message types:

```typescript
import { RealtimePoint, RWSConfigService, RWSJSONMessage, Socket } from "@rws-framework/server";
import { BlackLogger, RWSRealtimePoint, RWSRealtimeRoute } from "@rws-framework/server/nest";

@RWSRealtimePoint('chat_point', MarathonChatGateway)
export class ChatPoint extends RealtimePoint {
    constructor(
        // Inject your services here
        private someService: SomeService
    ) {
        super();
    }

    @RWSRealtimeRoute('marathon_chat_message')
    async getChatMessage(params: RWSJSONMessage<IWSChatPromptRequest>, socket: Socket) {
        const userMessage: string = params.msg.message;
        const userId: string | number | null | undefined = params.msg.user_id !== '' ? params.msg.user_id : null;

        // Handle the message logic here
        // Emit responses back to the client
        this.emitMessage('response_method', socket, { data: 'response' });
    }
}
```

### Key Decorators

- **`@RWSRealtimePoint(pointName, gatewayClass)`**: Registers a realtime point with a specific name and associates it with a gateway
- **`@RWSRealtimeRoute(methodName)`**: Maps a WebSocket method to a handler function

### Message Emission

Realtime points can emit messages back to clients using the `emitMessage` method:

```typescript
// Emit a successful response
this.emitMessage<ResponseType>('method_name', socket, responseData, true);

// Emit an error response
this.emitMessage<ErrorType>('error_method', socket, errorData, false);
```

### Frontend Integration

On the frontend, you can connect to WebSocket gateways using the `@rws-framework/nest-interconnectors` package:

```typescript
import { RWSViewComponent, RWSView, RWSInject, observable } from "@rws-framework/client";
import { WSService, WSServiceInstance } from "@rws-framework/nest-interconnectors";

@RWSView('web-chat')
class WebChatComponent extends RWSViewComponent {
    constructor(@RWSInject(WSService) private wsService: WSServiceInstance) {
        super();
    }

    async connectedCallback(): Promise<void> {
        super.connectedCallback();

        // Listen for messages from the realtime point
        this.wsService.listenForMessage('chat_point', (wsResponse) => {
            // Handle the response
            console.log('Received:', wsResponse.data);
        }, 'response_method');
    }

    sendMessage() {
        // Send message to the realtime point
        this.wsService.sendMessage('chat_point', 'marathon_chat_message', {
            message: 'Hello World',
            user_id: 'user123',
            extra: {}
        });
    }
}
```

### Gateway Registration

Register your gateway in the application configuration:

```typescript
// In your config file
export default (): IAppConfig => {
    return {
        // ... other config
        ws_routes: {
            'chat': MarathonChatGateway,
            // Add more gateways as needed
        },
        // ... other config
    }
}
```

### Advanced Features

#### Streaming Responses

For real-time streaming (like chat responses), you can emit multiple messages:

```typescript
@RWSRealtimeRoute('stream_chat')
async streamChat(params: RWSJSONMessage<IChatRequest>, socket: Socket) {
    const messageId = uuid();
    
    // Start streaming
    this.emitMessage('chat_response_start', socket, { messageId, date: new Date() });
    
    // Stream chunks
    for (const chunk of responseChunks) {
        this.emitMessage(`chat_response_chunk_${messageId}`, socket, { chunkWord: chunk });
    }
    
    // End streaming
    this.emitMessage(`chat_response_end_${messageId}`, socket, { finished: true });
}
```

#### Type Safety

Define TypeScript interfaces for your message types:

```typescript
export interface IWSChatPromptRequest {
    message: string;
    user_id?: string | number;
    extra?: unknown;
}

export interface IWSChatPromptStartResponse {
    messageId: string;
    date: Date;
}

export interface IWSChatPromptChunkResponse {
    chunkWord: string;
    date: Date;
}
```

### Best Practices

1. **Use descriptive point names**: Choose clear, meaningful names for your realtime points
2. **Implement proper error handling**: Always handle exceptions and emit appropriate error responses
3. **Type your messages**: Define TypeScript interfaces for all message types
4. **Organize by feature**: Group related WebSocket functionality into dedicated realtime points
5. **Clean up resources**: Properly handle disconnections and clean up any resources
6. **Use dependency injection**: Leverage NestJS dependency injection for services in realtime points

---

## Development

- **Start in development mode:**

```bash
yarn dev
```

- **Build for production:**

```bash
yarn build
```

- **Run production server:**

```bash
yarn server
```

---

## Project Structure

```
src/
├── app/              # Main application module
├── commands/         # CLI commands
├── config/           # Configuration files
├── controllers/      # HTTP controllers
├── gateways/         # WebSocket gateways
├── models/           # Data models
├── routing/          # Route definitions
├── services/         # Business logic services
└── types/            # TypeScript type definitions
```

---

## Configuration Options

The `IAppConfig` interface supports the following options:

- `features`: Enable/disable framework features
  - `ws_enabled`: Enable WebSocket support
  - `routing_enabled`: Enable HTTP routing
  - `ssl`: Enable SSL/TLS
- `db_type`: DB connection driver type (mongodb by default)
- `db_url`: DB connection string
- `db_name`: Database name
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

---

## Best Practices

1. Always run `yarn rws-server init` after modifying model schemas.
2. Use decorators for clean and maintainable code.
3. Implement proper error handling in controllers and gateways.
4. Keep configuration in environment variables.
5. Follow the provided project structure for consistency.
6. Use TypeScript for type safety and better development experience.

---

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Database Integration (RWS DB)

RWS uses a model system that integrates with Prisma for type-safe, scalable database access. Models are defined using decorators and can be automatically converted to Prisma schemas.

### Model Structure
- Models extend `RWSModel` and use decorators like `@TrackType`, `@Relation`, and `@InverseRelation` for schema and relationship definition.
- Example:

```typescript
import { TrackType, RWSCollection, RWSModel } from '@rws-framework/db';

@RWSCollection('users')
class User extends RWSModel<User> {
    @TrackType(String)
    username: string;
    // ...
}
export default User;
```

### Relations
- Use `@Relation` for many-to-one and one-to-one relations.
- Use `@InverseRelation` for one-to-many relations.

### Prisma Conversion & CLI
- Models are converted to Prisma schemas for use with PrismaClient.
- Use the CLI to generate and sync schemas:

```bash
npx rws-db "<mongo_url>" <db_name> <db_type> <models_dir>
# or
yarn rws-db "<mongo_url>" <db_name> <db_type> <models_dir>
```

- See the DB package README for advanced relation options and CLI usage.

---

## Manager & Build Configuration

The RWS Manager handles build, workspace, and environment configuration for both frontend and backend. The main configuration file is `rws.config.ts` at the project root.

### Main Config File: `rws.config.ts`
- Exports a function returning an `IManagerConfig` object.
- Handles environment variables, build directories, output files, and builder options for frontend, backend, and CLI.
- Example structure:

```typescript
export default function config(): IManagerConfig {
    return {
        dev: true,
        build: {
            front: { /* frontend build options */ },
            back: { /* backend build options */ },
            cli: { /* CLI build options */ }
        }
    }
}
```

- The config supports hot reload, custom output paths, TypeScript path mappings, and more.
- See the file for all available options and customize as needed for your project.

---
