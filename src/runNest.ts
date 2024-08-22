import { NestFactory, Module } from '@rws-framework/server/nest';
import { AppConfigService,  AuthService,  ConsoleService,  IAppConfig, IDbUser, RWSFillService, UtilsService } from '@rws-framework/server';

import { DynamicModule, forwardRef, Inject, Type } from '@nestjs/common';
import { IRWSModule, NestModulesType, RWSModuleType } from './types/IRWSModule';
import { CommandModule } from 'nestjs-command';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
      providers: [ConfigService, UtilsService, ConsoleService, AuthService],  
      exports: [ConfigService, UtilsService, ConsoleService, AuthService],    
    };
  }

  onModuleInit() {    
    console.log('RWSModule has been initialized');
  }
}

export default async function bootstrap(nestModule:any , cfgRunner: () => IAppConfig, opts: ServerOpts = {}) {
  const rwsOptions = cfgRunner();
  const app = await NestFactory.create(nestModule.forRoot(rwsOptions));
  
  await app.listen(rwsOptions.port);
}

