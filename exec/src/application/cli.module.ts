

import IAppConfig from '../../../src/types/IAppConfig';
import { DynamicModule,  Module} from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { InitCommand } from '../../../src/commands/init.command';
import { ConsoleService, DBService, ProcessService, TraversalService, UtilsService } from '../../../src';
import { RWSModuleType } from '../../../src/types/IRWSModule';
import { DecoratorExplorerService } from '../../../src/services/DecoratorExplorerService';
import { DiscoveryService } from '@nestjs/core';
import { MD5Service } from '../../../src/services/MD5Service';
import { RWSConfigService } from '../../../src/services/RWSConfigService';
import { DBPushCommand } from '../../../src/commands/db-push.command';
import { DBMigrateCommand } from '../../../src/commands/db-migrate.command';

export interface ParsedOpt {
  key: string,
  value: string | boolean,
  fullString: string  
}
export interface ParsedOptions {
  [key: string]: ParsedOpt;
}

export interface NestModuleInputData {
    imports?: any[];
    providers?: any[]
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
        const newImports = nestModuleData.imports ? [...nestModuleData.imports] : [];    
        const baseProviders = [
            ProcessService,      
            DBService,
            ConfigService,
            RWSConfigService,
            UtilsService,
            TraversalService,
            ConsoleService,            
            InitCommand,
            DBPushCommand,
            DBMigrateCommand,
            DiscoveryService,
            DecoratorExplorerService,
            MD5Service        
        ];

        const newProviders = nestModuleData.providers ? [...nestModuleData.providers] : [];    
        
        return {
          module: CLIModule,
          imports: [      
            ConfigModule.forRoot({
              isGlobal: true,
              load: [ () => config ]
            }),
            ...newImports
          ],
          providers: [
            ...baseProviders, ...nestModuleData.providers
        ],
          exports: [...baseProviders, ...newProviders]
        };
    }
}