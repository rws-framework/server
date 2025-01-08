import { DynamicModule, forwardRef, Inject, Type } from '@nestjs/common';
import { IRWSModule, NestModuleTypes, RWSModuleType } from './types/IRWSModule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterService } from './services/RouterService';
import { ConsoleService } from './services/ConsoleService';
import { AuthService } from './services/AuthService';
import { UtilsService } from './services/UtilsService';
import IAppConfig from './types/IAppConfig';
import IDbUser from './types/IDbUser';
import { DBService } from './services/DBService';
import { 
  Module  
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ServerOpts } from './types/ServerTypes';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { BootstrapRegistry } from '../nest/decorators/RWSConfigInjector';
import { exit } from 'process';

const baseModules: (cfg: IAppConfig) => (DynamicModule| Type<any> | Promise<DynamicModule>)[] = (cfg: IAppConfig) => [   
  ConfigModule.forRoot({
    isGlobal: true,
    load: [ () => cfg ]
  }),  
];

@Module({})
export class RWSModule {
  static cfgData: IAppConfig;
  
  static async forRoot(cfg: IAppConfig, cli: boolean = false): Promise<DynamicModule> {       
    const processedImports = [
      ...baseModules(cfg)   
    ];

    if(!cli){
      processedImports.push(ServeStaticModule.forRoot({
        rootPath: path.join(process.cwd(), process.env.PUBLIC_DIR), 
        serveRoot: cfg.static_route || '/',
      }));      
    }

    return {
      module: RWSModule,
      imports: processedImports as unknown as NestModuleTypes,
      providers: [
        DBService,
        ConfigService,
        UtilsService, 
        ConsoleService, 
        AuthService,
        RouterService        
      ],  
      exports: [
        DBService,
        ConfigService,
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
  opts: ServerOpts = {},
  controllers: any[] = []
) {
  const rwsOptions = cfgRunner();

  const app = await NestFactory.create(nestModule.forRoot(rwsOptions));
  
  const routerService = app.get(RouterService);

  const dbService = app.get(DBService);
  const configService = app.get(ConfigService);

  const models = configService.get('user_models') as any[];

  for (const model of models){
    model.dbService = dbService;
    model.configService = configService;
  }

  const routes = routerService.generateRoutesFromResources(rwsOptions.resources || []);
  await routerService.assignRoutes(app.getHttpAdapter().getInstance(), routes, controllers);

  await app.listen(rwsOptions.port);
}
