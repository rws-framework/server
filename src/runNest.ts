import { DynamicModule, Logger, Type } from '@nestjs/common';
import { NestModuleTypes } from './types/IRWSModule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterService } from './services/RouterService';
import { ConsoleService } from './services/ConsoleService';
import { RWSConfigService } from './services/RWSConfigService';
import { NestDBService } from './services/NestDBService';
import { AuthService } from './services/AuthService';
import { UtilsService } from './services/UtilsService';
import IAppConfig from './types/IAppConfig';
import { RWSModel } from '@rws-framework/db';
import { 
    Module  
} from '@nestjs/common';
import { APP_INTERCEPTOR, NestFactory, Reflector, DiscoveryService, APP_GUARD, ModuleRef } from '@nestjs/core';
import { ServerOpts } from './types/ServerTypes';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { RunCallbackList } from './types/BootstrapTypes';
import { INestApplication } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SerializeInterceptor } from './interceptors/serialize.interceptor';
import { RWSAutoApiController } from './controller/_autoApi';
import { RWSAutoAPIService } from './services/RWSAutoAPIService';
import { RWSCoreController } from './controller/core.controller';
import { AuthGuard } from '../nest/decorators/guards/auth.guard';
import { BlackLogger } from '../nest';
import { RWSWebsocketRoutingService } from './services/RWSWebsocketRoutingService';
import { RealtimePoint } from './gateways/_realtimePoint';
import { RWSFillService } from './services/RWSFillService';

type AnyModule =  (DynamicModule| Type<any> | Promise<DynamicModule>);

const baseModules: (cfg: IAppConfig) => AnyModule[] = (cfg: IAppConfig) => [   
    ConfigModule.forRoot({
        isGlobal: true,
        load: [ () => cfg ]
    }),  
    RouterModule.register([])
];

@Module({})
export class RWSModule {
    static cfgData: IAppConfig;
  
    static async forRoot(cfg: IAppConfig, pubDirEnabled: boolean = true): Promise<DynamicModule> {       
        const processedImports = [
            ...baseModules(cfg)   
        ];

        if(pubDirEnabled){
            processedImports.push(ServeStaticModule.forRoot({
                rootPath: path.join(process.cwd(), cfg.pub_dir), 
                serveRoot: cfg.static_route || '/',
            }));      
        }

        const theModule: AnyModule = {
            module: RWSModule,
            imports: processedImports as unknown as NestModuleTypes,
            providers: [
                {
                    provide: APP_GUARD,
                    useFactory: (reflector: Reflector, configService: RWSConfigService<IAppConfig>) => {
                        return new AuthGuard(configService, reflector);
                    },
                    inject: [Reflector, RWSConfigService]
                },   
                DiscoveryService,
                ConfigService,
                NestDBService,
                RWSConfigService,        
                UtilsService, 
                ConsoleService, 
                AuthService,
                RouterService,
                RWSWebsocketRoutingService,
                RWSFillService,
                SerializeInterceptor,
                {
                    provide: APP_INTERCEPTOR,
                    useFactory: (reflector: Reflector) => {
                        return new SerializeInterceptor();
                    },
                    inject: [Reflector]
                },
                RWSAutoAPIService    
            ],  
            exports: [
                NestDBService,
                ConfigService,
                RWSConfigService,
                UtilsService, 
                ConsoleService, 
                AuthService,
                RouterService,
                SerializeInterceptor,
                RWSAutoAPIService,
                RWSWebsocketRoutingService,
                RWSFillService
            ]            
        };

        if(!cfg.noCoreController){
            theModule.controllers = [
                RWSCoreController
            ];
        }

        return theModule;
    }

    onModuleInit() {    
    }
}

export default async function bootstrap(
    nestModule: any, 
    cfgRunner: () => IAppConfig, 
    opts: ServerOpts = {
        pubDirEnabled: true
    },
    callback: RunCallbackList | null = null,
    controllers: any[] = []
): Promise<{ app: INestApplication, listen: () => Promise<void> }> {
    const logger = new Logger('bootstrap');
    const dbCli =  process.env?.DB_CLI ? parseInt(process.env.DB_CLI) : 0;

    if(dbCli){
        return;
    }

    const rwsOptions = cfgRunner();  
    
    BlackLogger.setConfig(rwsOptions.logging);

    if(rwsOptions.logging){
        logger.debug('Loki logs upload enabled.');
    }

    const app: INestApplication = await NestFactory.create(
        nestModule.forRoot(RWSModule.forRoot(rwsOptions, opts.pubDirEnabled), rwsOptions)
    );

    if(rwsOptions.cors_domain){
        app.enableCors({
            origin: rwsOptions.cors_domain, 
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
    }

    if(callback?.preInit){
        await callback.preInit(app);
    }

    const configService = app.get(RWSConfigService);
    const dbService = app.get(NestDBService);  
    const autoRouteService: RWSAutoAPIService = app.get(RWSAutoAPIService);
    const websocketRoutingService: RWSWebsocketRoutingService = app.get(RWSWebsocketRoutingService);

    RealtimePoint.setModuleRef(app.get(ModuleRef));

    RWSModel.setServices({
        dbService: dbService.core(),
        configService: configService
    });    
  
    RWSAutoApiController.setServices({
        configService: configService,
        autoRouteService: autoRouteService,      
        httpAdapter: app.getHttpAdapter().getInstance()
    });

    await app.init();  

    if(callback?.afterInit){
        await callback.afterInit(app);
    }

    const routerService = app.get(RouterService);

    const routes = routerService.generateRoutesFromResources(rwsOptions.resources || []);
    await routerService.assignRoutes(app.getHttpAdapter().getInstance(), routes, controllers);
    
    // websocketRoutingService.assignRoutes();

    autoRouteService.shoutRoutes();

    if(configService.get('db_url')){
        process.env.PRISMA_DB_URL = configService.get('db_url');
    }

    if(callback?.preServerStart){
        await callback.preServerStart(app);
    }

    logger.log(`HTTP server started on port "${rwsOptions.port}"`);

    if(rwsOptions.ws_port){
        logger.log(`WS server started on port "${rwsOptions.ws_port}"`);

    }        

    return {
        app,
        listen: async () => app.listen(rwsOptions.port)
    };
}