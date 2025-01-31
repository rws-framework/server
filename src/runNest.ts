import { DynamicModule, Type } from '@nestjs/common';
import { NestModuleTypes } from './types/IRWSModule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterService } from './services/RouterService';
import { ConsoleService } from './services/ConsoleService';
import { RWSConfigService } from './services/RWSConfigService';
import { AuthService } from './services/AuthService';
import { UtilsService } from './services/UtilsService';
import IAppConfig from './types/IAppConfig';
import { DBService } from './services/DBService';
import { 
  Module  
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ServerOpts } from './types/ServerTypes';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import RWSModel from './models/_model';
import { RunCallback } from './types/BootstrapTypes';
import { INestApplication } from '@nestjs/common';

const baseModules: (cfg: IAppConfig) => (DynamicModule| Type<any> | Promise<DynamicModule>)[] = (cfg: IAppConfig) => [   
  ConfigModule.forRoot({
    isGlobal: true,
    load: [ () => cfg ]
  }),  
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

    return {
      module: RWSModule,
      imports: processedImports as unknown as NestModuleTypes,
      providers: [
        ConfigService,
        DBService,
        RWSConfigService,        
        UtilsService, 
        ConsoleService, 
        AuthService,
        RouterService        
      ],  
      exports: [
        DBService,
        ConfigService,
        RWSConfigService,
        UtilsService, 
        ConsoleService, 
        AuthService,
        RouterService
      ]
    };
  }

  onModuleInit() {    
    console.log('RWSModule has been initialized');
  }
}

export default async function bootstrap(
  nestModule: any, 
  cfgRunner: () => IAppConfig, 
  opts: ServerOpts = {
    pubDirEnabled: true
  },
  callback: RunCallback | null = null,
  controllers: any[] = []
) {
  const rwsOptions = cfgRunner();  

  const app: INestApplication = await NestFactory.create(nestModule.forRoot(RWSModule.forRoot(rwsOptions, opts.pubDirEnabled)));
  await app.init();  

  const routerService = app.get(RouterService);

  const dbService = app.get(DBService);
  const configService = app.get(RWSConfigService);

  RWSModel.dbService = dbService;
  RWSModel.configService = configService;

  const routes = routerService.generateRoutesFromResources(rwsOptions.resources || []);
  await routerService.assignRoutes(app.getHttpAdapter().getInstance(), routes, controllers);

  if(callback){
    callback(app);
  }

  await app.listen(rwsOptions.port);
}