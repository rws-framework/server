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
import { APP_INTERCEPTOR, NestFactory, Reflector, DiscoveryService } from '@nestjs/core';
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
import { config } from 'yargs';
import { RWSLogger } from './services/RWSLogger';
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
                DiscoveryService,
                ConfigService,
                NestDBService,
                RWSConfigService,        
                UtilsService, 
                ConsoleService, 
                AuthService,
                RouterService,
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
                RWSAutoAPIService
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
) {
    const dbCli =  process.env?.DB_CLI ? parseInt(process.env.DB_CLI) : 0;

    if(dbCli){
        return;
    }

    const rwsOptions = cfgRunner();  
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
        callback.preInit(app);
    }

    const configService = app.get(RWSConfigService);
    const dbService = app.get(NestDBService);  
    const autoRouteService: RWSAutoAPIService = app.get(RWSAutoAPIService);

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
        callback.afterInit(app);
    }

    const routerService = app.get(RouterService);

    const routes = routerService.generateRoutesFromResources(rwsOptions.resources || []);
    await routerService.assignRoutes(app.getHttpAdapter().getInstance(), routes, controllers);
    
    autoRouteService.shoutRoutes();

    if(callback?.preServerStart){
        callback.preServerStart(app);
    }

    await app.listen(rwsOptions.port);
}