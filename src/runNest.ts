import { NestFactory, Module } from '@rws-framework/server/nest';
import { AppConfigService,  IAppConfig, IDbUser } from '@rws-framework/server';

import { DynamicModule, Inject, Type } from '@nestjs/common';
import { IRWSModule, NestModulesType, RWSModuleType } from './types/IRWSModule';
import { CommandModule } from 'nestjs-command';
import { ConfigModule } from '@nestjs/config';

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

const providers: any[] = [];

export class RWSModule {
  constructor(private configService: AppConfigService){

  }

  static cfgData: IAppConfig;
  
  static async forRoot(cfg: IAppConfig): Promise<DynamicModule> {       
    return {
      module: RWSModule,
      imports: [...baseModules(cfg)] as unknown as NestModulesType,
      providers: providers,
    };
  }

  onModuleInit() {    
    console.log('RWSModule has been initialized', this.configService);
  }
}

export default async function bootstrap(nestModule:any , cfgRunner: () => IAppConfig, opts: ServerOpts = {}) {
  const rwsOptions = cfgRunner();
  const app = await NestFactory.create(nestModule.forRoot(rwsOptions));
  
  await app.listen(rwsOptions.port);
}

