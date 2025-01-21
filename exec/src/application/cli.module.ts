

import IAppConfig from '../../../src/types/IAppConfig';
import { DynamicModule,  Module} from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { InitCommand } from '../../../src/commands/init.command';
import { ConsoleService, DBService, ProcessService, TraversalService, UtilsService } from '../../../src';
import { RWSModuleType } from '../../../src/types/IRWSModule';
import { DecoratorExplorerService } from '../../../src/services/DecoratorExplorerService';
import { DiscoveryService } from '@nestjs/core';
import { MD5Service } from '../../../src/services/MD5Service';

export interface ParsedOpt {
  key: string,
  value: string,
  fullString: string  
}
export interface ParsedOptions {
  [key: string]: ParsedOpt;
}

export interface NestModuleInputData {
    providers: any[]
}

export interface NestModuleData extends NestModuleInputData {
    module: RWSModuleType,
    exports: any[],
    imports: any[]
}

export interface StaticCLIModule {
    forRoot(nestModuleData: NestModuleData, config: IAppConfig): Promise<NestModuleData>
}

export type NestCliModuleType = Promise<DynamicModule>

@Module({})
export class CLIModule {
    static async forRoot(nestModuleData: NestModuleInputData = {
        providers: []
    }, config: IAppConfig): NestCliModuleType {      
        const baseProviders = [
            ProcessService,      
            DBService,
            ConfigService,
            UtilsService,
            TraversalService,
            ConsoleService,            
            InitCommand,
            DiscoveryService,
            DecoratorExplorerService,
            MD5Service        
        ];
        
        return {
          module: CLIModule,
          imports: [      
            ConfigModule.forRoot({
              isGlobal: true,
              load: [ () => config ]
            }),
          ],
          providers: [
            ...baseProviders, ...nestModuleData.providers
        ],
          exports: [...baseProviders, ...nestModuleData.providers]
        };
    }
}