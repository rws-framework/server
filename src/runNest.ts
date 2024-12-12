import { NestFactory, Module } from '../nest';
import { DynamicModule, forwardRef, Inject, Type } from '@nestjs/common';
import { IRWSModule, NestModulesType, RWSModuleType } from './types/IRWSModule';
import { CommandModule } from 'nestjs-command';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterService } from './services/RouterService';
import { ConsoleService } from './services/ConsoleService';
import { AuthService } from './services/AuthService';
import { UtilsService } from './services/UtilsService';
import IAppConfig from './types/IAppConfig';
import IDbUser from './types/IDbUser';
import { DBService } from './services/DBService';
import RWSModel from './models/_model';

type ServerOpts = {
  authorization?: true, 
  transport?: string, 
  onAuthorize?: <T extends IDbUser>(user: T, authorizationScope: 'ws' | 'http') => Promise<void>
}

const baseModules: (cfg: IAppConfig) => (DynamicModule| Type<any> | Promise<DynamicModule>)[] = (cfg: IAppConfig) => [   
  ConfigModule.forRoot({
    isGlobal: true,
    load: [ () => cfg ]
  }), 
  CommandModule,  
];

@Module({})
export class RWSModule {
  static cfgData: IAppConfig;
  
  static async forRoot(cfg: IAppConfig): Promise<DynamicModule> {       
    return {
      module: RWSModule,
      imports: [...baseModules(cfg)] as unknown as NestModulesType,
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
      ],    
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
